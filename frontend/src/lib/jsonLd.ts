/**
 * Serialises structured data for `<script type="application/ld+json">`.
 *
 * `JSON.stringify` alone is unsafe inside a script element: a title or description that contains
 * `</script>` would close the tag and let the rest run as HTML (stored XSS). Escaping `<` and the
 * two JS line separators keeps the payload valid JSON while making that impossible.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
