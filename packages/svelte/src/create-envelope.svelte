<script context="module" lang="ts">
  export type EmbedCreateEnvelopeProps = {
    className?: string;
    host?: string;
    presignToken: string;
    externalId?: string;
    type: "DOCUMENT" | "TEMPLATE";
    css?: string | undefined;
    cssVars?: (CssVars & Record<string, string>) | undefined;
    darkModeDisabled?: boolean | undefined; // biome-ignore lint/suspicious/noExplicitAny: Hehe

    features?: DeepPartial<EnvelopeEditorSettings> & Record<string, any>;
    onEnvelopeCreated?: (data: {
      externalId: string | null;
      envelopeId: number;
    }) => void;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { CssVars } from "./css-vars";
  import type { DeepPartial, EnvelopeEditorSettings } from "./features-type";

  export let host: EmbedCreateEnvelopeProps["host"] = undefined;
  export let externalId: EmbedCreateEnvelopeProps["externalId"] = undefined;
  export let type: EmbedCreateEnvelopeProps["type"];
  export let features: EmbedCreateEnvelopeProps["features"] = undefined;
  export let css: EmbedCreateEnvelopeProps["css"] = undefined;
  export let cssVars: EmbedCreateEnvelopeProps["cssVars"] = undefined;
  export let darkModeDisabled: EmbedCreateEnvelopeProps["darkModeDisabled"] =
    undefined;
  export let presignToken: EmbedCreateEnvelopeProps["presignToken"];
  export let onEnvelopeCreated: EmbedCreateEnvelopeProps["onEnvelopeCreated"] =
    undefined;
  export let className: EmbedCreateEnvelopeProps["className"] = undefined;

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "envelope-created":
          onEnvelopeCreated?.({
            envelopeId: event.data.envelopeId,
            externalId: event.data.externalId,
          });
          break;
      }
    }
  }
  $: src = () => {
    const appHost = host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          externalId: externalId,
          type: type,
          features: features,
          css: css,
          cssVars: cssVars,
          darkModeDisabled: darkModeDisabled,
        })
      )
    );
    const srcUrl = new URL(`/embed/v2/authoring/envelope/create`, appHost);
    srcUrl.searchParams.set("token", presignToken);
    srcUrl.hash = encodedOptions;
    return srcUrl.toString();
  };

  let __iframe;

  onMount(() => {
    window.addEventListener("message", handleMessage);
  });

  onDestroy(() => {
    window.removeEventListener("message", handleMessage);
  });
</script>

<iframe bind:this={__iframe} class={className} src={src()} />