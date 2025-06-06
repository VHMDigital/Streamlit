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

import React, {
  memo,
  ReactElement,
  useCallback,
  useRef,
  useState,
} from "react"

import JSON5 from "json5"
import {
  githubDarkTheme,
  githubLightTheme,
  JsonEditor as ReactJsonEditor,
  UpdateFunctionProps,
} from "json-edit-react"
import Clipboard from "clipboard"
import { useTheme } from "@emotion/react"

import { Json as JsonProto } from "@streamlit/protobuf"

import { WidgetStateManager } from "~lib/WidgetStateManager"
import {
  useBasicWidgetState,
  ValueWithSource,
} from "~lib/hooks/useBasicWidgetState"
import ErrorElement from "~lib/components/shared/ErrorElement"
import { EmotionTheme, hasLightBackgroundColor } from "~lib/theme"
import { ensureError } from "~lib/util/ErrorHandling"

import { StyledJsonWrapper } from "./styled-components"

export interface JsonProps {
  disabled: boolean
  element: JsonProto
  widgetMgr: WidgetStateManager
  fragmentId?: string
}

/**
 * Functional element representing JSON structured text.
 */
function JsonEditor({
  disabled,
  element,
  widgetMgr,
  fragmentId,
}: JsonProps): ReactElement {
  const [value, setValueWithSource] = useBasicWidgetState<
    string | null,
    JsonProto
  >({
    getStateFromWidgetMgr,
    getDefaultStateFromProto,
    getCurrStateFromProto,
    updateWidgetMgrState,
    element,
    widgetMgr,
    fragmentId,
  })

  const theme: EmotionTheme = useTheme()

  const elementRef = useRef<HTMLDivElement>(null)

  let bodyObject
  try {
    bodyObject = JSON.parse(element.body)
  } catch (e) {
    const error = ensureError(e)
    try {
      // eslint-disable-next-line import/no-named-as-default-member
      bodyObject = JSON5.parse(element.body)
    } catch (json5Error) {
      // If content fails to parse as Json, rebuild the error message
      // to show where the problem occurred.
      const pos = parseInt(error.message.replace(/[^0-9]/g, ""), 10)
      error.message += `\n${element.body.substring(0, pos + 1)} ← here`
      return <ErrorElement name={"Json Parse Error"} message={error.message} />
    }
  }

  const darkTheme = [
    githubDarkTheme,
    {
      input: ["#ffffff", { fontSize: "90%" }],
      inputHighlight: "#acb0b5",
    },
  ]

  const lightTheme = [
    githubLightTheme,
    {
      string: "rgb(203, 75, 22)",
      number: "rgb(38, 139, 210)",
    },
  ]

  const [jsonData, setJsonData] = useState(bodyObject)

  // Try to pick a reasonable ReactJson theme based on whether the streamlit
  // theme's background is light or dark.
  const jsonTheme = hasLightBackgroundColor(theme) ? lightTheme : darkTheme

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: Replace 'any' with a more specific type.
  const handleCopy = (copy: any): void => {
    // we use ClipboardJS to do the copying, because it allows
    // us to specify a container element. This is necessary because
    // otherwise copying doesn't work in dialogs.
    Clipboard.copy(JSON.stringify(copy.src), {
      container: elementRef.current ?? undefined,
    })
  }

  return (
    <StyledJsonWrapper
      className="stJsonEditor"
      data-testid="stJsonEditor"
      ref={elementRef}
    >
      <ReactJsonEditor
        data={jsonData}
        setData={setJsonData}
        enableClipboard={handleCopy}
        viewOnly={disabled}
        collapse={element.maxExpandDepth ?? !element.expanded}
        theme={jsonTheme}
        rootName=""
        onUpdate={useCallback(
          (update: UpdateFunctionProps): void => {
            const newJson: string | null =
              update.newData === null ? null : JSON.stringify(update.newData)
            setValueWithSource({ value: newJson, fromUi: true })
            setJsonData(value) //updates state with new data
          },
          [value, setValueWithSource]
        )}
      />
    </StyledJsonWrapper>
  )
}

function getStateFromWidgetMgr(
  widgetMgr: WidgetStateManager,
  element: JsonProto
): string | null {
  return widgetMgr.getStringValue(element) ?? null
}

function getDefaultStateFromProto(): string | null {
  return ""
}

function getCurrStateFromProto(element: JsonProto): string | null {
  return element.value ?? null
}

function updateWidgetMgrState(
  element: JsonProto,
  widgetMgr: WidgetStateManager,
  vws: ValueWithSource<string | null>,
  fragmentId?: string
): void {
  widgetMgr.setStringValue(
    element,
    vws.value,
    { fromUi: vws.fromUi },
    fragmentId
  )
}

export default memo(JsonEditor)
