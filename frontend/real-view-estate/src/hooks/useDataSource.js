const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export function useDataSource(apiFn, mockFn) {
  return async (...args) => {
    if (USE_MOCK) {
      return { data: await mockFn(...args) };
    }
    return apiFn(...args);
  };
}
