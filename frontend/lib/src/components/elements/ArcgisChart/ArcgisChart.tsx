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

import React, { memo, useEffect, useRef } from "react"

import MapView from "@arcgis/core/views/MapView"
import WebMap from "@arcgis/core/WebMap"

import { ArcgisChart as ArcgisChartProto } from "@streamlit/protobuf"

interface ArcgisChartProps {
  element: ArcgisChartProto
}

interface Extent {
  xmin: number
  xmax: number
  ymin: number
  ymax: number
}

function estimateZoom(extent: Extent, mapWidthPx: number = 1024): number {
  // Web Mercator full extent width (in meters)
  const MAX_EXTENT_WIDTH = 40075016.68557849

  // Tile size in pixels (standard is 256)
  const TILE_SIZE = 256

  // Calculate the visible width of the extent
  const extentWidth = Math.abs(extent.xmax - extent.xmin)

  // Meters per pixel at zoom level 0
  const initialResolution = MAX_EXTENT_WIDTH / TILE_SIZE

  // Calculate resolution (meters per pixel) for this extent and screen width
  const resolution = extentWidth / mapWidthPx

  // Estimate zoom level using formula:
  const zoom = Math.log2(initialResolution / resolution)

  // Return a rounded zoom (or adjust precision as needed)
  return Math.round(zoom) / 2
}

export const ArcgisChart: React.FC<ArcgisChartProps> = ({ element }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<MapView | null>(null)

  const mapData = JSON.parse(element.spec)

  // Other non Arcgis json format data
  const config = JSON.parse(element.config)
  const extent: Extent = mapData.initialState.viewpoint.targetGeometry

  const zoom = estimateZoom(extent)

  const width = "100%"
  const height = element.height ? `${element.height}px` : "500px"

  useEffect(() => {
    const map = WebMap.fromJSON(mapData)

    const view = new MapView({
      ...config,
      container: mapRef.current as HTMLDivElement,
      map,
      zoom: zoom,
    })

    viewRef.current = view

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
  }, [mapData, zoom]) // re-run if any of these change

  return (
    <div ref={mapRef} style={{ height, width }} data-testid="stArcgisChart" />
  )
}

export default memo(ArcgisChart)
