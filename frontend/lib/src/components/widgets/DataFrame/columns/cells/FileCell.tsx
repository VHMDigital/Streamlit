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

import * as React from "react"

import {
  type CustomCell,
  type CustomRenderer,
  getMiddleCenterBias,
  GridCellKind,
  measureTextCached,
  type ProvideEditorCallback,
  TextCellEntry,
} from "@glideapps/glide-data-grid"

// Material Symbols file icon URL
const FILE_ICON_URL =
  "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/description/default/24px.svg"

interface FileCellData {
  contentType?: string
  modality?: string
  url?: string
  fileName?: string
}

interface FileCellProps {
  readonly kind: "file-cell"
  readonly file: FileCellData
}

export type FileCell = CustomCell<FileCellProps>

/**
 * Helper function to draw a rounded rectangle on a canvas
 */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * The cell overlay editor used by File columns to render
 * the file information.
 */
export const FileCellEditor: ReturnType<
  ProvideEditorCallback<FileCell>
> = cell => {
  const { isHighlighted, onChange, value } = cell
  const fileData = value.data.file

  return (
    <TextCellEntry
      highlight={isHighlighted}
      autoFocus={true}
      value={fileData.fileName ?? ""}
      disabled={value.readonly ?? false}
      onChange={e =>
        onChange({
          ...value,
          data: {
            ...value.data,
            file: {
              ...fileData,
              fileName: e.target.value,
            },
          },
        })
      }
    />
  )
}

/**
 * The cell renderer for the FileColumn
 */
const renderer: CustomRenderer<FileCell> = {
  kind: GridCellKind.Custom,
  isMatch: (c): c is FileCell => (c.data as any).kind === "file-cell",
  draw: (args, cell) => {
    const { ctx, rect, theme, imageLoader, col, row } = args
    const { file } = cell.data

    if (!file || !file.fileName) {
      return false
    }

    const xPad = theme.cellHorizontalPadding
    const drawX = rect.x + xPad

    // Determine if we should render an image or a default file icon
    const isImage =
      file.contentType?.startsWith("image/") || file.modality === "image"

    ctx.save()

    // Fixed square size for icons and images - use height of the cell with padding
    const iconSize = Math.min(24, rect.height - theme.cellVerticalPadding * 2)
    const iconY = rect.y + (rect.height - iconSize) / 2

    if (!isImage || !file.url) {
      // Draw the Material Symbols file icon
      const fileIconImg = imageLoader.loadOrGetImage(FILE_ICON_URL, -1, -1) // Use -1 to indicate this is not a regular cell image

      if (fileIconImg !== undefined) {
        // Make the file icon smaller (80% of normal size)
        const fileIconSize = Math.floor(iconSize * 0.8)
        // Calculate position to center the smaller icon in the same space
        const offsetX = (iconSize - fileIconSize) / 2
        const offsetY = (iconSize - fileIconSize) / 2

        // Draw the file icon at the correct position and smaller size
        ctx.drawImage(
          fileIconImg,
          drawX + offsetX,
          iconY + offsetY,
          fileIconSize,
          fileIconSize
        )
      } else {
        // Fallback if icon fails to load
        ctx.fillStyle = "#6b7280"
        ctx.font = `bold 12px ${theme.fontFamily}`
        const fileIcon = "📄"
        const metrics = measureTextCached(fileIcon, ctx)
        ctx.fillText(
          fileIcon,
          drawX + (iconSize - metrics.width) / 2,
          iconY +
            iconSize / 2 +
            getMiddleCenterBias(ctx, `bold 12px ${theme.fontFamily}`)
        )
      }
    } else if (file.url) {
      // Try to load and draw the image as a square
      const imageResult = imageLoader.loadOrGetImage(file.url, col, row)

      if (imageResult !== undefined) {
        // Calculate source dimensions to crop the image to a square if needed
        const imgWidth = imageResult.width
        const imgHeight = imageResult.height

        let sx = 0
        let sy = 0
        let sWidth = imgWidth
        let sHeight = imgHeight

        // Crop the image to ensure square aspect ratio
        if (imgWidth > imgHeight) {
          // Landscape image - crop from center horizontally
          sx = (imgWidth - imgHeight) / 2
          sWidth = imgHeight
        } else if (imgHeight > imgWidth) {
          // Portrait image - crop from center vertically
          sy = (imgHeight - imgWidth) / 2
          sHeight = imgWidth
        }

        // Get rounding radius from theme with fallback to 4
        const roundingRadius = theme.roundingRadius ?? 4

        // Apply rounded corners for the image
        if (roundingRadius > 0) {
          ctx.save()
          // Create a rounded rectangle clipping path
          roundedRect(ctx, drawX, iconY, iconSize, iconSize, roundingRadius)
          ctx.clip()
        }

        // Draw the image as a square
        ctx.drawImage(
          imageResult,
          sx,
          sy,
          sWidth,
          sHeight, // Source rectangle (cropped square from original)
          drawX,
          iconY,
          iconSize,
          iconSize // Destination rectangle (square in cell)
        )

        if (roundingRadius > 0) {
          ctx.restore()
        }
      } else {
        // If image is not loaded yet, draw a placeholder icon
        ctx.fillStyle = "#3b82f6"
        ctx.font = `bold 12px ${theme.fontFamily}`
        const imgIcon = "🖼️"
        const metrics = measureTextCached(imgIcon, ctx)
        ctx.fillText(
          imgIcon,
          drawX + (iconSize - metrics.width) / 2,
          iconY +
            iconSize / 2 +
            getMiddleCenterBias(ctx, `bold 12px ${theme.fontFamily}`)
        )
      }
    }

    // Calculate available width for filename to prevent overlap
    const availableWidth = rect.width - (iconSize + xPad * 3)

    // Draw the filename next to the icon/image with truncation if needed
    ctx.font = theme.baseFontFull
    ctx.fillStyle = theme.textDark

    let displayFileName = file.fileName
    const textMetrics = ctx.measureText(displayFileName)

    // Truncate text with ellipsis if it's too long
    if (textMetrics.width > availableWidth) {
      // Try truncating to fit
      let truncatedName = displayFileName
      while (
        truncatedName.length > 3 &&
        ctx.measureText(truncatedName + "...").width > availableWidth
      ) {
        truncatedName = truncatedName.slice(0, -1)
      }
      displayFileName = truncatedName + "..."
    }

    ctx.fillText(
      displayFileName,
      drawX + iconSize + xPad,
      rect.y + rect.height / 2 + getMiddleCenterBias(ctx, theme)
    )

    ctx.restore()

    return true
  },
  measure: (ctx, cell, theme) => {
    const { file } = cell.data
    const filename = file?.fileName ?? ""

    // Always use a square icon
    const iconSize = Math.min(24, 35 - theme.cellVerticalPadding * 2) // 35px is typical row height
    return (
      theme.cellHorizontalPadding +
      iconSize +
      theme.cellHorizontalPadding +
      (filename ? ctx.measureText(filename).width : 0) +
      theme.cellHorizontalPadding
    )
  },
  provideEditor: () => ({
    editor: FileCellEditor,
  }),
  onPaste: (v, d) => ({
    ...d,
    file: {
      ...d.file,
      fileName: v,
    },
  }),
}

export default renderer
