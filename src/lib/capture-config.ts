const DEFAULT_CAPTURE_LINK_TEMPLATE = 'lootopia://capture/{sessionId}';

export function getWebBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_WEB_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

export function getMobileCaptureLinkTemplate(): string {
  return process.env.NEXT_PUBLIC_MOBILE_CAPTURE_LINK || DEFAULT_CAPTURE_LINK_TEMPLATE;
}

function usesDirectAppLink(template: string): boolean {
  return /^(exp[s]?:|lootopia:)/.test(template);
}

/** HTTPS URL for the web redirect fallback page. */
export function mobileCaptureUrl(sessionId: string, webBaseUrl = getWebBaseUrl()): string {
  return `${webBaseUrl}/capture/${sessionId}`;
}

/** App deep link opened in Expo Go / dev build. */
export function mobileCaptureDeepLink(
  sessionId: string,
  template = getMobileCaptureLinkTemplate()
): string {
  return template.replace('{sessionId}', sessionId);
}

/**
 * URL encoded in the QR code.
 * With Expo Go + tunnel, use exp:// directly — phone browsers block exp:// redirects from http pages.
 */
export function mobileCaptureQrUrl(sessionId: string): string {
  const template = getMobileCaptureLinkTemplate();
  if (usesDirectAppLink(template)) {
    return mobileCaptureDeepLink(sessionId, template);
  }
  return mobileCaptureUrl(sessionId);
}

export function getCaptureConfig() {
  const webBaseUrl = getWebBaseUrl();
  const mobileCaptureLinkTemplate = getMobileCaptureLinkTemplate();
  const useDirectExpoQr = usesDirectAppLink(mobileCaptureLinkTemplate);
  return { webBaseUrl, mobileCaptureLinkTemplate, useDirectExpoQr };
}

export function getCaptureConfigForSession(sessionId: string) {
  const config = getCaptureConfig();
  return {
    ...config,
    qrUrl: mobileCaptureQrUrl(sessionId),
    deepLink: mobileCaptureDeepLink(sessionId),
    webFallbackUrl: mobileCaptureUrl(sessionId),
  };
}
