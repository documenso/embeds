<script context="module" lang="ts">
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
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { CssVars } from "./css-vars";
  import type { DeepPartial, EnvelopeEditorSettings } from "./features-type";

  export let host: EmbedUpdateEnvelopeProps["host"] = undefined;
  export let externalId: EmbedUpdateEnvelopeProps["externalId"] = undefined;
  export let features: EmbedUpdateEnvelopeProps["features"] = undefined;
  export let css: EmbedUpdateEnvelopeProps["css"] = undefined;
  export let cssVars: EmbedUpdateEnvelopeProps["cssVars"] = undefined;
  export let darkModeDisabled: EmbedUpdateEnvelopeProps["darkModeDisabled"] =
    undefined;
  export let envelopeId: EmbedUpdateEnvelopeProps["envelopeId"];
  export let presignToken: EmbedUpdateEnvelopeProps["presignToken"];
  export let onEnvelopeUpdated: EmbedUpdateEnvelopeProps["onEnvelopeUpdated"] =
    undefined;
  export let className: EmbedUpdateEnvelopeProps["className"] = undefined;

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "envelope-updated":
          onEnvelopeUpdated?.({
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
          features: features,
          css: css,
          cssVars: cssVars,
          darkModeDisabled: darkModeDisabled,
        })
      )
    );
    const srcUrl = new URL(
      `/embed/v2/authoring/envelope/edit/${envelopeId}`,
      appHost
    );
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