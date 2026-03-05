import { Component, ViewChild, ElementRef, Input } from "@angular/core";

import { CommonModule } from "@angular/common";

export type EmbedUpdateEnvelopeProps = {
  className?: string;
  host?: string;
  presignToken: string;
  externalId?: string;
  envelopeId: string;
  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;
  darkModeDisabled?: boolean | undefined; // biome-ignore lint/suspicious/noExplicitAny: Hehe

  features?: DeepPartial<EnvelopeEditorSettings> & Record<string, any>;
  onEnvelopeUpdated?: (data: {
    externalId: string | null;
    envelopeId: string;
  }) => void;
};

import { CssVars } from "./css-vars";
import type { DeepPartial, EnvelopeEditorSettings } from "./features-type";

@Component({
  selector: "embed-update-envelope",
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
export default class EmbedUpdateEnvelope {
  @Input() host!: EmbedUpdateEnvelopeProps["host"];
  @Input() externalId!: EmbedUpdateEnvelopeProps["externalId"];
  @Input() features!: EmbedUpdateEnvelopeProps["features"];
  @Input() css!: EmbedUpdateEnvelopeProps["css"];
  @Input() cssVars!: EmbedUpdateEnvelopeProps["cssVars"];
  @Input() darkModeDisabled!: EmbedUpdateEnvelopeProps["darkModeDisabled"];
  @Input() envelopeId!: EmbedUpdateEnvelopeProps["envelopeId"];
  @Input() presignToken!: EmbedUpdateEnvelopeProps["presignToken"];
  @Input() onEnvelopeUpdated!: EmbedUpdateEnvelopeProps["onEnvelopeUpdated"];
  @Input() className!: EmbedUpdateEnvelopeProps["className"];

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
        })
      )
    );
    const srcUrl = new URL(
      `/embed/v2/authoring/envelope/edit/${this.envelopeId}`,
      appHost
    );
    srcUrl.searchParams.set("token", this.presignToken);
    srcUrl.hash = encodedOptions;
    return srcUrl.toString();
  }
  handleMessage(event: MessageEvent) {
    if (this.__iframe?.nativeElement?.contentWindow === event.source) {
      switch (event.data.type) {
        case "envelope-updated":
          this.onEnvelopeUpdated?.({
            envelopeId: event.data.envelopeId,
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
