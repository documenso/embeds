import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
import { Component, ViewChild, ElementRef, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type EmbedCreateTemplateProps = {
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
  onTemplateCreated?: (data: {
    externalId: string;
    templateId: number;
  }) => void;
};

import { CssVars } from "./css-vars";

@Component({
  selector: "embed-create-template, EmbedCreateTemplate",
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
export default class EmbedCreateTemplate {
  @Input() host!: EmbedCreateTemplateProps["host"];
  @Input() presignToken!: EmbedCreateTemplateProps["presignToken"];
  @Input() externalId!: EmbedCreateTemplateProps["externalId"];
  @Input() features!: EmbedCreateTemplateProps["features"];
  @Input() css!: EmbedCreateTemplateProps["css"];
  @Input() cssVars!: EmbedCreateTemplateProps["cssVars"];
  @Input() darkModeDisabled!: EmbedCreateTemplateProps["darkModeDisabled"];
  @Input() additionalProps!: EmbedCreateTemplateProps["additionalProps"];
  @Input() onTemplateCreated!: EmbedCreateTemplateProps["onTemplateCreated"];
  @Input() className!: EmbedCreateTemplateProps["className"];

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
    const srcUrl = new URL(`/embed/v1/authoring/template/create`, appHost);
    return `${srcUrl}#${encodedOptions}`;
  }
  handleMessage(event: MessageEvent) {
    if (this.__iframe.nativeElement?.contentWindow === event.source) {
      switch (event.data.type) {
        case "template-created":
          this.onTemplateCreated?.({
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
