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

from playwright.sync_api import Page, expect

from e2e_playwright.conftest import ImageCompareFunction
from e2e_playwright.shared.app_utils import check_top_level_class, get_element_by_key


def test_st_json_editor_displays_correctly(
    app: Page, assert_snapshot: ImageCompareFunction
):
    """Test st.json renders the data correctly."""
    json_elements = app.get_by_test_id("stJsonEditor")
    expect(json_elements).to_have_count(14)

    assert_snapshot(json_elements.nth(0), name="st_json_editor-simple_dict")
    assert_snapshot(json_elements.nth(1), name="st_json_editor-collapsed")
    assert_snapshot(json_elements.nth(2), name="st_json_editor-with_white_spaces")
    # The complex dict is  tested in the themed test below
    assert_snapshot(json_elements.nth(4), name="st_json_editor-simple_list")
    assert_snapshot(json_elements.nth(5), name="st_json_editor-empty_dict")
    assert_snapshot(json_elements.nth(6), name="st_json_editor-expanded_2")
    # The disabled edit json test is  tested in another test below
    # Width tests
    assert_snapshot(json_elements.nth(8), name="st_json_editor-width_stretch")
    assert_snapshot(json_elements.nth(9), name="st_json_editor-width_pixels")

    # The container bounds test is  tested in another test below
    # The onChange function test is  tested in another test below
    # Edit and view tests are tested in another tests below


def test_st_json_editor_keeps_container_bounds(
    app: Page, assert_snapshot: ImageCompareFunction
):
    """Test st.json_editor keeps the container bounds."""
    container_with_json_editor = get_element_by_key(app, "container_with_json_editor")
    expect(container_with_json_editor.get_by_test_id("stJsonEditor")).to_have_count(1)
    assert_snapshot(container_with_json_editor, name="st_json-keep_bounds")


def test_st_json_editor_displays_correctly_when_themed(
    themed_app: Page, assert_snapshot: ImageCompareFunction
):
    """Test st.json_editor renders the data correctly with different themes."""
    json_elements = themed_app.get_by_test_id("stJsonEditor")
    assert_snapshot(json_elements.nth(3), name="st_json_editor-complex_dict")


def test_check_top_level_class(app: Page):
    """Check that the top level class is correctly set."""
    check_top_level_class(app, "stJsonEditor")


def test_shows_copy_icon(themed_app: Page, assert_snapshot: ImageCompareFunction):
    """Test that the copy icon is shown by hovering over the element."""
    json_element = themed_app.get_by_test_id("stJsonEditor").nth(7)
    expect(json_element).to_be_visible()
    hover_target = json_element.locator(".jer-value-string")
    hover_target.hover()

    assert_snapshot(
        json_element, name="st_json_editor-copy_icon_on_hover_edit_disabled"
    )


def test_shows_edit_icon_on_hovering(
    themed_app: Page, assert_snapshot: ImageCompareFunction
):
    """Test that the copy icon is shown by hovering over the element."""
    json_element = themed_app.get_by_test_id("stJsonEditor").nth(0)
    expect(json_element).to_be_visible()
    hover_target = json_element.locator(".jer-value-string")
    hover_target.hover()

    assert_snapshot(json_element, name="st_json_editor-edit_icon_on_hover")


def test_json_editor_has_correct_value_when_edited(app: Page):
    """Test that st.json_edit has the correct value when edited."""

    json_element = app.get_by_test_id("stJsonEditor").nth(12)
    expect(json_element).to_be_visible()
    click_target = json_element.locator("#car_display")
    fill_target = json_element.locator("#car_textarea")
    click_target.dblclick()
    fill_target.fill("Renault")
    fill_target.press("Enter")

    expect(app.get_by_test_id("stMarkdown").nth(2)).to_have_text(
        'value : {"car": "Renault"}'
    )


def test_json_editor_has_correct_value_when_not_edited(app: Page):
    """Test that st.json_edit has the correct value when NOT edited because edit is disabled."""

    json_element = app.get_by_test_id("stJsonEditor").nth(13)
    expect(json_element).to_be_visible()
    click_target = json_element.locator("#MotorBike_display")
    click_target.dblclick()

    expect(app.get_by_test_id("stMarkdown").nth(3)).to_have_text(
        'value : {"MotorBike": "Kawasaki"}'
    )


def test_calls_callback_on_change(app: Page):
    """Test that it correctly calls the callback on change."""

    json_element = app.get_by_test_id("stJsonEditor").nth(11)
    expect(json_element).to_be_visible()
    click_target = json_element.locator("#Car\\.2_display")
    fill_target = json_element.locator("#Car\\.2_textarea")
    click_target.dblclick()
    fill_target.fill("1964")
    fill_target.press("Enter")

    expect(app.get_by_test_id("stMarkdown").nth(0)).to_have_text(
        'value : {"Car": ["Chevrolet", "Impala", "1964"]}',
        use_inner_text=True,
    )
    expect(app.get_by_test_id("stMarkdown").nth(1)).to_have_text(
        "text input changed: True",
        use_inner_text=True,
    )
