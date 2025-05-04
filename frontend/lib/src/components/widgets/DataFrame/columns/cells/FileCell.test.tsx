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

import { describe, expect, it } from "vitest"
import { GridCellKind } from "@glideapps/glide-data-grid"

import FileRenderer, { FileCell } from "./FileCell"

const MOCK_FILE_DATA = {
  contentType: "image/png",
  modality: "image",
  url: "https://example.com/image.png",
  fileName: "image.png",
}

const MOCK_THEME = {
  cellHorizontalPadding: 8,
  cellVerticalPadding: 4,
  fontFamily: "Arial",
  baseFontFull: "12px Arial",
  textDark: "#000",
}

describe("FileCell", () => {
  it("correctly validates file cells", () => {
    const fileCell: FileCell = {
      kind: GridCellKind.Custom,
      allowOverlay: true,
      readonly: false,
      style: "normal",
      copyData: "image.png",
      data: {
        kind: "file-cell",
        file: MOCK_FILE_DATA,
      },
    }

    expect(FileRenderer.isMatch(fileCell)).toBe(true)
    expect(
      FileRenderer.isMatch({
        kind: GridCellKind.Custom,
        allowOverlay: true,
        data: { kind: "not-a-file-cell" },
      } as any)
    ).toBe(false)
  })

  it("provides correct measure calculation", () => {
    // Mock the context to test measure function
    const ctx = {
      measureText: (text: string) => ({
        width: text.length * 8, // Simple mock calculation
      }),
    } as unknown as CanvasRenderingContext2D

    const fileCell: FileCell = {
      kind: GridCellKind.Custom,
      allowOverlay: true,
      readonly: false,
      style: "normal",
      copyData: "image.png",
      data: {
        kind: "file-cell",
        file: MOCK_FILE_DATA,
      },
    }

    // FileRenderer.measure is defined in the type, but need to check it exists first
    if (FileRenderer.measure) {
      const width = FileRenderer.measure(ctx, fileCell, MOCK_THEME as any)

      // Expected: padding + icon + padding + text width + padding
      const expectedWidth = 8 + 24 + 8 + 9 * 8 + 8
      expect(width).toBe(expectedWidth)
    } else {
      // If measure is not defined, this test should fail
      expect(FileRenderer.measure).toBeDefined()
    }
  })

  it("handles paste event correctly", () => {
    const pasteData = "new_file.png"
    const fileCell: FileCell = {
      kind: GridCellKind.Custom,
      allowOverlay: true,
      readonly: false,
      style: "normal",
      copyData: "image.png",
      data: {
        kind: "file-cell",
        file: MOCK_FILE_DATA,
      },
    }

    // onPaste is optional, so we should check it exists first
    if (FileRenderer.onPaste) {
      const result = FileRenderer.onPaste(pasteData, fileCell.data)

      // Check that result is defined before accessing properties
      if (result) {
        expect(result.file?.fileName).toBe(pasteData)
        // Other properties should remain unchanged
        expect(result.file?.contentType).toBe(MOCK_FILE_DATA.contentType)
        expect(result.file?.modality).toBe(MOCK_FILE_DATA.modality)
        expect(result.file?.url).toBe(MOCK_FILE_DATA.url)
      } else {
        // If result is undefined, this test should fail
        expect(result).toBeDefined()
      }
    } else {
      // If onPaste is not defined, this test should fail
      expect(FileRenderer.onPaste).toBeDefined()
    }
  })

  it("provides an editor via provideEditor", () => {
    // Test that provideEditor is properly defined
    expect(FileRenderer.provideEditor).toBeDefined()

    // If it's defined, we can test that it returns an object with an editor property
    if (FileRenderer.provideEditor) {
      // Create a mock file cell to pass as parameter
      const mockFileCell: FileCell = {
        kind: GridCellKind.Custom,
        allowOverlay: true,
        readonly: false,
        style: "normal",
        copyData: "image.png",
        data: {
          kind: "file-cell",
          file: MOCK_FILE_DATA,
        },
      }

      const editorProvider = FileRenderer.provideEditor(mockFileCell)
      expect(editorProvider).toHaveProperty("editor")
    }
  })
})
