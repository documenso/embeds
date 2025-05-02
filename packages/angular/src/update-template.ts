import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

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

@Component({
  selector: "embed-update-template, EmbedUpdateTemplate",
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
export default class EmbedUpdateTemplate {
  @Input() host!: EmbedUpdateTemplateProps["host"];
  @Input() externalId!: EmbedUpdateTemplateProps["externalId"];
  @Input() features!: EmbedUpdateTemplateProps["features"];
  @Input() css!: EmbedUpdateTemplateProps["css"];
  @Input() cssVars!: EmbedUpdateTemplateProps["cssVars"];
  @Input() darkModeDisabled!: EmbedUpdateTemplateProps["darkModeDisabled"];
  @Input() additionalProps!: EmbedUpdateTemplateProps["additionalProps"];
  @Input() templateId!: EmbedUpdateTemplateProps["templateId"];
  @Input() presignToken!: EmbedUpdateTemplateProps["presignToken"];
  @Input() onTemplateUpdated!: EmbedUpdateTemplateProps["onTemplateUpdated"];
  @Input() className!: EmbedUpdateTemplateProps["className"];

  @ViewChild("__iframe") __iframe!: ElementRef;

  get src() {
    const appHost = this.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          externalId: this.externalId,
          features: this.features,
          css: this.css,
          cssVars: this.cssVars,
          darkModeDisabled: this.darkModeDisabled,
          ...this.additionalProps,
        })
      )
    );
    const srcUrl = new URL(
      `/embed/v1/authoring/template/update/${this.templateId}`,
      appHost
    );
    srcUrl.searchParams.set("token", this.presignToken);
    srcUrl.hash = encodedOptions;
    return srcUrl.toString();
  }
  handleMessage(event: MessageEvent) {
    if (this.__iframe.nativeElement?.contentWindow === event.source) {
      switch (event.data.type) {
        case "template-updated":
          this.onTemplateUpdated?.({
            templateId: event.data.templateId,
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
