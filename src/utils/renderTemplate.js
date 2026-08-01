export function renderTemplate(body, context = {}) {
  return String(body || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = context[key];
    return value === undefined || value === null ? match : String(value);
  });
}
