import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type EmbedSignDocumentProps = {
  className?: string;
  host?: string;
  token: string; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

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
};

import { CssVars } from "./css-vars";

@Component({
  selector: "embed-sign-document, EmbedSignDocument",
  template: `
    <iframe #__iframe [class]="className" [attr.src]="src | trustedResourceUrl"></iframe>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, TrustedResourceUrlPipe],
})
export default class EmbedSignDocument {
  @Input() host!: EmbedSignDocumentProps["host"];
  @Input() name!: EmbedSignDocumentProps["name"];
  @Input() lockName!: EmbedSignDocumentProps["lockName"];
  @Input() css!: EmbedSignDocumentProps["css"];
  @Input() cssVars!: EmbedSignDocumentProps["cssVars"];
  @Input() darkModeDisabled!: EmbedSignDocumentProps["darkModeDisabled"];
  @Input()
  allowDocumentRejection!: EmbedSignDocumentProps["allowDocumentRejection"];
  @Input() additionalProps!: EmbedSignDocumentProps["additionalProps"];
  @Input() token!: EmbedSignDocumentProps["token"];
  @Input() onDocumentReady!: EmbedSignDocumentProps["onDocumentReady"];
  @Input() onDocumentCompleted!: EmbedSignDocumentProps["onDocumentCompleted"];
  @Input() onDocumentError!: EmbedSignDocumentProps["onDocumentError"];
  @Input() onDocumentRejected!: EmbedSignDocumentProps["onDocumentRejected"];
  @Input() className!: EmbedSignDocumentProps["className"];

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
    const srcUrl = new URL(`/embed/sign/${this.token}`, appHost);
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
