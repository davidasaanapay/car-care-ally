export function isNativeWebView() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /wv|WebView|FBAN|FBAV|Instagram|Line|Electron|Capacitor|Cordova/i.test(ua);
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
}

export function getSafeAreaStyle() {
  return {
    paddingTop: "env(safe-area-inset-top)",
    paddingRight: "env(safe-area-inset-right)",
    paddingBottom: "env(safe-area-inset-bottom)",
    paddingLeft: "env(safe-area-inset-left)",
  } as const;
}