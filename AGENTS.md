# AI contributor instructions

## Versioning and changelog

Update the app version and changelog only for changes users can see or that change how the app works for them. Deployment, build, CI, dependency, and other internal fixes do not get an app version bump or changelog entry unless they also change the user-facing app:

1. Choose the next version using semantic versioning: patch for backward-compatible fixes, minor for backward-compatible features, and major for breaking changes. Use `1.0.0` as the initial version baseline.
2. Keep `package.json`'s `version`, `APP_VERSION` in `src/app/version.ts`, and the newest `CHANGELOG` entry in that file on the same version.
3. Add the matching release at the top of `public/CHANGELOG.md`; preserve older entries.
4. Date the release using the current local date in `YYYY-MM-DD` format. Use a short title, ideally one to three common words (for example, “History”). Write the summary and bullets in plain, everyday language that a non-technical reader can understand easily. Explain what users can do or what they will notice; avoid technical terms, internal details, and long sentences.
5. Do not invent commit hashes. Leave the `commits` list empty unless the relevant commit hashes are known.
6. Keep the TypeScript changelog and public Markdown changelog consistent. Include only changes that matter to users, and describe them in the same simple language in both files.

If multiple public-facing changes are being released together, group them into one version entry. Do not create a release entry for internal-only or documentation-only edits.
