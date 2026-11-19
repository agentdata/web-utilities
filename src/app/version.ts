export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: string[];
  commits: string[];
};

export const APP_VERSION = '1.12.0';

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.12.0',
    date: '2026-11-18',
    title: 'History',
    summary:
      'You can now find and reuse lists you copied before.',
    changes: [
      'The app saves your 10 most recent lists when you copy a result.',
      'Open History to see a preview of each list and load one back into the input box.',
    ],
    commits: [],
  },
  {
    version: '1.11.0',
    date: '2026-11-18',
    title: 'Parentheses',
    summary: 'You can now put parentheses around each quoted row.',
    changes: [
      'Turn on Add parentheses to wrap each row, like (\'item\'),.',
      'Your choice is saved for next time.',
    ],
    commits: [],
  },
  {
    version: '1.10.0',
    date: '2026-11-17',
    title: 'What’s New',
    summary: 'See what changed when you open the app, and browse older updates.',
    changes: [
      'A popup shows the latest changes when you have not seen them yet.',
      'You can close the popup or open the list of older updates.',
      'The app stops showing an update after two weeks.',
    ],
    commits: [],
  },
  {
    version: '1.9.0',
    date: '2026-11-17',
    title: 'Compare Lists',
    summary: 'You can sort lists and choose which differences to show.',
    changes: [
      'Sort each list as entered, alphabetically, or by number.',
      'Ignore letter case or show only rows that differ.',
    ],
    commits: [],
  },
  {
    version: '1.8.2',
    date: '2026-11-17',
    title: 'Tooltips',
    summary: 'Help tips wait a moment before they appear.',
    changes: ['This helps prevent tips from appearing by accident.'],
    commits: [],
  },
  {
    version: '1.8.1',
    date: '2026-08-28',
    title: 'Long Lists',
    summary: 'Long lines wrap so they are easier to read when comparing lists.',
    changes: [
      'Line numbers stay with their rows when text wraps.',
      'See line, word, and character counts for both lists.',
      'See how many lines and characters were added or removed.',
      'A notice appears when a very large comparison uses a simpler matching method.',
    ],
    commits: [],
  },
  {
    version: '1.8.0',
    date: '2026-08-28',
    title: 'Compare Text',
    summary: 'Compare two lists side by side and see what changed.',
    changes: [
      'Paste, clear, or swap the two lists.',
      'Choose to ignore extra spaces.',
      'See changed rows and a count of the differences.',
    ],
    commits: [],
  },
  {
    version: '1.7.0',
    date: '2026-08-17',
    title: 'Change Letter Case',
    summary: 'Change all letters in your list to uppercase or lowercase.',
    changes: [
      'Use the Uppercase or Lowercase button in the quote tool.',
      'Your rows stay in the same order.',
    ],
    commits: [],
  },
  {
    version: '1.6.2',
    date: '2026-07-16',
    title: 'Quote Cleanup',
    summary: 'It is easier to spot and fix quote issues in your list.',
    changes: [
      'The matching cleanup button is highlighted when an issue is found.',
      'The cursor stays in the input box after you type or paste.',
      'Buttons stay in place when their labels change.',
    ],
    commits: [],
  },
  {
    version: '1.6.1',
    date: '2026-07-10',
    title: 'More Room',
    summary: 'The quote tool is wider, giving you more room to work.',
    changes: ['The input and result areas have more space.'],
    commits: [],
  },
  {
    version: '1.6.0',
    date: '2026-07-10',
    title: 'Clearer Actions',
    summary: 'Quote tool actions now give clearer feedback, and you can view app updates.',
    changes: [
      'See a message when you paste, add, clean up, or copy text.',
      'Find the app version and update history in the footer.',
      'The quote tool buttons are easier to use.',
    ],
    commits: ['2b88ae6', '61db0a3'],
  },
  {
    version: '1.5.0',
    date: '2026-06-18',
    title: 'Install and Cleanup',
    summary: 'You can install the app, and quote cleanup warnings are easier to spot.',
    changes: [
      'Added support for installing the app on your device.',
      'Duplicate rows and quote issues are easier to see.',
      'Quote options and results take up less space.',
    ],
    commits: ['ec19bcd', '419acd0', '9988684', '7a61a2c', 'bca4b54', '61d3dbf'],
  },
  {
    version: '1.4.0',
    date: '2026-06-08',
    title: 'More Tools',
    summary: 'Use the quote tool and password generator from the same app.',
    changes: [
      'Use the navigation links to switch between the tools.',
    ],
    commits: ['a82064c'],
  },
  {
    version: '1.3.0',
    date: '2026-06-04',
    title: 'Saved Quote Options',
    summary: 'Your quote choices are saved, and pasting and cleanup are easier.',
    changes: [
      'The app remembers your quote options.',
      'Single quotes are selected by default, and you can leave off the last comma.',
      'Quote options and cleanup buttons are easier to find.',
      'Pasted text is handled more consistently.',
    ],
    commits: ['0cbd6f3', '51f0bef', '37fe3bb', '6f1e2fd', '1cd36e0'],
  },
  {
    version: '1.2.0',
    date: '2026-06-03',
    title: 'Passphrases',
    summary: 'Make passphrases with themes and choose where numbers or symbols go.',
    changes: [
      'Choose from themed word lists.',
      'Choose where to put numbers and symbols.',
    ],
    commits: ['eb59f86', '0c2b1a5', '8b42f99'],
  },
  {
    version: '1.1.0',
    date: '2026-06-01',
    title: 'Password Generator',
    summary: 'Make passwords that are easier to type.',
    changes: [
      'Choose password styles designed to be easier to type.',
      'The quote tool handles large lists more smoothly.',
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
    title: 'Quote Tool',
    summary: 'Turn a list into quoted text with commas.',
    changes: [
      'Put quotes and commas around each row in your list.',
      'Paste text and copy the finished result.',
      'Remove empty rows and see how many rows are in your list.',
    ],
    commits: ['f0a1e5c', '85be4cc', 'e3b3872', '53020fb'],
  },
];
