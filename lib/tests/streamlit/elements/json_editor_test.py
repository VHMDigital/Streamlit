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

import json

import numpy as np
import pytest
from parameterized import parameterized

import streamlit as st
from streamlit.elements.widgets.json_editor import JsonEditorSerde
from streamlit.errors import StreamlitInvalidWidthError
from tests.delta_generator_test_case import DeltaGeneratorTestCase
from tests.streamlit.elements.layout_test_utils import WidthConfigFields


class StjsonEditorAPITest(DeltaGeneratorTestCase):
    """Test Public Streamlit Public APIs."""

    def test_st_json_editor(self):
        """Test st.json_editor."""
        st.json_editor('{"some": "json_editor"}')

        el = self.get_delta_from_queue().new_element
        assert el.json_editor.body == '{"some": "json_editor"}'
        assert el.json_editor.expanded is True
        assert el.json_editor.HasField("max_expand_depth") is False
        assert (
            el.json_editor.width_config.WhichOneof("width_spec")
            == WidthConfigFields.USE_STRETCH.value
        )
        assert el.json_editor.width_config.use_stretch is True

        # Test that an object containing non-json_editor-friendly keys can still
        # be displayed.  Resultant json_editor body will be missing those keys.

        n = np.array([1, 2, 3, 4, 5])
        data = {n[0]: "this key will not render as json_editor", "array": n}
        st.json_editor(data)

        el = self.get_delta_from_queue().new_element
        assert el.json_editor.body == '{"array": "array([1, 2, 3, 4, 5])"}'
        assert (
            el.json_editor.width_config.WhichOneof("width_spec")
            == WidthConfigFields.USE_STRETCH.value
        )
        assert el.json_editor.width_config.use_stretch is True

    def test_expanded_param(self):
        """Test expanded parameter for `st.json_editor`"""
        st.json_editor(
            {
                "level1": {"level2": {"level3": {"a": "b"}}, "c": "d"},
            },
            expanded=2,
            key="json_editor",
        )

        el = self.get_delta_from_queue().new_element
        assert el.json_editor.expanded is True
        assert el.json_editor.max_expand_depth == 2
        assert (
            el.json_editor.width_config.WhichOneof("width_spec")
            == WidthConfigFields.USE_STRETCH.value
        )
        assert el.json_editor.width_config.use_stretch is True

        with self.assertRaises(TypeError):
            st.json_editor(
                {
                    "level1": {"level2": {"level3": {"a": "b"}}, "c": "d"},
                },
                expanded=["foo"],  # type: ignore
            )

    def test_st_json_editor_with_width_pixels(self):
        """Test st.json_editor with width in pixels."""
        st.json_editor('{"some": "json_editor"}', width=500)

        el = self.get_delta_from_queue().new_element
        assert (
            el.json_editor.width_config.WhichOneof("width_spec")
            == WidthConfigFields.PIXEL_WIDTH.value
        )
        assert el.json_editor.width_config.pixel_width == 500

    def test_st_json_editor_with_width_stretch(self):
        """Test st.json_editor with stretch width."""
        st.json_editor('{"some": "json_editor"}', width="stretch")

        el = self.get_delta_from_queue().new_element
        assert (
            el.json_editor.width_config.WhichOneof("width_spec")
            == WidthConfigFields.USE_STRETCH.value
        )
        assert el.json_editor.width_config.use_stretch is True

    @parameterized.expand(
        [
            "invalid",
            -100,
            0,
            100.5,
            None,
        ]
    )
    def test_st_json_editor_with_invalid_width(self, width):
        """Test st.json_editor with invalid width values."""
        with pytest.raises(StreamlitInvalidWidthError) as e:
            st.json_editor('{"some": "json_editor"}', width=width)
        assert "Invalid width" in str(e.value)

    def test_st_json_editor_with_key(self):
        """Test st.json_editor with a unique key."""
        st.json_editor('{"keyed": "value"}', key="unique_json_editor")
        el = self.get_delta_from_queue().new_element
        assert el.json_editor.body == '{"keyed": "value"}'

    def test_st_json_editor_with_nested_dict(self):
        """Test st.json_editor with a deeply nested dictionary."""
        data = {"level1": {"level2": {"level3": {"value": 42, "list": [1, 2, 3]}}}}
        st.json_editor(data)
        el = self.get_delta_from_queue().new_element
        assert '"value": 42' in el.json_editor.body
        assert '"list": [1, 2, 3]' in el.json_editor.body

    def test_st_json_editor_with_list_input(self):
        """Test st.json_editor with a list as top-level input."""
        st.json_editor([{"item": 1}, {"item": 2}])
        el = self.get_delta_from_queue().new_element
        assert el.json_editor.body.startswith("[")
        assert '"item": 1' in el.json_editor.body

    def test_deserialize_with_valid_edited_json(self):
        serde = JsonEditorSerde(body={"name": "Alice"})
        edited = '{"name": "Bob"}'
        result = serde.deserialize(edited)
        assert result == {"name": "Bob"}

    def test_deserialize_with_none_uses_original_body(self):
        body = {"foo": "bar"}
        serde = JsonEditorSerde(body=body)
        result = serde.deserialize(None)
        assert result == body

    def test_deserialize_with_empty_string_returns_empty_string(self):
        serde = JsonEditorSerde(body={"foo": "bar"})
        result = serde.deserialize("")
        assert result == ""

    def test_deserialize_with_list_and_types(self):
        edited = '[1, "two", true, null]'
        serde = JsonEditorSerde(body=[])
        result = serde.deserialize(edited)
        assert result == [1, "two", True, None]

    def test_serialize_set_to_list(self):
        serde = JsonEditorSerde(body=None)
        result = serde.serialize({"items": {1, 2}})
        # JSON string should have list, not set
        assert json.loads(result)["items"] == [1, 2] or json.loads(result)["items"] == [
            2,
            1,
        ]

    def test_deserialize_nested_object_edit(self):
        original = {"Item1": {"Item2": "a", "Item3": "b"}}
        edited = '{"Item1": {"Item2": "c", "Item3": "d"}}'
        serde = JsonEditorSerde(body=original)
        result = serde.deserialize(edited)
        assert result == {"Item1": {"Item2": "c", "Item3": "d"}}

    def test_deserialize_invalid_json_raises(self):
        serde = JsonEditorSerde(body={})
        with pytest.raises(json.JSONDecodeError):
            serde.deserialize('{"name": "Bob"')
