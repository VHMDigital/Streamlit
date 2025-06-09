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

//My contribution 
// import React, { memo, ReactElement, useState } from "react"
// import { Exception as ExceptionProto } from "@streamlit/protobuf"
// import { isLocalhost } from "@streamlit/utils"
// import { notNullOrUndefined } from "~lib/util/utils"
// import AlertContainer, { Kind } from "~lib/components/shared/AlertContainer"
// import StreamlitMarkdown from "~lib/components/shared/StreamlitMarkdown"
// import { StyledCode } from "~lib/components/elements/CodeBlock/styled-components"
// import { StyledStackTrace } from "~lib/components/shared/ErrorElement/styled-components"
// import {
//   StyledExceptionLinks,
//   StyledExceptionMessage,
//   StyledExceptionWrapper,
//   StyledMessageType,
//   StyledStackTraceContent,
//   StyledStackTraceRow,
//   StyledStackTraceTitle,
// } from "./styled-components"

// // TYPE DEFINITIONS

// export interface ExceptionElementProps {
//   element: ExceptionProto
// }

// interface ExceptionMessageProps {
//   type: string
//   message: string
//   messageIsMarkdown: boolean
// }

// interface StackTraceProps {
//   stackTrace: string[]
// }

// interface CopyButtonProps {
//   text: string
//   className?: string
// }

// // COPY BUTTON COMPONENT

// /**
//  * FUNCTION: CopyButton Component
//  * PURPOSE: Renders a button that copies exception text to clipboard with visual feedback
//  * PARAMS: text (string to copy), className (optional CSS class)
//  * RETURNS: React button component with copy functionality
//  */
// const CopyButton: React.FC<CopyButtonProps> = ({ text, className = '' }) => {
//   const [copied, setCopied] = useState(false)

//   /**
//    * FUNCTION: copyToClipboard
//    * PURPOSE: Attempts to copy text using modern clipboard API with fallback
//    * PARAMS: textToCopy - string to copy to clipboard
//    * RETURNS: Promise<boolean> - true if successful, false otherwise
//    */
//   const copyToClipboard = async (textToCopy: string): Promise<boolean> => {
//     try {
//       // Method 1: Modern Clipboard API (preferred)
//       if (navigator.clipboard && window.isSecureContext) {
//         await navigator.clipboard.writeText(textToCopy)
//         return true
//       }

//       // Method 2: Fallback using execCommand (for older browsers or non-HTTPS)
//       return fallbackCopyToClipboard(textToCopy)
//     } catch (err) {
//       console.error('Clipboard API failed:', err)
//       // Try fallback method
//       return fallbackCopyToClipboard(textToCopy)
//     }
//   }

//   /**
//    * FUNCTION: fallbackCopyToClipboard
//    * PURPOSE: Legacy copy method using document.execCommand for older browsers
//    * PARAMS: textToCopy - string to copy to clipboard
//    * RETURNS: boolean - true if successful, false otherwise
//    */
//   const fallbackCopyToClipboard = (textToCopy: string): boolean => {
//     try {
//       // Create a temporary textarea element
//       const textArea = document.createElement('textarea')
//       textArea.value = textToCopy

//       // Make the textarea invisible but accessible
//       textArea.style.position = 'fixed'
//       textArea.style.top = '-9999px'
//       textArea.style.left = '-9999px'
//       textArea.style.opacity = '0'
//       textArea.style.pointerEvents = 'none'
//       textArea.style.tabIndex = '-1'

//       // Add to DOM
//       document.body.appendChild(textArea)

//       // Focus and select the text
//       textArea.focus()
//       textArea.select()
//       textArea.setSelectionRange(0, textToCopy.length)

//       // Execute copy command
//       const successful = document.execCommand('copy')

//       // Clean up
//       document.body.removeChild(textArea)

//       return successful
//     } catch (err) {
//       console.error('Fallback copy method failed:', err)
//       return false
//     }
//   }

