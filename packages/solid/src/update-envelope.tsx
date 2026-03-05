import { onMount, createSignal, createMemo } from "solid-js";

export type EmbedUpdateEnvelopeProps = {
  className?: string;
  host?: string;
  presignToken: string;
  externalId?: string;
  envelopeId: string;
  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;
  darkModeDisabled?: boolean | undefined; // biome-ignore lint/suspicious/noExplicitAny: Hehe

  features?: DeepPartial<EnvelopeEditorSettings> & Record<string, any>;
  onEnvelopeUpdated?: (data: {
    externalId: string | null;
    envelopeId: string;
  }) => void;
};

import { CssVars } from "./css-vars";
import type { DeepPartial, EnvelopeEditorSettings } from "./features-type";

function EmbedUpdateEnvelope(props: EmbedUpdateEnvelopeProps) {
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
        })
      )
    );
    const srcUrl = new URL(
      `/embed/v2/authoring/envelope/edit/${props.envelopeId}`,
      appHost
    );
    srcUrl.searchParams.set("token", props.presignToken);
    srcUrl.hash = encodedOptions;
    return srcUrl.toString();
  });

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "envelope-updated":
          props.onEnvelopeUpdated?.({
            envelopeId: event.data.envelopeId,
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

export default EmbedUpdateEnvelope;
