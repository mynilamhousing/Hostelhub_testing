import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('POLL-001', 'Polls', 'Create poll', 'Owner creates a mess poll for tomorrow', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Property with 3 residents',
    data: 'Meal: Dinner / Date: tomorrow / Options: Yes, No / Repeat daily: off',
    steps: [
      'Polls → "New poll" => Sheet "New mess poll" with Meal, date, options, "Repeat daily"',
      'Pick meal "Dinner" and tomorrow\'s date => Values accepted',
      'Keep the default Yes/No options and tap "Create poll" => Toast "Poll created"; the poll card appears under "Mess polls"',
      'Read the card => "Are you eating?" with Dinner, "For tomorrow · one-tap Yes/No", and response counts',
    ],
    post: 'polls row created with property_id and options JSON',
    auto: 'tests/web/e2e.spec.js › E2E-POLL-01 (list rendering)',
  }),

  tc('POLL-002', 'Polls', 'Create poll', 'Meal selection covers breakfast, lunch and dinner', {
    t: 'Functional', p: 'P2', role: 'Owner',
    steps: [
      'Create a poll with meal Breakfast => Card shows Breakfast',
      'Create with Lunch => Card shows Lunch',
      'Check the poll list ordering => Newest first, each with its own meal label',
    ],
  }),

  tc('POLL-003', 'Polls', 'Create poll', 'Custom options are accepted', {
    t: 'Functional', p: 'P1', role: 'Owner',
    data: 'Options: Yes, No, Maybe',
    steps: [
      'Add a third option "Maybe" => Option chip added',
      'Create the poll => Card lists all three options for residents',
      'As a resident vote "Maybe" => Vote recorded against that option',
      'Tally => Maybe = 1, others 0',
    ],
  }),

  tc('POLL-004', 'Polls', 'Create poll', 'Poll requires at least two options', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Remove all but one option and create => Rejected with a validation message',
      'Remove every option => "Create poll" stays disabled or shows the message',
      'Restore Yes/No and create => Succeeds',
    ],
  }),

  tc('POLL-005', 'Polls', 'Create poll', 'Duplicate and blank options are rejected', {
    t: 'Negative', p: 'P2', role: 'Owner',
    steps: [
      'Add "Yes" twice => Duplicate is refused or collapsed into one chip',
      'Leave an option blank => Blank option is not saved',
      'Create with Yes/No => Poll card shows exactly two options',
    ],
  }),

  tc('POLL-006', 'Polls', 'Create poll', 'Past dates are refused or clearly marked', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Pick yesterday and create => Rejected, or created and immediately marked closed; record which',
      'Pick today => Poll is open for the current day',
      'Pick 30 days ahead => Accepted',
    ],
  }),

  tc('POLL-007', 'Polls', 'Create poll', 'Repeat-daily flag is persisted', {
    t: 'Functional', p: 'P2', role: 'Owner',
    steps: [
      'Create a poll with "Repeat daily" on => Card shows the recurring marker',
      'Call GET /polls => recurring = true for that poll',
      'Create one with it off => recurring = false',
    ],
  }),

  tc('POLL-008', 'Polls', 'Vote', 'Resident votes with one tap', {
    t: 'Functional', p: 'P0', role: 'Resident',
    pre: 'Open poll exists for the resident\'s property',
    steps: [
      'Home or Polls tab → poll card => Poll visible with the Yes/No options for the resident',
      'Tap "Yes" => Immediate confirmation; card shows "You said Yes"',
      'Refresh => Vote persists; the option stays selected',
      'Owner side => Response count includes this resident',
    ],
    post: 'poll_responses row created',
    auto: 'Manual',
  }),

  tc('POLL-009', 'Polls', 'Vote', 'A resident can change their vote before the poll closes', {
    t: 'Functional', p: 'P1', role: 'Resident',
    pre: 'Resident already voted Yes',
    steps: [
      'Tap "No" => Vote switches; "You said No"',
      'Owner tally => Yes decremented, No incremented (not a duplicate row)',
      'Reload as the resident => No remains selected',
    ],
  }),

  tc('POLL-010', 'Polls', 'Vote', 'Double-tap does not duplicate a vote', {
    t: 'Negative', p: 'P1', role: 'Resident',
    steps: [
      'Tap "Yes" twice quickly => Only one response row for this resident and poll',
      'Owner tally => Total responses equals the number of distinct residents who voted',
    ],
  }),

  tc('POLL-011', 'Polls', 'Vote', 'Voting on a closed poll is blocked', {
    t: 'Negative', p: 'P1', role: 'Resident',
    pre: 'A poll whose date has passed',
    steps: [
      'Open the poll => Marked closed / options disabled',
      'Attempt to vote via the API POST /poll-responses => 400/409, no row created',
      'Owner view => Poll shown as closed with final tallies',
    ],
  }),

  tc('POLL-012', 'Polls', 'Vote', 'Only residents of the property can vote', {
    t: 'Security', p: 'P0', role: 'Resident', plat: 'API',
    pre: 'Two properties, each with residents and polls',
    steps: [
      'As a resident of property A, POST a response for a poll of property B => 403/400',
      'As the owner, attempt to vote on a resident poll => Refused (owner is not a respondent)',
    ],
  }),

  tc('POLL-013', 'Polls', 'Results', 'Owner sees live tallies', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: '3 residents, 2 voted',
    steps: [
      'Open the poll card => Counts per option and "No response: 1"',
      'A third resident votes => Counts update on refresh',
      'When everyone voted => "All responded ✓"',
    ],
  }),

  tc('POLL-014', 'Polls', 'Nudge', 'Owner nudges non-responders', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Poll with 3 pending residents',
    steps: [
      'Tap "Nudge 3 non-responders" => Toast "Nudge sent to 3 inmates"',
      'Nudge again immediately => Either cooldown message or another send; record behaviour, no crash',
      'With everyone responded => Nudge action hidden or disabled',
    ],
  }),

  tc('POLL-015', 'Polls', 'Results', 'Empty poll shows zero counts', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'Fresh poll with no votes',
    steps: [
      'Open the card => 0 per option, pending count equals the number of residents',
      'Check the bar/ring rendering => No divide-by-zero artefacts (NaN, 100% for zero votes)',
    ],
  }),

  tc('POLL-016', 'Polls', 'List', 'Poll list is ordered and complete', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'Three polls created on different days',
    steps: [
      'Open Polls => Newest first; each card shows meal, date, options and counts',
      'Reload => Same order, no duplicates',
      'Delete/close a poll if the UI offers it => List updates accordingly',
    ],
  }),

  tc('POLL-017', 'Polls', 'Empty state', 'Polls screen guides a new owner', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'No polls yet',
    steps: [
      'Open Polls => "No polls yet — create your first mess poll." with a create action',
      'With no property => "Set up your hostel first."',
    ],
  }),

  tc('POLL-018', 'Polls', 'API', 'Poll creation validates the payload', {
    t: 'API', p: 'P1', role: 'Owner', plat: 'API',
    steps: [
      'POST /polls with {} => 400',
      'POST without property_id => 400',
      'POST with options as a plain string => Stored as a JSON array or rejected, never corrupt',
      'GET /polls?property_id=... => options parsed back into an array for the client',
    ],
  }),

  tc('POLL-019', 'Polls', 'Isolation', 'Polls are scoped to the property', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    pre: 'Two owners with polls',
    steps: [
      'GET /polls?property_id=<other> with owner A token => Empty or 403, never B\'s polls',
      'Open the Polls tab in the app => Only the selected property\'s polls',
    ],
  }),

  tc('POLL-020', 'Polls', 'Concurrency', 'Simultaneous votes tally correctly', {
    t: 'Functional', p: 'P2', role: 'Resident',
    pre: '10 residents, open poll',
    steps: [
      'Have 10 residents vote within a few seconds (parallel API calls) => 10 distinct responses',
      'Owner tally => Counts sum to 10, no lost updates',
      'Check the DB => 10 rows, one per resident',
    ],
  }),

  tc('POLL-021', 'Polls', 'Resident view', 'Resident sees only their own vote state', {
    t: 'Security', p: 'P1', role: 'Resident',
    steps: [
      'Open Polls as resident A => "You said Yes" for A\'s vote only',
      'Check the payload => Other residents\' identities are not exposed, only aggregate counts',
      'Resident B opens the same poll => Sees B\'s own vote state',
    ],
  }),

  tc('POLL-022', 'Polls', 'Timezone', 'Poll date reflects the local day, not UTC', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Create a poll "for tomorrow" at 23:50 IST => Card shows the next local day, not the UTC day',
      'Create one at 00:10 IST => Same rule',
      'Resident opens it after midnight IST => Still "today"/closed per the local date',
    ],
    notes: 'IST is UTC+5:30; a UTC-based comparison shifts the day boundary by 5.5 hours.',
  }),
];
