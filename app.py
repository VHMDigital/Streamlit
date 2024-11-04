import streamlit as st

'''Hello this is an example :cloud:'''

# st.file_uploader(
#     "Your best cat photo",
#     type=["jpg", "png"],
# )


# import streamlit as st
# from pathlib import Path
# import tempfile

# # Create temporary directory
# temp_dir = Path(tempfile.mkdtemp())

# # Create test files
# image_file = Path.home() / "Desktop" / "test-media-files" / "image.jpeg"
# audio_file = Path.home() / "Desktop" / "test-media-files" / "audio.wav"
# video_file = Path.home() / "Desktop" / "test-media-files" / "video.mp4"

# # Test st.set_page_config
# st.set_page_config(
#     page_title="Streamlit Test App",
#     page_icon=image_file,
# )

# # Test st.image
# st.subheader("Testing st.image")
# st.image(image_file)

# # Test st.audio
# st.subheader("Testing st.audio")
# st.audio(audio_file)

# # Test st.video
# st.subheader("Testing st.video")
# st.video(video_file)

# # Test st.switch_page and st.page_link
# st.subheader("Testing st.switch_page and st.page_link")
# if st.button("Switch to About page"):
#     st.switch_page(Path("pages/about.py"))
# st.page_link(Path("pages/about.py"), label="Go to About page")

# # Test st.logo
# st.subheader("Testing st.logo")
# st.logo(image_file)

# # Test st.html
# st.subheader("Testing st.html")
# st.html(Path.home() / "Desktop" / "test-media-files" / "html.html")

# st.subheader("Testing st.chat_message")
# st.chat_message("user", avatar=image_file)

# st.success("All tests completed!")

# # Note: We're not cleaning up the temp files at the end of the app.
# # They will be automatically removed when the system cleans up the temp directory.
