import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('DEP-001', 'Deposits', 'Record deposit', 'Owner records a security deposit', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'A resident exists with no deposit',
    data: 'Amount: 10000',
    steps: [
      'Deposits → select the resident → "Record deposit" => Form with "Amount (₹)" and Save',
      'Enter 10000 and save => Summary shows "Collected ₹10000 · Refundable ₹10000"',
      'Open the resident detail → Security deposit => Same amount, refundable',
      'Reload => Deposit persists',
    ],
    post: 'deposits row created',
  }),

  tc('DEP-002', 'Deposits', 'Record deposit', 'An inmate must be selected first', {
    t: 'Validation', p: 'P1', role: 'Owner',
    pre: 'Two residents with no selection made',
    steps: [
      'Open Deposits without tapping a resident => "Tap an inmate to select them"',
      'Attempt to save a deposit => Message "Select an inmate first"; nothing saved',
      'Select a resident and save => Deposit recorded for that resident only',
    ],
  }),

  tc('DEP-003', 'Deposits', 'Record deposit', 'Amount validation', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Save with an empty amount => Message "Enter a valid amount"',
      'Save with 0 or a negative value => Rejected',
      'Save with a non-numeric value => Field rejects input',
      'Save with 1,00,000 => Accepted; refundable equals collected',
    ],
  }),

  tc('DEP-004', 'Deposits', 'Deductions', 'Owner adds a deduction', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Deposit of ₹10000 recorded',
    data: 'Deduction: 1500 / Reason: Broken chair',
    steps: [
      'Open the deposit → "Add deduction" => Form with Amount, Reason, Save',
      'Enter 1500 and the reason and save => "Deducted ₹1500 · Refundable ₹8500"',
      'Add a second deduction of 500 => Deducted ₹2000, refundable ₹8000',
      'Reload => Both deductions listed',
    ],
  }),

  tc('DEP-005', 'Deposits', 'Deductions', 'Deductions cannot exceed the deposit', {
    t: 'Boundary', p: 'P1', role: 'Owner',
    pre: 'Deposit ₹10000 with ₹2000 deducted (refundable ₹8000)',
    steps: [
      'Add a deduction of 9000 => Rejected with a message (would make the refundable negative)',
      'Add exactly 8000 => Accepted; refundable ₹0',
      'Attempt one more deduction => Rejected',
    ],
  }),

  tc('DEP-006', 'Deposits', 'Deductions', 'Deduction reason is required and bounded', {
    t: 'Validation', p: 'P2', role: 'Owner',
    steps: [
      'Save a deduction without a reason => Rejected or saved with a placeholder; behaviour documented',
      'Enter a 200-character reason => Accepted and wrapped',
      'Enter a negative amount => Rejected',
    ],
  }),

  tc('DEP-007', 'Checkout', 'Initiate', 'Owner initiates a checkout', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Resident with a deposit and no open checkout',
    data: 'Vacate date: today+7',
    steps: [
      'Checkout screen → select the resident → "Initiate checkout" => "Vacating <date>" recorded',
      'Set the vacate date and confirm => The checkout appears under "No checkouts yet." replaced by the new row',
      'Reload => Checkout persists with pending state',
    ],
    post: 'checkouts row created',
  }),

  tc('DEP-008', 'Checkout', 'Initiate', 'Vacate date is required and valid', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Initiate without a vacate date => Blocked with a message',
      'Use a past date => Allowed or rejected; documented, but never a malformed value',
      'Use "31-02-2026" => Rejected',
    ],
  }),

  tc('DEP-009', 'Checkout', 'Complete', 'Owner completes checkout and settles the deposit', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Checkout initiated; deposit ₹10000 with ₹1500 deducted',
    steps: [
      'Tap "Complete checkout & settle deposit" => Confirmation with "Refundable ₹8500"',
      'Enter the refund amount 8500 and confirm => Toast success; "Complete" state shown',
      'Resident room occupancy => Decremented; the resident is marked "Checked out" in the detail',
      'Reload => State persisted, no duplicate checkout rows',
    ],
    post: 'checkout completed; residents can no longer pay rent',
  }),

  tc('DEP-010', 'Checkout', 'Complete', 'Refund amount is validated', {
    t: 'Boundary', p: 'P1', role: 'Owner',
    pre: 'Refundable ₹8500',
    steps: [
      'Enter a refund above 8500 => Rejected',
      'Enter a negative refund => Rejected',
      'Enter 0 => Accepted (full forfeit) with a clear label',
      'Enter 8500 => Accepted and the summary shows refunded = 8500',
    ],
  }),

  tc('DEP-011', 'Checkout', 'Complete', 'Completing twice is not possible', {
    t: 'Negative', p: 'P1', role: 'Owner',
    pre: 'A completed checkout',
    steps: [
      'Re-open the checkout => No "Complete" action remains',
      'Force POST the completion again => Rejected or idempotent; deposit not refunded twice',
    ],
  }),

  tc('DEP-012', 'Deposits', 'Resident view', 'Resident sees their deposit and refundable amount', {
    t: 'Functional', p: 'P1', role: 'Resident',
    pre: 'Deposit ₹10000, deduction ₹1500',
    steps: [
      'Resident → "My deposit" => Collected ₹10000, deducted ₹1500, refundable ₹8500',
      'No deposit recorded => "No deposit recorded yet."',
      'After checkout completion => Final refunded amount shown',
    ],
  }),

  tc('DEP-013', 'Deposits', 'Isolation', 'Deposits are per resident and per property', {
    t: 'Security', p: 'P0', role: 'Resident', plat: 'API',
    pre: 'Two residents with deposits',
    steps: [
      'As resident A, GET /deposits?inmate_id=<B> => Empty or 403',
      'As owner A, GET /deposits?property_id=<B> => Empty or 403',
      'As resident A, POST a deposit row => Rejected (owner-only action)',
    ],
  }),

  tc('DEP-014', 'Checkout', 'Effects', 'Checkout removes the resident from active lists', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Resident completed checkout',
    steps: [
      'Inmates list => Resident marked "Checked out" (or excluded from active occupancy)',
      'Room occupancy => Bed freed and reusable for a new resident',
      'Add resident into that bed => Succeeds',
    ],
  }),

  tc('DEP-015', 'Deposits', 'API', 'Deposit and checkout endpoints validate input', {
    t: 'API', p: 'P2', role: 'Owner', plat: 'API',
    steps: [
      'POST /deposits without inmate_id => 400',
      'POST /deposits with a negative amount => 400',
      'POST /checkouts without vacate_date => 400',
      'POST /checkouts with a valid body => 200/201 with id and status',
    ],
  }),

  tc('DEP-016', 'Checkout', 'UI', 'Checkout screen explains the settlement', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'Checkout in progress',
    steps: [
      'Open the checkout => "Deposit summary" with collected, deductions, refundable',
      'Read the primary action => "Complete checkout & settle deposit"',
      'Check the empty state => "No checkouts yet."',
    ],
  }),
];