//   /**
//    * FUNCTION: handleCopy
//    * PURPOSE: Handles click event for copy button, manages UI state
//    * PARAMS: e - React mouse event
//    * RETURNS: void
//    */
//   const handleCopy = async (e: React.MouseEvent) => {
//     e.preventDefault()
//     e.stopPropagation()

//     if (!text || text.trim().length === 0) {
//       return
//     }

//     const success = await copyToClipboard(text)
//     if (success) {
//       setCopied(true)
//       // Reset the copied state after 2 seconds
//       setTimeout(() => {
//         setCopied(false)
//       }, 2000)
//     }
//   }

//   return (
//     <button
//       onClick={handleCopy}
//       className={`copy-button ${className}`}
//       title={copied ? 'Copied!' : 'Copy exception to clipboard'}
//       aria-label={copied ? 'Exception copied to clipboard' : 'Copy exception to clipboard'}
//       style={{
//         background: copied ? '#4CAF50' : 'rgba(255, 255, 255, 0.9)',
//         border: '1px solid rgba(0, 0, 0, 0.2)',
//         borderRadius: '4px',
//         cursor: 'pointer',
//         padding: '4px 6px',
//         fontSize: '12px',
//         color: copied ? 'white' : '#333',
//         transition: 'all 0.2s ease',
//         minWidth: '50px',
//         height: '24px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: '4px',
//       }}
//       onMouseEnter={(e) => {
//         if (!copied) {
//           e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
//         }
//       }}
//       onMouseLeave={(e) => {
//         if (!copied) {
//           e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
//         }
//       }}
//     >
//       {copied ? (
//         <>
//           <span style={{ fontSize: '10px' }}>✓</span>
//           <span>Copied</span>
//         </>
//       ) : (
//         <>
//           <span style={{ fontSize: '10px' }}>📋</span>
//           <span>Copy</span>
//         </>
//       )}
//     </button>
//   )
// }

// // UTILITY FUNCTIONS

// /**
//  * FUNCTION: isNonEmptyString
//  * PURPOSE: Checks if a value is a non-null, non-empty string
//  * PARAMS: value - string or null/undefined to check
//  * RETURNS: boolean - true if string is valid and not empty
//  */
// function isNonEmptyString(value: string | null | undefined): boolean {
//   return notNullOrUndefined(value) && value !== ""
// }

// /**
//  * FUNCTION: getExceptionText
//  * PURPOSE: Generates complete exception text for clipboard copying
//  * PARAMS: element - ExceptionProto object containing exception data
//  * RETURNS: string - formatted exception text with type, message, and stack trace
//  */
// function getExceptionText(element: ExceptionProto): string {
//   const parts: string[] = []

//   // Add the exception type and message
//   if (element.type && element.message) {
//     parts.push(`${element.type}: ${element.message}`)
//   } else if (element.type) {
//     parts.push(element.type)
//   } else if (element.message) {
//     parts.push(element.message)
//   }

//   // Add the stack trace if available
//   if (element.stackTrace && element.stackTrace.length > 0) {
//     parts.push('') // Empty line separator
//     parts.push('Traceback:')
//     parts.push(...element.stackTrace)
//   }

//   return parts.join('\n')
// }

// //  SUB-COMPONENTS

// /**
//  * FUNCTION: ExceptionMessage Component
//  * PURPOSE: Renders the exception type and message with proper formatting
//  * PARAMS: type, message, messageIsMarkdown - exception details and formatting flag
//  * RETURNS: ReactElement - formatted exception message display
//  */
// function ExceptionMessage({
//   type,
//   message,
//   messageIsMarkdown,
// }: Readonly<ExceptionMessageProps>): ReactElement {
//   // Build the message display.
//   // On the backend, we use the StreamlitException type for errors that
//   // originate from inside Streamlit. These errors have Markdown-formatted
//   // messages, and so we wrap those messages inside our Markdown renderer.
//   if (messageIsMarkdown) {
//     let markdown = message ?? ""
//     if (type.length !== 0) {
//       markdown = `**${type}**: ${markdown}`
//     }
//     return <StreamlitMarkdown source={markdown} allowHTML={false} />
//   }
//   return (
//     <>
//       <StyledMessageType>{type}</StyledMessageType>
//       {type.length !== 0 && ": "}
//       {isNonEmptyString(message) ? message : null}
//     </>
//   )
// }

