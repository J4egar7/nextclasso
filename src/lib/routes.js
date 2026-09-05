// Maps the old App.js page-id strings ("home", "skincare", etc.) to real URLs.
// Kept as a single lookup so every wrapper page/component navigates consistently.
export const pageToPath = (id) => {
  switch (id) {
    case "home":        return "/";
    case "skincare":    return "/skincare";
    case "makeup":      return "/makeup";
    case "about":       return "/about";
    case "brands":      return "/brands";
    case "checkout":    return "/checkout";
    case "admin":       return "/admin";
    case "admin-login": return "/admin/login";
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
  if (pathname.startsWith("/checkout")) return "checkout";
  if (pathname.startsWith("/admin/login")) return "admin-login";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/product")) return "product";
  return "home";
};
