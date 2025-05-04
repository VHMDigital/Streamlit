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

import { GridCell, GridCellKind } from "@glideapps/glide-data-grid"

import { isNullOrUndefined, notNullOrUndefined } from "@streamlit/utils"

import { FileCell } from "./cells/FileCell"
import {
  BaseColumn,
  BaseColumnProps,
  getEmptyCell,
  getErrorCell,
  toSafeString,
} from "./utils"

interface FileData {
  contentType?: string
  modality?: string
  url?: string
  fileName?: string
}

/**
 * A column type that renders a file reference, showing a thumbnail for images
 * and a file icon for other file types, with a filename next to it.
 */
function FileColumn(props: BaseColumnProps): BaseColumn {
  const cellTemplate = {
    kind: GridCellKind.Custom,
    allowOverlay: true,
    contentAlignment: props.contentAlignment || "left",
    readonly: !props.isEditable,
    // The text in pinned columns should be faded.
    style: props.isPinned ? "faded" : "normal",
    copyData: "",
    data: {
      kind: "file-cell",
      file: {
        contentType: "",
        modality: "",
        url: "",
        fileName: "",
      },
    },
  } as FileCell

  return {
    ...props,
    kind: "file",
    sortMode: "default",
    isEditable: props.isEditable,
    getCell(data?: any): GridCell {
      try {
        // Handle missing data/null/undefined
        if (isNullOrUndefined(data)) {
          return getEmptyCell(true)
        }

        // Handle non-object data
        if (typeof data !== "object") {
          return getErrorCell(
            toSafeString(data),
            "The value cannot be interpreted as a file object. Expected an object with contentType, modality, url, and fileName properties."
          )
        }

        // Extract file data, providing fallback values if missing
        const fileData: FileData = {
          contentType: data.contentType || "",
          modality: data.modality || "",
          url: data.url || "",
          fileName: data.fileName || "Unnamed file",
        }

        // Use the filename as the copy data
        const copyData = fileData.fileName || ""

        return {
          ...cellTemplate,
          copyData,
          isMissingValue: false,
          data: {
            ...cellTemplate.data,
            file: fileData,
          },
        } as FileCell
      } catch (error) {
        return getErrorCell(
          toSafeString(data),
          `The value cannot be interpreted as a file object. Error: ${error}`
        )
      }
    },
    getCellValue(cell: FileCell): object | null {
      // Return the file data as an object, or null if not available
      return notNullOrUndefined(cell.data?.file) ? { ...cell.data.file } : null
    },
  }
}

// Mark whether this column type is editable by default
FileColumn.isEditableType = true

export default FileColumn
