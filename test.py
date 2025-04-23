import streamlit as st
import pandas as pd
import numpy as np

st.title('Test Checkbox/Toggle')

st.toggle("Test", True)

st.toggle(
    "Enable feature",
    value=True,
    on_label="✅ Enabled",
    off_label="❌ Disabled"
)

st.checkbox(
    "Enable feature",
    value=True,
    )