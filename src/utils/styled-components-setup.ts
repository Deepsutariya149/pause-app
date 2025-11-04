// styled-components setup for React Native
// This prevents styled-components from trying to access browser-only APIs

// Ensure we're using the native version
// styled-components/native automatically handles React Native
// But we need to ensure document is not accessed during rehydration

// Polyfill document to prevent errors (styled-components checks for it)
if (typeof global !== 'undefined') {
  if (typeof global.document === 'undefined') {
    // Create a minimal document mock to prevent errors
    // styled-components may call querySelectorAll, getElementsByTagName, etc.
    (global as any).document = {
      getElementsByTagName: () => [],
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementsByClassName: () => [],
      createElement: () => ({}),
      createTextNode: () => ({}),
      head: {
        appendChild: () => {},
        insertBefore: () => {},
        removeChild: () => {},
      },
      body: {
        appendChild: () => {},
        insertBefore: () => {},
        removeChild: () => {},
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      readyState: 'complete',
    };
  }
}

// Ensure window is also defined (some versions check for this)
if (typeof global !== 'undefined' && typeof global.window === 'undefined') {
  (global as any).window = global;
}

// Polyfill location to prevent href errors (expo-auth-session, expo-linking might need this)
if (typeof global !== 'undefined') {
  if (typeof global.location === 'undefined') {
    (global as any).location = {
      href: '',
      origin: '',
      protocol: '',
      host: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
    };
  }
  
  // Also ensure window.location exists
  if (typeof (global as any).window !== 'undefined' && typeof (global as any).window.location === 'undefined') {
    (global as any).window.location = (global as any).location;
  }
}
