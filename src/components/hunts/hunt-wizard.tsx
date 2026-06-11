'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import {
  huntBasicsSchema,
  huntFormSchema,
  huntStepSchema,
  HUNT_STEP_TYPE_OPTIONS,
  createDefaultHuntStep,
  DEFAULT_STEP_REWARD,
  type HuntFormValues,
  type HuntStepTypeValue,
} from '@/lib/schemas/hunt';
import { useCreateHunt, useUpdateHunt, useMe } from '@/lib/api/queries';
import { StepLocationPicker } from '@/components/hunts/step-location-picker';
import { ArStepPreview } from '@/components/hunts/ar-step-preview';
import { formatStepType } from '@/lib/utils';
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
  const createHunt = useCreateHunt();
  const updateHunt = useUpdateHunt(hunt?.id ?? '');

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
        order: s.order,
        title: s.title,
        description: s.description,
        type: s.type,
        clue: s.clue,
        answer: s.answer,
        latitude: s.latitude?.toString() ?? '37.7749',
        longitude: s.longitude?.toString() ?? '-122.4194',
        reward: s.reward ?? DEFAULT_STEP_REWARD,
      })) ?? [createDefaultHuntStep(1)],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

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
    const payload = {
      ...data,
      image: data.image || undefined,
      steps: data.steps.map((s, i) => ({
        ...s,
        order: i + 1,
        latitude: String(s.latitude),
        longitude: String(s.longitude),
        reward: s.reward,
      })),
    };

    try {
      if (mode === 'create') {
        await createHunt.mutateAsync(payload);
        toast.success('Hunt created!');
      } else {
        await updateHunt.mutateAsync(payload);
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
            <div className="space-y-2">
              <Label>Cover image URL</Label>
              <Input {...form.register('image')} placeholder="https://…" />
              {errors.image && (
                <p className="text-xs text-rose-400">{errors.image.message}</p>
              )}
            </div>
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
              <Card key={field.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Step {index + 1}</CardTitle>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-rose-400" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={stepType}
                        onValueChange={(v: HuntStepTypeValue) =>
                          form.setValue(`steps.${index}.type`, v)
                        }
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
                        {...form.register(`steps.${index}.reward`, { valueAsNumber: true })}
                      />
                      {errors.steps?.[index]?.reward && (
                        <p className="text-xs text-rose-400">{errors.steps[index]?.reward?.message}</p>
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

                  {stepType === 'riddle' && (
                    <>
                      <div className="space-y-2">
                        <Label>Clue (optional)</Label>
                        <Input
                          {...form.register(`steps.${index}.clue`)}
                          placeholder="Hint shown to players"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Answer</Label>
                        <Input {...form.register(`steps.${index}.answer`)} />
                        {errors.steps?.[index]?.answer && (
                          <p className="text-xs text-rose-400">{errors.steps[index]?.answer?.message}</p>
                        )}
                      </div>
                    </>
                  )}

                  {stepType === 'qr_code' && (
                    <div className="space-y-2">
                      <Label>QR code payload</Label>
                      <Input
                        {...form.register(`steps.${index}.answer`)}
                        placeholder="Text or URL encoded in the QR code"
                      />
                      {errors.steps?.[index]?.answer && (
                        <p className="text-xs text-rose-400">{errors.steps[index]?.answer?.message}</p>
                      )}
                    </div>
                  )}

                  {stepType === 'clue' && (
                    <div className="space-y-2">
                      <Label>Clue text</Label>
                      <Input
                        {...form.register(`steps.${index}.clue`)}
                        placeholder="What players need to find or read"
                      />
                      {errors.steps?.[index]?.clue && (
                        <p className="text-xs text-rose-400">{errors.steps[index]?.clue?.message}</p>
                      )}
                    </div>
                  )}

                  {stepType === 'ar' && (
                    <>
                      <ArStepPreview />
                      <div className="space-y-2">
                        <Label>AR hint (optional)</Label>
                        <Input
                          {...form.register(`steps.${index}.clue`)}
                          placeholder="e.g. Look for the golden glow near the fountain"
                        />
                      </div>
                    </>
                  )}

                  <StepLocationPicker
                    address={form.watch(`steps.${index}.address`)}
                    latitude={form.watch(`steps.${index}.latitude`)}
                    longitude={form.watch(`steps.${index}.longitude`)}
                    onAddressChange={(value) => form.setValue(`steps.${index}.address`, value)}
                    onLocationChange={(lat, lng) => {
                      form.setValue(`steps.${index}.latitude`, lat.toString(), { shouldDirty: true });
                      form.setValue(`steps.${index}.longitude`, lng.toString(), { shouldDirty: true });
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
              <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs text-teal capitalize">
                {form.watch('status')}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                {fields.length} steps
              </span>
              <span className="rounded-full bg-gold/20 px-3 py-1 text-xs text-gold">
                {fields.reduce((sum, _, i) => sum + (form.watch(`steps.${i}.reward`) || 0), 0)} total points
              </span>
            </div>
            <ol className="space-y-2">
              {fields.map((_, i) => (
                <li key={i} className="text-sm text-white/70">
                  {i + 1}. {form.watch(`steps.${i}.title`)} ({formatStepType(form.watch(`steps.${i}.type`))})
                  <span className="text-gold"> · {form.watch(`steps.${i}.reward`)} pts</span>
                  {form.watch(`steps.${i}.address`) && (
                    <span className="block text-xs text-white/40 mt-0.5">
                      {form.watch(`steps.${i}.address`)}
                    </span>
                  )}
                </li>
              ))}
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
            disabled={createHunt.isPending || updateHunt.isPending}
          >
            {mode === 'create' ? 'Create hunt' : 'Save changes'}
          </Button>
        )}
      </div>
    </form>
  );
}
