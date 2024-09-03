<template>
  <iframe ref="__iframe" :class="className" :src="src"></iframe>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";

export type EmbedSignDocumentProps = {
  className?: string;
  host?: string;
  token: string; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

  css?: string | undefined;
  cssVars?: Record<string, string> | undefined;
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

const props = defineProps<EmbedSignDocumentProps>();

const __iframe = ref<HTMLIFrameElement>();

onMounted(() => {
  window.addEventListener("message", handleMessage);
});
onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
const src = computed(() => {
  const host = props.host || "https://app.documenso.com";
  const encodedOptions = btoa(
    JSON.stringify({
      name: props.name,
      lockName: props.lockName,
      css: props.css,
    })
  );
  const srcUrl = new URL(`/embed/sign/${props.token}`, host);
  return `${srcUrl}#${encodedOptions}`;
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
    }
  }
}
</script>