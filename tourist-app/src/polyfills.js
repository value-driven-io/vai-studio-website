// polyfills.js - Global polyfills for production builds
// Fix for Supabase "c.global is undefined" error

// Ensure global is available
if (typeof global === 'undefined') {
  var global = globalThis;
}

// Ensure globalThis is available (for older browsers)
if (typeof globalThis === 'undefined') {
  if (typeof window !== 'undefined') {
    window.globalThis = window;
  } else if (typeof self !== 'undefined') {
    self.globalThis = self;
  }
}