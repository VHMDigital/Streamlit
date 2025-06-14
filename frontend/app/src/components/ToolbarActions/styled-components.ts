/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
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

import styled from "@emotion/styled"

export const StyledActionButtonContainer = styled.div(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.sm,
  alignItems: "center",
  // line height should be the same as the icon size
  lineHeight: theme.iconSizes.md,
}))

export interface StyledActionButtonIconProps {
  icon: string
}

export const StyledActionButtonIcon = styled.div<StyledActionButtonIconProps>(
  ({ theme, icon }) => ({
    background: `url("${icon}") no-repeat center / contain`,
    width: theme.iconSizes.base,
    height: theme.iconSizes.base,
  })
)

export const StyledToolbarActions = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "row",

  // Ensure toolbar action buttons maintain hover state after click
  "& .stToolbarActionButton button": {
    // Ensure hover state persists after click when mouse is still over button
    "&:hover": {
      backgroundColor: `${theme.colors.darkenedBgMix25} !important`,
      cursor: "pointer !important",
    },

    // Maintain hover state when button is focused (after click)
    "&:focus:hover": {
      backgroundColor: `${theme.colors.darkenedBgMix25} !important`,
      cursor: "pointer !important",
    },

    // Maintain hover state when button is active (being clicked)
    "&:active:hover": {
      backgroundColor: `${theme.colors.darkenedBgMix25} !important`,
      cursor: "pointer !important",
    },

    // Prevent focus outline from interfering with hover state
    "&:focus": {
      outline: "none",
    },

    // Only show focus-visible outline when navigating with keyboard
    "&:focus-visible": {
      boxShadow: `0 0 0 0.2rem ${theme.colors.primary}40`, // 40 is 25% opacity in hex
    },

    // Ensure the button maintains its interactive appearance
    "&:not(:disabled)": {
      cursor: "pointer",
    },
  },
}))
