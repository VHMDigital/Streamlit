# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import annotations

from typing import TYPE_CHECKING

from e2e_playwright.conftest import wait_for_app_loaded

if TYPE_CHECKING:
    from playwright.sync_api import Page


def test_no_console_errors(page: Page):
    """Test that the app does not log any console errors."""
    console_errors = []

    def on_console_message(msg):
        # Possible message types: "log", "debug", "info", "error", "warning", ...
        if msg.type == "error":
            # Each console message has text, location, etc.
            console_errors.append(
                {
                    "message": msg.text,
                    "url": msg.location["url"],
                    "line": msg.location["lineNumber"],
                    "column": msg.location["columnNumber"],
                }
            )

    page.on("console", on_console_message)
    page.goto("http://localhost:8501")
    wait_for_app_loaded(page)

    assert not console_errors, "Console errors were logged " + str(console_errors)
