/**
 * Safe redirect target after create/edit product flows.
 * Accepts only the products index path (optionally with query).
 */
export function parseProductsListReturnQuery(returnParam: unknown): string {
  if (typeof returnParam !== "string" || returnParam.trim() === "") {
    return "/dashboard/products";
  }

  try {
    const decoded = decodeURIComponent(returnParam);
    if (decoded === "/dashboard/products" || decoded.startsWith("/dashboard/products?")) {
      return decoded;
    }
  } catch {
    // ignore malformed encoding
  }

  return "/dashboard/products";
}
