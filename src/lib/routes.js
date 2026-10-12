// Maps the old App.js page-id strings ("home", "skincare", etc.) to real URLs.
// Kept as a single lookup so every wrapper page/component navigates consistently.
export const pageToPath = (id) => {
  switch (id) {
    case "home":        return "/";
    case "skincare":    return "/skincare";
    case "makeup":      return "/makeup";
    case "about":       return "/about";
    case "brands":      return "/brands";
    case "orders":      return "/orders";
    case "checkout":    return "/checkout";
    case "admin":       return "/admin";
    case "admin-login": return "/admin/login";
    case "privacy":     return "/privacy";
    case "terms":       return "/terms";
    case "fragrances":  return "/fragrances";
    case "hair-care":   return "/hair-care";
    case "returns":     return "/returns";
    case "contact":     return "/contact";
    case "faq":         return "/faq";
    case "search":      return "/search";
    default:            return "/";
  }
};

// Reverse mapping — used by the Shell to highlight the active nav link.
export const pathToPage = (pathname) => {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/skincare")) return "skincare";
  if (pathname.startsWith("/makeup")) return "makeup";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/brands")) return "brands";
  if (pathname.startsWith("/orders")) return "orders";
  if (pathname.startsWith("/checkout")) return "checkout";
  if (pathname.startsWith("/admin/login")) return "admin-login";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/product")) return "product";
  if (pathname.startsWith("/privacy")) return "privacy";
  if (pathname.startsWith("/terms")) return "terms";
  if (pathname.startsWith("/fragrances")) return "fragrances";
  if (pathname.startsWith("/hair-care")) return "hair-care";
  if (pathname.startsWith("/returns")) return "returns";
  if (pathname.startsWith("/contact")) return "contact";
  if (pathname.startsWith("/faq")) return "faq";
  if (pathname.startsWith("/search")) return "search";
  return "home";
};
