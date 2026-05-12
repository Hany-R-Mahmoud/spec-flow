const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";

let isInitialized = false;

type GtagCommand =
  | ["js", Date]
  | ["config", string, { send_page_view: false }]
  | ["event", string, Record<string, string | number | boolean | undefined>];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagCommand) => void;
  }
}

export function initializeGoogleAnalytics(): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID || isInitialized) {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: GtagCommand) => {
      window.dataLayer?.push(args);
    });

  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`,
  );

  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  isInitialized = true;
}

export function trackPageView(pathname: string): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID || !window.gtag) {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: pathname,
    page_location: window.location.href,
    page_title: document.title,
  });
}
