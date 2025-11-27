import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type EmbedUpdateDocumentProps = {
  className?: string;
  host?: string;
  presignToken: string;
  documentId: number;
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
  onDocumentUpdated?: (data: {
    externalId: string;
    documentId: number;
  }) => void;
};

import { CssVars } from "./css-vars";

@Component({
  selector: "embed-update-document, EmbedUpdateDocument",
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
export default class EmbedUpdateDocument {
  @Input() host!: EmbedUpdateDocumentProps["host"];
  @Input() presignToken!: EmbedUpdateDocumentProps["presignToken"];
  @Input() externalId!: EmbedUpdateDocumentProps["externalId"];
  @Input() features!: EmbedUpdateDocumentProps["features"];
  @Input() css!: EmbedUpdateDocumentProps["css"];
  @Input() cssVars!: EmbedUpdateDocumentProps["cssVars"];
  @Input() darkModeDisabled!: EmbedUpdateDocumentProps["darkModeDisabled"];
  @Input() onlyEditFields!: EmbedUpdateDocumentProps["onlyEditFields"];
  @Input() additionalProps!: EmbedUpdateDocumentProps["additionalProps"];
  @Input() documentId!: EmbedUpdateDocumentProps["documentId"];
  @Input() onDocumentUpdated!: EmbedUpdateDocumentProps["onDocumentUpdated"];
  @Input() className!: EmbedUpdateDocumentProps["className"];

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
          onlyEditFields: this.onlyEditFields,
          ...this.additionalProps,
        })
      )
    );
    const srcUrl = new URL(
      `/embed/v1/authoring/document/edit/${this.documentId}`,
      appHost
    );
    srcUrl.searchParams.set("token", this.presignToken);
    srcUrl.hash = encodedOptions;
    return srcUrl.toString();
  }
  handleMessage(event: MessageEvent) {
    if (this.__iframe.nativeElement?.contentWindow === event.source) {
      switch (event.data.type) {
        case "document-updated":
          this.onDocumentUpdated?.({
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
