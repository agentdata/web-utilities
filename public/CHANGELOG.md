# Changelog

## 1.6.1 - 2026-07-10

Wider quote tool layout.

- Increased the max page width on the quote tool view.

## 1.6.0 - 2026-07-10

Versioned changelog and quote feedback.

- Added a standard app version source for the UI and release references.
- Added the current version to the footer with a changelog popover.
- Added user-facing and AI-readable changelog files.
- Added visible action feedback for paste, add, cleanup, and copy flows.
- Improved editor button layout and clipboard input handling.
- Added interaction animations for quote input actions.
- Commits: `2b88ae6`, `61db0a3`

## 1.5.0 - 2026-06-18

PWA and quote warning polish.

- Added PWA manifest/service worker assets and fallback icons.
- Unified quote warning states and highlighted duplicate quote rows.
- Reduced title height and moved quote options/results controls into a more compact layout.
- Commits: `ec19bcd`, `419acd0`, `9988684`, `7a61a2c`, `bca4b54`, `61d3dbf`

## 1.4.0 - 2026-06-08

Utility routing.

- Added routes for the quote tool and password generator.
- Updated navigation to switch between utilities directly.
- Commit: `a82064c`

## 1.3.0 - 2026-06-04

Persistent quote options.

- Stored selected quote options in a cookie.
- Changed the default quote type to single quotes and refined omit-last-comma behavior.
- Reworked quote option and cleanup button placement.
- Normalized pasted input handling.
- Commits: `0cbd6f3`, `51f0bef`, `37fe3bb`, `6f1e2fd`, `1cd36e0`

## 1.2.0 - 2026-06-03

Passphrase generator expansion.

- Added themed passphrase generation.
- Added configurable number and symbol placement.
- Refactored password generation logic and added test coverage.
- Adjusted row number width for large inputs.
- Commits: `eb59f86`, `0c2b1a5`, `8b42f99`

## 1.1.0 - 2026-06-01

Password generator.

- Added QWERTY-aware password generation.
- Improved quote tool performance.
- Added GitHub Pages and Wrangler deployment configuration.
- Commits: `4ac16d2`, `780ba31`, `4bd1541`, `18297f6`, `521a691`, `30fb18d`, `7222557`, `bb7ab26`

## 1.0.0 - 2026-06-01

Initial quote tool.

- Added the quote tool for wrapping rows in quotes and commas.
- Added clipboard paste handling and input textarea focus support.
- Added empty-row cleanup, input insights, and row-count alignment fixes.
- Commits: `f0a1e5c`, `85be4cc`, `e3b3872`, `53020fb`
