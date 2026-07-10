export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: string[];
  commits: string[];
};

export const APP_VERSION = '1.6.1';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.6.1',
    date: '2026-07-10',
    title: 'Wider quote tool layout',
    summary: 'Widened the page shell for the quote tool to give the editor more room.',
    changes: ['Increased the max page width on the quote tool view.'],
    commits: [],
  },
  {
    version: '1.6.0',
    date: '2026-07-10',
    title: 'Versioned changelog and quote feedback',
    summary:
      'Added app versioning and changelog access while improving quote input actions with clearer feedback and layout.',
    changes: [
      'Added a standard app version source for the UI and release references.',
      'Added the current version to the footer with a changelog popover.',
      'Added user-facing and AI-readable changelog files.',
      'Added visible action feedback for paste, add, cleanup, and copy flows.',
      'Improved editor button layout and clipboard input handling.',
      'Added interaction animations for quote input actions.',
    ],
    commits: ['2b88ae6', '61db0a3'],
  },
  {
    version: '1.5.0',
    date: '2026-06-18',
    title: 'PWA and quote warning polish',
    summary:
      'Added installable app support and refined quote tool warning states and layout density.',
    changes: [
      'Added PWA manifest/service worker assets and fallback icons.',
      'Unified quote warning states and highlighted duplicate quote rows.',
      'Reduced title height and moved quote options/results controls into a more compact layout.',
    ],
    commits: ['ec19bcd', '419acd0', '9988684', '7a61a2c', 'bca4b54', '61d3dbf'],
  },
  {
    version: '1.4.0',
    date: '2026-06-08',
    title: 'Utility routing',
    summary: 'Split the app into routable quote and password utilities with navigation links.',
    changes: [
      'Added routes for the quote tool and password generator.',
      'Updated navigation to switch between utilities directly.',
    ],
    commits: ['a82064c'],
  },
  {
    version: '1.3.0',
    date: '2026-06-04',
    title: 'Persistent quote options',
    summary: 'Improved quote formatting defaults, cleanup controls, and option persistence.',
    changes: [
      'Stored selected quote options in a cookie.',
      'Changed the default quote type to single quotes and refined omit-last-comma behavior.',
      'Reworked quote option and cleanup button placement.',
      'Normalized pasted input handling.',
    ],
    commits: ['0cbd6f3', '51f0bef', '37fe3bb', '6f1e2fd', '1cd36e0'],
  },
  {
    version: '1.2.0',
    date: '2026-06-03',
    title: 'Passphrase generator expansion',
    summary:
      'Expanded password generation with themed passphrases, configurable disruptions, and stronger tests.',
    changes: [
      'Added themed passphrase generation.',
      'Added configurable number and symbol placement.',
      'Refactored password generation logic and added test coverage.',
      'Adjusted row number width for large inputs.',
    ],
    commits: ['eb59f86', '0c2b1a5', '8b42f99'],
  },
  {
    version: '1.1.0',
    date: '2026-06-01',
    title: 'Password generator',
    summary: 'Added an easy-to-type password generator and deployment infrastructure.',
    changes: [
      'Added QWERTY-aware password generation.',
      'Improved quote tool performance.',
      'Added GitHub Pages and Wrangler deployment configuration.',
    ],
    commits: [
      '4ac16d2',
      '780ba31',
      '4bd1541',
      '18297f6',
      '521a691',
      '30fb18d',
      '7222557',
      'bb7ab26',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-01',
    title: 'Initial quote tool',
    summary: 'Initial release of the quote formatting utility.',
    changes: [
      'Added the quote tool for wrapping rows in quotes and commas.',
      'Added clipboard paste handling and input textarea focus support.',
      'Added empty-row cleanup, input insights, and row-count alignment fixes.',
    ],
    commits: ['f0a1e5c', '85be4cc', 'e3b3872', '53020fb'],
  },
];
