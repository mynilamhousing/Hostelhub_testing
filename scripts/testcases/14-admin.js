import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('ADM-001', 'Admin', 'Login', 'Platform admin signs in to /admin', {
    t: 'Functional', p: 'P0', role: 'Admin',
    pre: 'A platform admin account exists',
    steps: [
      'Open /admin signed out => Admin login screen (not the owner login)',
      'Enter admin credentials => /admin dashboard opens with "Admin panel"',
      'Check the redirect from /home => An admin is always routed back to /admin',
    ],
  }),

  tc('ADM-002', 'Admin', 'Login', 'Wrong admin password is rejected', {
    t: 'Negative', p: 'P1', role: 'Admin',
    steps: [
      'Submit a wrong password => Error message; stays on the admin login',
      'Submit a valid owner account on the admin login => Rejected (owners cannot enter /admin)',
      'Confirm the owner session is not created by the admin form',
    ],
  }),

  tc('ADM-003', 'Admin', 'Stats', 'Admin dashboard lists clients and owners', {
    t: 'Functional', p: 'P1', role: 'Admin',
    pre: 'At least two owner accounts with properties',
    steps: [
      'Open /admin => "Clients" list with owner names and properties',
      'Read the counts => Owners and properties match the database',
      'With no owners => "No owner accounts yet."',
    ],
  }),

  tc('ADM-004', 'Admin', 'Pricing', 'Admin saves the global rates', {
    t: 'Functional', p: 'P1', role: 'Admin',
    data: 'Monthly 199 / Yearly 5999 / Extra property 99',
    steps: [
      'Open "Global rates" => Fields Monthly (₹/mo), Yearly (₹/yr), Extra property (₹/mo)',
      'Change the values and tap "Save global rates" => Toast "Global rates saved"',
      'Reload and check GET /pricing => New values returned to every client',
      'Open the owner Upgrade screen => Shows the new prices',
    ],
  }),

  tc('ADM-005', 'Admin', 'Pricing', 'Global rates validate input', {
    t: 'Validation', p: 'P2', role: 'Admin',
    steps: [
      'Save with an empty monthly price => Rejected',
      'Save a negative or zero price => Rejected or accepted with a warning; record which',
      'Save an extremely large value (10^9) => Accepted or capped, no overflow in the UI',
    ],
  }),

  tc('ADM-006', 'Admin', 'Override', 'Admin sets a per-owner price override', {
    t: 'Functional', p: 'P1', role: 'Admin',
    pre: 'An owner with a known id',
    steps: [
      'Open "Override for <owner>" => Fields for the override amount',
      'Set 149 and save => "Override" state shown for that owner',
      'Owner opens Upgrade => Sees ₹149 instead of the global rate',
      'Clear override => Owner sees the global rate again',
    ],
  }),

  tc('ADM-007', 'Admin', 'Override', 'Override is scoped to one owner', {
    t: 'Security', p: 'P1', role: 'Admin',
    pre: 'Two owners',
    steps: [
      'Set an override for owner A => Only A\'s billing changes',
      'Owner B opens Upgrade => Global rate, unchanged',
      'Check GET /pricing for B => No override leakage',
    ],
  }),

  tc('ADM-008', 'Admin', 'Authorization', 'Admin endpoints reject non-admin tokens', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    steps: [
      'GET /admin/stats with an owner token => 401/403',
      'POST /admin/pricing with an owner token => 401/403 and rates unchanged',
      'GET /owners with an owner token => 401/403',
      'Repeat with no token => 401',
    ],
  }),

  tc('ADM-009', 'Admin', 'Session', 'Admin session behaves like any other session', {
    t: 'Functional', p: 'P2', role: 'Admin',
    steps: [
      'Reload /admin => Still signed in',
      'Navigate to /home => Redirected back to /admin',
      'Log out (or clear the token) => /admin requires login again',
    ],
  }),

  tc('ADM-010', 'Admin', 'UI', 'Admin panel is usable on a laptop screen', {
    t: 'UI', p: 'P3', role: 'Admin',
    steps: [
      'Open /admin at 1440×900 => Table and forms are readable, no horizontal scroll',
      'Open at 390×844 => Content stacks; actions still reachable',
      'Check long owner names => Wrapped or ellipsised, no overlap',
    ],
  }),
];
