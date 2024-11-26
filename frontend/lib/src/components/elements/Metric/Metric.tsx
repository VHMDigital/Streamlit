/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2024)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { ReactElement } from "react"

import { ArrowDownward, ArrowUpward } from "@emotion-icons/material-outlined"

import { Metric as MetricProto } from "@streamlit/lib/src/proto"
import { labelVisibilityProtoValueToEnum } from "@streamlit/lib/src/util/utils"
import Icon from "@streamlit/lib/src/components/shared/Icon"
import { StyledWidgetLabelHelpInline } from "@streamlit/lib/src/components/widgets/BaseWidget"
import TooltipIcon from "@streamlit/lib/src/components/shared/TooltipIcon"
import { Placement } from "@streamlit/lib/src/components/shared/Tooltip"
import StreamlitMarkdown from "@streamlit/lib/src/components/shared/StreamlitMarkdown"

import {
  StyledMetricContainer,
  StyledMetricDeltaText,
  StyledMetricLabelText,
  StyledMetricValueText,
  StyledTruncateText,
} from "./styled-components"

export interface MetricProps {
  element: MetricProto
}

export default function Metric({
  element,
}: Readonly<MetricProps>): ReactElement {
  const { MetricDirection } = MetricProto
  const {
    body,
    label,
    delta,
    direction,
    color,
    labelVisibility,
    help,
    border,
  } = element

  let metricDirection: any = null

  switch (direction) {
    case MetricDirection.DOWN:
      metricDirection = ArrowDownward
      break
    case MetricDirection.UP:
      metricDirection = ArrowUpward
      break
    // this must be none
    default:
      metricDirection = null
      break
  }

  const arrowMargin = "0 threeXS 0 0"
  const deltaExists = delta !== ""

  return (
    <StyledMetricContainer
      className="stMetric"
      data-testid="stMetric"
      border={border}
    >
      <StyledMetricLabelText
        data-testid="stMetricLabel"
        visibility={labelVisibilityProtoValueToEnum(labelVisibility?.value)}
      >
        <StyledTruncateText>
          <StreamlitMarkdown source={label} allowHTML={false} isLabel />
        </StyledTruncateText>
        {help && (
          <StyledWidgetLabelHelpInline>
            <TooltipIcon content={help} placement={Placement.TOP_RIGHT} />
          </StyledWidgetLabelHelpInline>
        )}
      </StyledMetricLabelText>
      <StyledMetricValueText data-testid="stMetricValue">
        <StyledTruncateText> {body} </StyledTruncateText>
      </StyledMetricValueText>
      {deltaExists && (
        <StyledMetricDeltaText data-testid="stMetricDelta" metricColor={color}>
          <Icon
            testid={
              // if direction is null, icon will be null
              metricDirection === ArrowUpward
                ? "stMetricDeltaIcon-Up"
                : "stMetricDeltaIcon-Down"
            }
            content={metricDirection}
            size="lg"
            margin={arrowMargin}
          />
          <StyledTruncateText> {delta} </StyledTruncateText>
        </StyledMetricDeltaText>
      )}
    </StyledMetricContainer>
  )
}
