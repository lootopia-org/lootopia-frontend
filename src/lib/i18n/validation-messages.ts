import type { ValidationMessages } from '@/lib/schemas/hunt';

type ValidationTranslator = (key: string) => string;

export function getValidationMessages(tv: ValidationTranslator): ValidationMessages {
  return {
    hunt: {
      titleRequired: tv('hunt.step.titleRequired'),
      titleMin: tv('hunt.basics.titleMin'),
      descriptionRequired: tv('hunt.step.descriptionRequired'),
      descriptionMin: tv('hunt.basics.descriptionMin'),
      imageInvalid: tv('hunt.basics.imageInvalid'),
      partnerIdRequired: tv('hunt.basics.partnerIdRequired'),
      pointsRequired: tv('hunt.step.pointsInvalidType'),
      pointsMin: tv('hunt.step.pointsMin'),
      locationRequired: tv('hunt.step.locationRequired'),
      photoRequired: tv('hunt.step.photoAnswerRequired'),
      qrRequired: tv('hunt.step.qrContentRequired'),
      stepsMin: tv('hunt.form.stepsMin'),
    },
    auth: {
      invalidEmail: tv('auth.login.emailInvalid'),
      passwordMin: tv('auth.login.passwordMin'),
      usernameMin: tv('auth.register.usernameMin'),
      codeLength: tv('auth.totp.codeLength'),
      passwordMismatch: tv('auth.resetPassword.passwordMismatch'),
      tokenRequired: tv('auth.resetPassword.tokenRequired'),
    },
  };
}
