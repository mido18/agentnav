export function scanMetaDescription(): string | undefined {
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content;
  const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content;
  return description?.trim() || ogDescription?.trim() || undefined;
}

export function scanCanonicalUrl(): string | undefined {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  return canonical?.trim() || undefined;
}

export function scanMetaTitle(): string {
  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content;
  return document.title.trim() || ogTitle?.trim() || "";
}
