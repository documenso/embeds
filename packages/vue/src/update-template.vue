<template>
  <iframe ref="__iframe" :class="className" :src="src"></iframe>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";

import { CssVars } from "./css-vars";

export type EmbedUpdateTemplateProps = {
  className?: string;
  host?: string;
  presignToken: string;
  templateId: number;
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
  };
  onlyEditFields?: boolean | undefined; // Additional props to be passed to the iframe, used for testing out features
  // prior to being added to the main props

  additionalProps?: Record<string, string | number | boolean> | undefined;
  onTemplateUpdated?: (data: {
    externalId: string;
    templateId: number;
  }) => void;
};

const props = defineProps<EmbedUpdateTemplateProps>();

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
    encodeURIComponent(
      JSON.stringify({
        externalId: props.externalId,
        features: props.features,
        css: props.css,
        cssVars: props.cssVars,
        darkModeDisabled: props.darkModeDisabled,
        onlyEditFields: props.onlyEditFields,
        ...props.additionalProps,
      })
    )
  );
  const srcUrl = new URL(
    `/embed/v1/authoring/template/edit/${props.templateId}`,
    appHost
  );
  srcUrl.searchParams.set("token", props.presignToken);
  srcUrl.hash = encodedOptions;
  return srcUrl.toString();
});

function handleMessage(event: MessageEvent) {
  if (__iframe.value?.contentWindow === event.source) {
    switch (event.data.type) {
      case "template-updated":
        props.onTemplateUpdated?.({
          templateId: event.data.templateId,
          externalId: event.data.externalId,
        });
        break;
    }
  }
}
</script>