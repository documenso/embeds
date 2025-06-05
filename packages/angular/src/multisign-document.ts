import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type EmbedMultiSignDocumentProps = {
  className?: string;
  host?: string;
  tokens: string[]; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;
  darkModeDisabled?: boolean | undefined;
  name?: string | undefined;
  lockName?: boolean | undefined;
  allowDocumentRejection?: boolean | undefined; // Additional props to be passed to the iframe, used for testing out features
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

import { CssVars } from "./css-vars";

@Component({
  selector: "embed-multi-sign-document, EmbedMultiSignDocument",
  template: `
    <iframe #__iframe [class]="className" [attr.src]="src"></iframe>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export default class EmbedMultiSignDocument {
  @Input() host!: EmbedMultiSignDocumentProps["host"];
  @Input() name!: EmbedMultiSignDocumentProps["name"];
  @Input() lockName!: EmbedMultiSignDocumentProps["lockName"];
  @Input() css!: EmbedMultiSignDocumentProps["css"];
  @Input() cssVars!: EmbedMultiSignDocumentProps["cssVars"];
  @Input() darkModeDisabled!: EmbedMultiSignDocumentProps["darkModeDisabled"];
  @Input()
  allowDocumentRejection!: EmbedMultiSignDocumentProps["allowDocumentRejection"];
  @Input() additionalProps!: EmbedMultiSignDocumentProps["additionalProps"];
  @Input() tokens!: EmbedMultiSignDocumentProps["tokens"];
  @Input() onDocumentReady!: EmbedMultiSignDocumentProps["onDocumentReady"];
  @Input()
  onDocumentCompleted!: EmbedMultiSignDocumentProps["onDocumentCompleted"];
  @Input() onDocumentError!: EmbedMultiSignDocumentProps["onDocumentError"];
  @Input()
  onDocumentRejected!: EmbedMultiSignDocumentProps["onDocumentRejected"];
  @Input()
  onAllDocumentsCompleted!: EmbedMultiSignDocumentProps["onAllDocumentsCompleted"];
  @Input() className!: EmbedMultiSignDocumentProps["className"];

  @ViewChild("__iframe") __iframe!: ElementRef;

  get src() {
    const appHost = this.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          name: this.name,
          lockName: this.lockName,
          css: this.css,
          cssVars: this.cssVars,
          darkModeDisabled: this.darkModeDisabled,
          allowDocumentRejection: this.allowDocumentRejection,
          ...this.additionalProps,
        })
      )
    );
    const srcUrl = new URL(`/embed/v1/multisign`, appHost);

    for (const token of this.tokens) {
      srcUrl.searchParams.append("token", token);
    }

    return `${srcUrl}#${encodedOptions}`;
  }
  handleMessage(event: MessageEvent) {
    if (this.__iframe.nativeElement?.contentWindow === event.source) {
      switch (event.data.action) {
        case "document-ready":
          this.onDocumentReady?.();
          break;

        case "document-completed":
          this.onDocumentCompleted?.(event.data.data);
          break;

        case "document-error":
          this.onDocumentError?.(event.data.data);
          break;

        case "document-rejected":
          this.onDocumentRejected?.(event.data.data);
          break;

        case "all-documents-completed":
          this.onAllDocumentsCompleted?.(event.data.data);
          break;
      }
    }
  }

  ngOnInit() {
    if (typeof window !== "undefined") {
      window.addEventListener("message", this.handleMessage);
    }
  }

  ngOnDestroy() {
    window.removeEventListener("message", this.handleMessage);
  }
}
