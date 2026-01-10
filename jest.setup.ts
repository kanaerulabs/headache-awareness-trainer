import '@testing-library/jest-dom';

// Polyfill for structuredClone (required for fake-indexeddb)
if (!global.structuredClone) {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}
