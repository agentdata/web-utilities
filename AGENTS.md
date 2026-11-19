# AI contributor instructions

## Versioning and changelog

Update release metadata only for changes that are visible to users or change user-facing behavior, preferences, or compatibility. Deployment, build, CI, dependency-management, and other internal fixes do not get a version bump or changelog entry unless they also change the user-facing app:

1. Choose the next version using semantic versioning: patch for backward-compatible fixes, minor for backward-compatible features, and major for breaking changes. Use `1.0.0` as the initial version baseline.
2. Keep `package.json`'s `version`, `APP_VERSION` in `src/app/version.ts`, and the newest `CHANGELOG` entry in that file on the same version.
3. Add the matching release at the top of `public/CHANGELOG.md`; preserve older entries.
4. Date the release using the current local date in `YYYY-MM-DD` format. Write a concise user-facing title, summary, and bullets describing the observable changes.
5. Do not invent commit hashes. Leave the `commits` list empty unless the relevant commit hashes are known.
6. Keep the TypeScript changelog and public Markdown changelog consistent. Mention meaningful behavior, preference, or compatibility changes; omit internal implementation details.

If multiple public-facing changes are being released together, group them into one version entry. Do not create a release entry for internal-only or documentation-only edits.
