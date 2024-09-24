import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Kept outside of src since Mitosis will delete the src folder.
 */
@Pipe({
  name: 'trustedResourceUrl',
  standalone: true,
})
export class TrustedResourceUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
