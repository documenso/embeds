import { onMount, createSignal, createMemo } from "solid-js";

export type EmbedDirectTemplateProps = {
  className?: string;
  host?: string;
  token: string;
  externalId?: string;

  // @src: /apps/web/src/app/embed/direct/[[...url]]/schema
  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;
  darkModeDisabled?: boolean | undefined;
  language?: string | undefined;
  email?: string | undefined;
  lockEmail?: boolean | undefined;
  name?: string | undefined;
  lockName?: boolean | undefined;

  // Additional props to be passed to the iframe, used for testing out features
  // prior to being added to the main props
  additionalProps?: Record<string, string | number | boolean> | undefined;
  onDocumentReady?: () => void;
  onDocumentCompleted?: (data: {
    token: string;
    documentId: number;
    recipientId: number;
  }) => void;
  onDocumentError?: (error: string) => void;
  onFieldSigned?: () => void;
  onFieldUnsigned?: () => void;
};

import { CssVars } from "./css-vars";

function EmbedDirectTemplate(props: EmbedDirectTemplateProps) {
  const src = createMemo(() => {
    const appHost = props.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          name: props.name,
          lockName: props.lockName,
          email: props.email,
          lockEmail: props.lockEmail,
          css: props.css,
          cssVars: props.cssVars,
          darkModeDisabled: props.darkModeDisabled,
          language: props.language,
          ...props.additionalProps,
        })
      )
    );
    const srcUrl = new URL(`/embed/direct/${props.token}`, appHost);
    if (props.externalId) {
      srcUrl.searchParams.set("externalId", props.externalId);
    }
    return `${srcUrl}#${encodedOptions}`;
  });

  const sandbox = createMemo(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Mitosis types `sandbox` as a single token, but the attribute is space-separated.
    return "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" as any;
  });

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.action) {
        case "document-ready":
          props.onDocumentReady?.();
          break;
        case "document-completed":
          props.onDocumentCompleted?.(event.data.data);
          break;
        case "document-error":
          props.onDocumentError?.(event.data.data);
          break;
        case "field-signed":
          props.onFieldSigned?.();
          break;
        case "field-unsigned":
          props.onFieldUnsigned?.();
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

export default EmbedDirectTemplate;
