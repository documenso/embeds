<script context="module" lang="ts">
  export type EmbedUpdateDocumentProps = {
    className?: string;
    host?: string;
    presignToken: string;
    documentId: number;
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
    onDocumentUpdated?: (data: {
      externalId: string;
      documentId: number;
    }) => void;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { CssVars } from "./css-vars";

  export let host: EmbedUpdateDocumentProps["host"] = undefined;
  export let presignToken: EmbedUpdateDocumentProps["presignToken"];
  export let externalId: EmbedUpdateDocumentProps["externalId"] = undefined;
  export let features: EmbedUpdateDocumentProps["features"] = undefined;
  export let css: EmbedUpdateDocumentProps["css"] = undefined;
  export let cssVars: EmbedUpdateDocumentProps["cssVars"] = undefined;
  export let darkModeDisabled: EmbedUpdateDocumentProps["darkModeDisabled"] =
    undefined;
  export let additionalProps: EmbedUpdateDocumentProps["additionalProps"] =
    undefined;
  export let documentId: EmbedUpdateDocumentProps["documentId"];
  export let onDocumentUpdated: EmbedUpdateDocumentProps["onDocumentUpdated"] =
    undefined;
  export let className: EmbedUpdateDocumentProps["className"] = undefined;

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "document-updated":
          onDocumentUpdated?.({
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
    const srcUrl = new URL(
      `/embed/v1/authoring/document/update/${documentId}`,
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