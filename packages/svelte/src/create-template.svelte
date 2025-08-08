<script context="module" lang="ts">
  export type EmbedCreateTemplateProps = {
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
    onTemplateCreated?: (data: {
      externalId: string;
      templateId: number;
    }) => void;
  };
</script>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { CssVars } from "./css-vars";

  export let host: EmbedCreateTemplateProps["host"] = undefined;
  export let presignToken: EmbedCreateTemplateProps["presignToken"];
  export let externalId: EmbedCreateTemplateProps["externalId"] = undefined;
  export let features: EmbedCreateTemplateProps["features"] = undefined;
  export let css: EmbedCreateTemplateProps["css"] = undefined;
  export let cssVars: EmbedCreateTemplateProps["cssVars"] = undefined;
  export let darkModeDisabled: EmbedCreateTemplateProps["darkModeDisabled"] =
    undefined;
  export let additionalProps: EmbedCreateTemplateProps["additionalProps"] =
    undefined;
  export let onTemplateCreated: EmbedCreateTemplateProps["onTemplateCreated"] =
    undefined;
  export let className: EmbedCreateTemplateProps["className"] = undefined;

  function handleMessage(event: MessageEvent) {
    if (__iframe?.contentWindow === event.source) {
      switch (event.data.type) {
        case "template-created":
          onTemplateCreated?.({
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
    const srcUrl = new URL(`/embed/v1/authoring/template/create`, appHost);
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