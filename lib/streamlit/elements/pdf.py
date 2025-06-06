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

from __future__ import annotations

import io
from pathlib import Path
from typing import TYPE_CHECKING, Union, cast

from typing_extensions import TypeAlias

from streamlit import runtime, url_util
from streamlit.elements.lib.form_utils import current_form_id
from streamlit.elements.lib.layout_utils import LayoutConfig, validate_width
from streamlit.elements.lib.utils import compute_and_register_element_id
from streamlit.proto.Pdf_pb2 import Pdf as PdfProto
from streamlit.runtime.metrics_util import gather_metrics

if TYPE_CHECKING:
    from streamlit.delta_generator import DeltaGenerator
    from streamlit.elements.lib.layout_utils import WidthWithoutContent

PdfData: TypeAlias = Union[str, Path, bytes, io.BytesIO]


class PdfMixin:
    @gather_metrics("pdf")
    def pdf(
        self,
        data: PdfData,
        *,
        height: int = 500,
        width: WidthWithoutContent = "stretch",
        use_ext_module: bool = False,
        hide_toolbar: bool = True,
    ) -> DeltaGenerator:
        """Display a PDF viewer.

        Parameters
        ----------
        data : str, Path, bytes, or BytesIO
            The PDF file to show. This can be one of the following:
            - A URL (string) for a hosted PDF file.
            - A path to a local PDF file.
            - A file-like object, e.g. a file opened with `open` or an `UploadedFile` returned by `st.file_uploader`.
            - Raw bytes data.
        height : int
            Height of the PDF viewer in pixels.
        width : int or "stretch"
            Desired width of the PDF viewer. Can be "stretch" for full width or an integer for pixel width.
        use_ext_module : bool
            If True, uses react-pdf for rendering. If False, uses iframe (default behavior).
        hide_toolbar : bool
            If True, hides the PDF toolbar in iframe mode (default is True).

        Returns
        -------
        DeltaGenerator
            A DeltaGenerator object for chaining.

        Example
        -------
        >>> st.pdf("https://example.com/sample.pdf")
        >>> st.pdf("https://example.com/sample.pdf", width=500)
        >>> st.pdf("https://example.com/sample.pdf", use_ext_module=True)
        >>> st.pdf("https://example.com/sample.pdf", hide_toolbar=False)
        """
        # Validate width parameter
        validate_width(width, allow_content=False)

        # Compute element ID first, like other elements do
        element_id = compute_and_register_element_id(
            "pdf",
            user_key=None,
            form_id=current_form_id(self.dg),
            dg=self.dg,
            data=str(data) if isinstance(data, (str, Path)) else "binary_data",
            height=height,
            width=width,
            use_ext_module=use_ext_module,
            hide_toolbar=hide_toolbar,
        )

        pdf_proto = PdfProto()
        pdf_proto.id = element_id
        coordinates = self.dg._get_delta_path_str()

        # Create layout config for width
        layout_config = LayoutConfig(width=width)

        _marshall_pdf(
            coordinates,
            pdf_proto,
            data,
            height=height,
            use_ext_module=use_ext_module,
            hide_toolbar=hide_toolbar,
        )

        return self.dg._enqueue("pdf", pdf_proto, layout_config=layout_config)

    @property
    def dg(self) -> DeltaGenerator:
        """Get our DeltaGenerator."""
        return cast("DeltaGenerator", self)


def _marshall_pdf(
    coordinates: str,
    proto: PdfProto,
    data: PdfData,
    *,
    height: int = 500,
    use_ext_module: bool = False,
    hide_toolbar: bool = True,
) -> None:
    """Marshall a PDF protobuf element."""

    # Set height, use_ext_module, and hide_toolbar
    proto.height = height
    proto.use_ext_module = use_ext_module
    proto.hide_toolbar = hide_toolbar

    # Handle the PDF data
    if isinstance(data, Path):
        data = str(data)  # Convert Path to string

    if isinstance(data, str):
        if url_util.is_url(data, allowed_schemas=("http", "https")):
            # It's a URL
            proto.url = data
        else:
            # It's a local file path - we need to serve it through media file manager
            try:
                with open(data, "rb") as f:
                    file_data = f.read()
                if runtime.exists():
                    proto.url = runtime.get_instance().media_file_mgr.add(
                        file_data, "application/pdf", coordinates
                    )
                else:
                    proto.url = ""
            except Exception:
                raise ValueError(
                    "Could not read PDF file. Please check the URL or the file path."
                )
    elif isinstance(data, bytes):
        # Handle raw bytes
        if runtime.exists():
            proto.url = runtime.get_instance().media_file_mgr.add(
                data, "application/pdf", coordinates
            )
        else:
            proto.url = ""
    elif hasattr(data, "read") and hasattr(data, "getvalue"):
        # Handle BytesIO and similar
        file_data = data.getvalue()
        if runtime.exists():
            proto.url = runtime.get_instance().media_file_mgr.add(
                file_data, "application/pdf", coordinates
            )
        else:
            proto.url = ""
    elif hasattr(data, "read"):
        # Handle other file-like objects (including UploadedFile)
        file_data = data.read()
        if runtime.exists():
            proto.url = runtime.get_instance().media_file_mgr.add(
                file_data, "application/pdf", coordinates
            )
        else:
            proto.url = ""
    else:
        raise ValueError(f"Unsupported data type for PDF: {type(data)}")
