import { onMount, onUnMount, useRef, useStore } from '@builder.io/mitosis';

import { CssVars } from './css-vars';
import type { DeepPartial, EnvelopeEditorSettings } from './features-type';

export type EmbedUpdateEnvelopeProps = {
  className?: string;
  host?: string;
  presignToken: string;
  externalId?: string;

  envelopeId: string;

  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;

  darkModeDisabled?: boolean | undefined;

  // biome-ignore lint/suspicious/noExplicitAny: Hehe
  features?: DeepPartial<EnvelopeEditorSettings> & Record<string, any>;

  onEnvelopeUpdated?: (data: { externalId: string | null; envelopeId: string }) => void;
};

export default function EmbedUpdateEnvelope(props: EmbedUpdateEnvelopeProps) {
  const __iframe = useRef<HTMLIFrameElement>(null);

  const state = useStore({
    get src() {
      const appHost = props.host || 'https://app.documenso.com';

      const encodedOptions = btoa(
        encodeURIComponent(
          JSON.stringify({
            externalId: props.externalId,
            features: props.features,
            css: props.css,
            cssVars: props.cssVars,
            darkModeDisabled: props.darkModeDisabled,
          }),
        ),
      );

      const srcUrl = new URL(`/embed/v2/authoring/envelope/edit/${props.envelopeId}`, appHost);

      srcUrl.searchParams.set('token', props.presignToken);
      srcUrl.hash = encodedOptions;

      return srcUrl.toString();
    },

    handleMessage(event: MessageEvent) {
      if (__iframe?.contentWindow === event.source) {
        switch (event.data.type) {
          case 'envelope-updated':
            props.onEnvelopeUpdated?.({
              envelopeId: event.data.envelopeId,
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

  return <iframe ref={__iframe} class={props.className} src={state.src}></iframe>;
}
