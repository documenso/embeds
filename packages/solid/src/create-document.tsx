import { onMount, createSignal, createMemo } from "solid-js";

export type EmbedCreateDocumentProps = {
  className?: string;
  host?: string;
  presignToken: string;
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

  // Additional props to be passed to the iframe, used for testing out features
  // prior to being added to the main props
  additionalProps?: Record<string, string | number | boolean> | undefined;
  onDocumentCreated?: (data: {
    externalId: string;
    documentId: number;
  }) => void;
};

import { CssVars } from "./css-vars";

function EmbedCreateDocument(props: EmbedCreateDocumentProps) {
  const src = createMemo(() => {
    const appHost = props.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          externalId: props.externalId,
          features: props.features,
          css: props.css,
          cssVars: props.cssVars,
          darkModeDisabled: props.darkModeDisabled,
          language: props.language,
          ...props.additionalProps,
        })
      )
    );
    const srcUrl = new URL(`/embed/v1/authoring/document/create`, appHost);
    srcUrl.searchParams.set("token", props.presignToken);
    srcUrl.hash = encodedOptions;
    return srcUrl.toString();
  });

  const sandbox = createMemo(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Mitosis types `sandbox` as a single token, but the attribute is space-separated.
    return "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" as any;
  });

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "document-created":
          props.onDocumentCreated?.({
            documentId: event.data.documentId,
            externalId: event.data.externalId,
          });
          break;
      }
    }
  }

  let __iframe!: HTMLIFrameElement;

  onMount(() => {
    window.addEventListener("message", handleMessage);
  });

  return (
    <>
      <iframe
        class={props.className}
        ref={__iframe!}
        src={src()}
        sandbox={sandbox()}
      ></iframe>
    </>
  );
}

export default EmbedCreateDocument;
