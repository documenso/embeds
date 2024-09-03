"use client";
import * as React from "react";
import { useRef, useEffect } from "react";

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

function EmbedSignDocument(props: EmbedSignDocumentProps) {
  const __iframe = useRef<HTMLIFrameElement>(null);
  function src() {
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
  }

  function handleMessage(event: MessageEvent) {
    if (__iframe.current?.contentWindow === event.source) {
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

export default EmbedSignDocument;
