import { tc } from './_helpers.js';

export const cases = [
  tc('E2E-001', 'End-to-end', 'Onboarding', 'New owner goes from sign-up to first resident', {
    t: 'E2E', p: 'P0', role: 'Owner',
    pre: 'No account, no property',
    steps: [
      'Register a new owner account => Lands on /home with "Set up your hostel"',
      'Complete setup: name "QA Hostel", type Hostel, address, room R101 with 4 beds => Dashboard shows 0/4 occupancy',
      'Add resident Asha with bed 1, rent 6500, due day 5 => Credentials dialog with username and password',
      'Copy the credentials and dismiss => Resident listed with Room R101 · Bed 1 · ₹6500',
      'Reload the app => Property, room and resident all persist',
    ],
    post: 'A resident can now log in with the copied credentials',
  }),

  tc('E2E-002', 'End-to-end', 'Rent', 'Resident pays rent and the owner sees the collection', {
    t: 'E2E', p: 'P0', role: 'Resident',
    pre: 'Owner created a resident with rent 6500 and due day 5',
    steps: [
      'Resident logs in with the generated credentials => "Your stay at a glance" with ₹6500 due',
      'Tap "Pay rent ₹6500" and confirm => "Payment successful" and a receipt',
      'Return to Home => "Paid ✓" for the month',
      'Owner signs in and opens Home => "Total collected" increased by ₹6500 and pending dues dropped by the same amount',
      'Owner opens the resident → Payment history => One payment with today\'s date and the right amount',
    ],
  }),

  tc('E2E-003', 'End-to-end', 'Polls', 'Full poll cycle from creation to all-responded', {
    t: 'E2E', p: 'P0', role: 'Owner',
    pre: 'Three residents in the property',
    steps: [
      'Owner creates a Dinner poll for tomorrow with Yes/No => Card with 0 responses and "No response: 3"',
      'Resident 1 votes Yes, resident 2 votes No => Owner tally 1/1 and pending 1',
      'Owner taps "Nudge 1 non-responders" => "Nudge sent to 1 inmates"',
      'Resident 3 votes Yes => Owner sees "All responded ✓"',
      'Reload the polls screen => Counts preserved',
    ],
  }),

  tc('E2E-004', 'End-to-end', 'Complaints', 'Complaint from raise to resolution', {
    t: 'E2E', p: 'P0', role: 'Resident',
    pre: 'Resident signed in',
    steps: [
      'Resident raises "Geyser not working" => "Complaint submitted"',
      'Owner opens Complaints => Complaint present with status open and "Open complaints" counter at 1',
      'Owner marks it resolved => Status resolved; counter 0',
      'Resident refreshes => Sees the resolved status',
    ],
  }),

  tc('E2E-005', 'End-to-end', 'Room change', 'Resident moves rooms and everything follows', {
    t: 'E2E', p: 'P1', role: 'Owner',
    pre: 'Resident in R101; R102 has free beds',
    steps: [
      'Owner opens the resident → Change room → picks R102 bed 1 => "Moved to Room R102, bed 1"',
      'Inmates screen => R101 count decremented, R102 incremented',
      'Resident logs in => Home shows Room R102, bed 1',
      'Owner generates an invoice => The invoice carries the new room',
    ],
  }),

  tc('E2E-006', 'End-to-end', 'Checkout', 'Deposit to refund in one flow', {
    t: 'E2E', p: 'P1', role: 'Owner',
    pre: 'Resident with deposit ₹10000',
    steps: [
      'Owner records a deduction of ₹1500 with a reason => Refundable ₹8500',
      'Owner initiates checkout with a vacate date => Checkout listed as pending',
      'Owner completes the checkout and settles ₹8500 => Success state',
      'Resident opens My deposit => Collected 10000, deducted 1500, refunded 8500',
      'Owner opens Inmates => Resident checked out, bed freed, room occupancy reduced',
    ],
  }),

  tc('E2E-007', 'End-to-end', 'Chat', 'Two-way conversation between owner and resident', {
    t: 'E2E', p: 'P1', role: 'Owner',
    steps: [
      'Owner sends "Rent due on the 5th" => Message in the thread with the owner role',
      'Resident opens Chat with owner and replies "Paying today" => Message visible as the resident',
      'Owner reopens the thread => Both messages in chronological order',
      'Owner opens the chat list => The thread is first',
    ],
  }),

  tc('E2E-008', 'End-to-end', 'Notices', 'Pinned notice reaches every resident', {
    t: 'E2E', p: 'P1', role: 'Owner',
    steps: [
      'Owner posts "Water supply" with a body and Pin to top => Notice appears first in the owner list',
      'Resident 1 opens Notices => Same notice on top with the full body',
      'Owner posts a newer unpinned notice => The pinned notice is still first',
      'Owner unpins => Chronological order returns for both roles',
    ],
  }),

  tc('E2E-009', 'End-to-end', 'SOS', 'Emergency alert is delivered and acknowledged', {
    t: 'E2E', p: 'P0', role: 'Resident',
    steps: [
      'Resident taps Emergency SOS and confirms => "SOS alert sent to your owner"',
      'Owner opens SOS alerts => Unacknowledged alert with the resident and time',
      'Owner taps Acknowledge => "Acknowledged"; the action disappears',
      'Reload both apps => State consistent',
    ],
  }),

  tc('E2E-010', 'End-to-end', 'Visitors', 'Visitor logs in and out', {
    t: 'E2E', p: 'P2', role: 'Owner',
    steps: [
      'Owner logs visitor Ravi for resident Asha with a purpose => Row "Inside since <time>"',
      'Owner taps Check out => "Left at <time>"',
      'Reload => The visit keeps both timestamps and is not duplicated',
    ],
  }),

  tc('E2E-011', 'End-to-end', 'Scale', 'Three residents, mixed states, consistent dashboard', {
    t: 'E2E', p: 'P1', role: 'Owner',
    pre: '3 residents: one paid, one pending, one on leave',
    steps: [
      'Dashboard => Occupancy 3/4, collected = paid rent, pending = unpaid rent, open complaints correct',
      'Create a poll and have two residents vote => Tally matches',
      'Move one resident to another room => Occupancy moves with them',
      'Reload => Every number still consistent with the underlying rows',
    ],
  }),

  tc('E2E-012', 'End-to-end', 'Role switch', 'Owner and resident share one device', {
    t: 'E2E', p: 'P1', role: 'All',
    steps: [
      'Owner signs in and uses the app => Owner tabs and Manage menu',
      'Log out and sign in as the resident => Resident tabs, Menu heading, no owner items',
      'Log out and sign back in as the owner => Owner data intact, no resident session bleed',
      'Check localStorage/tokens => Only one session at a time',
    ],
  }),

  tc('E2E-013', 'End-to-end', 'Second property', 'Owner runs two properties in parallel', {
    t: 'E2E', p: 'P2', role: 'Owner',
    pre: 'Owner has QA Hostel and QA Annex, each with a resident',
    steps: [
      'Switch to QA Annex => Inmates/Polls/Dashboard show only Annex data',
      'Create a poll in Annex => The Hostel property does not see it',
      'Switch back to QA Hostel => Its own polls and residents are unchanged',
    ],
  }),

  tc('E2E-014', 'End-to-end', 'Regression sweep', 'Every owner menu entry opens and closes cleanly', {
    t: 'E2E', p: 'P1', role: 'Owner',
    steps: [
      'From More, open each entry: Notices, Complaints, Visitors, Leave, Deposits, Checkout, Chat, Expenses, Bills, Ratings, SOS, Documents, Settings, Upgrade, Privacy, Terms',
      'Each screen renders content or a proper empty state => No blank screen, no crash, no console error',
      'Back from each => Returns to the shell with the tab bar intact',
      'Log out from the same menu => Returns to /login',
    ],
  }),

  tc('E2E-015', 'End-to-end', 'First-day resident', 'Resident completes every first-session action', {
    t: 'E2E', p: 'P1', role: 'Resident',
    pre: 'Fresh resident with rent, deposit and an open poll',
    steps: [
      'Log in => Home shows room, rent, deposit and the quick actions',
      'Vote in the poll => "You said Yes"',
      'Raise a complaint => Confirmed',
      'Mark leave for tomorrow => Recorded',
      'Upload a document => Listed under My documents',
      'Send a chat message => Visible in the thread',
      'Reload => All six actions persisted',
    ],
  }),
];
