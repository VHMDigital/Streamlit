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

import { mockEndpoints } from "~lib/mocks/mocks"

import { extractEmoji, handleFavicon } from "./Favicon"

function getFaviconHref(): string {
  const faviconElement: HTMLLinkElement | null = document.querySelector(
    "link[rel='shortcut icon']"
  )
  return faviconElement ? faviconElement.href : ""
}

document.head.innerHTML = `<link rel="shortcut icon" href="default.png">`

const FLAG_MATERIAL_ICON_URL =
  "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/flag/default/24px.svg"

const SMART_DISPLAY_MATERIAL_ICON_URL =
  "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/smart_display/default/24px.svg"

const ACCESSIBILITY_NEW_MATERIAL_ICON_URL =
  "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/accessibility_new/default/24px.svg"

test("is set up with the default favicon", () => {
  expect(getFaviconHref()).toBe("http://localhost:3000/default.png")
})

describe("Favicon element", () => {
  const buildMediaURL = vi.fn().mockReturnValue("https://mock.media.url")
  const endpoints = mockEndpoints({ buildMediaURL: buildMediaURL })

  it("sets the favicon in the DOM", () => {
    handleFavicon("https://some/random/favicon.png", vi.fn(), endpoints)
    expect(buildMediaURL).toHaveBeenCalledWith(
      "https://some/random/favicon.png"
    )
    expect(getFaviconHref()).toBe("https://mock.media.url/")
  })

  it("accepts emojis directly", () => {
    handleFavicon("emoji:🍕", vi.fn(), endpoints)
    // Check that its an svg that contains the pizza emoji bytecode:
    expect(getFaviconHref()).toContain("svg")
    expect(getFaviconHref()).toContain("%F0%9F%8D%95")
  })

  it("handles emoji variants correctly", () => {
    handleFavicon("emoji:🛰", vi.fn(), endpoints)
    // Check that its an svg that contains the satellite emoji bytecode:
    expect(getFaviconHref()).toContain("svg")
    expect(getFaviconHref()).toContain("%F0%9F%9B%B0")
  })

  it("handles material icon correctly", () => {
    handleFavicon(":material/flag:", vi.fn(), endpoints)
    expect(getFaviconHref()).toBe(FLAG_MATERIAL_ICON_URL)

    handleFavicon(":material/smart_display:", vi.fn(), endpoints)
    expect(getFaviconHref()).toBe(SMART_DISPLAY_MATERIAL_ICON_URL)

    handleFavicon(":material/accessibility_new:", vi.fn(), endpoints)
    expect(getFaviconHref()).toBe(ACCESSIBILITY_NEW_MATERIAL_ICON_URL)
  })

  it("handles emoji shortcodes containing a dash correctly", () => {
    handleFavicon("emoji::crescent-moon:", vi.fn(), endpoints)
    // Check that its an svg that contains the crescent moon emoji bytecode:
    expect(getFaviconHref()).toContain("svg")
    expect(getFaviconHref()).toContain("%F0%9F%8C%99")
  })

  it("accepts emoji shortcodes", () => {
    handleFavicon("emoji::pizza:", vi.fn(), endpoints)
    // Check that its an svg that contains the pizza emoji bytecode:
    expect(getFaviconHref()).toContain("svg")
    expect(getFaviconHref()).toContain("%F0%9F%8D%95")
  })

  it("updates the favicon when it changes", () => {
    handleFavicon("/media/1234567890.png", vi.fn(), endpoints)
    handleFavicon("emoji::pizza:", vi.fn(), endpoints)
    // Check that its an svg that contains the pizza emoji bytecode:
    expect(getFaviconHref()).toContain("svg")
    expect(getFaviconHref()).toContain("%F0%9F%8D%95")
  })

  it("sends SET_PAGE_FAVICON message to host", () => {
    const sendMessageToHost = vi.fn()
    handleFavicon(
      "https://streamlit.io/path/to/favicon.png",
      sendMessageToHost,
      endpoints
    )
    expect(sendMessageToHost).toHaveBeenCalledWith({
      favicon: "https://mock.media.url",
      type: "SET_PAGE_FAVICON",
    })
  })

  describe("extractEmoji", () => {
    it("handles basic emojis", () => {
      expect(extractEmoji("emoji:😀")).toBe("😀")
      expect(extractEmoji("emoji:🚀")).toBe("🚀")
      expect(extractEmoji("emoji:🍕")).toBe("🍕")
      expect(extractEmoji("emoji:⭐")).toBe("⭐")
      expect(extractEmoji("emoji:🎮")).toBe("🎮")
      expect(extractEmoji("emoji:🛰️")).toBe("🛰️")
    })

    it("handles emoji shortcodes", () => {
      expect(extractEmoji("emoji::smile:")).toBe("😄")
      expect(extractEmoji("emoji::rocket:")).toBe("🚀")
      expect(extractEmoji("emoji::pizza:")).toBe("🍕")
      expect(extractEmoji("emoji::star:")).toBe("⭐")
      expect(extractEmoji("emoji::video_game:")).toBe("🎮")
    })

    it("handles shortcodes with dashes", () => {
      expect(extractEmoji("emoji::crescent-moon:")).toBe("🌙")
      expect(extractEmoji("emoji::lying-face:")).toBe("🤥")
    })

    it("handles skin tone modifiers", () => {
      expect(extractEmoji("emoji:👍🏻")).toBe("👍🏻") // light skin tone
      expect(extractEmoji("emoji:👍🏽")).toBe("👍🏽") // medium skin tone
      expect(extractEmoji("emoji:👍🏿")).toBe("👍🏿") // dark skin tone
    })

    it("handles newer emojis", () => {
      expect(extractEmoji("emoji:🪣")).toBe("🪣") // bucket (added in 2020)
      expect(extractEmoji("emoji:🥹")).toBe("🥹") // face holding back tears (added in 2022)
      expect(extractEmoji("emoji:🫠")).toBe("🫠") // melting face (added in 2022)
      expect(extractEmoji("emoji:🫥")).toBe("🫥") // dotted line face (added in 2022)
      expect(extractEmoji("emoji:🐦‍🔥")).toBe("🐦‍🔥") // Phoenix (added in 2023)
      expect(extractEmoji("emoji:🍋‍🟩")).toBe("🍋‍🟩") // lime (added in 2023)
    })

    it("handles older emojis", () => {
      expect(extractEmoji("emoji:😀")).toBe("😀") // grinning face (2015)
      expect(extractEmoji("emoji:👨‍👩‍👦")).toBe("👨‍👩‍👦") // family (2016)
      expect(extractEmoji("emoji:💩")).toBe("💩") // pile of poo (2010)
      expect(extractEmoji("emoji:♥️")).toBe("♥️") // heart symbol (very early emoji)
    })

    it("handles compound emojis", () => {
      expect(extractEmoji("emoji:👨‍💻")).toBe("👨‍💻") // man technologist
      expect(extractEmoji("emoji:👩‍🚒")).toBe("👩‍🚒") // woman firefighter
      expect(extractEmoji("emoji:👨‍👨‍👧‍👧")).toBe("👨‍👨‍👧‍👧") // family with two men and two girls
      expect(extractEmoji("emoji::woman_technologist:")).toBe("👩‍💻")
    })

    it("handles flags", () => {
      expect(extractEmoji("emoji:🇺🇸")).toBe("🇺🇸")
      expect(extractEmoji("emoji:🇯🇵")).toBe("🇯🇵")
      expect(extractEmoji("emoji:🇪🇸")).toBe("🇪🇸")
      expect(extractEmoji("emoji::brazil:")).toBe("🇧🇷")
    })

    it("handles material icons correctly", () => {
      expect(extractEmoji(":material/flag:")).toBe("")
      expect(extractEmoji(":material/smart_display:")).toBe("")
    })

    it("handles edge cases", () => {
      expect(extractEmoji(":invalid_emoji_code:")).toBe("")
      expect(extractEmoji("hello")).toBe("")
      expect(extractEmoji("12345")).toBe("")
      expect(extractEmoji("::")).toBe("")
      expect(extractEmoji(":")).toBe("")
    })
  })
})
