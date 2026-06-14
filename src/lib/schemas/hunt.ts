import { z } from 'zod';
import { isValidImageReference } from '@/lib/image-utils';

export const HUNT_STEP_TYPES = [
  'checkpoint',
  'riddle',
  'qr_code',
  'clue',
  'ar',
  'photo',
] as const;

export type HuntStepTypeValue = (typeof HUNT_STEP_TYPES)[number];

export const DEFAULT_STEP_POINTS = 10;

export type ValidationMessages = {
  hunt: {
    titleRequired: string;
    titleMin: string;
    descriptionRequired: string;
    descriptionMin: string;
    imageInvalid: string;
    partnerIdRequired: string;
    pointsRequired: string;
    pointsMin: string;
    locationRequired: string;
    photoRequired: string;
    qrRequired: string;
    stepsMin: string;
  };
  auth: {
    invalidEmail: string;
    passwordMin: string;
    usernameMin: string;
    codeLength: string;
  };
};

const optionalStepIdSchema = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().uuid().optional(),
);

export function createHuntSchemas(v: ValidationMessages) {
  const huntStepSchema = z
    .object({
      id: optionalStepIdSchema,
      order: z.number().int().min(1),
      title: z.string().min(1, v.hunt.titleRequired),
      description: z.string().min(1, v.hunt.descriptionRequired),
      type: z.enum(HUNT_STEP_TYPES),
      address: z.string().optional(),
      answer: z.string().optional(),
      scanInAr: z.boolean().optional(),
      latitude: z.coerce.string(),
      longitude: z.coerce.string(),
      points: z
        .number({ invalid_type_error: v.hunt.pointsRequired })
        .min(1, v.hunt.pointsMin),
    })
    .superRefine((step, ctx) => {
      if (step.latitude === undefined || step.longitude === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.hunt.locationRequired,
          path: ['latitude'],
        });
      }

      if (step.type === 'photo' && !step.answer?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.hunt.photoRequired,
          path: ['answer'],
        });
      }

      if (step.type === 'qr_code' && !step.answer?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: v.hunt.qrRequired,
          path: ['answer'],
        });
      }
    });

  const huntBasicsSchema = z.object({
    title: z.string().min(3, v.hunt.titleMin),
    description: z.string().min(10, v.hunt.descriptionMin),
    image: z
      .string()
      .optional()
      .refine((value) => !value || isValidImageReference(value), {
        message: v.hunt.imageInvalid,
      }),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    estimatedDuration: z.number().int().min(5).max(480),
    status: z.enum(['active', 'draft', 'archived', 'paused']),
    partnerId: z.string().min(1, v.hunt.partnerIdRequired),
  });

  const huntFormSchema = huntBasicsSchema.extend({
    steps: z.array(huntStepSchema).min(1, v.hunt.stepsMin),
  });

  const loginSchema = z.object({
    email: z.string().email(v.auth.invalidEmail),
    password: z.string().min(8, v.auth.passwordMin),
  });

  const registerSchema = z.object({
    username: z.string().min(3, v.auth.usernameMin),
    email: z.string().email(v.auth.invalidEmail),
    password: z.string().min(8, v.auth.passwordMin),
    bio: z.string().optional(),
  });

  const totpSchema = z.object({
    code: z.string().length(6, v.auth.codeLength),
  });

  const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8, v.auth.passwordMin),
  });

  const forgotPasswordSchema = z.object({
    email: z.string().email(v.auth.invalidEmail),
  });

  return {
    huntStepSchema,
    huntBasicsSchema,
    huntFormSchema,
    loginSchema,
    registerSchema,
    totpSchema,
    resetPasswordSchema,
    forgotPasswordSchema,
  };
}

// Default English schemas for backwards compatibility during migration
const defaultSchemas = createHuntSchemas({
  hunt: {
    titleRequired: 'Title is required',
    titleMin: 'Title must be at least 3 characters',
    descriptionRequired: 'Description is required',
    descriptionMin: 'Description must be at least 10 characters',
    imageInvalid: 'Upload an image or provide a valid image URL',
    partnerIdRequired: 'Partner ID is required',
    pointsRequired: 'Points are required',
    pointsMin: 'Points must be at least 1',
    locationRequired: 'Set a location using the address lookup or map',
    photoRequired: 'Add a reference photo for players to match',
    qrRequired: 'Enter the content to encode in the QR code',
    stepsMin: 'At least one step is required',
  },
  auth: {
    invalidEmail: 'Invalid email',
    passwordMin: 'Password must be at least 8 characters',
    usernameMin: 'Username must be at least 3 characters',
    codeLength: 'Code must be 6 digits',
  },
});

export const huntStepSchema = defaultSchemas.huntStepSchema;
export const huntBasicsSchema = defaultSchemas.huntBasicsSchema;
export const huntFormSchema = defaultSchemas.huntFormSchema;
export const loginSchema = defaultSchemas.loginSchema;
export const registerSchema = defaultSchemas.registerSchema;
export const totpSchema = defaultSchemas.totpSchema;
export const resetPasswordSchema = defaultSchemas.resetPasswordSchema;
export const forgotPasswordSchema = defaultSchemas.forgotPasswordSchema;

export type HuntBasicsForm = z.infer<typeof huntBasicsSchema>;
export type HuntStepForm = z.infer<typeof huntStepSchema>;
export type HuntFormValues = z.infer<typeof huntFormSchema>;

export function createDefaultHuntStep(order = 1): HuntStepForm {
  return {
    order,
    title: '',
    description: '',
    type: 'checkpoint',
    latitude: '37.7749',
    longitude: '-122.4194',
    points: DEFAULT_STEP_POINTS,
    scanInAr: false,
  };
}

export function getHuntStepTypeOptions(
  t: (key: string) => string
): { value: HuntStepTypeValue; label: string; description: string }[] {
  return HUNT_STEP_TYPES.map((value) => ({
    value,
    label: t(`stepTypeOptions.${value}.label`),
    description: t(`stepTypeOptions.${value}.description`),
  }));
}
