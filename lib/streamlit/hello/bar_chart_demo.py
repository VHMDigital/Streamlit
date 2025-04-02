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

import numpy as np
import pandas as pd

import streamlit as st
from streamlit.hello.utils import show_code


def bar_chart_demo():
    st.header("Basic Bar Chart")
    chart_data = pd.DataFrame(np.random.randn(20, 3), columns=["a", "b", "c"])
    st.bar_chart(chart_data)

    st.header("Bar Chart with Sorting")

    # Demo 1: Sorting by values
    st.subheader("Sorting by values - User Engagement Example")

    # Create sample data
    top_users = pd.DataFrame(
        {
            "name": ["John", "Emma", "Kelly", "Brad", "Rachel"],
            "views": [300, 200, 250, 400, 50],
        }
    )

    col1, col2 = st.columns(2)

    with col1:
        st.caption("Original data")
        st.dataframe(top_users)

    with col2:
        st.caption("Default Bar Chart (sorted by x-axis)")
        st.bar_chart(top_users, x="name", y="views")

    col1, col2 = st.columns(2)

    with col1:
        st.caption("Bar Chart sorted by 'views' (descending)")
        st.bar_chart(top_users, x="name", y="views", sort_by="views", ascending=False)

    with col2:
        st.caption("Bar Chart sorted by 'views' (ascending)")
        st.bar_chart(top_users, x="name", y="views", sort_by="views", ascending=True)

    # Demo 2: Horizontal bar charts with sorting
    st.subheader("Horizontal Bar Charts with Sorting")

    col1, col2 = st.columns(2)

    with col1:
        st.caption("Horizontal Bar Chart (default)")
        st.bar_chart(top_users, x="name", y="views", horizontal=True)

    with col2:
        st.caption("Horizontal Bar Chart (sorted by 'views')")
        st.bar_chart(
            top_users,
            x="name",
            y="views",
            sort_by="views",
            ascending=False,
            horizontal=True,
        )

    # Demo 3: Multiple series with sorting
    st.subheader("Multiple Series Bar Chart with Sorting")

    # Create more complex sample data
    product_data = pd.DataFrame(
        {
            "product": [
                "Product A",
                "Product B",
                "Product C",
                "Product D",
                "Product E",
            ],
            "sales_2021": [150, 200, 125, 350, 275],
            "sales_2022": [180, 220, 160, 310, 290],
        }
    )

    col1, col2 = st.columns(2)

    with col1:
        st.caption("Original data")
        st.dataframe(product_data)

    with col2:
        st.caption("Default Bar Chart (multiple series)")
        st.bar_chart(product_data, x="product", y=["sales_2021", "sales_2022"])

    col1, col2 = st.columns(2)

    with col1:
        st.caption("Sorted by 2021 sales (descending)")
        st.bar_chart(
            product_data,
            x="product",
            y=["sales_2021", "sales_2022"],
            sort_by="sales_2021",
            ascending=False,
        )

    with col2:
        st.caption("Sorted by 2022 sales (ascending)")
        st.bar_chart(
            product_data,
            x="product",
            y=["sales_2021", "sales_2022"],
            sort_by="sales_2022",
            ascending=True,
        )

    # Demo 4: Real-world example - Country data
    st.subheader("Real-World Example - GDP per Capita")

    country_data = pd.DataFrame(
        {
            "country": [
                "United States",
                "China",
                "Japan",
                "Germany",
                "India",
                "United Kingdom",
                "France",
                "Brazil",
                "Italy",
                "Canada",
            ],
            "gdp_per_capita": [
                69288,
                12556,
                39312,
                51988,
                2256,
                46510,
                44853,
                7741,
                34777,
                51988,
            ],
            "population_millions": [
                329.5,
                1410.0,
                125.8,
                83.2,
                1380.0,
                67.2,
                67.4,
                212.6,
                60.5,
                38.0,
            ],
        }
    )

    col1, col2 = st.columns(2)

    with col1:
        st.caption("Countries (alphabetical)")
        st.bar_chart(country_data, x="country", y="gdp_per_capita")

    with col2:
        st.caption("Countries by GDP per Capita (descending)")
        st.bar_chart(
            country_data,
            x="country",
            y="gdp_per_capita",
            sort_by="gdp_per_capita",
            ascending=False,
        )

    st.write("""
    ## How to use the `sort_by` parameter

    The new `sort_by` parameter allows you to specify which column to use for sorting the bars.
    This is particularly useful when you want to display bars in a specific order,
    rather than the default alphabetical order of the x-axis values.

    ```python
    # Basic syntax
    st.bar_chart(df, x="category", y="value", sort_by="value", ascending=False)
    ```

    - **sort_by**: Specify the column name to sort by
    - **ascending**: Set to `True` for ascending order, `False` for descending order (default is `False`)

    This works with both vertical and horizontal bar charts, and with multiple series.
    """)


st.set_page_config(page_title="Bar Chart Demo", page_icon=":chart_with_upwards_trend:")
st.title("Bar Chart Demo")
st.write(
    """
    This demo shows the various capabilities of the Streamlit bar chart,
    including the new sorting features.

    With the `sort_by` parameter, you can now easily sort your bar charts by any column,
    not just the x-axis values. This makes it much easier to create charts that highlight
    the highest or lowest values.
    """
)
bar_chart_demo()
show_code(bar_chart_demo)
