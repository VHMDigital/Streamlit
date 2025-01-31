import streamlit as st
import numpy as np
from PIL import Image  # Added import for image processing
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Function to normalize the image
def normalize_image(image):
    return image / 255.0

# Function to augment the image
def augment_image(image):
    datagen = ImageDataGenerator(
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1
    )
    image = np.expand_dims(image, 0)
    it = datagen.flow(image, batch_size=1)
    return it[0].astype('float32')[0]

# Upload image from input data
uploaded_file = st.file_uploader("Upload an image", type=["png", "jpg", "jpeg"])

# Layout the columns
col1, col2 = st.columns(2)

# Clear button state
clear_state = st.session_state.get('clear', False)

with col1:
    if st.button("Clear"):
        st.session_state.clear = True

if not clear_state:
    if uploaded_file is not None:
        image = np.array(Image.open(uploaded_file))
        
        # Normalize the image
        normalized_image = normalize_image(image)
        
        # Augment the image
        augmented_image = augment_image(normalized_image)
        
        # Display the original and processed image
        st.image(image, caption="Original Image")
        st.image(augmented_image, caption="Processed Image")
        
        # Your code for prediction on the processed image
        # result = model.predict(augmented_image)
        # st.write("Prediction:", result)
else:
    st.session_state.clear = False

# Rest of your Streamlit app code
