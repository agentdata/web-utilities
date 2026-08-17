# AI Version Review

```yaml
schema: web-utilities.version-review.v1
project: web-utilities
current_version: 1.7.0
version_source: src/app/version.ts
user_changelog: public/CHANGELOG.md
package_version: package.json
versioning_policy:
  format: semver
  major: Breaking user-facing workflow or data contract changes.
  minor: New tools, new user-facing features, or meaningful workflow improvements.
  patch: Bug fixes, copy/style polish, tests, or deployment-only updates.
release_history:
  - version: 1.7.0
    date: 2026-08-17
    title: Input case conversion
    summary: Added fast uppercase and lowercase cleanup actions for normalizing case-sensitive identifiers.
    commits: []
  - version: 1.6.2
    date: 2026-07-16
    title: Quote validation fixes
    summary: Improved quote cleanup validation so fix buttons are easier to identify without stealing focus.
    commits: []
  - version: 1.6.1
    date: 2026-07-10
    title: Wider quote tool layout
    summary: Widened the page shell for the quote tool to give the editor more room.
    commits: []
  - version: 1.6.0
    date: 2026-07-10
    title: Versioned changelog and quote feedback
    summary: Added app versioning and changelog access while improving quote input actions with clearer feedback and layout.
    commits: [2b88ae6, 61db0a3]
  - version: 1.5.0
    date: 2026-06-18
    title: PWA and quote warning polish
    summary: Added installable app support and refined quote tool warning states and layout density.
    commits: [ec19bcd, 419acd0, 9988684, 7a61a2c, bca4b54, 61d3dbf]
  - version: 1.4.0
    date: 2026-06-08
    title: Utility routing
    summary: Split the app into routable quote and password utilities with navigation links.
    commits: [a82064c]
  - version: 1.3.0
    date: 2026-06-04
    title: Persistent quote options
    summary: Improved quote formatting defaults, cleanup controls, and option persistence.
    commits: [0cbd6f3, 51f0bef, 37fe3bb, 6f1e2fd, 1cd36e0]
  - version: 1.2.0
    date: 2026-06-03
    title: Passphrase generator expansion
    summary: Expanded password generation with themed passphrases, configurable disruptions, and stronger tests.
    commits: [eb59f86, 0c2b1a5, 8b42f99]
  - version: 1.1.0
    date: 2026-06-01
    title: Password generator
    summary: Added an easy-to-type password generator and deployment infrastructure.
    commits: [4ac16d2, 780ba31, 4bd1541, 18297f6, 521a691, 30fb18d, 7222557, bb7ab26]
  - version: 1.0.0
    date: 2026-06-01
    title: Initial quote tool
    summary: Initial release of the quote formatting utility.
    commits: [f0a1e5c, 85be4cc, e3b3872, 53020fb]
```
