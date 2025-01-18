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

import {
  ForwardMsgList,
  localStorageAvailable,
  logError,
} from "@streamlit/lib"

import { ConnectionState } from "./ConnectionState"

// Holds url for static asset location
export const STATIC_CONFIG = "https://data.streamlit.io/static.json"

type OnMessage = (ForwardMsg: any) => void
type OnConnectionStateChange = (
  connectionState: ConnectionState,
  errMsg?: string
) => void

interface Props {
  /** The static notebook's ID from query param */
  notebookId: string

  /**
   * Function called when our ConnectionState changes.
   * For a StaticConnection, used for StatusWidget
   */
  onConnectionStateChange: OnConnectionStateChange

  /**
   * Function called when we receive a new ForwardMsg
   */
  onMessage: OnMessage
}

// Fetches the static asset url from the config file
async function getStaticConfig(): Promise<string> {
  const isLocalStoreAvailable = localStorageAvailable()
  let staticURL = ""

  // Pull static asset url from localStorage if available
  if (isLocalStoreAvailable) {
    const cachedConfig = window.localStorage.getItem("stStaticUrl")
    if (cachedConfig) {
      staticURL = cachedConfig
    }
  }

  // Otherwise, fetch url from config file
  if (!staticURL) {
    try {
      const response = await fetch(STATIC_CONFIG, {
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        logError("Failed to fetch static config url: ", response.status)
      } else {
        const config = await response.json()
        staticURL = config.static_url ?? undefined

        // Set in localStorage
        if (isLocalStoreAvailable && staticURL) {
          window.localStorage.setItem("stStaticUrl", staticURL)
        }
      }
    } catch (err) {
      logError("Failed to fetch static config url:", err)
    }
  }

  return staticURL
}

// Fetches FowardMsg protos from S3 for static streamlit apps
// First, gets the location of the static assets from url in the config
// Then fetches the protos from that location
async function getProtoResponse(
  notebookId: string
): Promise<void | ArrayBuffer> {
  const staticURL = await getStaticConfig()

  // Next, fetch the static app's protos (if we have a url)
  if (staticURL) {
    const path = `${staticURL}/${notebookId}/protos.pb`
    const response = await fetch(path, {
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      logError("Failed to fetch static app protos: ", response.status)
    } else {
      const data = await response.arrayBuffer()
      return data
    }
  }

  return
}

// Triggers fetch of static app assets and dispatches ForwardMsgs to be handled
// by App.tsx's handleMessage, replicating the app
async function dispatchAppForwardMessages(
  notebookId: string,
  onMessage: OnMessage
): Promise<void> {
  const arrayBuffer = await getProtoResponse(notebookId)

  if (!arrayBuffer) {
    logError("Failed to retrieve static app protos")
    return
  }

  // Transforms our arrayBuffer response into ForwardMsgList protos
  const forwardMsgList = ForwardMsgList.decode(new Uint8Array(arrayBuffer))

  // Dispatches each ForwardMsg to be handled by App.tsx's handleMessage
  forwardMsgList.messages.forEach(msg => {
    onMessage(msg)
  })

  return
}

export function StaticConnection({
  notebookId,
  onConnectionStateChange,
  onMessage,
}: Props): void {
  // Static notebooks are not connected to a server - put into connecting
  // state until assets fetched/loaded from S3
  onConnectionStateChange(ConnectionState.STATIC_CONNECTING)

  dispatchAppForwardMessages(notebookId, onMessage)

  // Once protos are fetched & dispatched, we are connected
  onConnectionStateChange(ConnectionState.STATIC_CONNECTED)
}

export default StaticConnection
