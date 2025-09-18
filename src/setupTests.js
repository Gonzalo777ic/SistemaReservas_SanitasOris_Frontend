// src/setupTests.js
import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder for Jest
import { TextDecoder, TextEncoder } from "util";
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// Mock for window.crypto required by Auth0
Object.defineProperty(global.window, "crypto", {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      // Auth0 might also use subtle, so it's good to include it.
      // You can add more mock functions here if other errors pop up,
      // but getRandomValues is usually the main one needed.
    },
  },
});
