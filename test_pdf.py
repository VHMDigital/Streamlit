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

import streamlit as st

st.title("PDF Viewer Test")

# Sidebar controls
st.sidebar.header("PDF Viewer Options")

# Input type selection
input_type = st.sidebar.radio(
    "Select input type:", options=["File Upload", "URL"], index=0
)

pdf_source = None
pdf_name = ""

if input_type == "File Upload":
    uploaded_file = st.sidebar.file_uploader(
        "Choose a PDF file", type="pdf", help="Upload a PDF file from your computer"
    )
    if uploaded_file is not None:
        pdf_source = uploaded_file
        pdf_name = uploaded_file.name
else:  # URL input
    pdf_url = st.sidebar.text_input(
        "Enter PDF URL:",
        placeholder="https://example.com/sample.pdf",
        help="Enter a direct URL to a PDF file",
    )
    if pdf_url:
        pdf_source = pdf_url
        pdf_name = pdf_url.split("/")[-1] if "/" in pdf_url else "PDF from URL"

# Width options
width_type = st.sidebar.radio("Width type:", options=["stretch", "custom"], index=0)

if width_type == "custom":
    width_value = st.sidebar.slider(
        "Width (pixels):", min_value=300, max_value=1200, value=600, step=50
    )
else:
    width_value = "stretch"

# Height control
height_value = st.sidebar.slider(
    "Height (pixels):", min_value=300, max_value=1000, value=500, step=50
)

# Use external module toggle
use_ext_module = st.sidebar.checkbox("Use external module (react-pdf)", value=False)
hide_toolbar = st.sidebar.checkbox("Hide Toolbar")

# Display current settings
st.sidebar.markdown("---")
st.sidebar.markdown("**Current Settings:**")
st.sidebar.write(f"Input type: {input_type}")
if pdf_source:
    st.sidebar.write(f"PDF: {pdf_name}")
st.sidebar.write(f"Width: {width_value}")
st.sidebar.write(f"Height: {height_value}")
st.sidebar.write(f"External module: {use_ext_module}")
st.sidebar.write(f"Hide Toolbar: {hide_toolbar}")

# Display the PDF with selected options
if pdf_source:
    st.subheader(f"Displaying: {pdf_name}")

    try:
        pdf_result = st.pdf(
            pdf_source,
            width=width_value,
            height=height_value,
            use_ext_module=use_ext_module,
            hide_toolbar=hide_toolbar,
        )
        st.success("PDF loaded successfully!")
    except Exception as e:
        st.error(f"Error loading PDF: {e}")
        st.write(f"Attempted to load: {pdf_name}")
else:
    st.info(
        f"Please {'upload a PDF file' if input_type == 'File Upload' else 'enter a PDF URL'} to view it here."
    )
