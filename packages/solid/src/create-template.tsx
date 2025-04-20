import { onMount, createSignal, createMemo } from "solid-js";

export type EmbedCreateTemplateProps = {
  className?: string;
  host?: string;
  presignToken: string;
  externalId?: string; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

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
  }; // Additional props to be passed to the iframe, used for testing out features
  // prior to being added to the main props

  additionalProps?: Record<string, string | number | boolean> | undefined;
  onTemplateCreated?: (data: {
    externalId: string;
    templateId: number;
  }) => void;
};

import { CssVars } from "./css-vars";

function EmbedCreateTemplate(props: EmbedCreateTemplateProps) {
  const src = createMemo(() => {
    const appHost = props.host || "https://app.documenso.com";
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
        })
      )
    );
    const srcUrl = new URL(`/embed/v1/authoring/template/create`, appHost);
    return `${srcUrl}#${encodedOptions}`;
  });

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "template-created":
          props.onTemplateCreated?.({
            templateId: event.data.templateId,
            externalId: event.data.externalId,
          });
          break;
      }
    }
  }

  let __iframe: HTMLIFrameElement;

  onMount(() => {
    window.addEventListener("message", handleMessage);
  });

  return (
    <>
      <iframe class={props.className} ref={__iframe!} src={src()}></iframe>
    </>
  );
}

export default EmbedCreateTemplate;
