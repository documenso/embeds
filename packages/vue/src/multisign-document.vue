<template>
  <iframe
    ref="__iframe"
    :class="className"
    :src="src"
    :sandbox="sandbox"
  ></iframe>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import { CssVars } from "./css-vars";

export type EmbedMultiSignDocumentProps = {
  className?: string;
  host?: string;
  tokens: string[];

  // @src: /apps/web/src/app/embed/direct/[[...url]]/schema
  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;
  darkModeDisabled?: boolean | undefined;
  name?: string | undefined;
  lockName?: boolean | undefined;
  allowDocumentRejection?: boolean | undefined;

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

const props = defineProps<EmbedMultiSignDocumentProps>();

const __iframe = ref<HTMLIFrameElement>(null);

onMounted(() => {
  window.addEventListener("message", handleMessage);
});
onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
const src = computed(() => {
  const appHost = props.host || "https://app.documenso.com";
  const encodedOptions = btoa(
    encodeURIComponent(
      JSON.stringify({
        name: props.name,
        lockName: props.lockName,
        css: props.css,
        cssVars: props.cssVars,
        darkModeDisabled: props.darkModeDisabled,
        allowDocumentRejection: props.allowDocumentRejection,
        ...props.additionalProps,
      })
    )
  );
  const srcUrl = new URL(`/embed/v1/multisign`, appHost);
  for (const token of props.tokens) {
    srcUrl.searchParams.append("token", token);
  }
  return `${srcUrl}#${encodedOptions}`;
});
const sandbox = computed(() => {
  // biome-ignore lint/suspicious/noExplicitAny: Mitosis types `sandbox` as a single token, but the attribute is space-separated.
  return "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation" as any;
});

function handleMessage(event: MessageEvent) {
  if (__iframe.value?.contentWindow === event.source) {
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
      case "document-rejected":
        props.onDocumentRejected?.(event.data.data);
        break;
      case "all-documents-completed":
        props.onAllDocumentsCompleted?.(event.data.data);
        break;
    }
  }
}
</script>