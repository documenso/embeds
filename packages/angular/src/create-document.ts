import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type EmbedCreateDocumentProps = {
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
  onDocumentCreated?: (data: {
    externalId: string;
    documentId: number;
  }) => void;
};

import { CssVars } from "./css-vars";

@Component({
  selector: "embed-create-document, EmbedCreateDocument",
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
export default class EmbedCreateDocument {
  @Input() host!: EmbedCreateDocumentProps["host"];
  @Input() presignToken!: EmbedCreateDocumentProps["presignToken"];
  @Input() externalId!: EmbedCreateDocumentProps["externalId"];
  @Input() features!: EmbedCreateDocumentProps["features"];
  @Input() css!: EmbedCreateDocumentProps["css"];
  @Input() cssVars!: EmbedCreateDocumentProps["cssVars"];
  @Input() darkModeDisabled!: EmbedCreateDocumentProps["darkModeDisabled"];
  @Input() additionalProps!: EmbedCreateDocumentProps["additionalProps"];
  @Input() onDocumentCreated!: EmbedCreateDocumentProps["onDocumentCreated"];
  @Input() className!: EmbedCreateDocumentProps["className"];

  @ViewChild("__iframe") __iframe!: ElementRef;

  get src() {
    const appHost = this.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          token: this.presignToken,
          externalId: this.externalId,
          features: this.features,
          css: this.css,
          cssVars: this.cssVars,
          darkModeDisabled: this.darkModeDisabled,
          ...this.additionalProps,
        })
      )
    );
    const srcUrl = new URL(`/embed/v1/authoring/document/create`, appHost);
    return `${srcUrl}#${encodedOptions}`;
  }
  handleMessage(event: MessageEvent) {
    if (this.__iframe.nativeElement?.contentWindow === event.source) {
      switch (event.data.type) {
        case "document-created":
          this.onDocumentCreated?.({
            documentId: event.data.documentId,
            externalId: event.data.externalId,
          });
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
