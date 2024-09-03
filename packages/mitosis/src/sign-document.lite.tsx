import { onMount, onUnMount, useRef, useStore } from '@builder.io/mitosis';

export type EmbedSignDocumentProps = {
  className?: string;
  host?: string;
  token: string;

  // @src: /apps/web/src/app/embed/direct/[[...url]]/schema
  css?: string | undefined;
  cssVars?: Record<string, string> | undefined;

  name?: string | undefined;
  lockName?: boolean | undefined;

  onDocumentReady?: () => void;
  onDocumentCompleted?: (data: { token: string; documentId: number; recipientId: number }) => void;
  onDocumentError?: (error: string) => void;
};

export default function EmbedSignDocument(props: EmbedSignDocumentProps) {
  const __iframe = useRef<HTMLIFrameElement>(null);

  const state = useStore({
    get src() {
      const host = props.host || 'https://app.documenso.com';

      const encodedOptions = btoa(
        JSON.stringify({
          name: props.name,
          lockName: props.lockName,
          css: props.css,
        }),
      );

      const srcUrl = new URL(`/embed/sign/${props.token}`, host);

      return `${srcUrl}#${encodedOptions}`;
    },

    handleMessage(event: MessageEvent) {
      if (__iframe?.contentWindow === event.source) {
        switch (event.data.action) {
          case 'document-ready':
            props.onDocumentReady?.();
            break;

          case 'document-completed':
            props.onDocumentCompleted?.(event.data.data);
            break;

          case 'document-error':
            props.onDocumentError?.(event.data.data);
            break;
        }
      }
    },
  });

  onMount(() => {
    window.addEventListener('message', state.handleMessage);
  });

  onUnMount(() => {
    window.removeEventListener('message', state.handleMessage);
  });

  return <iframe ref={__iframe} class={props.className} src={state.src}></iframe>;
}
