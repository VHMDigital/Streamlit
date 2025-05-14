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

import React, { ReactNode } from "react"
import { IAppPage } from "@streamlit/protobuf"
import groupBy from "lodash/groupBy"

/**
 * Groups pages by their section headers, returning a map of section headers to pages.
 */
export const groupPagesBySection = (
  appPages: IAppPage[]
): Record<string, IAppPage[]> => {
  return groupBy(appPages, page => page.sectionHeader || "")
}

/**
 * Determines if the navigation has multiple sections.
 */
export const hasMultipleSections = (
  navSections: Record<string, IAppPage[]>
): boolean => {
  return Object.keys(navSections).length > 1
}

/**
 * Generates an array of pages to display based on collapsed state and threshold parameters.
 * This is used by both the sidebar and top navigation to determine which pages to show.
 */
export const getVisiblePages = (
  pages: IAppPage[],
  needsCollapse: boolean,
  maxVisibleWhenCollapsed: number
): IAppPage[] => {
  if (needsCollapse) {
    return pages.slice(0, maxVisibleWhenCollapsed)
  }
  return pages
}

/**
 * Helper function to generate NavSections from a collection of pages.
 * This can be used by both SidebarNav and TopNav to generate sections.
 */
export const generateNavSections = (
  navSections: string[],
  appPages: IAppPage[],
  needsCollapse: boolean,
  maxVisibleWhenCollapsed: number,
  generateNavLink: (page: IAppPage, index: number) => ReactNode
): ReactNode[] => {
  const contents: ReactNode[] = []
  const pagesBySectionHeader = groupBy(
    appPages,
    page => page.sectionHeader || ""
  )
  let currentPageCount = 0

  navSections.forEach(header => {
    const sectionPages = pagesBySectionHeader[header] ?? []
    let viewablePages = sectionPages

    if (needsCollapse) {
      if (currentPageCount >= maxVisibleWhenCollapsed) {
        // We cannot even show the section
        return
      } else if (
        currentPageCount + sectionPages.length >
        maxVisibleWhenCollapsed
      ) {
        // We can partially show the section
        viewablePages = sectionPages.slice(
          0,
          maxVisibleWhenCollapsed - currentPageCount
        )
      }
    }
    currentPageCount += viewablePages.length

    if (viewablePages.length > 0) {
      contents.push(
        <React.Fragment key={header}>
          {viewablePages.map((page, index) => generateNavLink(page, index))}
        </React.Fragment>
      )
    }
  })

  return contents
}
