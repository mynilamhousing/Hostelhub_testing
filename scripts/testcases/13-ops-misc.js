import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('OPS-001', 'Settings', 'Feature visibility', 'Owner toggles features visible to residents', {
    t: 'Functional', p: 'P1', role: 'Owner',
    steps: [
      'More → "Property settings" => Toggles under "Visible to inmates"',
      'Turn off Polls and save => Confirmation; the resident reopens the app',
      'Resident view => Polls entry is hidden',
      'Turn it back on => Resident sees it again after refresh',
    ],
    notes: 'Copy on screen: "Only inmates can see the features you turn on."',
  }),

  tc('OPS-002', 'Settings', 'Property type', 'Property type is displayed and consistent', {
    t: 'Functional', p: 'P2', role: 'Owner',
    pre: 'Property created as House (rent)',
    steps: [
      'Open Property settings => "Type: House (rent)"',
      'Change the type to Hostel and save => Settings shows "Type: Hostel" after reload',
      'Dashboard copy => Still renders without a stale label',
    ],
  }),

  tc('OPS-003', 'Settings', 'Empty state', 'Settings requires a property', {
    t: 'Negative', p: 'P2', role: 'Owner',
    pre: PRE.ownerNoProp,
    steps: [
      'Open /settings => "Set up your property first."',
      'No toggle is interactive in that state',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-OPS-05',
  }),

  tc('OPS-004', 'Ratings', 'Submit', 'Resident submits a rating with a comment', {
    t: 'Functional', p: 'P2', role: 'Resident',
    data: 'Stars: 4 / Comment: Clean rooms',
    steps: [
      'Open "Rate my stay" => Star selector and "Comment (optional)"',
      'Select 4 stars, add the comment, submit => "Thanks for rating!"',
      'Owner → Ratings => Shows 4 stars and the comment with the resident name',
    ],
  }),

  tc('OPS-005', 'Ratings', 'Validation', 'Rating requires at least one star', {
    t: 'Validation', p: 'P2', role: 'Resident',
    steps: [
      'Submit with no star selected => Blocked with a message',
      'Submit with 1 star => Accepted',
      'Submit a 1000-character comment => Accepted or limited with a message',
    ],
  }),

  tc('OPS-006', 'Ratings', 'Owner view', 'Ratings list is empty-safe and ordered', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'No ratings yet',
    steps: [
      'Open Ratings => "No ratings yet."',
      'After two ratings => Newest first with stars and comments',
      'With no property => "Set up your hostel first."',
    ],
  }),

  tc('OPS-007', 'SOS', 'Send', 'Owner sees and acknowledges an SOS alert', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Resident sent an SOS alert',
    steps: [
      'More → "SOS alerts" => Alert listed with resident, time and "Acknowledge"',
      'Tap "Acknowledge" => Status "Acknowledged" and the action disappears',
      'Reload => Acknowledged state persisted',
      'Resident view => No error; the alert is not actionable by the resident',
    ],
  }),

  tc('OPS-008', 'SOS', 'Empty state', 'SOS list is empty-safe', {
    t: 'UI', p: 'P2', role: 'Owner',
    steps: [
      'Open SOS alerts with no alerts => "No SOS alerts."',
      'With no property => "Set up your hostel first."',
    ],
  }),

  tc('OPS-009', 'SOS', 'Isolation', 'SOS alerts stay within the property', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    steps: [
      'GET /sos?property_id=<other> with owner A token => Empty or 403',
      'Owner B cannot acknowledge owner A\'s alert',
    ],
  }),

  tc('OPS-010', 'Upgrade', 'Plans', 'Upgrade screen shows the plan matrix', {
    t: 'UI', p: 'P2', role: 'Owner',
    steps: [
      'More → "Upgrade plan" => Monthly and Yearly tabs with prices (Rs. 199 / Rs. 599, Rs. 5,999 yearly)',
      'Read the inclusions => "One property included", "Unlimited inmates", "Extra property ₹/mo", "Priority support"',
      'Check the payment note => "Online payment is being enabled soon." is shown while Razorpay is not live',
    ],
  }),

  tc('OPS-011', 'Upgrade', 'Billing rule', 'Extra properties are billed per property', {
    t: 'Functional', p: 'P2', role: 'Owner',
    pre: 'Owner has 2 properties',
    steps: [
      'Open Upgrade => The second property is presented as billable',
      'Compare with GET /pricing => The extra-property amount matches the global rate',
      'With an admin override for this owner => The override amount is displayed instead',
    ],
  }),

  tc('OPS-012', 'Upgrade', 'Payment', 'Upgrade purchase is blocked while payments are disabled', {
    t: 'Negative', p: 'P2', role: 'Owner',
    steps: [
      'Tap the purchase action => Message that online payment is not enabled yet; no order created',
      'Confirm nothing was charged and the plan is unchanged',
    ],
  }),

  tc('OPS-013', 'Legal', 'Privacy', 'Privacy policy renders and is readable', {
    t: 'UI', p: 'P3', role: 'Guest',
    steps: [
      'Open /privacy (also reachable from the More menu) => Sections "What we collect", "Why we collect it", "Your rights"',
      'Check the contact => "support@hostelhub.app" present',
      'Verify text is selectable/scrollable on mobile',
    ],
  }),

  tc('OPS-014', 'Legal', 'Terms', 'Terms and acceptable use render', {
    t: 'UI', p: 'P3', role: 'Guest',
    steps: [
      'Open /terms => Sections "The service", "Accounts", "Payments & billing", "Acceptable use", "Liability"',
      'Check the plans copy => Matches the Upgrade screen prices',
      'No broken links or empty sections',
    ],
  }),

  tc('OPS-015', 'Dashboard', 'Stats', 'Owner dashboard counters are correct', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: '3 residents, 1 room capacity 4, 2 complaints (1 open), 1 payment',
    steps: [
      'Open Home => Occupancy 3/4, Pending dues = unpaid rents, Total collected = paid total, Open complaints = 1',
      'Resolve a complaint and refresh => Open complaints 0',
      'Add a resident => Occupancy 4/4 and the room is now full',
    ],
  }),

  tc('OPS-016', 'Dashboard', 'Responsive', 'Dashboard uses the viewport on desktop', {
    t: 'UI', p: 'P2', role: 'Owner', plat: 'Web (1440×900)',
    steps: [
      'Open Home at 1440×900 => Stat cards in 4 columns, content capped around 1180px',
      'No blank side gutters and no stretched cards',
      'Resize to 820 wide => 2 columns; to 390 => 1 column, no overflow',
    ],
  }),

  tc('OPS-017', 'Navigation', 'Tabs', 'Owner tabs are all reachable on every platform', {
    t: 'Functional', p: 'P0', role: 'Owner',
    steps: [
      'Tap Home, Inmates, Polls, More in order => Each tab renders its screen',
      'Return to Home => State preserved',
      'Reload on any tab route => Still on the shell, correct tab selected',
    ],
    auto: 'tests/web/smoke.spec.js › SMK-04',
  }),

  tc('OPS-018', 'Navigation', 'Deep links', 'Direct URLs resolve to the right screen', {
    t: 'Functional', p: 'P1', role: 'Owner', plat: 'Web',
    steps: [
      'Open /inmates, /polls, /expenses, /settings directly => Each loads the correct screen (SPA fallback, no 404)',
      'Open a nonsense route /xyz => Handled (home or not-found), never a blank page',
      'Open /inmates/new directly => Add tenant form loads',
    ],
  }),

  tc('OPS-019', 'Offline', 'Network loss', 'App degrades gracefully without a network', {
    t: 'Negative', p: 'P2', role: 'Owner',
    steps: [
      'Enable airplane mode / offline throttling and open Inmates => "Error loading inmates" style message with a retry, no infinite spinner',
      'Restore the network and retry => Data loads',
      'Submit a form while offline => Clear failure message; no false success',
    ],
  }),

  tc('OPS-020', 'Performance', 'Cold load', 'First meaningful paint is acceptable', {
    t: 'Functional', p: 'P2', role: 'Guest', plat: 'Web',
    steps: [
      'Load the app on a cold cache over 4G => Login screen visible within a reasonable budget (record the number)',
      'Check the network waterfall => `main.dart.js` cached on the second visit (immutable headers)',
      'Repeat on a warm cache => Much faster; verify `_headers` behaviour',
    ],
  }),
];
