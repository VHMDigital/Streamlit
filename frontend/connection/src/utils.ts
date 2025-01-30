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

import { IS_DEV_ENV, WEBSOCKET_PORT_DEV } from "./constants"

const FINAL_SLASH_RE = /\/+$/
const INITIAL_SLASH_RE = /^\/+/

/**
 * Return the BaseUriParts for the global window
 */
export function getWindowBaseUriParts(): URL {
  const currentUrl = new URL(window.location.href)
  // If dev, always connect to 8501, since window.location.port is the Node
  // server's port 3000.
  // If changed, also change config.py

  if (IS_DEV_ENV) {
    currentUrl.port = WEBSOCKET_PORT_DEV
  } else if (!currentUrl.port) {
    currentUrl.port = isHttps() ? "443" : "80"
  }

  currentUrl.pathname = currentUrl.pathname
    .replace(FINAL_SLASH_RE, "")
    .replace(INITIAL_SLASH_RE, "")

  return currentUrl
}

// NOTE: In the multipage apps world, there is some ambiguity around whether a
// path like "foo/bar" means
//   * the page "/" at baseUrlPath "foo/bar", or
//   * the page "/bar" at baseUrlPath "foo".
// To resolve this, we just try both possibilities for now, but this leads to
// the unfortunate consequence of the initial page load when navigating directly
// to a non-main page of an app being slower than navigating to the main page
// (as the first attempt at connecting to the server fails the healthcheck).
//
// We'll want to improve this situation in the near future, but figuring out
// the best path forward may be tricky as I wasn't able to come up with an
// easy solution covering every deployment scenario.
export function getPossibleBaseUris(): Array<URL> {
  const baseUriParts = getWindowBaseUriParts()
  const { pathname } = baseUriParts

  if (pathname === "/") {
    return [baseUriParts]
  }

  const parts = pathname.split("/")
  const possibleBaseUris: Array<URL> = []

  while (parts.length > 0) {
    const newURL = new URL(baseUriParts)
    newURL.pathname = parts.join("/")
    possibleBaseUris.push(newURL)
    parts.pop()
  }

  if (possibleBaseUris.length <= 2) {
    return possibleBaseUris
  }

  return possibleBaseUris.slice(0, 2)
}

/**
 * Create a ws:// or wss:// URI for the given path.
 */
export function buildWsUri(
  { hostname, port, pathname }: URL,
  path: string
): string {
  const protocol = isHttps() ? "wss" : "ws"
  const fullPath = makePath(pathname, path)
  return `${protocol}://${hostname}:${port}/${fullPath}`
}

/**
 * Create an HTTP URI for the given path.
 */
export function buildHttpUri(
  { hostname, port, pathname }: URL,
  path: string
): string {
  const protocol = isHttps() ? "https" : "http"
  const fullPath = makePath(pathname, path)
  return `${protocol}://${hostname}:${port}/${fullPath}`
}

export function makePath(basePath: string, subPath: string): string {
  basePath = basePath.replace(FINAL_SLASH_RE, "").replace(INITIAL_SLASH_RE, "")
  subPath = subPath.replace(FINAL_SLASH_RE, "").replace(INITIAL_SLASH_RE, "")

  if (basePath.length === 0) {
    return subPath
  }

  return `${basePath}/${subPath}`
}

/**
 * True if we're connected to the host via HTTPS.
 */
function isHttps(): boolean {
  return window.location.href.startsWith("https://")
}

/**
 * Returns cookie value
 */
export function getCookie(name: string): string | undefined {
  const r = document.cookie.match(`\\b${name}=([^;]*)\\b`)
  return r ? r[1] : undefined
}

// Method taken from
// https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
export function localStorageAvailable(): boolean {
  const testData = "testData"

  try {
    const { localStorage } = window
    localStorage.setItem(testData, testData)
    localStorage.getItem(testData)
    localStorage.removeItem(testData)
  } catch (e) {
    return false
  }
  return true
}

/**
 * A type predicate that is true if the given value is neither undefined
 * nor null.
 */
export function notNullOrUndefined<T>(
  value: T | null | undefined
): value is T {
  return <T>value !== null && <T>value !== undefined
}

/**
 * A type predicate that is true if the given value is either undefined
 * or null.
 */
export function isNullOrUndefined<T>(
  value: T | null | undefined
): value is null | undefined {
  return <T>value === null || <T>value === undefined
}
