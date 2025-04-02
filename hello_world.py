import streamlit as st
import pandas as pd
import numpy as np

st.title("Bar Chart Sorting Demo - Debugging")
st.write("This demonstrates how the sort_by and ascending parameters affect the underlying data")

# Create sample data with very distinct values to make sorting obvious
st.subheader("Original Sample Data")
data = pd.DataFrame({
    'category': ['A', 'B', 'C', 'D', 'E'],
    'values': [30, 70, 20, 90, 50],
    'importance': [3, 5, 1, 4, 2]  # Lower number = higher importance
})

# Display the original data as a table
st.dataframe(data)

# Interactive controls for sorting options
st.subheader("Select Sorting Options")

# Create two columns for the controls
col1, col2, col3 = st.columns(3)

with col1:
    # Option to select which column to sort by
    sort_by_column = st.selectbox(
        "Sort by:", 
        options=['None', 'category', 'values', 'importance'],
        index=0
    )

with col2:
    # Option to select sort order
    ascending = st.checkbox("Sort ascending", value=False)

with col3:
    # Which column to display in the chart
    y_column = st.selectbox(
        "Display column:", 
        options=['values', 'importance'],
        index=0
    )

# Prepare data based on sorting options
if sort_by_column == 'None':
    sorted_data = data.copy()
    sorting_description = "No sorting applied"
else:
    # This is what your implementation does in built_in_chart_utils.py
    sorted_data = data.sort_values(by=sort_by_column, ascending=ascending)
    sort_direction = "ascending" if ascending else "descending"
    sorting_description = f"Sorted by '{sort_by_column}' ({sort_direction})"

# Display the sorted data
st.subheader("Data After Sorting")
st.write(f"**{sorting_description}**")
st.dataframe(sorted_data.reset_index(drop=True))

# Display the bar chart
st.subheader("Bar Chart with Sorting Applied")
st.write(f"Displaying '{y_column}' with {sorting_description.lower()}")

# For demonstration, let's try two approaches:

# APPROACH 1: Using your sort_by parameter implementation
st.write("1. Using the sort_by parameter implementation:")
if sort_by_column == 'None':
    # No sorting
    st.bar_chart(
        data,
        x='category',
        y=y_column
    )
else:
    # Using sort_by parameter - test if this works
    st.bar_chart(
        data,
        x='category',
        y=y_column,
        sort_by=sort_by_column,
        ascending=ascending
    )

# APPROACH 2: The foolproof way - pre-sort the dataframe AND category values
st.write("2. Pre-sorted approach (guaranteed to work):")
if sort_by_column != 'None':
    # Create a categorical index with the right order
    sorted_categories = sorted_data['category'].tolist()
    # Use pandas' categorical dtype with explicit order
    display_data = data.copy()
    display_data['category'] = pd.Categorical(
        display_data['category'],
        categories=sorted_categories,
        ordered=True
    )
    # Display this guaranteed sorted version
    st.bar_chart(
        display_data,
        x='category',
        y=y_column
    )
else:
    # No sorting needed
    st.bar_chart(
        data,
        x='category',
        y=y_column
    )

# Display a manually sorted chart for comparison
st.subheader("Comparison: Manual Pre-sorting Approach")
st.write("The same chart but using a pre-sorted DataFrame (traditional approach):")

# Use the manually sorted dataframe directly
st.bar_chart(
    sorted_data,
    x='category',
    y=y_column
)

# Example suggestions
st.markdown("""---
### Example use cases to try:

1. **Default view**: Display 'values' with no sorting
2. **Basic sorting**: Display 'values' sorted by 'values' (ascending or descending)
3. **Key feature**: Display 'values' sorted by 'importance' (this demonstrates the main feature of GitHub issue #7111)
4. **Reverse view**: Display 'importance' sorted by 'values'

The interactive controls in the sidebar let you experiment with all these combinations.
""")

# Implementation explanation
st.markdown("""---
### About This Implementation

This demo showcases the `sort_by` and `ascending` parameters that were added to `st.bar_chart` to address GitHub issue #7111.

The implementation in `built_in_chart_utils.py` includes this key code:

```python
# Sort the dataframe if sort_by is specified and exists in the dataframe
if sort_by is not None and sort_by in df.columns:
    df = df.sort_values(by=sort_by, ascending=ascending)
```

This enhancement allows users to sort bar charts by any column in their dataset while displaying a different column for the bars, without having to manually pre-sort their data.

By separating the column used for display from the column used for sorting, you've made Streamlit's visualization capabilities more flexible and powerful.
""")
