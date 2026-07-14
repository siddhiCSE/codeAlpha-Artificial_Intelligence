// Safe storage helper to prevent SecurityError in restricted environments (e.g., iframes)
export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied for getItem:", key, e);
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied for setItem:", key, e);
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage delete denied for removeItem:", key, e);
    }
  }
};
