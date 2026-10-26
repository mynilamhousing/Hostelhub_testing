import { tc, PRE, DATA } from './_helpers.js';

export const cases = [
  tc('ONB-001', 'Onboarding', 'Empty state', 'New owner is pushed into setup', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: PRE.ownerNoProp,
    steps: [
      'Sign in with a fresh owner account => Dashboard shows "Set up your hostel" with a "Get started" action',
      'Tap "Get started" => /setup opens with "Set up your property"',
      'Open the Inmates tab => Empty state "No hostel yet · Set up your hostel to start adding rooms and inmates"',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-ONB-01',
  }),

  tc('ONB-002', 'Onboarding', 'Create property', 'Owner creates a hostel with valid details', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Owner signed in with no property',
    data: 'Property name: QA Hostel / Type: Hostel / Address: 12 Test Road, Pune',
    steps: [
      'Open /setup => Section "Tell us about your hostel" with Property name, Property type, Address (optional)',
      'Enter name, pick type "Hostel", enter the address => Fields accept the values',
      'Tap "Next" => Section "Add your rooms" appears',
      'Observe the header => "Room number + bed capacity. Add as many as you need."',
    ],
    post: 'properties row created for owner_id',
    auto: 'tests/web/e2e.spec.js › E2E-ONB-02 · E2E-ONB-03',
  }),

  tc('ONB-003', 'Onboarding', 'Create property', 'Property name is mandatory', {
    t: 'Validation', p: 'P0', role: 'Owner',
    steps: [
      'Open /setup and leave Property name empty => "Next" is tappable',
      'Tap "Next" => Message "Enter a hostel name"; stays on step 1',
      'Enter a name and continue => Advances to rooms',
    ],
  }),

  tc('ONB-004', 'Onboarding', 'Create property', 'Property type drives the label and behaviour', {
    t: 'Functional', p: 'P2', role: 'Owner',
    steps: [
      'Select type "House (rent)" => Setup copy refers to the house; saved value is house',
      'Repeat with "Office space" => Saved value is office and the residents list still works',
      'Check /settings after setup => "Type: House (rent)" / "Type: Office space" is displayed correctly',
    ],
  }),

  tc('ONB-005', 'Onboarding', 'Create property', 'Address is optional', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Create a property with the address empty => Setup completes',
      'Open /settings => Address is blank, no placeholder artefact',
      'Enter a very long address (200 chars) in another property => Accepted or truncated, but saved without corruption',
    ],
  }),

  tc('ONB-006', 'Onboarding', 'Rooms', 'Owner adds a room with number and capacity', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Owner is on the rooms step of /setup',
    data: 'Room no.: R101 / Beds: 4',
    steps: [
      'Enter "R101" and capacity "4" => Values accepted',
      'Tap "Add room" => Room chip "Room R101" appears in the list; form resets',
      'Add a second room "R102" with 2 beds => Both chips listed',
      'Tap "Finish setup" => Dashboard opens with the property name and occupancy 0/6',
    ],
    post: 'rooms rows created for the property',
    auto: 'tests/web/e2e.spec.js › E2E-ONB-02 · E2E-ONB-03',
  }),

  tc('ONB-007', 'Onboarding', 'Rooms', 'Room number is required', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Leave Room no. empty and tap "Add room" => No room is created; a validation message is shown',
      'Enter a room number only and add => Room is created with the default capacity',
    ],
  }),

  tc('ONB-008', 'Onboarding', 'Rooms', 'Bed capacity boundaries', {
    t: 'Boundary', p: 'P1', role: 'Owner',
    steps: [
      'Enter capacity 0 and add => Rejected (must be at least 1)',
      'Enter capacity 1 => Room created with 1 bed',
      'Enter capacity 50 => Accepted; occupancy reads 0/50',
      'Enter "abc" or negative "-2" => Rejected, no room created',
    ],
  }),

  tc('ONB-009', 'Onboarding', 'Rooms', 'Duplicate room numbers are rejected', {
    t: 'Negative', p: 'P1', role: 'Owner',
    steps: [
      'Add room R101, then add R101 again => Second attempt is refused (duplicate message or existing chip updated, never two R101 rows)',
      'Query GET /rooms?property_id=... => Exactly one R101 row',
      'Add "r101" (lowercase) => Treated as the same room or accepted as distinct; behaviour recorded',
    ],
  }),

  tc('ONB-010', 'Onboarding', 'Rooms', 'Rooms can be added later from the Inmates tab', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: PRE.owner,
    steps: [
      'Open Inmates => "Rooms" section with "Add room"',
      'Add room "R201" with 3 beds => Appears immediately with "0 / 3 beds"',
      'Reload => Room still present',
    ],
  }),

  tc('ONB-011', 'Onboarding', 'Rooms', 'Room chip shows live occupancy', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'Room R101 capacity 4 with 1 resident',
    steps: [
      'Open Inmates => Room R101 shows "1 / 4 beds"',
      'Add another resident to R101 => Count becomes "2 / 4" without a manual refresh',
    ],
  }),

  tc('ONB-012', 'Onboarding', 'Rooms', 'A full room is blocked for new residents', {
    t: 'Negative', p: 'P1', role: 'Owner',
    pre: 'Room R101 (capacity 1) already has 1 resident',
    steps: [
      'Tap "Add inmate" => Room picker lists R101 as "Room R101 (1/1)"',
      'Select R101 => Message "Room R101 is full (1/1)"; the form cannot submit',
    ],
  }),

  tc('ONB-013', 'Onboarding', 'Resume', 'Setup state survives a reload', {
    t: 'Functional', p: 'P2', role: 'Owner',
    steps: [
      'On the rooms step, add one room, then reload the page => Property still exists; rooms step shows the saved room',
      'Complete setup and reload => Dashboard still bound to the property',
    ],
  }),

  tc('ONB-014', 'Onboarding', 'Multiple properties', 'Owner adds a second property', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Owner already owns "QA Hostel"',
    steps: [
      'From the dashboard property menu choose "Add property" => Setup opens for a new property',
      'Create "QA Annex" with room A1 => Both properties exist for the owner',
      'GET /properties?owner_id=... => Two rows, correct owner_id',
    ],
    notes: 'Extra properties are billed — see the Upgrade screen rules (ADM/UPG cases).',
  }),

  tc('ONB-015', 'Onboarding', 'Multiple properties', 'Owner switches between properties', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Owner has two properties with distinct residents',
    steps: [
      'Open the property switcher on the dashboard => Both properties listed',
      'Select the second property => Dashboard, Inmates and Polls all switch to that property',
      'Reload => The selected property persists',
    ],
  }),

  tc('ONB-016', 'Onboarding', 'Empty states', 'Every owner screen explains what is missing', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'Newly created property with no residents',
    steps: [
      'Inmates => "No inmates yet — add your first inmate."',
      'Polls => "No polls yet — create your first mess poll."',
      'Expenses => "No expenses logged."',
      'Complaints => "No complaints yet."',
      'Visitors / Leave => "No visitors yet." / "No one on leave."',
      'Documents => "No documents yet."',
    ],
  }),

  tc('ONB-017', 'Onboarding', 'Permissions', 'Resident cannot open setup', {
    t: 'Security', p: 'P0', role: 'Resident',
    pre: PRE.resident,
    steps: [
      'Navigate to /setup => Redirected to /home',
      'Call POST /properties with the resident token => 401/403; no property created',
    ],
  }),

  tc('ONB-018', 'Onboarding', 'API', 'Property creation rejects invalid payloads', {
    t: 'API', p: 'P1', role: 'Owner', plat: 'API',
    steps: [
      'POST /properties with {} => 400 with an error field',
      'POST with name only (no type) => 400 or type defaults to hostel — value must be one of hostel/house/office',
      'POST with type "castle" => Rejected or normalised; never stored as "castle"',
      'POST a valid payload => 201 with the created property id',
    ],
  }),

  tc('ONB-019', 'Onboarding', 'API', 'Rooms cannot belong to another owner', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    pre: 'Two owners, each with a property',
    steps: [
      'POST /rooms with property_id belonging to owner B => 401/403 or the row is rejected',
      'GET /rooms?property_id=<B> with owner A token => Empty list or 403, never B rows',
    ],
  }),

  tc('ONB-020', 'Onboarding', 'UI', 'Setup is usable on a phone viewport', {
    t: 'Compatibility', p: 'P2', role: 'Owner', plat: 'Web (390×844) · Android · iOS',
    steps: [
      'Open /setup at 390×844 => No horizontal scroll, fields full width, buttons reachable',
      'Open the keyboard in the room number field => Field scrolls into view above the keyboard',
      'Rotate to landscape => Layout remains usable',
    ],
  }),
];
