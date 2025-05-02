"use client";
import * as React from "react";
import { useRef, useEffect } from "react";

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
  }; // Additional props to be passed to the iframe, used for testing out features
  // prior to being added to the main props

  additionalProps?: Record<string, string | number | boolean> | undefined;
  onTemplateUpdated?: (data: {
    externalId: string;
    templateId: number;
  }) => void;
};
import { CssVars } from "./css-vars";

function EmbedUpdateTemplate(props: EmbedUpdateTemplateProps) {
  const __iframe = useRef<HTMLIFrameElement>(null);
  function src() {
    const appHost = props.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          externalId: props.externalId,
          features: props.features,
          css: props.css,
          cssVars: props.cssVars,
          darkModeDisabled: props.darkModeDisabled,
          ...props.additionalProps,
        })
      )
    );
    const srcUrl = new URL(
      `/embed/v1/authoring/template/update/${props.templateId}`,
      appHost
    );
    srcUrl.searchParams.set("token", props.presignToken);
    srcUrl.hash = encodedOptions;
    return srcUrl.toString();
  }

  function handleMessage(event: MessageEvent) {
    if (__iframe.current?.contentWindow === event.source) {
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

  useEffect(() => {
    window.addEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return <iframe ref={__iframe} className={props.className} src={src()} />;
}

export default EmbedUpdateTemplate;
