<script context="module" lang="ts">
  export type EmbedDirectTemplateProps = {
    className?: string;
    host?: string;
    token: string;
    externalId?: string; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

    css?: string | undefined;
    cssVars?: (CssVars & Record<string, string>) | undefined;
    darkModeDisabled?: boolean | undefined;
    email?: string | undefined;
    lockEmail?: boolean | undefined;
    name?: string | undefined;
    lockName?: boolean | undefined; // Additional props to be passed to the iframe, used for testing out features
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
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { CssVars } from "./css-vars";

  export let host: EmbedDirectTemplateProps["host"] = undefined;
  export let name: EmbedDirectTemplateProps["name"] = undefined;
  export let lockName: EmbedDirectTemplateProps["lockName"] = undefined;
  export let email: EmbedDirectTemplateProps["email"] = undefined;
  export let lockEmail: EmbedDirectTemplateProps["lockEmail"] = undefined;
  export let css: EmbedDirectTemplateProps["css"] = undefined;
  export let cssVars: EmbedDirectTemplateProps["cssVars"] = undefined;
  export let darkModeDisabled: EmbedDirectTemplateProps["darkModeDisabled"] =
    undefined;
  export let additionalProps: EmbedDirectTemplateProps["additionalProps"] =
    undefined;
  export let token: EmbedDirectTemplateProps["token"];
  export let externalId: EmbedDirectTemplateProps["externalId"] = undefined;
  export let onDocumentReady: EmbedDirectTemplateProps["onDocumentReady"] =
    undefined;
  export let onDocumentCompleted: EmbedDirectTemplateProps["onDocumentCompleted"] =
    undefined;
  export let onDocumentError: EmbedDirectTemplateProps["onDocumentError"] =
    undefined;
  export let onFieldSigned: EmbedDirectTemplateProps["onFieldSigned"] =
    undefined;
  export let onFieldUnsigned: EmbedDirectTemplateProps["onFieldUnsigned"] =
    undefined;
  export let className: EmbedDirectTemplateProps["className"] = undefined;

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.action) {
        case "document-ready":
          onDocumentReady?.();
          break;

        case "document-completed":
          onDocumentCompleted?.(event.data.data);
          break;

        case "document-error":
          onDocumentError?.(event.data.data);
          break;

        case "field-signed":
          onFieldSigned?.();
          break;

        case "field-unsigned":
          onFieldUnsigned?.();
          break;
      }
    }
  }
  $: src = () => {
    const appHost = host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          name: name,
          lockName: lockName,
          email: email,
          lockEmail: lockEmail,
          css: css,
          cssVars: cssVars,
          darkModeDisabled: darkModeDisabled,
          ...additionalProps,
        })
      )
    );
    const srcUrl = new URL(`/embed/direct/${token}`, appHost);

    if (externalId) {
      srcUrl.searchParams.set("externalId", externalId);
    }

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