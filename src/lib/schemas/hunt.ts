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

export const HUNT_STEP_TYPE_OPTIONS: {
  value: HuntStepTypeValue;
  label: string;
  description: string;
}[] = [
  {
    value: 'checkpoint',
    label: 'Checkpoint (GPS)',
    description: 'Players must physically reach this location',
  },
  {
    value: 'riddle',
    label: 'Riddle',
    description: 'Solve a riddle when arriving at this location',
  },
  {
    value: 'qr_code',
    label: 'QR Code',
    description: 'Scan a QR code placed at this location',
  },
  {
    value: 'clue',
    label: 'Clue',
    description: 'Discover a clue hidden at this location',
  },
  {
    value: 'ar',
    label: 'AR Treasure',
    description: 'Reveal augmented-reality loot at this location in the app',
  },
  {
    value: 'photo',
    label: 'Photo match',
    description: 'Players take a matching photo at this location to complete the step',
  },
] as const;

const optionalStepIdSchema = z.preprocess(
  (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
  z.string().uuid().optional(),
);

export const huntStepSchema = z
  .object({
    id: optionalStepIdSchema,
    order: z.number().int().min(1),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    type: z.enum(HUNT_STEP_TYPES),
    address: z.string().optional(),
    answer: z.string().optional(),
    latitude: z.coerce.string(),
    longitude: z.coerce.string(),
    points: z
      .number({ invalid_type_error: 'Points are required' })
      .min(1, 'Points must be at least 1'),
  })
  .superRefine((step, ctx) => {
    if (step.latitude === undefined || step.longitude === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Set a location using the address lookup or map',
        path: ['latitude'],
      });
    }

    if (step.type === 'photo' && !step.answer?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Add a reference photo for players to match',
        path: ['answer'],
      });
    }
  });

export const huntBasicsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z
    .string()
    .optional()
    .refine((value) => !value || isValidImageReference(value), {
      message: 'Upload an image or provide a valid image URL',
    }),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  estimatedDuration: z.number().int().min(5).max(480),
  status: z.enum(['active', 'draft', 'archived', 'paused']),
  partnerId: z.string().min(1, 'Partner ID is required'),
});

export const huntFormSchema = huntBasicsSchema.extend({
  steps: z.array(huntStepSchema).min(1, 'At least one step is required'),
});

export type HuntBasicsForm = z.infer<typeof huntBasicsSchema>;
export type HuntStepForm = z.infer<typeof huntStepSchema>;
export type HuntFormValues = z.infer<typeof huntFormSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  bio: z.string().optional(),
});

export const totpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export function createDefaultHuntStep(order = 1): HuntStepForm {
  return {
    order,
    title: '',
    description: '',
    type: 'checkpoint',
    latitude: '37.7749',
    longitude: '-122.4194',
    points: DEFAULT_STEP_POINTS,
  };
}
