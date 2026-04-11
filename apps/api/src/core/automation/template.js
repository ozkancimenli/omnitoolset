function getPathValue(source, path) {
  return path.split('.').reduce((current, segment) => {
    if (current == null) {
      return undefined;
    }

    return current[segment];
  }, source);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function resolveTemplateValue(template, context) {
  if (Array.isArray(template)) {
    return template.map((entry) => resolveTemplateValue(entry, context));
  }

  if (isPlainObject(template)) {
    return Object.fromEntries(
      Object.entries(template).map(([key, value]) => [key, resolveTemplateValue(value, context)])
    );
  }

  if (typeof template !== 'string') {
    return template;
  }

  const exactMatch = template.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
  if (exactMatch) {
    return getPathValue(context, exactMatch[1].trim());
  }

  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, path) => {
    const value = getPathValue(context, path.trim());
    return value == null ? '' : String(value);
  });
}