// /**
//  * FUNCTION: StackTrace Component
//  * PURPOSE: Renders the stack trace section with proper formatting
//  * PARAMS: stackTrace - array of stack trace lines
//  * RETURNS: ReactElement - formatted stack trace display
//  */
// function StackTrace({ stackTrace }: Readonly<StackTraceProps>): ReactElement {
//   // Build the stack trace display, if we got a stack trace.
//   return (
//     <div>
//       <StyledStackTraceTitle>Traceback:</StyledStackTraceTitle>
//       <StyledStackTrace>
//         <StyledStackTraceContent>
//           <StyledCode>
//             {stackTrace.map((row: string, index: number) => (
//               <StyledStackTraceRow
//                 // TODO: Update to match React best practices
//                 // eslint-disable-next-line @eslint-react/no-array-index-key
//                 key={index}
//                 data-testid="stExceptionTraceRow"
//               >
//                 {row}
//               </StyledStackTraceRow>
//             ))}
//           </StyledCode>
//         </StyledStackTraceContent>
//       </StyledStackTrace>
//     </div>
//   )
// }

// // MAIN COMPONENT

// /**
//  * FUNCTION: ExceptionElement Component (Main)
//  * PURPOSE: Main component that renders complete exception display with copy functionality
//  * PARAMS: element - ExceptionProto object containing all exception data
//  * RETURNS: ReactElement - complete exception display with message, stack trace, and copy button
//  */
// function ExceptionElement({
//   element,
// }: Readonly<ExceptionElementProps>): ReactElement {
//   // Generate search URLs for localhost debugging links
//   const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
//     `${element.type}: ${element.message}`
//   )}`
//   const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(
//     `${element.type}: ${element.message}\n\n${element.stackTrace?.join("\n")}`
//   )}`

//   // Get formatted text for clipboard copying
//   const exceptionText = getExceptionText(element)

//   return (
//     <div className="stException" data-testid="stException">
//       <AlertContainer kind={element.isWarning ? Kind.WARNING : Kind.ERROR}>
//         <StyledExceptionWrapper>
//           {/* Exception header with copy button */}
//           <div style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'flex-start',
//             marginBottom: element.stackTrace && element.stackTrace.length > 0 ? '8px' : '0'
//           }}>
//             <StyledExceptionMessage data-testid="stExceptionMessage" style={{ flex: 1 }}>
//               <ExceptionMessage
//                 type={element.type}
//                 message={element.message}
//                 messageIsMarkdown={element.messageIsMarkdown}
//               />
//             </StyledExceptionMessage>
//             <div style={{ marginLeft: '12px', flexShrink: 0 }}>
//               <CopyButton text={exceptionText} />
//             </div>
//           </div>

//           {/* Stack trace */}
//           {element.stackTrace && element.stackTrace.length > 0 ? (
//             <StackTrace stackTrace={element.stackTrace} />
//           ) : null}

//           {/* Localhost links */}
//           {isLocalhost() && (
//             <StyledExceptionLinks>
//               <a href={searchUrl} target="_blank" rel="noopener noreferrer">
//                 Ask Google
//               </a>
//               <a href={chatGptUrl} target="_blank" rel="noopener noreferrer">
//                 Ask ChatGPT
//               </a>
//             </StyledExceptionLinks>
//           )}
//         </StyledExceptionWrapper>
//       </AlertContainer>
//     </div>
//   )
// }

// // EXPORT

// export default memo(ExceptionElement)




import React, { memo, ReactElement } from "react"

import { Exception as ExceptionProto } from "@streamlit/protobuf"
import { isLocalhost } from "@streamlit/utils"

