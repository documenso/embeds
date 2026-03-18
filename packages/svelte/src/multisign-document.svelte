<script context="module" lang="ts">
  export type EmbedMultiSignDocumentProps = {
    className?: string;
    host?: string;
    tokens: string[]; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

    css?: string | undefined;
    cssVars?: (CssVars & Record<string, string>) | undefined;
    darkModeDisabled?: boolean | undefined;
    name?: string | undefined;
    lockName?: boolean | undefined;
    allowDocumentRejection?: boolean | undefined; // Additional props to be passed to the iframe, used for testing out features
    // prior to being added to the main props

    additionalProps?: Record<string, string | number | boolean> | undefined;
    onDocumentReady?: () => void;
    onDocumentCompleted?: (data: {
      token: string;
      documentId: number;
      recipientId: number;
    }) => void;
    onDocumentError?: (error: string) => void;
    onDocumentRejected?: (data: {
      token: string;
      documentId: number;
      recipientId: number;
      reason: string;
    }) => void;
    onAllDocumentsCompleted?: (data: {
      documents: Array<{
        token: string;
        documentId: number;
        recipientId: number;
        action: "document-completed" | "document-rejected";
        reason?: string;
      }>;
    }) => void;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { CssVars } from "./css-vars";

  export let host: EmbedMultiSignDocumentProps["host"] = undefined;
  export let name: EmbedMultiSignDocumentProps["name"] = undefined;
  export let lockName: EmbedMultiSignDocumentProps["lockName"] = undefined;
  export let css: EmbedMultiSignDocumentProps["css"] = undefined;
  export let cssVars: EmbedMultiSignDocumentProps["cssVars"] = undefined;
  export let darkModeDisabled: EmbedMultiSignDocumentProps["darkModeDisabled"] =
    undefined;
  export let allowDocumentRejection: EmbedMultiSignDocumentProps["allowDocumentRejection"] =
    undefined;
  export let additionalProps: EmbedMultiSignDocumentProps["additionalProps"] =
    undefined;
  export let tokens: EmbedMultiSignDocumentProps["tokens"];
  export let onDocumentReady: EmbedMultiSignDocumentProps["onDocumentReady"] =
    undefined;
  export let onDocumentCompleted: EmbedMultiSignDocumentProps["onDocumentCompleted"] =
    undefined;
  export let onDocumentError: EmbedMultiSignDocumentProps["onDocumentError"] =
    undefined;
  export let onDocumentRejected: EmbedMultiSignDocumentProps["onDocumentRejected"] =
    undefined;
  export let onAllDocumentsCompleted: EmbedMultiSignDocumentProps["onAllDocumentsCompleted"] =
    undefined;
  export let className: EmbedMultiSignDocumentProps["className"] = undefined;

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

        case "document-rejected":
          onDocumentRejected?.(event.data.data);
          break;

        case "all-documents-completed":
          onAllDocumentsCompleted?.(event.data.data);
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
          css: css,
          cssVars: cssVars,
          darkModeDisabled: darkModeDisabled,
          allowDocumentRejection: allowDocumentRejection,
          ...additionalProps,
        })
      )
    );
    const srcUrl = new URL(`/embed/v1/multisign`, appHost);

    for (const token of tokens) {
      srcUrl.searchParams.append("token", token);
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