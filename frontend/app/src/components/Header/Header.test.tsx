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

import { screen } from "@testing-library/react"

import { render } from "@streamlit/lib"
import { PageConfig } from "@streamlit/protobuf"
import { AppContextProps } from "@streamlit/app/src/components/AppContext"
import * as StreamlitContextProviderModule from "@streamlit/app/src/components/StreamlitContextProvider"

import Header, { HeaderProps } from "./Header"

function getContextOutput(context: Partial<AppContextProps>): AppContextProps {
  return {
    initialSidebarState: PageConfig.SidebarState.AUTO,
    showPadding: false,
    disableScrolling: false,
    showToolbar: false,
    showColoredLine: false,
    pageLinkBaseUrl: "",
    sidebarChevronDownshift: 0,
    widgetsDisabled: false,
    gitInfo: null,
    appConfig: {},
    ...context,
  }
}

const getProps = (propOverrides: Partial<HeaderProps> = {}): HeaderProps => ({
  embedded: false,
  children: <div>Test</div>,
  ...propOverrides,
})

describe("Header", () => {
  beforeEach(() => {
    // Mock the useAppContext hook to return default values
    vi.spyOn(
      StreamlitContextProviderModule,
      "useAppContext"
    ).mockImplementation(() => getContextOutput({}))
  })

  it("renders a Header", () => {
    render(<Header {...getProps()} />)

    expect(screen.getByTestId("stHeader")).toBeInTheDocument()
  })

  it("renders correctly when not embedded, showToolbar & showColoredLine true", () => {
    vi.spyOn(StreamlitContextProviderModule, "useAppContext").mockReturnValue(
      getContextOutput({ showToolbar: true, showColoredLine: true })
    )

    render(<Header {...getProps()} />)

    expect(screen.getByTestId("stHeader")).toHaveStyle("display: block")
    expect(screen.getByTestId("stDecoration")).toBeVisible()
    expect(screen.getByTestId("stToolbar")).toBeVisible()
  })

  it("renders correctly when embedded, showToolbar & showColoredLine false", () => {
    render(<Header {...getProps({ embedded: true })} />)

    expect(screen.getByTestId("stHeader")).toHaveStyle("display: none")
  })
})
