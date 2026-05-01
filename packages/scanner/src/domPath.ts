function escapeCssIdentifier(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

export function domPath(element: Element): string {
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
    const tag = current.tagName.toLowerCase();
    const id = current.getAttribute("id");
    if (id) {
      segments.unshift(`${tag}#${escapeCssIdentifier(id)}`);
      break;
    }

    const parent: Element | null = current.parentElement;
    if (!parent) {
      segments.unshift(tag);
      break;
    }

    const currentTagName = current.tagName;
    const siblings = [...parent.children].filter((child) => child.tagName === currentTagName);
    const index = siblings.indexOf(current) + 1;
    segments.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${index})` : tag);
    current = parent;
  }

  return segments.join(" > ");
}
