import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('CMP-001', 'Complaints', 'Raise', 'Resident raises a complaint', {
    t: 'Functional', p: 'P0', role: 'Resident',
    data: 'Description: Geyser not working in bathroom 2',
    steps: [
      'Resident → "Raise a complaint" => Form "What needs fixing?" with Describe the issue and "Submit complaint"',
      'Type the description and submit => Toast "Complaint submitted"; the complaint appears in the resident list',
      'Owner opens Complaints => The same complaint is listed with the resident name and timestamp',
    ],
    post: 'complaints row created with status open',
  }),

  tc('CMP-002', 'Complaints', 'Raise', 'Empty description is blocked', {
    t: 'Validation', p: 'P1', role: 'Resident',
    steps: [
      'Submit with an empty description => Message "Enter a description"; nothing saved',
      'Submit whitespace only => Blocked',
      'Submit one word => Accepted',
    ],
  }),

  tc('CMP-003', 'Complaints', 'Raise', 'Long description is handled', {
    t: 'Boundary', p: 'P2', role: 'Resident',
    steps: [
      'Submit 1000 characters => Accepted and wrapped in the list/detail',
      'Submit 10000 characters => Accepted or rejected with a limit message; no crash',
      'Include line breaks and emoji => Preserved',
    ],
  }),

  tc('CMP-004', 'Complaints', 'Owner list', 'Owner sees all complaints for the property', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Two residents, one complaint each',
    steps: [
      'Open Complaints => Both complaints with resident, description, status and time',
      'Reload => Same rows, no duplicates',
      'With no complaints => "No complaints yet."',
    ],
  }),

  tc('CMP-005', 'Complaints', 'Status', 'Owner moves a complaint through statuses', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'An open complaint exists',
    steps: [
      'Tap the status action ("Mark in progress" / "Mark resolved") => Status changes and persists after reload',
      'Resident side => Sees the updated status on their complaint',
      'Dashboard "Open complaints" counter => Decreases when a complaint is resolved',
    ],
  }),

  tc('CMP-006', 'Complaints', 'Status', 'Status cannot skip backwards silently', {
    t: 'Negative', p: 'P2', role: 'Owner',
    steps: [
      'Resolve a complaint, then attempt to mark it open again (if offered) => Allowed with an audit trail or refused; behaviour documented',
      'Confirm the resident view matches the final state',
    ],
  }),

  tc('CMP-007', 'Complaints', 'Resident view', 'Resident sees only their own complaints', {
    t: 'Security', p: 'P0', role: 'Resident',
    pre: 'Residents A and B each raised a complaint',
    steps: [
      'As A, open Complaints => Only A\'s complaints',
      'As A, GET /complaints?property_id=... => Only A\'s rows (server-side filter by inmate)',
      'As A, GET /complaints?inmate_id=<B> => Empty or 403',
    ],
  }),

  tc('CMP-008', 'Complaints', 'Isolation', 'Another owner cannot see the complaint', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    steps: [
      'As owner B, GET /complaints?property_id=<A> => Empty or 403',
      'App: B\'s Complaints screen does not list A\'s rows',
    ],
  }),

  tc('CMP-009', 'Complaints', 'Empty state', 'Complaints screen adapts by role and setup', {
    t: 'UI', p: 'P2', role: 'All',
    steps: [
      'Owner with no property => "Set up your hostel first."',
      'Owner with a property and no complaints => "No complaints yet."',
      'Resident with no complaints => Empty state with the "Raise a complaint" action',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-OPS-01',
  }),

  tc('CMP-010', 'Complaints', 'Detail', 'Complaint detail shows the full thread of facts', {
    t: 'UI', p: 'P2', role: 'Owner',
    steps: [
      'Open a complaint => Description in full, resident, room/bed, created time, current status',
      'Check truncation => Long text is fully readable (expand or scroll)',
    ],
  }),

  tc('CMP-011', 'Complaints', 'Dashboard', 'Open complaint count is accurate', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Three complaints: two open, one resolved',
    steps: [
      'Dashboard "Open complaints" => 2',
      'Resolve one => Counter becomes 1',
      'Resident raises a new one => Counter returns to 2 on refresh',
    ],
  }),

  tc('CMP-012', 'Complaints', 'Validation', 'Injection and special characters are safe', {
    t: 'Security', p: 'P2', role: 'Resident',
    steps: [
      'Submit "<img src=x onerror=alert(1)>" => Displayed as text, never executed',
      'Submit SQL-looking text "\' OR 1=1 --" => Stored verbatim; the list still loads (parameterised queries)',
      'Submit emoji => Rendered correctly',
    ],
  }),

  tc('CMP-013', 'Complaints', 'API', 'Complaint API validates input', {
    t: 'API', p: 'P1', role: 'Resident', plat: 'API',
    steps: [
      'POST /complaints without property_id => 400',
      'POST with an empty description => 400',
      'POST a valid complaint => 201/200 with the created id and status open',
      'PATCH status to an unknown value => 400, status unchanged',
    ],
  }),

  tc('CMP-014', 'Complaints', 'Cross-role', 'Owner cannot raise a complaint on behalf of a resident', {
    t: 'Negative', p: 'P2', role: 'Owner',
    steps: [
      'Open /complaints/new as the owner => Redirected to /home (route is resident-only)',
      'POST /complaints as owner with a resident id => Rejected or accepted as owner-authored; behaviour documented',
    ],
  }),
];
