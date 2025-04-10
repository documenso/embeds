import { onMount, onUnMount, useRef, useStore } from '@builder.io/mitosis';

import { CssVars } from './css-vars';

export type EmbedCreateTemplateProps = {
  className?: string;
  host?: string;
  presignToken: string;
  externalId?: string;

  // @src: /apps/web/src/app/embed/direct/[[...url]]/schema
  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;

  darkModeDisabled?: boolean | undefined;

  features?: {
    allowConfigureSignatureTypes?: boolean;
    allowConfigureLanguage?: boolean;
    allowConfigureDateFormat?: boolean;
    allowConfigureTimezone?: boolean;
    allowConfigureRedirectUrl?: boolean;
    allowConfigureCommunication?: boolean;
  };

  // Additional props to be passed to the iframe, used for testing out features
  // prior to being added to the main props
  additionalProps?: Record<string, string | number | boolean> | undefined;

  onTemplateCreated?: (data: { externalId: string; templateId: number }) => void;
};

export default function EmbedCreateTemplate(props: EmbedCreateTemplateProps) {
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
            ...props.additionalProps,
          }),
        ),
      );

      const srcUrl = new URL(`/embed/v1/authoring/template/create`, appHost);

      return `${srcUrl}#${encodedOptions}`;
    },

    handleMessage(event: MessageEvent) {
      if (__iframe?.contentWindow === event.source) {
        switch (event.data.type) {
          case 'template-completed':
            props.onTemplateCreated?.({
              templateId: event.data.templateId,
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
