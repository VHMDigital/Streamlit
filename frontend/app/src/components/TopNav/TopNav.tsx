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

import React, { useMemo } from "react"
import { SidebarNavLink } from "../Navigation"
import NavSection from "./NavSection"
import Overflow from "rc-overflow"
import { IAppPage } from "@streamlit/protobuf"
import { StreamlitEndpoints } from "@streamlit/connection"
import {
  StyledOverflowContainer,
  StyledTopNavLinkContainer,
} from "./styled-components"
import { isNullOrUndefined } from "@streamlit/utils"
import {
  groupPagesBySection,
  hasMultipleSections,
} from "../Navigation/NavUtils"

export interface Props {
  currentPageScriptHash: string
  appPages: IAppPage[]
  onPageChange: (pageScriptHash: string) => void
  pageLinkBaseUrl: string
  endpoints: StreamlitEndpoints
}

/**
 * TopNav component that displays navigation items in a responsive horizontal menu.
 * Uses rc-overflow to dynamically manage visible items based on available space.
 */
const TopNav: React.FC<Props> = ({
  endpoints,
  pageLinkBaseUrl,
  currentPageScriptHash,
  appPages,
  onPageChange,
}) => {
  // Group pages by their section headers
  const navSections = useMemo(() => {
    return groupPagesBySection(appPages)
  }, [appPages])

  const hasSections = hasMultipleSections(navSections)

  // Prepare data for the overflow component:
  // If there are multiple sections, we pass the sections as groups
  // Otherwise, we flatten all pages into a single array
  const data = useMemo(() => {
    return hasSections
      ? Object.values(navSections) // Sections as groups: IAppPage[][]
      : Object.values(navSections).flat() // All pages flattened: IAppPage[]
  }, [hasSections, navSections])

  /**
   * Renders a single navigation link item
   */
  const renderNavLink = (item: IAppPage) => (
    <StyledTopNavLinkContainer>
      <SidebarNavLink
        isTopNav={true}
        isActive={currentPageScriptHash === item.pageScriptHash}
        icon={item.icon}
        pageUrl={endpoints.buildAppPageURL(pageLinkBaseUrl, item)}
        onClick={e => {
          e.preventDefault()
          if (item.pageScriptHash) {
            onPageChange(item.pageScriptHash)
          }
        }}
      >
        {String(item.pageName)}
      </SidebarNavLink>
    </StyledTopNavLinkContainer>
  )

  /**
   * Renders a dropdown section for grouped items
   */
  const renderNavSection = (
    items: IAppPage[] | IAppPage[][],
    title: string,
    hideChevron = false
  ) => (
    <NavSection
      hideChevron={hideChevron}
      sections={
        Array.isArray(items[0])
          ? (items as IAppPage[][])
          : [items as IAppPage[]]
      }
      title={title}
      handlePageChange={onPageChange}
      endpoints={endpoints}
      pageLinkBaseUrl={pageLinkBaseUrl}
      currentPageScriptHash={currentPageScriptHash}
    />
  )

  return (
    <Overflow<IAppPage | IAppPage[]>
      component={StyledOverflowContainer}
      // Generate a stable key for each item - either the section header or page hash
      itemKey={item =>
        Array.isArray(item) ? item[0].sectionHeader! : item.pageScriptHash!
      }
      data={data}
      // "responsive" automatically determines how many items to show based on container width
      maxCount={"responsive"}
      renderItem={(item, _info) => {
        // Case 1: Item is an array (a section with multiple pages)
        if (Array.isArray(item)) {
          return renderNavSection([item], item[0].sectionHeader || "")
        }
        // Case 2: Item is a single page
        else {
          return renderNavLink(item)
        }
      }}
      // This renders the overflow menu that shows items that don't fit
      renderRest={items => {
        if (isNullOrUndefined(items)) {
          return null
        }

        const totalNumPages = items.flat().length
        const title = `${totalNumPages} more`

        // Case 1: Remaining items are sections (arrays of pages)
        if (Array.isArray(items[0])) {
          return renderNavSection(items as IAppPage[][], title, true)
        }
        // Case 2: Remaining items are individual pages
        else {
          return renderNavSection([items as IAppPage[]], title, true)
        }
      }}
    />
  )
}

export default TopNav
