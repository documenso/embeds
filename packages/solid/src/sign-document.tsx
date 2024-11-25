import { onMount, createSignal, createMemo } from "solid-js";

export type EmbedSignDocumentProps = {
  className?: string;
  host?: string;
  token: string; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;
  darkModeDisabled?: boolean | undefined;
  name?: string | undefined;
  lockName?: boolean | undefined;
  onDocumentReady?: () => void;
  onDocumentCompleted?: (data: {
    token: string;
    documentId: number;
    recipientId: number;
  }) => void;
  onDocumentError?: (error: string) => void;
};

import { CssVars } from "./css-vars";

function EmbedSignDocument(props: EmbedSignDocumentProps) {
  const src = createMemo(() => {
    const appHost = props.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      JSON.stringify({
        name: props.name,
        lockName: props.lockName,
        css: props.css,
        cssVars: props.cssVars,
        darkModeDisabled: props.darkModeDisabled,
      })
    );
    const srcUrl = new URL(`/embed/sign/${props.token}`, appHost);
    return `${srcUrl}#${encodedOptions}`;
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

export default EmbedSignDocument;
