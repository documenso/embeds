<template>
  <iframe ref="__iframe" :class="className" :src="src"></iframe>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import { CssVars } from "./css-vars";
import type { DeepPartial, EnvelopeEditorSettings } from "./features-type";

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

const props = defineProps<EmbedCreateEnvelopeProps>();

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
        externalId: props.externalId,
        type: props.type,
        features: props.features,
        css: props.css,
        cssVars: props.cssVars,
        darkModeDisabled: props.darkModeDisabled,
      })
    )
  );
  const srcUrl = new URL(`/embed/v2/authoring/envelope/create`, appHost);
  srcUrl.searchParams.set("token", props.presignToken);
  srcUrl.hash = encodedOptions;
  return srcUrl.toString();
});

function handleMessage(event: MessageEvent) {
  if (__iframe.value?.contentWindow === event.source) {
    switch (event.data.type) {
      case "envelope-created":
        props.onEnvelopeCreated?.({
          envelopeId: event.data.envelopeId,
          externalId: event.data.externalId,
        });
        break;
    }
  }
}
</script>