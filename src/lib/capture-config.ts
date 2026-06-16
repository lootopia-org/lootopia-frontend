const DEFAULT_CAPTURE_LINK_TEMPLATE = 'lootopia://capture/{sessionId}';

function readRuntimeEnv(key: string): string | undefined {
  const value = process.env[key];
  return value?.trim() ? value.trim() : undefined;
}

export function getWebBaseUrl(requestOrigin?: string): string {
  const configured =
    readRuntimeEnv('WEB_URL') ||
    readRuntimeEnv('SITE_URL') ||
    readRuntimeEnv('NEXT_PUBLIC_WEB_URL') ||
    readRuntimeEnv('NEXT_PUBLIC_SITE_URL');
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  if (requestOrigin) {
    return requestOrigin.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

export function getMobileCaptureLinkTemplate(): string {
  return (
    readRuntimeEnv('MOBILE_CAPTURE_LINK') ||
    readRuntimeEnv('NEXT_PUBLIC_MOBILE_CAPTURE_LINK') ||
    DEFAULT_CAPTURE_LINK_TEMPLATE
  );
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
export function mobileCaptureQrUrl(sessionId: string, webBaseUrl = getWebBaseUrl()): string {
  const template = getMobileCaptureLinkTemplate();
  if (usesDirectAppLink(template)) {
    return mobileCaptureDeepLink(sessionId, template);
  }
  return mobileCaptureUrl(sessionId, webBaseUrl);
}

export function getCaptureConfig(requestOrigin?: string) {
  const webBaseUrl = getWebBaseUrl(requestOrigin);
  const mobileCaptureLinkTemplate = getMobileCaptureLinkTemplate();
  const useDirectExpoQr = usesDirectAppLink(mobileCaptureLinkTemplate);
  return { webBaseUrl, mobileCaptureLinkTemplate, useDirectExpoQr };
}

export function getCaptureConfigForSession(sessionId: string, requestOrigin?: string) {
  const config = getCaptureConfig(requestOrigin);
  const webBaseUrl = config.webBaseUrl;
  return {
    ...config,
    qrUrl: mobileCaptureQrUrl(sessionId, webBaseUrl),
    deepLink: mobileCaptureDeepLink(sessionId),
    webFallbackUrl: mobileCaptureUrl(sessionId, webBaseUrl),
  };
}
