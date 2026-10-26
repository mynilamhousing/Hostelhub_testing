import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('VIS-001', 'Visitors', 'Log visitor', 'Owner logs a visitor checking in', {
    t: 'Functional', p: 'P1', role: 'Owner',
    data: 'Visitor: Ravi Kumar / Phone: 9876500010 / Visiting: Asha Verma / Purpose: Family',
    steps: [
      'Visitors → "Log visitor" => Form with Visitor name, Phone, Visiting (inmate), Purpose, "Check in"',
      'Fill the fields and choose the resident => Values accepted',
      'Tap "Check in" => Visitor appears in the list as "Ravi Kumar · Visiting Asha Verma" with "Inside since <time>"',
      'Reload => Visitor still inside',
    ],
    post: 'visitors row with in_time set and out_time null',
  }),

  tc('VIS-002', 'Visitors', 'Check out', 'Owner checks a visitor out', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'A visitor is inside',
    steps: [
      'Tap "Check out" on the visitor => Row updates to "Left at <time>" and leaves the inside list',
      'Reload => out_time persisted; the entry is not duplicated',
      'Duration => Derived correctly from in/out times',
    ],
  }),

  tc('VIS-003', 'Visitors', 'Validation', 'Visitor name is required', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Submit with an empty visitor name => Validation message; no row created',
      'Submit with a name but no resident selected => Blocked with a clear message',
      'Submit with name + resident => Created',
    ],
  }),

  tc('VIS-004', 'Visitors', 'Validation', 'Phone and purpose rules', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Leave phone and purpose empty => Visitor still logged (they are optional)',
      'Enter phone "abc" => Rejected or accepted as text; verify it does not break the list',
      'Enter a 200-character purpose => Wrapped, no overflow',
    ],
  }),

  tc('VIS-005', 'Visitors', 'Double check-in', 'A visitor cannot be checked in twice simultaneously', {
    t: 'Negative', p: 'P2', role: 'Owner',
    pre: 'Ravi Kumar is currently inside',
    steps: [
      'Log the same visitor again => Either a second row is created (two visits) or blocked; behaviour documented',
      'Check the inside list => Exactly one "Inside since" row per open visit',
    ],
  }),

  tc('VIS-006', 'Visitors', 'Checkout without visit', 'Check out is not offered for a visitor already out', {
    t: 'Negative', p: 'P2', role: 'Owner',
    pre: 'A visitor who already left',
    steps: [
      'Open the Visitors list => The checked-out visitor shows "Left at <time>" without a Check out action',
      'Force POST a second checkout => Rejected or idempotent; out_time not overwritten silently',
    ],
  }),

  tc('VIS-007', 'Leave', 'Mark leave', 'Owner marks a resident on leave', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'A resident exists',
    data: 'Start: today / Return: today+3 / Reason: Home visit',
    steps: [
      'Open "Leave / attendance" → "Mark leave" => Form with Start date, Return date, Reason (optional)',
      'Fill the dates and submit => Toast "Leave marked"; the resident appears under leave with dates',
      'Reload => Record persists with the same dates',
    ],
    post: 'leave_records row created',
  }),

  tc('VIS-008', 'Leave', 'Validation', 'Leave dates are validated', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Enter a return date before the start date => Rejected with a clear message',
      'Enter a malformed date ("31-02-2026") => Rejected',
      'Leave the start date empty => Blocked',
      'Use the same date for start and return => Accepted (one-day leave)',
    ],
  }),

  tc('VIS-009', 'Leave', 'Resident view', 'Resident sees their own leave record', {
    t: 'Functional', p: 'P1', role: 'Resident',
    pre: 'Owner marked a leave for this resident',
    steps: [
      'Resident → "Mark leave" / leave section => The record with dates is visible',
      'Another resident\'s leave is not visible',
      'Resident can request leave (if the "Mark leave" resident action exists) => Creates a record the owner can see',
    ],
  }),

  tc('VIS-010', 'Leave', 'Empty state', 'Leave list is empty-safe', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'No leave records',
    steps: [
      'Open Leave => "No one on leave."',
      'With no property => "Set up your hostel first."',
    ],
  }),

  tc('VIS-011', 'Visitors', 'Isolation', 'Visitors are scoped per property and per resident', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    pre: 'Two properties with visitors',
    steps: [
      'GET /visitors?property_id=<other> with owner A token => Empty or 403',
      'As a resident, GET /visitors => Only visits addressed to them (or 403), never the whole property',
    ],
  }),

  tc('VIS-012', 'Leave', 'Isolation', 'Leave records do not cross properties', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    steps: [
      'GET /leave?property_id=<other> => Empty or 403',
      'As resident A, GET /leave?inmate_id=<B> => Empty or 403',
    ],
  }),

  tc('VIS-013', 'Visitors', 'API', 'Visitor and leave endpoints validate payloads', {
    t: 'API', p: 'P2', role: 'Owner', plat: 'API',
    steps: [
      'POST /visitors with {} => 400',
      'POST /visitors with a valid body => 200/201 with in_time',
      'POST /leave with return_date < start_date => 400',
      'GET both resources => Arrays with the created rows',
    ],
  }),

  tc('VIS-014', 'Visitors', 'UI', 'Visitor list shows who is inside right now', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'Two visitors inside, one already left',
    steps: [
      'Open Visitors => The two inside rows show "Inside since <time>" and a Check out action',
      'The departed visitor shows "Left at <time>" without the action',
      'Counts on screen match the rows',
    ],
  }),
];