import { notNullOrUndefined } from "~lib/util/utils"
import AlertContainer, { Kind } from "~lib/components/shared/AlertContainer"
import StreamlitMarkdown from "~lib/components/shared/StreamlitMarkdown"
import { StyledCode } from "~lib/components/elements/CodeBlock/styled-components"
import { StyledStackTrace } from "~lib/components/shared/ErrorElement/styled-components"

import {
  StyledExceptionLinks,
  StyledExceptionMessage,
  StyledExceptionWrapper,
  StyledMessageType,
  StyledStackTraceContent,
  StyledStackTraceRow,
  StyledStackTraceTitle,
} from "./styled-components"

export interface ExceptionElementProps {
  element: ExceptionProto
}

interface ExceptionMessageProps {
  type: string
  message: string
  messageIsMarkdown: boolean
}

interface StackTraceProps {
  stackTrace: string[]
}

/**
 * Return true if the string is non-null and non-empty.
 */
function isNonEmptyString(value: string | null | undefined): boolean {
  return notNullOrUndefined(value) && value !== ""
}

function ExceptionMessage({
  type,
  message,
  messageIsMarkdown,
}: Readonly<ExceptionMessageProps>): ReactElement {
  // Build the message display.
  // On the backend, we use the StreamlitException type for errors that
  // originate from inside Streamlit. These errors have Markdown-formatted
  // messages, and so we wrap those messages inside our Markdown renderer.

  if (messageIsMarkdown) {
    let markdown = message ?? ""
    if (type.length !== 0) {
      markdown = `**${type}**: ${markdown}`
    }
    return <StreamlitMarkdown source={markdown} allowHTML={false} />
  }
  return (
    <>
      <StyledMessageType>{type}</StyledMessageType>
      {type.length !== 0 && ": "}
      {isNonEmptyString(message) ? message : null}
    </>
  )
}

function StackTrace({ stackTrace }: Readonly<StackTraceProps>): ReactElement {
  // Build the stack trace display, if we got a stack trace.
  return (
    <div>
      <StyledStackTraceTitle>Traceback:</StyledStackTraceTitle>
      <StyledStackTrace>
        <StyledStackTraceContent>
          <StyledCode>
            {stackTrace.map((row: string, index: number) => (
              <StyledStackTraceRow
                // TODO: Update to match React best practices
                // eslint-disable-next-line @eslint-react/no-array-index-key
                key={index}
                data-testid="stExceptionTraceRow"
              >
                {row}
              </StyledStackTraceRow>
            ))}
          </StyledCode>
        </StyledStackTraceContent>
      </StyledStackTrace>
    </div>
  )
}

/**
 * Functional element representing formatted text.
 */
function ExceptionElement({
  element,
}: Readonly<ExceptionElementProps>): ReactElement {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${element.type}: ${element.message}`
  )}`
  const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(
    `${element.type}: ${element.message}\n\n${element.stackTrace?.join("\n")}`
  )}`

  return (
    <div className="stException" data-testid="stException">
      <AlertContainer kind={element.isWarning ? Kind.WARNING : Kind.ERROR}>
        <StyledExceptionWrapper>
          <StyledExceptionMessage data-testid="stExceptionMessage">
            <ExceptionMessage
              type={element.type}
              message={element.message}
              messageIsMarkdown={element.messageIsMarkdown}
            />
          </StyledExceptionMessage>
          {element.stackTrace && element.stackTrace.length > 0 ? (
            <StackTrace stackTrace={element.stackTrace} />
          ) : null}
          {isLocalhost() && (
            <StyledExceptionLinks>
              <a href={searchUrl} target="_blank" rel="noopener noreferrer">
                Ask Google
              </a>
              <a href={chatGptUrl} target="_blank" rel="noopener noreferrer">
                Ask ChatGPT
              </a>
            </StyledExceptionLinks>
          )}
        </StyledExceptionWrapper>
      </AlertContainer>
    </div>
  )
}

export default memo(ExceptionElement)
