import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('RAPP-001', 'Resident app', 'Home', 'Resident home summarises the stay', {
    t: 'Functional', p: 'P0', role: 'Resident',
    pre: 'Resident signed in with rent plan, room and deposit',
    steps: [
      'Open Home => Heading "Inmate · Your stay at a glance"',
      'Read the cards => Room and bed, rent amount with "Due on day <n>", deposit status, "Paid this month"/"Pending dues"',
      'Compare with the owner detail screen => Same room, bed, rent and deposit values',
    ],
    auto: 'Manual',
  }),

  tc('RAPP-002', 'Resident app', 'Home', 'Resident sees the owner name and hostel', {
    t: 'UI', p: 'P1', role: 'Resident',
    steps: [
      'Open Home => Property name and owner name are shown',
      'Owner renames the property => Resident view updates after refresh',
    ],
  }),

  tc('RAPP-003', 'Resident app', 'Quick actions', 'Every resident action is reachable', {
    t: 'Functional', p: 'P1', role: 'Resident',
    steps: [
      'Open Home → "Quick actions" => Pay rent, Raise a complaint, Mark leave, Chat with owner, My deposit, Documents, SOS',
      'Tap each action => Each opens the matching screen without a dead end',
      'Back from each => Returns to Home with state intact',
    ],
  }),

  tc('RAPP-004', 'Resident app', 'Menu', 'Resident menu hides owner-only features', {
    t: 'Security', p: 'P0', role: 'Resident',
    steps: [
      'Open the More tab => Heading "Menu" (not "Manage")',
      'Check the list => No Inmates, Expenses, Settings, Bills, Visitors, Checkout, Admin entries',
      'Owner signs in on the same build => Those entries are present (comparison proves role gating)',
    ],
    auto: 'Manual',
  }),

  tc('RAPP-005', 'Resident app', 'Polls', 'Resident answers a mess poll from Home', {
    t: 'Functional', p: 'P0', role: 'Resident',
    pre: 'An open poll exists',
    steps: [
      'Home/Polls → poll card => Options Yes / No visible',
      'Tap Yes => "You said Yes"; the card no longer asks',
      'Reopen later => The answer is retained',
    ],
    auto: 'Manual',
  }),

  tc('RAPP-006', 'Resident app', 'Rent', 'Resident pays rent and sees it reflected', {
    t: 'Functional', p: 'P0', role: 'Resident',
    pre: 'Rent plan ₹6500, unpaid this month',
    steps: [
      'Tap "Pay rent ₹6500" => Pay sheet with amount and method',
      'Confirm => "Payment successful" and receipt',
      'Return to Home => "Paid ✓" and "Paid this month"',
      'Owner dashboard => Collected total increased by exactly ₹6500',
    ],
    auto: 'Manual',
  }),

  tc('RAPP-007', 'Resident app', 'Complaints', 'Resident raises and tracks a complaint', {
    t: 'Functional', p: 'P0', role: 'Resident',
    steps: [
      'Raise a complaint with a description => "Complaint submitted"',
      'Open the complaints list => The complaint is listed with status open',
      'Owner resolves it, resident refreshes => Status shows resolved',
    ],
  }),

  tc('RAPP-008', 'Resident app', 'Leave', 'Resident marks leave', {
    t: 'Functional', p: 'P1', role: 'Resident',
    steps: [
      'Tap "Mark leave" => Form with start/return dates and reason',
      'Submit valid dates => Confirmation; the record appears for the resident',
      'Owner view => The leave appears in "Leave / attendance"',
    ],
  }),

  tc('RAPP-009', 'Resident app', 'Deposit', 'Resident views the deposit ledger', {
    t: 'Functional', p: 'P1', role: 'Resident',
    steps: [
      'Tap "My deposit" => Collected, deducted, refundable',
      'With no deposit => "No deposit recorded yet."',
      'Owner adds a deduction and the resident refreshes => Refundable updated',
    ],
  }),

  tc('RAPP-010', 'Resident app', 'Chat', 'Resident chats with the owner', {
    t: 'Functional', p: 'P1', role: 'Resident',
    steps: [
      'Tap "Chat with owner" => Thread opens (empty state "No messages yet — say hello.")',
      'Send a message => Appears as sent by the resident',
      'Owner replies, resident refreshes => Reply visible',
    ],
  }),

  tc('RAPP-011', 'Resident app', 'Documents', 'Resident manages personal documents', {
    t: 'Functional', p: 'P2', role: 'Resident',
    steps: [
      'Documents → "Upload document" => "My documents" section present',
      'Upload with a name => Listed',
      'Delete with confirmation => Removed',
      'Verify the owner can see it before deletion and not after',
    ],
  }),

  tc('RAPP-012', 'Resident app', 'SOS', 'Resident sends an SOS alert', {
    t: 'Functional', p: 'P0', role: 'Resident',
    steps: [
      'Tap "Emergency SOS" => Confirmation step ("Alerts your owner instantly")',
      'Confirm => Toast "SOS alert sent to your owner"',
      'Owner → SOS alerts => The alert is listed as unacknowledged with time and resident',
    ],
    post: 'sos_alerts row created',
  }),

  tc('RAPP-013', 'Resident app', 'Ratings', 'Resident rates the stay', {
    t: 'Functional', p: 'P2', role: 'Resident',
    steps: [
      'Tap "Rate my stay" => Stars 1–5 and "Comment (optional)"',
      'Pick 4 stars, add a comment, submit => "Thanks for rating!"',
      'Owner → Ratings => The rating with 4 stars and the comment is listed',
    ],
  }),

  tc('RAPP-014', 'Resident app', 'Notices', 'Resident reads notices', {
    t: 'Functional', p: 'P1', role: 'Resident',
    pre: 'Owner posted a notice',
    steps: [
      'Open Notices => The notice with title and body',
      'No owner-only action (post/pin) is shown',
      'With no notices => "No notices yet."',
    ],
  }),

  tc('RAPP-015', 'Resident app', 'Profile', 'Resident sees their own account details', {
    t: 'UI', p: 'P2', role: 'Resident',
    steps: [
      'More → profile section => Name, Username, Role "Inmate"',
      'Verify the role label => "Inmate", not "Owner"',
      'Log out and back in => Same values',
    ],
  }),

  tc('RAPP-016', 'Resident app', 'Logout', 'Resident logs out cleanly', {
    t: 'Functional', p: 'P1', role: 'Resident',
    steps: [
      'More → "Log out" => Returned to /login',
      'Reload => Still signed out',
      'Open /home => Redirected to /login',
    ],
  }),

  tc('RAPP-017', 'Resident app', 'Cross-role', 'Resident cannot perform owner actions via the API', {
    t: 'Security', p: 'P0', role: 'Resident', plat: 'API',
    steps: [
      'POST /inmates => 401/403',
      'POST /rooms, POST /properties => 401/403',
      'PATCH rent plan for themselves => 401/403',
      'Mark a complaint resolved => 401/403',
      'POST /notices => 401/403',
    ],
  }),

  tc('RAPP-018', 'Resident app', 'Edge case', 'Resident without a rent plan or room', {
    t: 'Negative', p: 'P2', role: 'Resident',
    pre: 'Resident created without rent and then moved out of a room (edge fixture)',
    steps: [
      'Home => "Your owner has not set your rent yet." with no Pay action',
      'Room card => Shows a sensible empty state instead of "Room null · Bed null"',
      'Other actions (complaint, chat, SOS) => Still usable',
    ],
  }),

  tc('RAPP-019', 'Resident app', 'After checkout', 'Checked-out resident sees the final state', {
    t: 'Functional', p: 'P1', role: 'Resident',
    pre: 'Owner completed checkout for this resident',
    steps: [
      'Open Home => Stay marked as ended; no active rent action',
      'Deposit => Final refunded amount displayed',
      'Payments history => Previous payments still visible',
    ],
  }),

  tc('RAPP-020', 'Resident app', 'Mobile usability', 'Resident flow works on a phone', {
    t: 'Compatibility', p: 'P2', role: 'Resident', plat: 'Web (390×844) · Android · iOS',
    steps: [
      'Open Home at 390×844 => Cards stack, no horizontal scroll',
      'Open the poll and vote with one thumb => Works; no zoom needed',
      'Open the keyboard in chat => Composer stays visible above it',
    ],
  }),

  tc('RAPP-021', 'Resident app', 'Persistence', 'Resident preferences survive a reload', {
    t: 'Functional', p: 'P2', role: 'Resident',
    steps: [
      'Vote in a poll, then reload => Vote retained',
      'Send a chat message, then reload => Message retained',
      'Reload Home => Same rent/deposit values, no flicker to zero',
    ],
  }),

  tc('RAPP-022', 'Resident app', 'Isolation', 'Resident never sees another resident\'s data on screen', {
    t: 'Security', p: 'P0', role: 'Resident',
    pre: 'Two residents in the same room, both with payments and complaints',
    steps: [
      'Open Payments as A => Only A\'s payments',
      'Open Complaints as A => Only A\'s complaints',
      'Open Chat as A => Only the thread with the owner, never B\'s',
      'Check the poll tallies => Aggregates only, no names',
    ],
  }),
];
