'use client';

import { useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import { ImagePicker } from '@/components/ui/image-picker';
import { MobileStepPhotoCapture } from '@/components/hunts/mobile-step-photo-capture';
import type { HuntFormValues } from '@/lib/schemas/hunt';
import { normalizeImageReference } from '@/lib/image-utils';

type Props = {
  index: number;
  stepKey: string;
  huntId?: string;
  control: Control<HuntFormValues>;
  setValue: UseFormSetValue<HuntFormValues>;
  error?: string;
};

export function PhotoStepCaptureFields({
  index,
  stepKey,
  huntId,
  control,
  setValue,
  error,
}: Props) {
  const answer = useWatch({ control, name: `steps.${index}.answer` });

  return (
    <div className="space-y-4">
      <MobileStepPhotoCapture
        stepKey={stepKey}
        huntId={huntId}
        onPhotoCaptured={(photoUrl) => {
          const normalized = normalizeImageReference(photoUrl);
          if (!normalized) return;
          setValue(`steps.${index}.answer`, normalized, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
      />
      <ImagePicker
        label="Reference photo"
        description="Take a photo on-site or upload a reference image players must match."
        uploadKind="step"
        allowCamera
        value={answer}
        onChange={(value) =>
          setValue(`steps.${index}.answer`, value ?? '', {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
        error={error}
      />
    </div>
  );
}
