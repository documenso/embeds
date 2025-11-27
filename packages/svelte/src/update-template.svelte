<script context="module" lang="ts">
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
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { CssVars } from "./css-vars";

  export let host: EmbedUpdateTemplateProps["host"] = undefined;
  export let externalId: EmbedUpdateTemplateProps["externalId"] = undefined;
  export let features: EmbedUpdateTemplateProps["features"] = undefined;
  export let css: EmbedUpdateTemplateProps["css"] = undefined;
  export let cssVars: EmbedUpdateTemplateProps["cssVars"] = undefined;
  export let darkModeDisabled: EmbedUpdateTemplateProps["darkModeDisabled"] =
    undefined;
  export let onlyEditFields: EmbedUpdateTemplateProps["onlyEditFields"] =
    undefined;
  export let additionalProps: EmbedUpdateTemplateProps["additionalProps"] =
    undefined;
  export let templateId: EmbedUpdateTemplateProps["templateId"];
  export let presignToken: EmbedUpdateTemplateProps["presignToken"];
  export let onTemplateUpdated: EmbedUpdateTemplateProps["onTemplateUpdated"] =
    undefined;
  export let className: EmbedUpdateTemplateProps["className"] = undefined;

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "template-updated":
          onTemplateUpdated?.({
            templateId: event.data.templateId,
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
          onlyEditFields: onlyEditFields,
          ...additionalProps,
        })
      )
    );
    const srcUrl = new URL(
      `/embed/v1/authoring/template/edit/${templateId}`,
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