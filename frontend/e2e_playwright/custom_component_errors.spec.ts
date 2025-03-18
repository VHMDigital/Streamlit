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

import { test, expect } from "@playwright/test"
import {
  loadPythonScript,
  waitForScriptFinish,
  COMPONENT_READY_WARNING_TIME_MS
} from "./lib/utils"

test.describe("Custom Component Errors", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/")
  })

  test("shows timeout error when component doesn't send COMPONENT_READY", async ({ page }) => {
    // Load a script that creates a custom component that never sends COMPONENT_READY
    await loadPythonScript(
      page,
      `
import streamlit as st
import streamlit.components.v1 as components

# Create a custom component that never sends COMPONENT_READY
components.html(
    '''
    <script>
        // Intentionally not sending COMPONENT_READY message
        window.addEventListener('message', function(event) {
            // Do nothing
        });
    </script>
    ''',
    height=100
)
      `
    )

    await waitForScriptFinish(page)

    // Wait for the timeout warning to appear
    await page.waitForTimeout(COMPONENT_READY_WARNING_TIME_MS)

    // Verify the warning message is shown
    const warningElement = page.getByText(/Your app is having trouble loading the .* component/)
    await expect(warningElement).toBeVisible()

    // Verify the error message contains troubleshooting link
    const troubleshootingLink = page.getByRole('link', { name: 'Streamlit Component docs' })
    await expect(troubleshootingLink).toBeVisible()
  })

  test("shows error when component source fails to load", async ({ page }) => {
    // Load a script that tries to load a non-existent custom component
    await loadPythonScript(
      page,
      `
import streamlit as st
import streamlit.components.v1 as components

# Try to load a non-existent component
components.declare_component(
    "non_existent_component",
    url="http://localhost:3001/non-existent"  # This URL should 404
)

# Use the non-existent component
st.components.v1.non_existent_component()
      `
    )

    await waitForScriptFinish(page)

    // Verify the error message is shown
    const errorElement = page.getByText(/404/)
    await expect(errorElement).toBeVisible()

    // Verify "Not Found" text appears in the error
    const notFoundElement = page.getByText(/Not Found/)
    await expect(notFoundElement).toBeVisible()
  })

  test("shows error when component source has network error", async ({ page }) => {
    // Block all requests to simulate network error
    await page.route('**/_stcore/components/*', route => route.abort('failed'))

    await loadPythonScript(
      page,
      `
import streamlit as st
import streamlit.components.v1 as components

# Try to load a component that will fail due to network error
components.declare_component(
    "network_error_component",
    url="http://localhost:3001/component"
)

# Use the component
st.components.v1.network_error_component()
      `
    )

    await waitForScriptFinish(page)

    // Verify the error message is shown
    const errorElement = page.getByText(/Error fetching source/)
    await expect(errorElement).toBeVisible()
  })
})
