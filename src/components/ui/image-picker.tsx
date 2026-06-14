'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, ImageUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiUploadFile } from '@/lib/api/upload';
import { compressImageFile, isHttpStoredImageUrl, normalizeImageReference } from '@/lib/image-utils';
import { RemoteStoredImage } from '@/components/ui/remote-stored-image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImagePickerProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  uploadKind?: 'hunt' | 'step' | 'avatar';
  /** When true, show a camera capture button (for on-site step reference photos). */
  allowCamera?: boolean;
  label?: string;
  description?: string;
  error?: string;
  className?: string;
}

export function ImagePicker({
  value,
  onChange,
  uploadKind = 'hunt',
  allowCamera = false,
  label = 'Image',
  description,
  error,
  className,
}: ImagePickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const localPreviewRef = useRef(false);
  const normalizedValue = normalizeImageReference(value);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const revokeBlob = (url?: string | null) => {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    return () => {
      revokeBlob(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setBusy(true);
    let nextLocalPreview: string | undefined;
    try {
      const compressed = await compressImageFile(file);

      revokeBlob(localPreviewUrl);
      nextLocalPreview = compressed.previewUrl;
      localPreviewRef.current = true;
      setLocalPreviewUrl(nextLocalPreview);

      const uploaded = await apiUploadFile(
        '/upload/image',
        new File([compressed.blob], 'upload.jpg', { type: compressed.mimeType }),
        { kind: uploadKind }
      );

      const storedUrl = normalizeImageReference(uploaded.url);
      revokeBlob(localPreviewUrl);
      localPreviewRef.current = false;
      setLocalPreviewUrl(undefined);
      onChange(storedUrl);
      toast.success('Image uploaded');
    } catch (err) {
      revokeBlob(nextLocalPreview);
      localPreviewRef.current = false;
      setLocalPreviewUrl(undefined);
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setBusy(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    revokeBlob(localPreviewUrl);
    localPreviewRef.current = false;
    setLocalPreviewUrl(undefined);
    onChange(undefined);
  };

  const showPreviewFrame = !!normalizedValue || !!localPreviewUrl;
  const showHttpPreview = !localPreviewUrl && isHttpStoredImageUrl(normalizedValue);
  const showDataPreview =
    !localPreviewUrl && !!normalizedValue && normalizedValue.startsWith('data:');

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label>{label}</Label>
        {description && <p className="mt-1 text-xs text-white/40">{description}</p>}
      </div>

      {allowCamera ? (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      ) : null}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {showPreviewFrame ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <div className="flex min-h-40 w-full items-center justify-center">
            {localPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={localPreviewUrl}
                alt="Selected reference"
                className="max-h-80 w-full object-contain"
              />
            ) : showDataPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={normalizedValue}
                alt="Selected reference"
                className="max-h-80 w-full object-contain"
              />
            ) : showHttpPreview && normalizedValue ? (
              <RemoteStoredImage
                key={normalizedValue}
                storedUrl={normalizedValue}
                alt="Selected reference"
              />
            ) : null}
          </div>
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-white">Uploading…</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Button type="button" size="icon" variant="destructive" onClick={clearImage} disabled={busy}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center">
          <ImageUp className="mb-3 h-8 w-8 text-white/30" />
          <p className="text-sm text-white/50">
            {allowCamera ? 'Take a photo or upload from your device' : 'Upload an image from your device'}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allowCamera ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {busy ? 'Processing…' : 'Take photo'}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => galleryInputRef.current?.click()}
        >
          <ImageUp className="h-4 w-4" />
          Upload image
        </Button>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
