export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/**
 * Envelope editor settings (features) for create/edit envelope embeds.
 * Matches ZEnvelopeEditorSettingsSchema from the app.
 */
export type EnvelopeEditorSettings = {
  general: {
    allowConfigureEnvelopeTitle: boolean;
    allowUploadAndRecipientStep: boolean;
    allowAddFieldsStep: boolean;
    allowPreviewStep: boolean;
    minimizeLeftSidebar: boolean;
  };

  /** If null, envelope settings will not be available to be seen/updated. */
  settings: {
    allowConfigureSignatureTypes: boolean;
    allowConfigureLanguage: boolean;
    allowConfigureDateFormat: boolean;
    allowConfigureTimezone: boolean;
    allowConfigureRedirectUrl: boolean;
    allowConfigureDistribution: boolean;
    allowConfigureExpirationPeriod: boolean;
  } | null;

  actions: {
    allowAttachments: boolean;
    allowDistributing: boolean;
    allowDirectLink: boolean;
    allowDuplication: boolean;
    allowDownloadPDF: boolean;
    allowDeletion: boolean;
    allowReturnToPreviousPage: boolean;
  };

  /** If null, no adjustments to envelope items will be allowed. */
  envelopeItems: {
    allowConfigureTitle: boolean;
    allowConfigureOrder: boolean;
    allowUpload: boolean;
    allowDelete: boolean;
  } | null;

  /** If null, recipients will not be configurable at all. */
  recipients: {
    allowAIDetection: boolean;
    allowConfigureSigningOrder: boolean;
    allowConfigureDictateNextSigner: boolean;
    allowApproverRole: boolean;
    allowViewerRole: boolean;
    allowCCerRole: boolean;
    allowAssistantRole: boolean;
  } | null;

  fields: {
    allowAIDetection: boolean;
  };
};
