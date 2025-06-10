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

st.title("PDF Upload Test")

# File uploader
uploaded_file = st.file_uploader("Upload a PDF", type=["pdf"])

if uploaded_file is not None:
    st.write(f"File uploaded: {uploaded_file.name}")
    st.write(f"File size: {len(uploaded_file.getvalue())} bytes")

    # Test with external module (react-pdf)
    st.subheader("Using react-pdf (use_ext_module=True)")
    try:
        st.pdf(uploaded_file, use_ext_module=True, height=400)
        st.success("✅ react-pdf rendering successful!")
    except Exception as e:
        st.error(f"❌ react-pdf rendering failed: {e}")

    # Test with iframe (default)
    st.subheader("Using iframe (use_ext_module=False)")
    try:
        # Reset file pointer
        uploaded_file.seek(0)
        st.pdf(uploaded_file, use_ext_module=False, height=400)
        st.success("✅ iframe rendering successful!")
    except Exception as e:
        st.error(f"❌ iframe rendering failed: {e}")
else:
    st.info("Please upload a PDF file to test the functionality.")
