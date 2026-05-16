import type { AiCapability } from '@/lib/types';

export type AiProviderUiState = {
  isAiEnabled: boolean;
  hasSavedKey: boolean;
  isValidated: boolean;
  canEditSkills: boolean;
  label: string;
  badgeVariant: 'default' | 'outline' | 'destructive';
  statusText: string;
  helperText: string;
};

export function getAiProviderUiState(capability: AiCapability | null | undefined): AiProviderUiState {
  const provider = capability?.provider;
  const hasSavedKey = Boolean(provider?.id && (provider.keySuffix || provider.keyFingerprint));
  const isAiEnabled = Boolean(capability?.canGenerate);
  const canEditSkills = Boolean(capability?.canEditSkills);
  const isValidated = Boolean(isAiEnabled && provider?.status === 'configured');

  if (isAiEnabled) {
    return {
      isAiEnabled: true,
      hasSavedKey,
      isValidated,
      canEditSkills,
      label: 'AI enabled',
      badgeVariant: 'default',
      statusText: [
        'validated',
        provider?.model ? provider.model : null,
        provider?.keySuffix ? `key ending ${provider.keySuffix}` : null,
      ].filter(Boolean).join(' · '),
      helperText: 'AI generation and custom step skills are active for this workspace.',
    };
  }

  if (hasSavedKey && provider?.status === 'validation_failed') {
    return {
      isAiEnabled: false,
      hasSavedKey,
      isValidated: false,
      canEditSkills,
      label: 'Validation failed',
      badgeVariant: 'destructive',
      statusText: provider.keySuffix ? `key ending ${provider.keySuffix}` : 'saved key failed validation',
      helperText: provider.validationError ?? 'Validate the saved provider key before using AI generation.',
    };
  }

  if (hasSavedKey) {
    return {
      isAiEnabled: false,
      hasSavedKey,
      isValidated: false,
      canEditSkills,
      label: provider?.status === 'validating' ? 'Validating' : 'Key saved',
      badgeVariant: 'outline',
      statusText: provider?.keySuffix ? `not validated · key ending ${provider.keySuffix}` : 'saved key not validated',
      helperText: 'Validate the saved provider key before AI generation and custom skills are enabled.',
    };
  }

  return {
    isAiEnabled: false,
    hasSavedKey: false,
    isValidated: false,
    canEditSkills: false,
    label: 'Manual mode',
    badgeVariant: 'outline',
    statusText: 'no saved provider key',
    helperText: 'Add and validate a provider key to enable AI generation and custom step skills.',
  };
}
