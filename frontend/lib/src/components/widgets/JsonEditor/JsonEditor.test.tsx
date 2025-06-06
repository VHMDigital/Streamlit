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

import React from "react"

import { act, screen } from "@testing-library/react"

import { Json as JsonProto } from "@streamlit/protobuf"

import { render } from "~lib/test_util"
import { WidgetStateManager } from "~lib/WidgetStateManager"
import * as getColors from "~lib/theme/getColors"

import JsonEditor, { JsonProps } from "./JsonEditor"

const getProps = (
  elementProps: Partial<JsonProto> = {},
  widgetProps: Partial<JsonProps> = {}
): JsonProps => ({
  element: JsonProto.create({
    body:
      '{ "proper": [1,2,3],' +
      '  "nested": { "thing1": "cat", "thing2": "hat" },' +
      '  "json": "structure" }',
    ...elementProps,
  }),
  disabled: false,
  widgetMgr: new WidgetStateManager({
    sendRerunBackMsg: vi.fn(),
    formsDataChanged: vi.fn(),
  }),
  ...widgetProps,
})

describe("JsonEditor", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("renders JSON editor as expected", () => {
    const props = getProps()
    render(<JsonEditor {...props} />)

    const jsonElement = screen.getByTestId("stJsonEditor")
    expect(jsonElement).toBeInTheDocument()
    expect(jsonElement).toHaveClass("stJsonEditor")
  })

  it("should show an error with invalid JSON", () => {
    const props = getProps({ body: "invalid JSON" })
    render(<JsonEditor {...props} />)

    expect(screen.getByTestId("stAlertContainer")).toBeInTheDocument()
  })

  it("renders JSON with NaN and Infinity values", () => {
    const props = getProps({
      body: `{
        "numbers":[ -1e27, NaN, Infinity, -Infinity, 2.2822022, -2.2702775 ]
      }`,
    })
    render(<JsonEditor {...props} />)

    expect(screen.getByTestId("stJsonEditor")).toBeInTheDocument()
  })

  describe("getJsonTheme", () => {
    it("picks a reasonable theme when the background is light", () => {
      vi.spyOn(getColors, "hasLightBackgroundColor").mockReturnValue(true)
      render(<JsonEditor {...getProps({ expanded: true })} />)
      expect(screen.getAllByText("}")[0]).toHaveStyle("color: rgb(0, 128, 46)")
    })

    it("picks a reasonable theme when the background is dark", () => {
      vi.spyOn(getColors, "hasLightBackgroundColor").mockReturnValue(false)
      render(<JsonEditor {...getProps({ expanded: true })} />)
      expect(screen.getAllByText("}")[0]).toHaveStyle(
        "color: rgb(86, 211, 100)"
      )
    })
  })

  describe("editing JSON", () => {
    it("updates the JSON and calls setStringValue", () => {
      const setStringValue = vi.fn()

      const props = getProps({
        body: '{ "a": 1 }',
        expanded: true,
      })
      props.widgetMgr.setStringValue = setStringValue

      render(<JsonEditor {...props} />)

      const updatedData = { a: 1, b: 2 }

      act(() => {
        props.widgetMgr.setStringValue(
          expect.any(Object),
          JSON.stringify(updatedData),
          { fromUi: true },
          undefined
        )
      })

      expect(setStringValue).toHaveBeenCalledWith(
        props.element,
        JSON.stringify(updatedData),
        { fromUi: true },
        undefined
      )

      const updatedValue = setStringValue.mock.calls[1][1]
      expect(JSON.parse(updatedValue)).toEqual({ a: 1, b: 2 })
    })

    it("updates the JSON correctly when a key is deleted", () => {
      const setStringValue = vi.fn()

      const props = getProps({ expanded: true })
      props.widgetMgr.setStringValue = setStringValue

      render(<JsonEditor {...props} />)

      const initialJson = {
        proper: [1, 2, 3],
        nested: { thing1: "cat", thing2: "hat" },
        json: "structure",
      }

      // Simulate initial value being set
      act(() => {
        props.widgetMgr.setStringValue(
          props.element,
          JSON.stringify(initialJson),
          { fromUi: false },
          undefined
        )
      })

      const updatedJson = {
        proper: [1, 2, 3],
        json: "structure",
      }

      act(() => {
        props.widgetMgr.setStringValue(
          props.element,
          JSON.stringify(updatedJson),
          { fromUi: true },
          undefined
        )
      })

      expect(setStringValue).toHaveBeenCalledWith(
        props.element,
        JSON.stringify(updatedJson),
        { fromUi: true },
        undefined
      )

      const updatedValue = setStringValue.mock.calls[2][1]

      expect(JSON.parse(updatedValue)).toEqual({
        proper: [1, 2, 3],
        json: "structure",
      })
    })

    it("updates the JSON correctly when a key is added", () => {
      const setStringValue = vi.fn()

      const props = getProps({ expanded: true })
      props.widgetMgr.setStringValue = setStringValue

      render(<JsonEditor {...props} />)

      const updatedJson = {
        proper: [1, 2, 3],
        nested: { thing1: "cat", thing2: "hat" },
        json: "structure",
      }

      const initialJson = {
        proper: [1, 2, 3],
        json: "structure",
      }

      // Simulate initial value being set
      act(() => {
        props.widgetMgr.setStringValue(
          props.element,
          JSON.stringify(initialJson),
          { fromUi: false },
          undefined
        )
      })

      act(() => {
        props.widgetMgr.setStringValue(
          props.element,
          JSON.stringify(updatedJson),
          { fromUi: true },
          undefined
        )
      })

      expect(setStringValue).toHaveBeenCalledWith(
        props.element,
        JSON.stringify(updatedJson),
        { fromUi: true },
        undefined
      )

      const updatedValue = setStringValue.mock.calls[2][1]

      expect(JSON.parse(updatedValue)).toEqual({
        proper: [1, 2, 3],
        nested: { thing1: "cat", thing2: "hat" },
        json: "structure",
      })
    })
  })
})
