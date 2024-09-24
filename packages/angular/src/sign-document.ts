import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";

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
  @Input() token!: EmbedSignDocumentProps["token"];
  @Input() onDocumentReady!: EmbedSignDocumentProps["onDocumentReady"];
  @Input() onDocumentCompleted!: EmbedSignDocumentProps["onDocumentCompleted"];
  @Input() onDocumentError!: EmbedSignDocumentProps["onDocumentError"];
  @Input() className!: EmbedSignDocumentProps["className"];

  @ViewChild("__iframe") __iframe!: ElementRef;

  get src() {
    const appHost = this.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      JSON.stringify({
        name: this.name,
        lockName: this.lockName,
        css: this.css,
      })
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
