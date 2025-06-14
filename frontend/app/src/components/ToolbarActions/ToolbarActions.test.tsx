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
import { userEvent } from "@testing-library/user-event"

import { mockSessionInfo, render } from "@streamlit/lib"
import { MetricsManager } from "@streamlit/app/src/MetricsManager"

import ToolbarActions, {
  ActionButton,
  ActionButtonProps,
  ToolbarActionsProps,
} from "./ToolbarActions"

// Helper function to wait for setTimeout
const waitForTimeout = (): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(), 10))

describe("ActionButton", () => {
  const getProps = (
    extended?: Partial<ActionButtonProps>
  ): ActionButtonProps => ({
    label: "the label",
    icon: "star.svg",
    onClick: vi.fn(),
    ...extended,
  })

  it("renders without crashing", () => {
    render(<ActionButton {...getProps()} />)

    expect(screen.getByTestId("stToolbarActionButton")).toBeInTheDocument()
  })

  it("does not render icon if not provided", () => {
    render(<ActionButton {...getProps({ icon: undefined })} />)

    expect(screen.getByTestId("stToolbarActionButton")).toBeInTheDocument()
    expect(
      screen.queryByTestId("stToolbarActionButtonIcon")
    ).not.toBeInTheDocument()
  })

  it("does not render label if not provided", () => {
    render(<ActionButton {...getProps({ label: undefined })} />)

    expect(screen.getByTestId("stToolbarActionButton")).toBeInTheDocument()
    expect(
      screen.queryByTestId("stToolbarActionButtonLabel")
    ).not.toBeInTheDocument()
  })

  it("maintains hover state after click when still hovering", async () => {
    const user = userEvent.setup()
    const onClickMock = vi.fn()

    render(
      <ActionButton {...getProps({ onClick: onClickMock, label: "Share" })} />
    )

    const button = screen.getByRole("button", { name: "Share" })

    // Hover over the button
    await user.hover(button)

    // Verify button has hover styles (this would need to be checked via computed styles in a real browser)
    // For now, we'll just verify the button is in the document and can be interacted with
    expect(button).toBeInTheDocument()

    // Click the button while still hovering
    await user.click(button)

    // Verify the onClick was called
    expect(onClickMock).toHaveBeenCalled()

    // Wait for the setTimeout to complete
    await new Promise(resolve => setTimeout(resolve, 20))

    // The button should still be hovered (cursor should still be over it)
    // In a real browser, this would maintain the hover state
    // We can't easily test CSS hover states in jsdom, but we can verify
    // the button is still interactive and hasn't lost focus
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()

    // The button should be focused after click to maintain hover-like state
    expect(button).toHaveFocus()
  })
})

describe("ToolbarActions", () => {
  const getProps = (
    extended?: Partial<ToolbarActionsProps>
  ): ToolbarActionsProps => ({
    hostToolbarItems: [
      { key: "favorite", icon: "star.svg" },
      { key: "share", label: "Share" },
    ],
    sendMessageToHost: vi.fn(),
    metricsMgr: new MetricsManager(mockSessionInfo()),
    ...extended,
  })

  it("renders without crashing", () => {
    render(<ToolbarActions {...getProps()} />)
    expect(screen.getByTestId("stToolbarActions")).toBeInTheDocument()
  })

  it("renders toolbar actions and renders action buttons horizontally", () => {
    render(<ToolbarActions {...getProps()} />)
    expect(screen.getByTestId("stToolbarActions")).toHaveStyle("display: flex")
  })

  it("calls sendMessageToHost with correct args when clicked", async () => {
    const user = userEvent.setup()
    const props = getProps()
    render(<ToolbarActions {...props} />)

    const favoriteButton = screen.getAllByTestId("stBaseButton-header")[0]
    await user.click(favoriteButton)

    // Wait for setTimeout to complete
    await waitForTimeout()

    expect(props.sendMessageToHost).toHaveBeenLastCalledWith({
      type: "TOOLBAR_ITEM_CALLBACK",
      key: "favorite",
    })

    const shareButton = screen.getByRole("button", { name: "Share" })
    await user.click(shareButton)

    // Wait for setTimeout to complete
    await waitForTimeout()

    expect(props.sendMessageToHost).toHaveBeenLastCalledWith({
      type: "TOOLBAR_ITEM_CALLBACK",
      key: "share",
    })
  })

  it("reproduces Community Cloud Share button hover issue", async () => {
    const user = userEvent.setup()

    // Mock sendMessageToHost to simulate the Community Cloud behavior
    // that might cause focus/hover state issues
    const sendMessageToHostMock = vi.fn().mockImplementation(() => {
      // Simulate what might happen in Community Cloud:
      // 1. The message is sent to the host
      // 2. This might trigger some async operation or state change
      // 3. That could affect the button's hover state

      // For testing purposes, we'll simulate a potential focus change
      // that might occur when the host processes the message
      setTimeout(() => {
        // This simulates the host potentially changing focus or triggering
        // some DOM manipulation that affects hover state
        document.body.focus()
      }, 0)
    })

    const props = getProps({
      hostToolbarItems: [{ key: "share", label: "Share" }],
      sendMessageToHost: sendMessageToHostMock,
    })

    render(<ToolbarActions {...props} />)

    const shareButton = screen.getByRole("button", { name: "Share" })

    // Hover over the Share button
    await user.hover(shareButton)

    // Click the Share button while hovering
    await user.click(shareButton)

    // Wait for the setTimeout to complete
    await new Promise(resolve => setTimeout(resolve, 20))

    // Verify the host message was sent
    expect(sendMessageToHostMock).toHaveBeenCalledWith({
      type: "TOOLBAR_ITEM_CALLBACK",
      key: "share",
    })

    // With our fix, the button should maintain focus after click
    // which helps preserve the hover-like appearance
    expect(shareButton).toHaveFocus()

    // The issue is that after clicking, the hover state is lost
    // even though the cursor is still over the button
    // This test documents the expected behavior - the button should
    // maintain its hover state after click if the cursor is still over it

    // In a real browser test, we would verify that:
    // 1. The button still has hover styles applied
    // 2. The cursor is still showing as a pointer
    // 3. The background color remains the hover color

    expect(shareButton).toBeInTheDocument()
    expect(shareButton).not.toBeDisabled()
  })
})
