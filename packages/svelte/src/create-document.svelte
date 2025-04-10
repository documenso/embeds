<script context="module" lang="ts">
  export type EmbedCreateDocumentProps = {
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
    onDocumentCreated?: (data: {
      externalId: string;
      documentId: number;
    }) => void;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { CssVars } from "./css-vars";

  export let host: EmbedCreateDocumentProps["host"] = undefined;
  export let presignToken: EmbedCreateDocumentProps["presignToken"];
  export let externalId: EmbedCreateDocumentProps["externalId"] = undefined;
  export let features: EmbedCreateDocumentProps["features"] = undefined;
  export let css: EmbedCreateDocumentProps["css"] = undefined;
  export let cssVars: EmbedCreateDocumentProps["cssVars"] = undefined;
  export let darkModeDisabled: EmbedCreateDocumentProps["darkModeDisabled"] =
    undefined;
  export let additionalProps: EmbedCreateDocumentProps["additionalProps"] =
    undefined;
  export let onDocumentCreated: EmbedCreateDocumentProps["onDocumentCreated"] =
    undefined;
  export let className: EmbedCreateDocumentProps["className"] = undefined;

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "document-completed":
          onDocumentCreated?.({
            documentId: event.data.documentId,
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
          token: presignToken,
          externalId: externalId,
          features: features,
          css: css,
          cssVars: cssVars,
          darkModeDisabled: darkModeDisabled,
          ...additionalProps,
        })
      )
    );
    const srcUrl = new URL(`/embed/v1/authoring/document/create`, appHost);
    return `${srcUrl}#${encodedOptions}`;
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