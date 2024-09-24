# Build instructions

Angular requires us to sanitize iframe resources, so we need to do some extra work to build the Angular package.

## Steps

1. Run `npm run build` in the Mitosis package
2. Navigate to the Angular package
3. Copy `trusted-resource-url-pipe.ts` from `util` to `src`
4. For each file in `src` that uses iframes:

- Add `import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";`
- Add `TrustedResourceUrlPipe` to the `imports` array
- Update the templates to include the pipe

**Old**

```
  <iframe #__iframe [class]="className" [attr.src]="src"></iframe>
```

**New**

```
  <iframe #__iframe [class]="className" [attr.src]="src | trustedResourceUrl"></iframe>
```

6. Run `npm run build` in the angular package
