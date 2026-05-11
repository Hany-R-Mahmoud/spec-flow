import { getCanonicalUrl, isPreviewDeployment } from "./runtime";

type PageMetadata = {
  title: string;
  description: string;
  themeColor: string;
  canonicalUrl: string;
  robots: string;
};

const SITE_NAME = "SpecFlow AI";
const DEFAULT_DESCRIPTION =
  "SpecFlow AI turns product inputs into structured breakdowns, reviews, and execution-ready workflow artifacts.";
const DEFAULT_THEME_COLOR = "#0f172a";

function createMetaSelector(
  kind: "name" | "property",
  value: string,
): string {
  return `meta[${kind}="${value}"]`;
}

function ensureMetaTag(
  kind: "name" | "property",
  value: string,
): HTMLMetaElement {
  const selector = createMetaSelector(kind, value);
  const existing = document.head.querySelector(selector);
  if (existing instanceof HTMLMetaElement) {
    return existing;
  }

  const element = document.createElement("meta");
  element.setAttribute(kind, value);
  document.head.appendChild(element);
  return element;
}

function ensureLinkTag(rel: string): HTMLLinkElement {
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector(selector);
  if (existing instanceof HTMLLinkElement) {
    return existing;
  }

  const element = document.createElement("link");
  element.rel = rel;
  document.head.appendChild(element);
  return element;
}

function getRouteMetadata(pathname: string): Pick<PageMetadata, "title" | "description"> {
  if (pathname === "/" || pathname === "") {
    return {
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
    };
  }

  if (pathname.startsWith("/login")) {
    return {
      title: "Sign in",
      description: "Sign in to SpecFlow AI and continue your product workflow.",
    };
  }

  if (pathname.startsWith("/signup")) {
    return {
      title: "Create account",
      description: "Create a SpecFlow AI account and start your workflow.",
    };
  }

  if (pathname.startsWith("/app")) {
    return {
      title: "Workspace",
      description: "Review, refine, and manage your SpecFlow AI workspace.",
    };
  }

  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  };
}

export function syncDocumentMetadata(pathname: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const routeMetadata = getRouteMetadata(pathname);
  const canonicalUrl = getCanonicalUrl(pathname);
  const preview = isPreviewDeployment();

  document.title =
    routeMetadata.title === SITE_NAME
      ? SITE_NAME
      : `${routeMetadata.title} · ${SITE_NAME}`;

  ensureMetaTag("name", "description").setAttribute(
    "content",
    routeMetadata.description,
  );
  ensureMetaTag("name", "robots").setAttribute(
    "content",
    preview ? "noindex,nofollow" : "index,follow",
  );
  ensureMetaTag("name", "theme-color").setAttribute(
    "content",
    DEFAULT_THEME_COLOR,
  );
  ensureMetaTag("property", "og:type").setAttribute("content", "website");
  ensureMetaTag("property", "og:site_name").setAttribute("content", SITE_NAME);
  ensureMetaTag("property", "og:title").setAttribute(
    "content",
    document.title,
  );
  ensureMetaTag("property", "og:description").setAttribute(
    "content",
    routeMetadata.description,
  );
  ensureMetaTag("property", "og:url").setAttribute("content", canonicalUrl);
  ensureMetaTag("name", "twitter:card").setAttribute(
    "content",
    "summary_large_image",
  );
  ensureMetaTag("name", "twitter:title").setAttribute("content", document.title);
  ensureMetaTag("name", "twitter:description").setAttribute(
    "content",
    routeMetadata.description,
  );
  ensureMetaTag("name", "twitter:url").setAttribute("content", canonicalUrl);
  ensureLinkTag("canonical").setAttribute("href", canonicalUrl);
}
