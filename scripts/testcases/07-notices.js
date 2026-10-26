import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('NOT-001', 'Notices', 'Post notice', 'Owner posts a notice', {
    t: 'Functional', p: 'P1', role: 'Owner',
    data: 'Title: Water supply / Body: Maintenance 10am-1pm / Pin: off',
    steps: [
      'More → "Post notice" (or Notices → Post) => Sheet "Post notice" with Title, Body (optional), "Pin to top"',
      'Enter the title and body and save => Toast/snackbar confirms; the notice appears in the list',
      'Read the card => Title, body and posted time shown',
    ],
    post: 'notices row created',
  }),

  tc('NOT-002', 'Notices', 'Post notice', 'Title is mandatory', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Leave Title empty and post => Validation message; nothing saved',
      'Enter a title with body empty => Saved (body is optional), card shows only the title',
    ],
  }),

  tc('NOT-003', 'Notices', 'Post notice', 'Pinned notices stay on top', {
    t: 'Functional', p: 'P2', role: 'Owner',
    pre: 'Two notices, the older one pinned',
    steps: [
      'Post a newer notice without pinning => The pinned notice remains first',
      'Unpin the pinned notice => Normal chronological order resumes',
    ],
  }),

  tc('NOT-004', 'Notices', 'Resident view', 'Resident sees notices for their property', {
    t: 'Functional', p: 'P0', role: 'Resident',
    pre: 'Notice posted in the resident\'s property',
    steps: [
      'Resident → Home/More → Notices => The notice is listed with title and body',
      'Open it => Full body visible, no owner-only controls',
      'Owner deletes/edits it (if supported) => Resident view updates on refresh',
    ],
  }),

  tc('NOT-005', 'Notices', 'Empty state', 'Notices screen is empty-safe', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'No notices',
    steps: [
      'Open Notices => "No notices yet." with a post action',
      'As a resident with no notices => Same empty state without owner controls',
    ],
  }),

  tc('NOT-006', 'Notices', 'Content', 'Long and multi-line bodies render correctly', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Post a 1000-character body with line breaks => Rendered with wrapping, no overflow',
      'Post emoji and ₹ symbols => Rendered correctly',
      'Post HTML-looking text => Displayed literally (no injection)',
    ],
  }),

  tc('NOT-007', 'Notices', 'Isolation', 'Notices do not leak across properties', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    pre: 'Two properties, each with notices',
    steps: [
      'GET /notices?property_id=<other> with owner A token => Empty or 403',
      'Resident of property B cannot see property A notices in the app',
    ],
  }),

  tc('NOT-008', 'Notices', 'Ordering', 'Newest notice first when unpinned', {
    t: 'Functional', p: 'P2', role: 'Owner',
    steps: [
      'Post three notices => Newest first',
      'Reload => Order stable',
      'Pin the oldest => It jumps to the top, others keep relative order',
    ],
  }),

  tc('NOT-009', 'Notices', 'Validation', 'Whitespace-only title is rejected', {
    t: 'Negative', p: 'P2', role: 'Owner',
    steps: [
      'Enter "   " as the title and post => Rejected',
      'Enter a 200-character title => Accepted or truncated consistently; no layout break',
    ],
  }),

  tc('NOT-010', 'Notices', 'API', 'Notice API round-trip', {
    t: 'API', p: 'P1', role: 'Owner', plat: 'API',
    steps: [
      'POST /notices without property_id => 400',
      'POST a valid notice => 201/200 with id',
      'GET /notices?property_id=... => Contains the new notice with the right fields',
    ],
  }),
];
