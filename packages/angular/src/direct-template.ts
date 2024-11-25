import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type EmbedDirectTemplateProps = {
  className?: string;
  host?: string;
  token: string;
  externalId?: string; // @src: /apps/web/src/app/embed/direct/[[...url]]/schema

  css?: string | undefined;
  cssVars?: Record<string, string> | undefined;
  email?: string | undefined;
  lockEmail?: boolean | undefined;
  name?: string | undefined;
  lockName?: boolean | undefined;
  onDocumentReady?: () => void;
  onDocumentCompleted?: (data: {
    token: string;
    documentId: number;
    recipientId: number;
  }) => void;
  onDocumentError?: (error: string) => void;
  onFieldSigned?: () => void;
  onFieldUnsigned?: () => void;
};

@Component({
  selector: "embed-direct-template, EmbedDirectTemplate",
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
export default class EmbedDirectTemplate {
  @Input() host!: EmbedDirectTemplateProps["host"];
  @Input() name!: EmbedDirectTemplateProps["name"];
  @Input() lockName!: EmbedDirectTemplateProps["lockName"];
  @Input() email!: EmbedDirectTemplateProps["email"];
  @Input() lockEmail!: EmbedDirectTemplateProps["lockEmail"];
  @Input() css!: EmbedDirectTemplateProps["css"];
  @Input() token!: EmbedDirectTemplateProps["token"];
  @Input() externalId!: EmbedDirectTemplateProps["externalId"];
  @Input() onDocumentReady!: EmbedDirectTemplateProps["onDocumentReady"];
  @Input()
  onDocumentCompleted!: EmbedDirectTemplateProps["onDocumentCompleted"];
  @Input() onDocumentError!: EmbedDirectTemplateProps["onDocumentError"];
  @Input() onFieldSigned!: EmbedDirectTemplateProps["onFieldSigned"];
  @Input() onFieldUnsigned!: EmbedDirectTemplateProps["onFieldUnsigned"];
  @Input() className!: EmbedDirectTemplateProps["className"];

  @ViewChild("__iframe") __iframe!: ElementRef;

  get src() {
    const appHost = this.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      JSON.stringify({
        name: this.name,
        lockName: this.lockName,
        email: this.email,
        lockEmail: this.lockEmail,
        css: this.css,
      })
    );
    const srcUrl = new URL(`/embed/direct/${this.token}`, appHost);

    if (this.externalId) {
      srcUrl.searchParams.set("externalId", this.externalId);
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

        case "field-signed":
          this.onFieldSigned?.();
          break;

        case "field-unsigned":
          this.onFieldUnsigned?.();
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
