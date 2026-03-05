import { Component, ViewChild, ElementRef, Input } from "@angular/core";

import { CommonModule } from "@angular/common";

export type EmbedCreateEnvelopeProps = {
  className?: string;
  host?: string;
  presignToken: string;
  externalId?: string;
  type: "DOCUMENT" | "TEMPLATE";
  css?: string | undefined;
  cssVars?: (CssVars & Record<string, string>) | undefined;
  darkModeDisabled?: boolean | undefined; // biome-ignore lint/suspicious/noExplicitAny: Hehe

  features?: DeepPartial<EnvelopeEditorSettings> & Record<string, any>;
  onEnvelopeCreated?: (data: {
    externalId: string | null;
    envelopeId: number;
  }) => void;
};

import { CssVars } from "./css-vars";
import type { DeepPartial, EnvelopeEditorSettings } from "./features-type";

@Component({
  selector: "embed-create-envelope",
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
export default class EmbedCreateEnvelope {
  @Input() host!: EmbedCreateEnvelopeProps["host"];
  @Input() externalId!: EmbedCreateEnvelopeProps["externalId"];
  @Input() type!: EmbedCreateEnvelopeProps["type"];
  @Input() features!: EmbedCreateEnvelopeProps["features"];
  @Input() css!: EmbedCreateEnvelopeProps["css"];
  @Input() cssVars!: EmbedCreateEnvelopeProps["cssVars"];
  @Input() darkModeDisabled!: EmbedCreateEnvelopeProps["darkModeDisabled"];
  @Input() presignToken!: EmbedCreateEnvelopeProps["presignToken"];
  @Input() onEnvelopeCreated!: EmbedCreateEnvelopeProps["onEnvelopeCreated"];
  @Input() className!: EmbedCreateEnvelopeProps["className"];

  @ViewChild("__iframe") __iframe!: ElementRef;

  get src() {
    const appHost = this.host || "https://app.documenso.com";
    const encodedOptions = btoa(
      encodeURIComponent(
        JSON.stringify({
          externalId: this.externalId,
          type: this.type,
          features: this.features,
          css: this.css,
          cssVars: this.cssVars,
          darkModeDisabled: this.darkModeDisabled,
        })
      )
    );
    const srcUrl = new URL(`/embed/v2/authoring/envelope/create`, appHost);
    srcUrl.searchParams.set("token", this.presignToken);
    srcUrl.hash = encodedOptions;
    return srcUrl.toString();
  }
  handleMessage(event: MessageEvent) {
    if (this.__iframe?.nativeElement?.contentWindow === event.source) {
      switch (event.data.type) {
        case "envelope-created":
          this.onEnvelopeCreated?.({
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
