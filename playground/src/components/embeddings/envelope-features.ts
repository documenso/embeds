import { z } from 'zod';

import type { EnvelopeEditorSettings } from '@documenso/embed/src/features-type';

/**
 * Recursively maps a features object to the same structure with string (description) at every leaf.
 * Ensures every key in T has a corresponding description when used as the type of a constant.
 */
type DescriptionsFor<T> = T extends boolean
  ? string
  : T extends object
    ? { [K in keyof T]: DescriptionsFor<Exclude<T[K], null>> }
    : never;

/** Type-safe descriptions for every setting in EnvelopeEmbedFeatures. Add new keys here when the type gains them. */
export type EnvelopeEmbedFeaturesDescriptions = DescriptionsFor<EnvelopeEditorSettings>;

/**
 * Default envelope editor features for the playground (all enabled).
 *
 * This is duplicated from the web app packages/lib/types/envelope-editor.ts
 */
export const DEFAULT_ENVELOPE_FEATURES = {
  general: {
    allowConfigureEnvelopeTitle: true,
    allowUploadAndRecipientStep: true,
    allowAddFieldsStep: true,
    allowPreviewStep: true,
    minimizeLeftSidebar: true,
  },
  settings: {
    allowConfigureSignatureTypes: true,
    allowConfigureLanguage: true,
    allowConfigureDateFormat: true,
    allowConfigureTimezone: true,
    allowConfigureRedirectUrl: true,
    allowConfigureDistribution: true,
    allowConfigureExpirationPeriod: true,
    allowConfigureEmailSender: true,
    allowConfigureEmailReplyTo: true,
  },
  actions: {
    allowAttachments: true,
  },
  envelopeItems: {
    allowConfigureTitle: true,
    allowConfigureOrder: true,
    allowUpload: true,
    allowDelete: true,
  },
  recipients: {
    allowConfigureSigningOrder: true,
    allowConfigureDictateNextSigner: true,
    allowApproverRole: true,
    allowViewerRole: true,
    allowCCerRole: true,
    allowAssistantRole: true,
  },
  // fields: {
  //   allowAIDetection: false,
  // },
} satisfies EnvelopeEditorSettings;

export const DEFAULT_ENVELOPE_FEATURES_DESCRIPTIONS: EnvelopeEmbedFeaturesDescriptions = {
  general: {
    allowConfigureEnvelopeTitle: 'Allow users to change the envelope title',
    allowUploadAndRecipientStep: 'Show upload and recipient configuration step',
    allowAddFieldsStep: 'Show add fields step',
    allowPreviewStep: 'Show preview step',
    minimizeLeftSidebar: 'Start with the left sidebar minimized',
  },
  settings: {
    allowConfigureSignatureTypes: 'Allow users to configure signature field types',
    allowConfigureLanguage: 'Allow users to configure document language',
    allowConfigureDateFormat: 'Allow users to configure date format',
    allowConfigureTimezone: 'Allow users to configure timezone',
    allowConfigureRedirectUrl: 'Allow users to set redirect URL after completion',
    allowConfigureDistribution: 'Allow users to configure distribution method',
    allowConfigureExpirationPeriod: 'Allow users to configure envelope expiration period',
    allowConfigureEmailSender: 'Allow users to configure email sender',
    allowConfigureEmailReplyTo: 'Allow users to configure email reply to',
  },
  actions: {
    allowAttachments: 'Allow adding attachments to the envelope',
  },
  envelopeItems: {
    allowConfigureTitle: 'Allow changing envelope item titles',
    allowConfigureOrder: 'Allow reordering envelope items',
    allowUpload: 'Allow uploading new documents to the envelope',
    allowDelete: 'Allow removing envelope items',
  },
  recipients: {
    allowConfigureSigningOrder: 'Allow configuring signing order',
    allowConfigureDictateNextSigner: 'Allow configuring who dictates the next signer',
    allowApproverRole: 'Allow adding approver recipients',
    allowViewerRole: 'Allow adding viewer recipients',
    allowCCerRole: 'Allow adding CC recipients',
    allowAssistantRole: 'Allow adding assistant recipients',
  },
  // fields: {
  //   allowAIDetection: 'N/A', // These aren't available for embeds.
  // },
};

/** Zod schema for the features form, mirrors EnvelopeEmbedFeatures. */
export const EnvelopeFeaturesSchema = z.object({
  general: z.object({
    allowConfigureEnvelopeTitle: z.boolean(),
    allowUploadAndRecipientStep: z.boolean(),
    allowAddFieldsStep: z.boolean(),
    allowPreviewStep: z.boolean(),
    minimizeLeftSidebar: z.boolean(),
  }),
  settings: z
    .object({
      allowConfigureSignatureTypes: z.boolean(),
      allowConfigureLanguage: z.boolean(),
      allowConfigureDateFormat: z.boolean(),
      allowConfigureTimezone: z.boolean(),
      allowConfigureRedirectUrl: z.boolean(),
      allowConfigureDistribution: z.boolean(),
      allowConfigureExpirationPeriod: z.boolean(),
      allowConfigureEmailSender: z.boolean(),
      allowConfigureEmailReplyTo: z.boolean(),
    })
    .nullable(),
  actions: z.object({
    allowAttachments: z.boolean(),
  }),
  envelopeItems: z
    .object({
      allowConfigureTitle: z.boolean(),
      allowConfigureOrder: z.boolean(),
      allowUpload: z.boolean(),
      allowDelete: z.boolean(),
    })
    .nullable(),
  recipients: z
    .object({
      // allowAIDetection: z.boolean(),
      allowConfigureSigningOrder: z.boolean(),
      allowConfigureDictateNextSigner: z.boolean(),
      allowApproverRole: z.boolean(),
      allowViewerRole: z.boolean(),
      allowCCerRole: z.boolean(),
      allowAssistantRole: z.boolean(),
    })
    .nullable(),
  // fields: z.object({
  //   allowAIDetection: z.boolean(),
  // }),
});

export type TEnvelopeFeatures = z.infer<typeof EnvelopeFeaturesSchema>;
