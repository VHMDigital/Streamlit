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

# URL options
pdf_options = {
    "Online Sample PDF": "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf",
    "Local Sample PDF": "/Users/smohile/Downloads/sample-local-pdf.pdf",
    "PDF Sample": "/Users/smohile/Downloads/pdf_sample.pdf",
    "C4611 Sample": "/Users/smohile/Downloads/c4611_sample_explain.pdf",
}

selected_pdf = st.sidebar.selectbox(
    "Select PDF:", options=list(pdf_options.keys()), index=0
)

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
use_ext_module = st.sidebar.checkbox("Use external module (react-pdf)", value=True)

# Display current settings
st.sidebar.markdown("---")
st.sidebar.markdown("**Current Settings:**")
st.sidebar.write(f"PDF: {selected_pdf}")
st.sidebar.write(f"Width: {width_value}")
st.sidebar.write(f"Height: {height_value}")
st.sidebar.write(f"External module: {use_ext_module}")

# Display the PDF with selected options
st.subheader(f"Displaying: {selected_pdf}")

try:
    pdf_result = st.pdf(
        pdf_options[selected_pdf],
        width=width_value,
        height=height_value,
        use_ext_module=use_ext_module,
    )
    st.success("PDF loaded successfully!")
except Exception as e:
    st.error(f"Error loading PDF: {e}")
    st.write(f"Attempted to load: {pdf_options[selected_pdf]}")
