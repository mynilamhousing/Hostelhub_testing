import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('RES-001', 'Residents', 'Add resident', 'Owner adds a resident with all details', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Property with room R101 (capacity 4) and no residents',
    data: 'Name: Asha Verma / Phone: 9876500001 / Email: asha.qa@hostelhub.test / Bed 1 / Rent 6500 / Due day 5',
    steps: [
      'Inmates → "Add inmate" => "Add tenant" form with Full name, Phone, Email, Room, Bed no., Rent, Due day',
      'Enter the name, phone and email => Values accepted',
      'Pick room R101 => Room chip highlights; the form shows the room capacity',
      'Enter bed 1, rent 6500, due day 5 and tap "Add inmate" => "Inmate added" confirmation',
      'Read the credentials dialog => Username + Password shown, "Share these login details with the inmate:", Copy / Done actions',
      'Tap "Done" => Returned to the list, resident card "Asha Verma · Room R101 · Bed 1 · ₹6500"',
    ],
    post: 'inmates row created; room occupancy 1/4; credentials hash stored',
    auto: 'tests/web/e2e.spec.js › E2E-INM-02',
  }),

  tc('RES-002', 'Residents', 'Add resident', 'Full name is mandatory', {
    t: 'Validation', p: 'P0', role: 'Owner',
    steps: [
      'Leave Full name empty, fill the rest and submit => Message "Enter a name"; no record created',
      'Enter a single character name => Accepted (record it) and displayed correctly',
      'Enter a 100-character name => Accepted or rejected, never truncated silently in the list',
    ],
  }),

  tc('RES-003', 'Residents', 'Add resident', 'A room must be selected', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Fill the name and submit without picking a room => Message "Pick a room"; no record created',
      'With no rooms at all, open Add inmate => Empty state "No rooms yet — add rooms first."',
    ],
  }),

  tc('RES-004', 'Residents', 'Add resident', 'Bed number is validated against room capacity', {
    t: 'Boundary', p: 'P1', role: 'Owner',
    pre: 'Room R101 capacity 4, bed 1 occupied',
    steps: [
      'Pick R101 and enter bed 5 => Message "Bed 5 is out of range (1-4)"',
      'Enter bed 0 or a negative number => Rejected by the numeric field',
      'Enter bed 1 (already taken) => Message "Bed 1 in room R101 is already taken"',
      'Enter bed 2 => Accepted and the resident is created',
    ],
  }),

  tc('RES-005', 'Residents', 'Add resident', 'Phone and email are optional', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Add a resident with name + room + bed only => Created successfully',
      'Open the resident detail => Phone/Email show as empty, invoice-email action reports "This inmate has no email on file"',
      'Open chat for that resident => Still possible from the owner side',
    ],
  }),

  tc('RES-006', 'Residents', 'Add resident', 'Rent defaults to the room rent and can be overridden', {
    t: 'Functional', p: 'P1', role: 'Owner',
    prep: 'Room rent 6500 set at creation',
    steps: [
      'Pick room R101 => Rent field prefills 6500',
      'Override to 5000 and save => Resident saved with ₹5000',
      'Open the resident detail → Rent => Shows ₹5000 for that resident',
    ],
  }),

  tc('RES-007', 'Residents', 'Add resident', 'Due day boundaries', {
    t: 'Boundary', p: 'P1', role: 'Owner',
    steps: [
      'Enter due day 31 and save => Accepted',
      'Enter 0 or 32 => Rejected by field validation',
      'Enter 1 => Accepted; the resident dashboard shows "Due on day 1"',
    ],
  }),

  tc('RES-008', 'Residents', 'Credentials', 'Each resident gets unique credentials', {
    t: 'Functional', p: 'P0', role: 'Owner',
    steps: [
      'Add two residents in the same room => Two different username/password pairs',
      'Copy credentials for the first => Clipboard contains "Username: ... Password: ..."',
      'Log in with the first resident credentials => Resident shell opens; the second resident is not affected',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-INM-02',
  }),

  tc('RES-009', 'Residents', 'Credentials', 'Regenerating credentials invalidates the old password', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'A resident exists with known credentials',
    steps: [
      'Open the resident detail → "Regenerate login credentials" => New username/password dialog appears',
      'Note the new password and dismiss => Detail screen unchanged otherwise',
      'Log in as the resident with the OLD password => 401',
      'Log in with the NEW password => Succeeds',
    ],
  }),

  tc('RES-010', 'Residents', 'List', 'Resident list shows room, bed and rent', {
    t: 'UI', p: 'P1', role: 'Owner',
    pre: 'Two residents in different rooms',
    steps: [
      'Open Inmates => Each card reads "<Name> · Room <no> · Bed <n> · ₹<rent>"',
      'Check the Rooms section => Occupancy counts match the number of residents per room',
      'Reload => Same data, no duplicates',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-INM-01 · smoke SMK-05',
  }),

  tc('RES-011', 'Residents', 'List', 'Empty state guides the owner', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'Property with rooms but no residents',
    steps: [
      'Open Inmates => "No inmates yet — add your first inmate." with an "Add inmate" action',
      'With no rooms either => "No rooms yet — add your first room."',
    ],
  }),

  tc('RES-012', 'Residents', 'Change room', 'Owner moves a resident to another room', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Resident in R101 bed 1; room R102 has free beds',
    steps: [
      'Open the resident detail → "Change room" => Sheet "Move to room" with the list of rooms and free beds',
      'Pick R102 and a free bed => Selection highlighted',
      'Confirm => Toast "Moved to Room R102, bed <n>"',
      'Check occupancy => R101 back to previous count, R102 incremented',
      'Log in as the resident => Resident home shows Room R102, bed <n>',
    ],
    post: 'inmates row updated; both rooms recalculated',
  }),

  tc('RES-013', 'Residents', 'Change room', 'Move into a full room is refused', {
    t: 'Negative', p: 'P1', role: 'Owner',
    pre: 'Room R103 is full (capacity reached)',
    steps: [
      'Open Change room for a resident => R103 is shown as full or absent from the free-bed list',
      'Force-select R103 if it is selectable and confirm => "Room is full"; the move is not applied',
      'Verify the resident => Still in the original room',
    ],
  }),

  tc('RES-014', 'Residents', 'Change room', 'Moving into the same bed is a no-op', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Open Change room and pick the current room/bed => Save either refuses with a clear message or succeeds without duplicating the record',
      'Check the list => Exactly one row for the resident; occupancy unchanged',
    ],
  }),

  tc('RES-015', 'Residents', 'Change room', 'Occupancy is recalculated for both rooms', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'R101 1/4, R102 0/2',
    steps: [
      'Move the resident from R101 to R102 => R101 reads 0/4 and R102 reads 1/2 on the Inmates screen',
      'Call GET /rooms twice => Counts are derived from inmates, not cached stale values',
    ],
  }),

  tc('RES-016', 'Residents', 'Detail', 'Resident detail summarises stay, rent and deposit', {
    t: 'UI', p: 'P1', role: 'Owner',
    steps: [
      'Open a resident => Header "Inmate details" with name, "Room R101 · Bed 1", Joined date, status "Current resident"',
      'Scroll => Sections Rent, Security deposit, Stay, Payment history, Complaints, Leave',
      'With no payments => "No payments yet."; no complaints => "No complaints."; no leave => "No leave records."',
    ],
  }),

  tc('RES-017', 'Residents', 'Detail', 'Auto-debit toggle persists per resident', {
    t: 'Functional', p: 'P2', role: 'Owner',
    steps: [
      'Toggle "Auto debit (UPI Autopay)" on => Switch turns on; helper text "Auto-collect rent each month from this inmate."',
      'Reload and reopen => Toggle stays on',
      'Toggle off and reopen => Stays off',
    ],
    notes: 'Razorpay autopay is scaffolded only; the persisted flag is what is asserted here.',
  }),

  tc('RES-018', 'Residents', 'Billing', 'Generate an invoice PDF for a resident', {
    t: 'Functional', p: 'P1', role: 'Owner',
    steps: [
      'Open the resident → "Generate invoice PDF" => PDF preview/download with the hostel name, resident, period and total due',
      'Check the amounts => Rent for the month plus mess charges; "Total due: Rs. <amount>" matches the API /inmates/:id/invoice',
      'Open the PDF metadata => Generated by HostelHub, no placeholder text',
    ],
  }),

  tc('RES-019', 'Residents', 'Billing', 'Email invoice is blocked without an email', {
    t: 'Negative', p: 'P2', role: 'Owner',
    pre: 'Resident created without an email',
    steps: [
      'Tap "Email invoice" => Message "This inmate has no email on file"',
      'Add an email via change/edit, then retry => Success toast "Invoice emailed to <email>"',
    ],
  }),

  tc('RES-020', 'Residents', 'Billing', 'WhatsApp invoice needs a phone number', {
    t: 'Negative', p: 'P2', role: 'Owner',
    pre: 'Resident created without a phone',
    steps: [
      'Tap "Send invoice via WhatsApp" => Message "This inmate has no phone number on file"',
      'With a phone present => WhatsApp deep link opens prefilled with "Hi <name>, here is your bill:" and the line items',
    ],
  }),

  tc('RES-021', 'Residents', 'Checkout', 'Checkout starts from the resident detail', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Resident with a recorded deposit',
    steps: [
      'Open the resident → Checkout entry point => Deposits/Checkout screen opens with that resident preselected',
      'Confirm the resident name and deposit => Refundable amount is shown',
    ],
  }),

  tc('RES-022', 'Residents', 'Isolation', 'Resident cannot read another resident\'s record', {
    t: 'Security', p: 'P0', role: 'Resident', plat: 'API',
    pre: 'Residents A and B exist in the same property',
    steps: [
      'As A, call GET /inmates/<B id> => 403/404, not B\'s data',
      'As A, call GET /payments?inmate_id=<B> => Empty or 403',
      'As A, call PATCH /inmates/<B> to change the room => Refused',
    ],
  }),

  tc('RES-023', 'Residents', 'Validation', 'Phone and email formats are validated', {
    t: 'Validation', p: 'P2', role: 'Owner',
    steps: [
      'Enter phone "abc" => Rejected by the numeric keyboard or validation message',
      'Enter phone "12345" (too short) => Accepted or rejected consistently; record which',
      'Enter email "asha@" => Validation message; record not saved with a malformed email',
    ],
  }),

  tc('RES-024', 'Residents', 'Add resident', 'Adding a resident updates dashboard counters', {
    t: 'Functional', p: 'P2', role: 'Owner',
    pre: 'Property with 0 residents',
    steps: [
      'Note the dashboard occupancy => 0/4',
      'Add a resident => Dashboard occupancy becomes 1/4 and "Total collected" excludes the new resident until a payment exists',
      'Return to Inmates => The resident appears once',
    ],
  }),
];
