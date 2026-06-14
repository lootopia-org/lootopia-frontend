const DEFAULT_MAX_WIDTH = 1280;
const DEFAULT_MAX_HEIGHT = 1280;
const DEFAULT_QUALITY = 0.82;

export interface CompressedImage {
  base64: string;
  blob: Blob;
  previewUrl: string;
  mimeType: string;
}

export function isLikelyBase64Image(value: string): boolean {
  if (!value || value.startsWith('http') || value.startsWith('/') || value.startsWith('data:')) {
    return false;
  }
  return /^[A-Za-z0-9+/=]+$/.test(value.slice(0, 64));
}

export function normalizeImageReference(value?: string | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return normalizeImageReference(trimmed.slice(1, -1));
  }
  return trimmed;
}

/** Same-origin proxy → backend `/upload/image/view` (see `app/media/stored-image/route.ts`). */
export function toImageProxySrc(url: string): string {
  return `/media/stored-image?url=${encodeURIComponent(url)}`;
}

export function isHttpStoredImageUrl(value?: string | null): boolean {
  const normalized = normalizeImageReference(value);
  return !!normalized && (normalized.startsWith('http://') || normalized.startsWith('https://'));
}

/** Same-origin display URL for previews (handles base64, relative paths, and storage URLs). */
export function toDisplayImageSrc(value?: string | null): string | undefined {
  const normalized = normalizeImageReference(value);
  if (!normalized) return undefined;

  if (
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:') ||
    normalized.startsWith('/')
  ) {
    return normalized;
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return toImageProxySrc(normalized);
  }

  if (isLikelyBase64Image(normalized)) {
    return `data:image/jpeg;base64,${normalized}`;
  }

  return normalized;
}

export function toImageSrc(value?: string | null): string | undefined {
  const normalized = normalizeImageReference(value);
  if (!normalized) return undefined;
  if (
    normalized.startsWith('data:') ||
    normalized.startsWith('http') ||
    normalized.startsWith('/') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }
  if (isLikelyBase64Image(normalized)) {
    return `data:image/jpeg;base64,${normalized}`;
  }
  return normalized;
}

export function isValidImageReference(value: string): boolean {
  if (!value) return false;
  if (zodUrl(value)) return true;
  if (value.startsWith('/uploads/')) return true;
  return isLikelyBase64Image(value);
}

function zodUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read image'));
        return;
      }
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(blob);
  });
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}

async function drawCompressedImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<{ blob: Blob; mimeType: string }> {
  let width: number;
  let height: number;
  let draw: (ctx: CanvasRenderingContext2D) => void;

  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
    draw = (ctx) => {
      ctx.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
    };
  } else {
    const img = await loadImageElement(file);
    width = img.naturalWidth;
    height = img.naturalHeight;
    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
    draw = (ctx) => {
      ctx.drawImage(img, 0, 0, width, height);
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process image');
  }

  draw(ctx);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Could not compress image'))),
      'image/jpeg',
      quality
    );
  });

  return { blob, mimeType: 'image/jpeg' };
}

export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number }
): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file');
  }

  const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH;
  const maxHeight = options?.maxHeight ?? DEFAULT_MAX_HEIGHT;
  const quality = options?.quality ?? DEFAULT_QUALITY;

  const { blob, mimeType } = await drawCompressedImage(file, maxWidth, maxHeight, quality);
  const base64 = await blobToBase64(blob);
  return {
    base64,
    blob,
    previewUrl: URL.createObjectURL(blob),
    mimeType,
  };
}

export function compressedImageToFile(image: CompressedImage, filename = 'photo.jpg'): File {
  return new File([image.blob], filename, { type: image.mimeType });
}
