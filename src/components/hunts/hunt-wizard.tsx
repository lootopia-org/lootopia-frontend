'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check } from 'lucide-react';
import {
  huntBasicsSchema,
  huntFormSchema,
  huntStepSchema,
  HUNT_STEP_TYPE_OPTIONS,
  createDefaultHuntStep,
  DEFAULT_STEP_POINTS,
  type HuntFormValues,
  type HuntStepTypeValue,
} from '@/lib/schemas/hunt';
import { useCreateHunt, useSaveHuntEdit, useMe } from '@/lib/api/queries';
import { StepLocationPicker } from '@/components/hunts/step-location-picker';
import { ArStepPreview } from '@/components/hunts/ar-step-preview';
import { ImagePicker } from '@/components/ui/image-picker';
import { PhotoStepCaptureFields } from '@/components/hunts/photo-step-capture-fields';
import { normalizeImageReference, isHttpStoredImageUrl } from '@/lib/image-utils';
import { RemoteStoredImage } from '@/components/ui/remote-stored-image';
import { formatStepType, huntStatusLabel } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Hunt } from '@/types';

interface HuntWizardProps {
  hunt?: Hunt;
  mode: 'create' | 'edit';
}

export function HuntWizard({ hunt, mode }: HuntWizardProps) {
  const router = useRouter();
  const { data: user } = useMe();
  const [step, setStep] = useState(0);
  const [mapEpoch, setMapEpoch] = useState(0);
  const createHunt = useCreateHunt();
  const saveHuntEdit = useSaveHuntEdit(hunt?.id ?? '');
  const originalStepsRef = useRef<Hunt['steps']>(hunt?.steps ?? []);

  const form = useForm<HuntFormValues>({
    resolver: zodResolver(huntFormSchema),
    defaultValues: {
      title: hunt?.title ?? '',
      description: hunt?.description ?? '',
      image: hunt?.image ?? '',
      difficulty: hunt?.difficulty ?? 'medium',
      estimatedDuration: hunt?.estimatedDuration ?? 60,
      status: hunt?.status ?? 'draft',
      partnerId: hunt?.partnerId ?? user?.id ?? '',
      steps: hunt?.steps?.map((s) => ({
        id: s.id,
        order: s.order,
        title: s.title,
        description: s.description,
        type: s.type,
        answer: s.answer ?? '',
        latitude: s.latitude?.toString() ?? '37.7749',
        longitude: s.longitude?.toString() ?? '-122.4194',
        points: s.points ?? DEFAULT_STEP_POINTS,
      })) ?? [createDefaultHuntStep(1)],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'steps',
    keyName: 'fieldKey',
  });

  const reorderStep = (from: number, to: number) => {
    move(from, to);
    requestAnimationFrame(() => {
      const reordered = form.getValues('steps');
      reordered.forEach((_, index) => {
        form.setValue(`steps.${index}.order`, index + 1, { shouldDirty: true });
      });
      setMapEpoch((epoch) => epoch + 1);
    });
  };

  const steps = ['Basics', 'Steps', 'Review'];
  const { errors } = form.formState;

  useEffect(() => {
    if (user?.id && mode === 'create') {
      form.setValue('partnerId', user.id, { shouldValidate: false });
    }
  }, [user?.id, mode, form]);

  const applyZodErrors = (issues: z.ZodIssue[], prefix?: string) => {
    for (const issue of issues) {
      const path = [prefix, ...issue.path.map(String)].filter(Boolean).join('.');
      form.setError(path as FieldPath<HuntFormValues>, { message: issue.message });
    }
  };

  const onSubmit = async (data: HuntFormValues) => {
    const steps = data.steps.map((s, i) => {
      const { address: _address, ...step } = s;
      return {
        ...step,
        order: i + 1,
        latitude: String(s.latitude),
        longitude: String(s.longitude),
        points: Number(s.points),
        answer: s.answer?.trim() || undefined,
      };
    });

    const metadata = {
      title: data.title,
      description: data.description,
      image: data.image || undefined,
      difficulty: data.difficulty,
      estimatedDuration: data.estimatedDuration,
      status: data.status,
    };

    try {
      if (mode === 'create') {
        await createHunt.mutateAsync({ ...metadata, partnerId: data.partnerId, steps });
        toast.success('Hunt created!');
      } else if (hunt) {
        await saveHuntEdit.mutateAsync({
          metadata,
          steps,
          originalSteps: originalStepsRef.current ?? [],
        });
        toast.success('Hunt updated!');
      }
      router.push('/partner');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save hunt');
    }
  };

  const nextStep = async () => {
    const values = form.getValues();

    if (step === 0) {
      form.clearErrors();
      const result = huntBasicsSchema.safeParse(values);
      if (!result.success) {
        applyZodErrors(result.error.issues);
        toast.error('Please fix the highlighted fields');
        return;
      }
    }

    if (step === 1) {
      form.clearErrors('steps');
      const result = z
        .array(huntStepSchema)
        .min(1, 'At least one step is required')
        .safeParse(values.steps);
      if (!result.success) {
        applyZodErrors(result.error.issues, 'steps');
        toast.error('Please complete all hunt steps');
        return;
      }
    }

    setStep((s) => Math.min(s + 1, 2));
  };

  const handleCreateHunt = () => {
    if (step !== 2) return;
    void form.handleSubmit(onSubmit)();
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && step < 2) {
          const target = e.target as HTMLElement;
          if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            e.preventDefault();
          }
        }
      }}
    >
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                i <= step ? 'bg-gold text-background' : 'bg-white/10 text-white/40'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i <= step ? 'text-gold' : 'text-white/40'}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-white/20 hidden sm:block" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hunt basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-xs text-rose-400">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input {...form.register('description')} />
              {errors.description && (
                <p className="text-xs text-rose-400">{errors.description.message}</p>
              )}
            </div>
            <ImagePicker
              label="Cover image"
              description="Upload an image for the hunt card and detail page."
              uploadKind="hunt"
              value={form.watch('image')}
              onChange={(value) => form.setValue('image', value ?? '', { shouldDirty: true, shouldValidate: true })}
              error={errors.image?.message}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={form.watch('difficulty')}
                  onValueChange={(v: HuntFormValues['difficulty']) => form.setValue('difficulty', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input type="number" {...form.register('estimatedDuration', { valueAsNumber: true })} />
                {errors.estimatedDuration && (
                  <p className="text-xs text-rose-400">{errors.estimatedDuration.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(v: HuntFormValues['status']) => form.setValue('status', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {user?.role === 'admin' && (
              <div className="space-y-2">
                <Label>Partner ID</Label>
                <Input {...form.register('partnerId')} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const stepType = form.watch(`steps.${index}.type`) as HuntStepTypeValue;

            return (
              <Card key={field.fieldKey}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Step {index + 1}</CardTitle>
                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => reorderStep(index, index - 1)}
                        aria-label="Move step up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    )}
                    {index < fields.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => reorderStep(index, index + 1)}
                        aria-label="Move step down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-rose-400" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <input type="hidden" {...form.register(`steps.${index}.id`)} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={stepType}
                        onValueChange={(v: HuntStepTypeValue) => {
                          const prev = form.getValues(`steps.${index}.type`);
                          form.setValue(`steps.${index}.type`, v);
                          if (prev === 'photo' && v !== 'photo') {
                            form.setValue(`steps.${index}.answer`, '', {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {HUNT_STEP_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-white/40">
                        {HUNT_STEP_TYPE_OPTIONS.find((o) => o.value === stepType)?.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input {...form.register(`steps.${index}.title`)} />
                      {errors.steps?.[index]?.title && (
                        <p className="text-xs text-rose-400">{errors.steps[index]?.title?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min={1}
                        step="0.1"
                        {...form.register(`steps.${index}.points`, { valueAsNumber: true })}
                      />
                      {errors.steps?.[index]?.points && (
                        <p className="text-xs text-rose-400">{errors.steps[index]?.points?.message}</p>
                      )}
                      <p className="text-xs text-white/40">Awarded when players complete this step</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input {...form.register(`steps.${index}.description`)} />
                    {errors.steps?.[index]?.description && (
                      <p className="text-xs text-rose-400">{errors.steps[index]?.description?.message}</p>
                    )}
                  </div>

                  {stepType === 'photo' ? (
                    <PhotoStepCaptureFields
                      index={index}
                      stepKey={field.fieldKey}
                      huntId={hunt?.id}
                      control={form.control}
                      setValue={form.setValue}
                      error={errors.steps?.[index]?.answer?.message}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Label>Answer</Label>
                      <Input
                        {...form.register(`steps.${index}.answer`)}
                        placeholder="Clue, code, riddle solution, QR payload, or any verification value"
                      />
                      <p className="text-xs text-white/40">
                        Optional verification value used across all step types.
                      </p>
                    </div>
                  )}

                  {stepType === 'ar' && <ArStepPreview />}

                  <StepLocationPicker
                    mapKey={`${field.fieldKey}-${index}-${mapEpoch}`}
                    address={form.watch(`steps.${index}.address`)}
                    latitude={form.watch(`steps.${index}.latitude`)}
                    longitude={form.watch(`steps.${index}.longitude`)}
                    onAddressChange={(value) => form.setValue(`steps.${index}.address`, value)}
                    onLocationChange={(lat, lng) => {
                      form.setValue(`steps.${index}.latitude`, lat.toFixed(6), { shouldDirty: true });
                      form.setValue(`steps.${index}.longitude`, lng.toFixed(6), { shouldDirty: true });
                    }}
                    error={errors.steps?.[index]?.latitude?.message}
                  />
                </CardContent>
              </Card>
            );
          })}
          <Button
            type="button"
            variant="secondary"
            onClick={() => append(createDefaultHuntStep(fields.length + 1))}
          >
            <Plus className="h-4 w-4" /> Add step
          </Button>
        </div>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold">{form.watch('title')}</h3>
              <p className="text-white/60 mt-1">{form.watch('description')}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs text-gold capitalize">
                {form.watch('difficulty')}
              </span>
              <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs text-teal">
                {huntStatusLabel(form.watch('status'))}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                {fields.length} steps
              </span>
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs text-gold">
                {fields.reduce((sum, _, i) => sum + (form.watch(`steps.${i}.points`) || 0), 0)} total points
              </span>
            </div>
            <ol className="space-y-3">
              {fields.map((field, i) => {
                const stepType = form.watch(`steps.${i}.type`) as HuntStepTypeValue;
                const answer = form.watch(`steps.${i}.answer`);
                const normalizedAnswer = normalizeImageReference(answer);
                const showPhotoPreview =
                  stepType === 'photo' &&
                  (isHttpStoredImageUrl(normalizedAnswer) ||
                    normalizedAnswer?.startsWith('data:'));

                return (
                  <li key={field.fieldKey} className="text-sm text-white/70">
                    {i + 1}. {form.watch(`steps.${i}.title`)} ({formatStepType(stepType)})
                    <span className="text-gold"> · {form.watch(`steps.${i}.points`)} pts</span>
                    {showPhotoPreview ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="relative h-16 w-24 overflow-hidden rounded-md border border-white/10 bg-black/20">
                          {normalizedAnswer!.startsWith('data:') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={normalizedAnswer!}
                              alt="Reference photo"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <RemoteStoredImage
                              key={normalizedAnswer!}
                              storedUrl={normalizedAnswer!}
                              alt="Reference photo"
                              className="max-h-16 py-0"
                            />
                          )}
                        </div>
                        <span className="text-xs text-white/40">Reference photo attached</span>
                      </div>
                    ) : normalizedAnswer ? (
                      <span className="mt-0.5 block text-xs text-white/40">
                        Answer: {normalizedAnswer}
                      </span>
                    ) : null}
                    {form.watch(`steps.${i}.address`) && (
                      <span className="mt-0.5 block text-xs text-white/40">
                        {form.watch(`steps.${i}.address`)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < 2 ? (
          <Button type="button" onClick={nextStep}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleCreateHunt}
            disabled={createHunt.isPending || saveHuntEdit.isPending}
          >
            {mode === 'create' ? 'Create hunt' : 'Save changes'}
          </Button>
        )}
      </div>
    </form>
  );
}
