import streamlit as st
import numpy as np
from PIL import Image
import joblib

# Load the trained model
model_path = "C:/Users/olgaw/Documents/python_code/Streamlit_app/models/model.pkl"
clf_extra_trees = joblib.load(model_path)

# Streamlit app title
st.title("Handwritten Digit Recognition")

# File uploader
uploaded_file = st.file_uploader("Upload an image of a digit", type=["png", "jpg", "jpeg"])

# Function to preprocess the image
def preprocess_image(image):
    st.write("✅ Image successfully uploaded!")  # Indicate that image was received

    # Convert image to grayscale
    image = image.convert('L')

    # Resize to 28x28 pixels (MNIST format)
    image = image.resize((28, 28))

    # Convert to NumPy array
    image_array = np.array(image)

    # Invert colors (MNIST uses black background)
    image_array = 255 - image_array

    # Normalize values to range 0-1
    image_array = image_array / 255.0

    # Flatten the array to match model input format (28x28 -> 784)
    image_array = image_array.flatten().reshape(1, -1)

    st.write("🖼️ Preprocessed image:")
    st.image(image, width=140)  # Show the processed image

    return image_array

# Layout: Three columns
col1, col2, col3 = st.columns([1, 1, 1])

with col1:
    st.header("Upload Image")
    if uploaded_file:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Image", width=140)

        # Preprocess image
        img_array = preprocess_image(image)

        # Clear previous prediction
        predicted_number = None

with col2:
    st.header("Model's View")
    if uploaded_file:
        # Show what the model "sees"
        st.image(image.resize((28, 28)), caption="Model's Input", width=140)

with col3:
    st.header("Prediction & Accuracy")
    if uploaded_file:
        # Ensure correct shape before prediction
        if img_array.shape == (1, 784):
            predicted_number = clf_extra_trees.predict(img_array)
            prediction_confidence = np.max(clf_extra_trees.predict_proba(img_array)) * 100

            st.write(f"🎯 **Predicted Digit:** {predicted_number[0]}")
            st.write(f"📊 **Prediction Confidence:** {prediction_confidence:.2f}%")
        else:
            st.error("⚠️ Image shape mismatch! Ensure proper preprocessing.")

        # Display confusion matrix image
        matrix_path = "C:/Users/olgaw/Documents/python_code/Streamlit_app/images/matrix.png"
        st.image(matrix_path, caption="Confusion Matrix", use_column_width=True)
