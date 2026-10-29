/**
 * Split a CSS string on a separator, ignoring separators inside quotes or
 * parentheses so values like url("https://...") or data:image/svg+xml;utf8,...
 * survive intact
 */
const splitTopLevel = (input: string, separator: string): string[] => {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: string | null = null;

  for (const char of input) {
    // Inside quotes: take everything until the matching closing quote
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(") depth++;
    if (char === ")") depth--;
    // Separator at the top level ends the current part
    if (char === separator && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) parts.push(current);
  return parts;
};

/**
 * Convert a CSS string into a React style object
 * @param styleInput - CSS string or style object
 */
export const parseStyle = (
  styleInput: string | Record<string, string> | null | undefined,
): Record<string, string> => {
  // Return an empty object when empty or undefined
  if (!styleInput) return {};

  // Already an object; return as-is
  if (typeof styleInput === "object" && !Array.isArray(styleInput)) {
    return styleInput;
  }

  // Parse when the input is a string
  if (typeof styleInput === "string") {
    // Try parsing as a JSON string
    if (styleInput.trim().startsWith("{")) {
      try {
        return JSON.parse(styleInput);
      } catch (error) {
        console.warn("Failed to parse style as JSON:", error);
        // On JSON failure, fall through to CSS string parsing
      }
    }

    // Parse CSS string format: "margin-right: 10px; color: red;"
    const styleObj: Record<string, string> = {};
    const stylePairs = splitTopLevel(styleInput, ";").filter((pair) =>
      pair.trim(),
    );

    stylePairs.forEach((pair) => {
      // Property names never contain a colon, so the first one separates
      // key and value; later colons (e.g. in url(...)) belong to the value
      const colonIndex = pair.indexOf(":");
      if (colonIndex === -1) return;
      const key = pair.slice(0, colonIndex).trim();
      const value = pair.slice(colonIndex + 1).trim();
      // Convert CSS property names: margin-right -> marginRight
      const reactKey = key.replace(/-([a-z])/g, (_match, letter: string) =>
        letter.toUpperCase(),
      );
      if (key && value) {
        styleObj[reactKey] = value;
      }
    });

    return styleObj;
  }

  // Fall back to an empty object
  return {};
};

/**
 * Safely merge multiple styles
 */
export const mergeStyles = (
  ...styles: Array<string | Record<string, string>>
): Record<string, string> => {
  return styles.reduce<Record<string, string>>(
    (acc, style) => ({ ...acc, ...parseStyle(style) }),
    {},
  );
};

/**
 * Create a cached style parser (performance optimization)
 */
export const createCachedStyleParser = () => {
  const cache = new Map<string, Record<string, string>>();

  return (styleInput: string | Record<string, string>) => {
    const cacheKey =
      typeof styleInput === "string" ? styleInput : JSON.stringify(styleInput);

    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const result = parseStyle(styleInput);
    cache.set(cacheKey, result);
    return result;
  };
};
