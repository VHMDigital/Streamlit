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

"""PDF element unit test."""

import pytest
from parameterized import parameterized

import streamlit as st
from streamlit.errors import StreamlitInvalidWidthError
from tests.delta_generator_test_case import DeltaGeneratorTestCase
from tests.streamlit.elements.layout_test_utils import WidthConfigFields


class PdfTest(DeltaGeneratorTestCase):
    """Test ability to marshall PDF protos."""

    def test_pdf_url(self):
        """Test PDF with URL."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url)

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert element.pdf.height == 500  # default height
        assert element.pdf.use_ext_module is False  # default value

    def test_pdf_with_height(self):
        """Test PDF with custom height."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url, height=600)

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert element.pdf.height == 600
        assert element.pdf.use_ext_module is False

    def test_pdf_with_use_ext_module_true(self):
        """Test PDF with use_ext_module set to True."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url, use_ext_module=True)

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert element.pdf.use_ext_module is True

    def test_pdf_with_use_ext_module_false(self):
        """Test PDF with use_ext_module set to False."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url, use_ext_module=False)

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert element.pdf.use_ext_module is False

    def test_pdf_with_width_pixels(self):
        """Test PDF with width in pixels."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url, width=500)

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert (
            element.width_config.WhichOneof("width_spec")
            == WidthConfigFields.PIXEL_WIDTH.value
        )
        assert element.width_config.pixel_width == 500

    def test_pdf_with_width_stretch(self):
        """Test PDF with stretch width."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url, width="stretch")

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert (
            element.width_config.WhichOneof("width_spec")
            == WidthConfigFields.USE_STRETCH.value
        )
        assert element.width_config.use_stretch is True

    def test_pdf_with_default_width(self):
        """Test PDF with default width."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url)

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert (
            element.width_config.WhichOneof("width_spec")
            == WidthConfigFields.USE_STRETCH.value
        )
        assert element.width_config.use_stretch is True

    @parameterized.expand(
        [
            "invalid",
            "content",  # content is not allowed for PDF
            -100,
            0,
            100.5,
            None,
        ]
    )
    def test_pdf_with_invalid_width(self, width):
        """Test PDF with invalid width values."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        with pytest.raises(StreamlitInvalidWidthError) as e:
            st.pdf(url, width=width)
        assert "Invalid width" in str(e.value)

    def test_pdf_with_both_width_and_height(self):
        """Test PDF with both width and height specified."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url, width=400, height=300)

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert element.pdf.height == 300
        assert (
            element.width_config.WhichOneof("width_spec")
            == WidthConfigFields.PIXEL_WIDTH.value
        )
        assert element.width_config.pixel_width == 400

    def test_pdf_with_all_parameters(self):
        """Test PDF with all parameters specified."""
        url = "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
        st.pdf(url, width=600, height=400, use_ext_module=True)

        element = self.get_delta_from_queue().new_element
        assert element.pdf.url == url
        assert element.pdf.height == 400
        assert element.pdf.use_ext_module is True
        assert (
            element.width_config.WhichOneof("width_spec")
            == WidthConfigFields.PIXEL_WIDTH.value
        )
        assert element.width_config.pixel_width == 600
