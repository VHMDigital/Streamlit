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

import { GridCellKind } from "@glideapps/glide-data-grid"
import { Field, Utf8 } from "apache-arrow"

import { DataFrameCellType } from "~lib/dataframes/arrowTypeUtils"

import FileColumn from "./FileColumn"
import { FileCell } from "./cells/FileCell"
import { isMissingValueCell } from "./utils"

const MOCK_FILE_COLUMN_PROPS = {
  id: "1",
  name: "file_column",
  title: "File column",
  indexNumber: 0,
  isEditable: true,
  isHidden: false,
  isIndex: false,
  isPinned: false,
  isStretched: false,
  arrowType: {
    type: DataFrameCellType.DATA,
    arrowField: new Field("file_column", new Utf8(), true),
    pandasType: {
      field_name: "file_column",
      name: "file_column",
      pandas_type: "unicode",
      numpy_type: "object",
      metadata: null,
    },
  },
}

const MOCK_FILE_DATA = {
  contentType: "image/png",
  modality: "image",
  url: "https://example.com/image.png",
  fileName: "image.png",
}

describe("FileColumn", () => {
  it("creates a valid column instance", () => {
    const mockColumn = FileColumn(MOCK_FILE_COLUMN_PROPS)
    expect(mockColumn.kind).toEqual("file")
    expect(mockColumn.title).toEqual(MOCK_FILE_COLUMN_PROPS.title)
    expect(mockColumn.id).toEqual(MOCK_FILE_COLUMN_PROPS.id)
    expect(mockColumn.sortMode).toEqual("default")
    expect(mockColumn.isEditable).toEqual(true)

    // Test with valid file data
    const mockCell = mockColumn.getCell(MOCK_FILE_DATA)
    expect(mockCell.kind).toEqual(GridCellKind.Custom)
    expect(mockCell.allowOverlay).toEqual(true)
    expect((mockCell as FileCell).copyData).toEqual("image.png")
    expect((mockCell as FileCell).data.file).toEqual(MOCK_FILE_DATA)
  })

  it("respects isEditable configuration", () => {
    const readOnlyColumn = FileColumn({
      ...MOCK_FILE_COLUMN_PROPS,
      isEditable: false,
    })

    // Column should be read-only
    expect(readOnlyColumn.isEditable).toEqual(false)

    // Cell should be read-only
    const mockCell = readOnlyColumn.getCell(MOCK_FILE_DATA) as FileCell
    expect(mockCell.readonly).toEqual(true)
  })

  it("handles null and undefined values", () => {
    const mockColumn = FileColumn(MOCK_FILE_COLUMN_PROPS)

    // Test with null
    const nullCell = mockColumn.getCell(null)
    expect(isMissingValueCell(nullCell)).toEqual(true)

    // Test with undefined
    const undefinedCell = mockColumn.getCell(undefined)
    expect(isMissingValueCell(undefinedCell)).toEqual(true)
  })

  it("handles non-object values", () => {
    const mockColumn = FileColumn(MOCK_FILE_COLUMN_PROPS)

    // Test with a string
    const stringCell = mockColumn.getCell("not an object")
    expect(stringCell.kind).toEqual(GridCellKind.Text)
    expect((stringCell as any).isError).toEqual(true)

    // Test with a number
    const numberCell = mockColumn.getCell(42)
    expect(numberCell.kind).toEqual(GridCellKind.Text)
    expect((numberCell as any).isError).toEqual(true)
  })

  it("provides fallback values for missing properties", () => {
    const mockColumn = FileColumn(MOCK_FILE_COLUMN_PROPS)

    // Test with partial data
    const mockCell = mockColumn.getCell({
      url: "https://example.com/file.pdf",
    }) as FileCell
    expect(mockCell.data.file.url).toEqual("https://example.com/file.pdf")
    expect(mockCell.data.file.fileName).toEqual("Unnamed file")
    expect(mockCell.data.file.contentType).toEqual("")
    expect(mockCell.data.file.modality).toEqual("")
  })

  it("returns correct cell value", () => {
    const mockColumn = FileColumn(MOCK_FILE_COLUMN_PROPS)
    const mockCell = mockColumn.getCell(MOCK_FILE_DATA) as FileCell

    const cellValue = mockColumn.getCellValue(mockCell)
    expect(cellValue).toEqual(MOCK_FILE_DATA)

    // Check that the returned value is a copy, not a reference
    expect(cellValue).not.toBe(MOCK_FILE_DATA)
  })

  it("returns null for cell value with missing file data", () => {
    const mockColumn = FileColumn(MOCK_FILE_COLUMN_PROPS)

    // Test with a cell that has no data.file property
    // We need to use type assertion to bypass TypeScript type checking
    const mockCell = {
      kind: GridCellKind.Custom,
      allowOverlay: true,
      readonly: false,
      style: "normal",
      copyData: "",
      data: {
        kind: "file-cell",
        file: null,
      },
    } as unknown as FileCell

    const cellValue = mockColumn.getCellValue(mockCell)
    expect(cellValue).toBeNull()
  })
})
