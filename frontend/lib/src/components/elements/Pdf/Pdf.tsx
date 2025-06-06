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

import React, { memo, ReactElement, useMemo, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"

// Import react-pdf stylesheets for proper text and annotation layer rendering
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

import { IPdf } from "@streamlit/protobuf"

import { StreamlitEndpoints } from "~lib/StreamlitEndpoints"

import {
  StyledPdf,
  StyledReactPdfContainer,
  StyledReactPdfPage,
} from "./styled-components"

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

export interface PdfProps {
  element: IPdf
  endpoints: StreamlitEndpoints
}

function Pdf({ element, endpoints }: Readonly<PdfProps>): ReactElement {
  const { url, widthConfig, height, useExtModule, hideToolbar } = element

  // State for react-pdf
  const [numPages, setNumPages] = useState<number>(0)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Build the media URL if it's not already a full URL
  const pdfUrl = url?.startsWith("http")
    ? url
    : endpoints.buildMediaURL(url || "")

  // Add toolbar parameter to URL for iframe rendering
  const iframePdfUrl = hideToolbar ? `${pdfUrl}#toolbar=0` : pdfUrl

  // Memoize options to prevent re-renders
  const options = useMemo(
    () => ({
      cMapUrl: "https://unpkg.com/pdfjs-dist@" + pdfjs.version + "/cmaps/",
      cMapPacked: true,
      standardFontDataUrl:
        "https://unpkg.com/pdfjs-dist@" + pdfjs.version + "/standard_fonts/",
    }),
    []
  )

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoadError(null) // Clear any previous errors
  }

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error)
    if (error.message.includes("CORS") || error.message.includes("fetch")) {
      setLoadError(
        "CORS Error: This PDF cannot be loaded due to cross-origin restrictions. " +
          "Try with another PDF instead or uncheck 'Use external module'."
      )
    } else {
      setLoadError(`Failed to load PDF: ${error.message}`)
    }
  }

  if (useExtModule) {
    // Use react-pdf for rendering
    return (
      <StyledReactPdfContainer
        className="stPdf"
        data-testid="stPdf"
        height={height || 500}
        widthConfig={widthConfig || undefined}
      >
        {loadError ? (
          <div
            style={{
              padding: "20px",
              color: "#ff4b4b",
              backgroundColor: "#fff2f2",
              border: "1px solid #ffcccb",
              borderRadius: "4px",
              margin: "10px",
            }}
          >
            <strong>Error loading PDF:</strong>
            <br />
            {loadError}
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            options={options}
            loading={
              <div style={{ padding: "20px", textAlign: "center" }}>
                Loading PDF...
              </div>
            }
            error={
              <div style={{ padding: "20px", color: "#ff4b4b" }}>
                Failed to load PDF file.
              </div>
            }
          >
            {Array.from(new Array(numPages), (el, index) => (
              <StyledReactPdfPage key={`page_${index + 1}`}>
                <Page
                  pageNumber={index + 1}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                />
              </StyledReactPdfPage>
            ))}
          </Document>
        )}
      </StyledReactPdfContainer>
    )
  }

  // Use traditional iframe for rendering (default behavior)
  return (
    <StyledPdf
      className="stPdf"
      data-testid="stPdf"
      src={iframePdfUrl}
      height={height || 500}
      widthConfig={widthConfig || undefined}
      title="PDF Viewer"
      sandbox="allow-scripts allow-forms allow-downloads allow-top-navigation-by-user-activation"
    />
  )
}

export default memo(Pdf)
