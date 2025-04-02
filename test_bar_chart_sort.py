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

import pandas as pd

import streamlit as st

st.title("Bar Chart Sorting Demo")

# Create sample data
top_users = pd.DataFrame(
    {
        "name": ["John", "Emma", "Kelly", "Brad", "Rachel"],
        "views": [300, 200, 250, 400, 50],
    }
)

st.subheader("Original Data")
st.dataframe(top_users)

st.subheader("Default Bar Chart (sorted by x-axis)")
st.bar_chart(top_users, x="name", y="views")

st.subheader("Bar Chart sorted by 'views' (descending)")
st.bar_chart(top_users, x="name", y="views", sort_by="views", ascending=False)

st.subheader("Bar Chart sorted by 'views' (ascending)")
st.bar_chart(top_users, x="name", y="views", sort_by="views", ascending=True)

st.subheader("Horizontal Bar Chart sorted by 'views' (descending)")
st.bar_chart(
    top_users, x="name", y="views", sort_by="views", ascending=False, horizontal=True
)

# Create more complex sample data
st.title("More Examples")

complex_data = pd.DataFrame(
    {
        "category": ["A", "B", "C", "D", "E"],
        "value1": [5, 3, 7, 2, 9],
        "value2": [10, 30, 20, 40, 15],
    }
)

st.subheader("Complex data")
st.dataframe(complex_data)

st.subheader("Sorting by value1 (descending)")
st.bar_chart(
    complex_data,
    x="category",
    y=["value1", "value2"],
    sort_by="value1",
    ascending=False,
)

st.subheader("Sorting by value2 (ascending)")
st.bar_chart(
    complex_data, x="category", y=["value1", "value2"], sort_by="value2", ascending=True
)
