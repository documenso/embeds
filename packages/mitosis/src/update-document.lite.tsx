import { onMount, onUnMount, useRef, useStore } from '@builder.io/mitosis';

import { CssVars } from './css-vars';

export type EmbedUpdateDocumentProps = {
  className?: string;
  host?: string;
  presignToken: string;
  documentId: number;
  externalId?: string;

  // @src: /apps/web/src/app/embed/direct/[[...url]]/schema
  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;

  darkModeDisabled?: boolean | undefined;
  language?: string | undefined;

  features?: {
    allowConfigureSignatureTypes?: boolean;
    allowConfigureLanguage?: boolean;
    allowConfigureDateFormat?: boolean;
    allowConfigureTimezone?: boolean;
    allowConfigureRedirectUrl?: boolean;
    allowConfigureCommunication?: boolean;
  };

  onlyEditFields?: boolean | undefined;

  // Additional props to be passed to the iframe, used for testing out features
  // prior to being added to the main props
  additionalProps?: Record<string, string | number | boolean> | undefined;

  onDocumentUpdated?: (data: { externalId: string; documentId: number }) => void;
};

export default function EmbedUpdateDocument(props: EmbedUpdateDocumentProps) {
  const __iframe = useRef<HTMLIFrameElement>(null);

  const state = useStore({
    get src() {
      const appHost = props.host || 'https://app.documenso.com';

      const encodedOptions = btoa(
        encodeURIComponent(
          JSON.stringify({
            token: props.presignToken,

            externalId: props.externalId,
            features: props.features,

            css: props.css,
            cssVars: props.cssVars,
            darkModeDisabled: props.darkModeDisabled,
            language: props.language,
            onlyEditFields: props.onlyEditFields,
            ...props.additionalProps,
          }),
        ),
      );

      const srcUrl = new URL(`/embed/v1/authoring/document/edit/${props.documentId}`, appHost);

      srcUrl.searchParams.set('token', props.presignToken);
      srcUrl.hash = encodedOptions;

      return srcUrl.toString();
    },

    get sandbox() {
      // biome-ignore lint/suspicious/noExplicitAny: Mitosis types `sandbox` as a single token, but the attribute is space-separated.
      return 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation' as any;
    },

    handleMessage(event: MessageEvent) {
      if (__iframe?.contentWindow === event.source) {
        switch (event.data.type) {
          case 'document-updated':
            props.onDocumentUpdated?.({
              documentId: event.data.documentId,
              externalId: event.data.externalId,
            });
            break;
        }
      }
    },
  });

  onMount(() => {
    window.addEventListener('message', state.handleMessage);
  });

  onUnMount(() => {
    window.removeEventListener('message', state.handleMessage);
  });

  return (
    <iframe ref={__iframe} class={props.className} src={state.src} sandbox={state.sandbox}></iframe>
  );
}
