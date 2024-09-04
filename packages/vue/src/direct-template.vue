<template>
  <iframe ref="__iframe" :class="className" :src="src"></iframe>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";

export type EmbedDirectTemplateProps = {
  className?: string;
  host?: string;
  token: string;
  externalId?: string; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

  css?: string | undefined;
  cssVars?: Record<string, string> | undefined;
  email?: string | undefined;
  lockEmail?: boolean | undefined;
  name?: string | undefined;
  lockName?: boolean | undefined;
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

const props = defineProps<EmbedDirectTemplateProps>();

const __iframe = ref<HTMLIFrameElement>();

onMounted(() => {
  window.addEventListener("message", handleMessage);
});
onUnmounted(() => {
  window.removeEventListener("message", handleMessage);
});
const src = computed(() => {
  const appHost = props.host || "https://app.documenso.com";
  const encodedOptions = btoa(
    JSON.stringify({
      name: props.name,
      lockName: props.lockName,
      email: props.email,
      lockEmail: props.lockEmail,
      css: props.css,
    })
  );
  const srcUrl = new URL(`/embed/direct/${props.token}`, appHost);

  if (props.externalId) {
    srcUrl.searchParams.set("externalId", props.externalId);
  }

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

      case "field-signed":
        props.onFieldSigned?.();
        break;

      case "field-unsigned":
        props.onFieldUnsigned?.();
        break;
    }
  }
}
</script>