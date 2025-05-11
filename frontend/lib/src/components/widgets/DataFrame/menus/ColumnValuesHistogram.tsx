/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { ReactElement, useEffect, useMemo, useRef } from "react"

import {
  BooleanCell,
  CustomCell,
  GridCell,
  MarkdownCell,
  NumberCell,
  TextCell,
  UriCell,
} from "@glideapps/glide-data-grid"
import { Global, useTheme } from "@emotion/react"
import embed, { VisualizationSpec } from "vega-embed"

import { EmotionTheme } from "~lib/theme"
// import { applyStreamlitTheme } from "~lib/components/elements/ArrowVegaLiteChart/CustomTheme"; // No longer used
import { StyledVegaLiteChartTooltips } from "~lib/components/elements/ArrowVegaLiteChart/styled-components"

export interface ColumnValuesHistogramProps {
  columnData: GridCell[] | undefined
  columnKind: string
}

const MAX_CATEGORICAL_VALUES = 15
const CHART_WIDTH = 120
const CHART_HEIGHT = 40

// Define a type for the custom date cell data structure
interface DateTimePickerCellData {
  date?: Date
  displayDate?: string
  kind?: string // e.g., "date-picker-cell"
  // add other properties if they exist and are needed
}

// Helper to safely get data from common cell types
function getScalarCellData(
  cell: GridCell
): string | number | boolean | null | undefined {
  switch (cell.kind) {
    case "text":
    case "number":
    case "boolean":
    case "uri":
    case "markdown":
      return (
        cell as TextCell | NumberCell | BooleanCell | UriCell | MarkdownCell
      ).data
    case "custom": {
      const customCellData = (cell as CustomCell<DateTimePickerCellData>).data
      if (
        customCellData &&
        typeof customCellData === "object" &&
        customCellData.kind === "date-picker-cell"
      ) {
        return customCellData.displayDate // Use the pre-formatted displayDate
      }
      return undefined
    }
    default:
      return undefined
  }
}

function ColumnValuesHistogram({
  columnData,
  columnKind,
}: ColumnValuesHistogramProps): ReactElement | null {
  // console.log("--- ColumnValuesHistogram: Component Rendered ---", { columnData, columnKind });
  const theme: EmotionTheme = useTheme()
  const chartRef = useRef<HTMLDivElement>(null)

  const processedData = useMemo(() => {
    if (!columnData || columnData.length === 0) {
      return []
    }

    if (
      [
        "text",
        "object",
        "selectbox",
        "list",
        "datetime",
        "date",
        "time",
      ].includes(columnKind)
    ) {
      const valueCounts: { [key: string]: number } = {}
      // let firstDateCellLogged = false; // No longer needed for this specific log
      columnData.forEach(cell => {
        // Diagnostic log removed, main logic follows
        const cellValue = getScalarCellData(cell)
        const value = cellValue?.toString() ?? "(empty)"
        valueCounts[value] = (valueCounts[value] || 0) + 1
      })

      return Object.entries(valueCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, MAX_CATEGORICAL_VALUES)
        .map(([value, count]) => ({ value, count }))
    }

    if (columnKind === "number") {
      const numbers = columnData
        .map(cell => {
          const cellValue = getScalarCellData(cell)
          return Number(cellValue)
        })
        .filter(num => !isNaN(num) && num !== null)
      if (numbers.length === 0) return []
      const min = Math.min(...numbers)
      const max = Math.max(...numbers)
      const numBins = Math.min(
        numbers.length > 10 ? 10 : numbers.length,
        MAX_CATEGORICAL_VALUES
      )
      if (numBins === 0) return []
      if (min === max) {
        return [{ value: `${min}`, count: numbers.length }]
      }
      const binSize = (max - min) / numBins
      const bins: { value: string; count: number }[] = Array(numBins)
        .fill(null)
        .map((_, i) => ({
          value: `${(min + i * binSize).toFixed(1)}-${(
            min +
            (i + 1) * binSize
          ).toFixed(1)}`,
          count: 0,
        }))
      numbers.forEach(num => {
        let binIndex = Math.floor((num - min) / binSize)
        if (binIndex >= numBins) {
          binIndex = numBins - 1
        }
        bins[binIndex].count += 1
      })
      return bins.filter(b => b.count > 0)
    }

    if (columnKind === "boolean" || columnKind === "checkbox") {
      const valueCounts: { [key: string]: number } = { True: 0, False: 0 }
      let hasData = false
      columnData.forEach(cell => {
        const cellValue = getScalarCellData(cell)
        if (typeof cellValue === "boolean") {
          if (cellValue === true) {
            valueCounts.True = (valueCounts.True || 0) + 1
          } else {
            valueCounts.False = (valueCounts.False || 0) + 1
          }
          hasData = true
        }
      })
      return hasData
        ? Object.entries(valueCounts)
            .map(([value, count]) => ({ value, count }))
            .filter(item => item.count > 0)
        : []
    }

    return []
  }, [columnData, columnKind])

  const specCore = useMemo<VisualizationSpec | null>(() => {
    if (processedData.length === 0) {
      return null
    }
    let xType: "nominal" | "quantitative" | "ordinal" = "nominal"
    let sortX: string | null = "-y"
    if (
      columnKind === "number" &&
      processedData.every(
        d => typeof d.value === "string" && d.value.includes("-")
      )
    ) {
      xType = "ordinal"
      sortX = null
    } else if (columnKind === "boolean" || columnKind === "checkbox") {
      xType = "nominal"
      sortX = null
    } else if (["datetime", "date", "time"].includes(columnKind)) {
      xType = "nominal"
    }
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Column data distribution histogram.",
      data: { values: processedData },
      width: CHART_WIDTH,
      height: CHART_HEIGHT,
      mark: "bar",
      encoding: {
        x: {
          field: "value",
          type: xType,
          axis: null,
          sort: sortX,
        },
        y: {
          field: "count",
          type: "quantitative",
          axis: null,
        },
        tooltip: [
          { field: "value", type: xType, title: "Value" },
          { field: "count", type: "quantitative", title: "Count" },
        ],
      },
      config: {
        background: theme.colors.bgColor,
        font: theme.genericFonts.bodyFont,
        view: {
          strokeWidth: 0,
        },
        mark: {
          color: theme.colors.blue80,
        },
      },
    } as VisualizationSpec
  }, [processedData, columnKind, theme])

  useEffect(() => {
    if (chartRef.current && specCore) {
      embed(chartRef.current, specCore, {
        actions: false,
        renderer: "svg",
      })
        .then(_result => {
          /* Intentional no-op */
        })
        .catch(_error => {
          /* Intentional no-op for promise handling */
        })
    }
  }, [specCore])

  if (!specCore) {
    return null
  }
  return (
    <>
      <Global styles={StyledVegaLiteChartTooltips} />
      <div
        ref={chartRef}
        data-testid={`stColumnValuesHistogram-${columnKind}`}
        style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}
      />
    </>
  )
}

export default React.memo(ColumnValuesHistogram)
