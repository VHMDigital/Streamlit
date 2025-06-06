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

import json
import types
from collections import ChainMap, UserDict
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, cast

from streamlit.elements.lib.form_utils import current_form_id
from streamlit.elements.lib.layout_utils import WidthWithoutContent, validate_width
from streamlit.elements.lib.policies import check_widget_policies
from streamlit.elements.lib.utils import Key, compute_and_register_element_id, to_key
from streamlit.proto.Json_pb2 import Json as JsonProto
from streamlit.runtime.metrics_util import gather_metrics
from streamlit.runtime.scriptrunner_utils.script_run_context import get_script_run_ctx
from streamlit.runtime.state import (
    WidgetArgs,
    WidgetCallback,
    WidgetKwargs,
    register_widget,
)
from streamlit.type_util import (
    is_custom_dict,
    is_list_like,
    is_namedtuple,
    is_pydantic_model,
)

if TYPE_CHECKING:
    from streamlit.delta_generator import DeltaGenerator


@dataclass
class JsonEditorSerde:
    """JsonEditorSerde is used to serialize and deserialize the json editor state."""

    body: object | str | None

    def set_body(self, new_body: str | None) -> None:
        self.body = new_body

    def serialize(self, body: object) -> str:
        return json.dumps(body, default=self._ensure_serialization)

    def deserialize(self, ui_value: str | None) -> object:
        if ui_value == "":
            return ""
        if ui_value is None:  # first case
            ui_value = json.dumps(self.body, default=self._ensure_serialization)
        return json.loads(ui_value)

    def _ensure_serialization(self, o: object) -> str | list[Any]:
        """A repr function for json.dumps default arg, which tries to serialize sets
        as lists.
        """
        return list(o) if isinstance(o, set) else repr(o)


class JsonEditorMixin:
    @gather_metrics("json_editor")
    def json_editor(
        self,
        body: object,
        *,  # keyword-only arguments:
        expanded: bool | int = True,
        width: WidthWithoutContent = "stretch",
        disabled: bool = False,
        key: Key | None = None,
        on_change: WidgetCallback | None = None,
        args: WidgetArgs | None = None,
        kwargs: WidgetKwargs | None = None,
    ) -> object:
        """Display an object or string as a pretty-printed, interactive and editable JSON string.

        Parameters
        ----------
        body : object or str
            The object to print as JSON. All referenced objects should be
            serializable to JSON as well. If object is a string, we assume it
            contains serialized JSON.

        expanded : bool or int
            The initial expansion state of the JSON element. This can be one
            of the following:

            - ``True`` (default): The element is fully expanded.
            - ``False``: The element is fully collapsed.
            - An integer: The element is expanded to the depth specified. The
              integer must be non-negative. ``expanded=0`` is equivalent to
              ``expanded=False``.

            Regardless of the initial expansion state, users can collapse or
            expand any key-value pair to show or hide any part of the object.

        width : "stretch" or int
            The width of the JSON element. This can be either:
            - "stretch" (default): The element will stretch to fill the container width
            - An integer: The element will have a fixed width in pixels

        disabled : bool
            An optional boolean that disables the json edit if set to
            ``True``. The default is ``False``.

        key : str or int
            An optional string or integer to use as the unique key for the widget.
            If this is omitted, a key will be generated for the widget
            based on its content. No two widgets may have the same key.

        on_change : callable
            An optional callback invoked when this json input's value changes.

        args : tuple
            An optional tuple of args to pass to the callback.

        kwargs : dict
            An optional dict of kwargs to pass to the callback.

        Example
        -------
        >>> import streamlit as st
        >>>
        >>> st.json_editor(
        ...     {
        ...         "My": "Json",
        ...         "Car": [
        ...             "Chevrolet",
        ...             "Impala",
        ...             "1967",
        ...         ],
        ...         "level 1": {"level 2": {"level3": {"Honda": "CB650R"}}},
        ...     },
        ...     expanded=2,
        ... )


        """
        key = to_key(key)

        check_widget_policies(
            self.dg,
            key,
            on_change,
            default_value=None,
            writes_allowed=False,
        )

        if is_custom_dict(body):
            body = body.to_dict()

        if is_namedtuple(body):
            body = body._asdict()

        if isinstance(
            body, (ChainMap, types.MappingProxyType, UserDict)
        ) or is_pydantic_model(body):
            body = dict(body)  # type: ignore

        if is_list_like(body):
            body = list(body)

        serde = JsonEditorSerde(body)

        if not isinstance(body, str):
            try:
                # Serialize body to string and try to interpret sets as lists
                body = serde.serialize(body)
            except TypeError as err:
                self.dg.warning(
                    "Warning: this data structure was not fully serializable as "
                    f"JSON due to one or more unexpected keys.  (Error was: {err})"
                )
                body = json.dumps(
                    body, skipkeys=True, default=serde._ensure_serialization
                )
                serde.body = body

        ctx = get_script_run_ctx()
        element_id = compute_and_register_element_id(
            "json_editor",
            user_key=key,
            form_id=current_form_id(self.dg),
            data=body,
        )

        json_proto = JsonProto()  # uses the same proto as st.json
        json_proto.body = body
        json_proto.id = element_id

        if isinstance(expanded, bool):
            json_proto.expanded = expanded
        elif isinstance(expanded, int):
            json_proto.expanded = True
            json_proto.max_expand_depth = expanded
        else:
            raise TypeError(
                f"The type {type(expanded)} of `expanded` is not supported"
                ", must be bool or int."
            )

        validate_width(width)
        if isinstance(width, int):
            json_proto.width_config.pixel_width = width
        else:
            json_proto.width_config.use_stretch = True

        json_proto.disabled = disabled
        json_proto.form_id = current_form_id(self.dg)
        json_proto.value = body

        widget_state = register_widget(
            json_proto.id,
            on_change_handler=on_change,
            args=args,
            kwargs=kwargs,
            deserializer=serde.deserialize,
            serializer=serde.serialize,
            ctx=ctx,
            value_type="string_value",
        )

        self.dg._enqueue("json_editor", json_proto)

        return widget_state.value

    @property
    def dg(self) -> DeltaGenerator:
        """Get our DeltaGenerator."""
        return cast("DeltaGenerator", self)
