/**
 * Test case catalogue — the single source of truth for the QA deliverables.
 *
 * `automation` points at the spec + test title that covers the case; cases
 * without it are manual checks. `scripts/generate-test-cases.js` turns this into
 * Excel, CSV (Jira) and Markdown.
 */
export const testCases = [
  // ── Smoke ─────────────────────────────────────────────────────────────────
  {
    id: 'SMK-01', module: 'Platform', title: 'API health endpoint responds',
    type: 'Smoke', priority: 'P1', severity: 'Critical',
    preconditions: 'Worker deployed',
    steps: ['GET /health'], expected: '200 with {"status":"ok"}',
    data: 'n/a', automation: 'tests/web/smoke.spec.js › SMK-01 API health endpoint responds',
  },
  {
    id: 'SMK-02', module: 'Authentication', title: 'App loads and shows the login screen',
    type: 'Smoke', priority: 'P1', severity: 'Critical',
    preconditions: 'Web app reachable',
    steps: ['Open the web app', 'Wait for the Flutter canvas to render semantics'],
    expected: '"Welcome back", Username and Password fields, Log in button are present',
    data: 'n/a', automation: 'tests/web/smoke.spec.js › SMK-02 app loads and shows the login screen',
  },
  {
    id: 'SMK-03', module: 'Dashboard', title: 'Owner signs in and sees the dashboard',
    type: 'Smoke', priority: 'P1', severity: 'Critical',
    preconditions: 'Owner account with a property',
    steps: ['Enter valid credentials', 'Tap Log in'],
    expected: 'Dashboard shows the property name and the KPI cards (Inmates, Occupancy, Rooms, Pending dues)',
    data: 'owner seeded per run', automation: 'tests/web/smoke.spec.js › SMK-03 owner signs in and sees the dashboard',
  },
  {
    id: 'SMK-04', module: 'Navigation', title: 'All owner tabs are reachable',
    type: 'Smoke', priority: 'P1', severity: 'High',
    preconditions: 'Owner signed in',
    steps: ['Open Inmates', 'Open Polls', 'Return to Home'],
    expected: 'Every tab renders without the router error page; Home returns to the dashboard',
    data: 'n/a', automation: 'tests/web/smoke.spec.js › SMK-04 owner tabs are all reachable',
  },
  {
    id: 'SMK-05', module: 'Inmates', title: 'Seeded resident is listed on the inmates tab',
    type: 'Smoke', priority: 'P1', severity: 'Critical',
    preconditions: 'Property with one resident (seeded via API)',
    steps: ['Reload the app', 'Open the Inmates tab'],
    expected: 'The resident name is listed',
    data: 'resident seeded', automation: 'tests/web/smoke.spec.js › SMK-05 seeded resident is listed on the inmates tab',
  },

  // ── Authentication ────────────────────────────────────────────────────────
  {
    id: 'E2E-AUTH-01', module: 'Authentication', title: 'Owner signs in with valid credentials',
    type: 'E2E', priority: 'P1', severity: 'Critical',
    preconditions: 'Owner account exists',
    steps: ['Open the app', 'Enter username and password', 'Tap Log in'],
    expected: 'User lands on /home and the dashboard renders for their property',
    data: 'owner seeded', automation: 'tests/web/auth.spec.js › E2E-AUTH-01 owner signs in with valid credentials',
  },
  {
    id: 'E2E-AUTH-02', module: 'Authentication', title: 'Invalid password keeps the user on the login screen',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'Valid owner account',
    steps: ['Enter a valid username with a wrong password', 'Tap Log in'],
    expected: 'Error message shown, route stays /login',
    data: 'WrongPass!1', automation: 'tests/web/auth.spec.js › E2E-AUTH-02 invalid password keeps the user on the login screen',
  },
  {
    id: 'E2E-AUTH-03', module: 'Authentication', title: 'Sign-up screen opens from login',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'App on the login screen',
    steps: ['Tap Sign up'], expected: 'Create-account screen is displayed',
    data: 'n/a', automation: 'tests/web/auth.spec.js › E2E-AUTH-03 sign-up screen opens from login',
  },
  {
    id: 'E2E-AUTH-04', module: 'Authentication', title: 'Forgot-password screen opens from login',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'App on the login screen',
    steps: ['Tap Forgot password?'], expected: 'Password reset screen is displayed',
    data: 'n/a', automation: 'tests/web/auth.spec.js › E2E-AUTH-04 forgot-password screen opens from login',
  },
  {
    id: 'E2E-AUTH-05', module: 'Authentication', title: 'Protected route redirects to login when signed out',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'No active session',
    steps: ['Navigate to #/expenses'],
    expected: 'Router redirects to /login and the login screen renders',
    data: 'n/a', automation: 'tests/web/auth.spec.js › E2E-AUTH-05 protected route redirects to login when signed out',
  },
  {
    id: 'E2E-AUTH-06', module: 'Authentication', title: 'Owner can sign out',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'Owner signed in',
    steps: ['Open More', 'Scroll to the bottom', 'Tap Log out'],
    expected: 'Session cleared and the login screen is shown',
    data: 'n/a', automation: 'tests/web/auth.spec.js › E2E-AUTH-06 owner can sign out',
  },
  {
    id: 'REG-SES-01', module: 'Authentication', title: 'Session survives a page reload',
    type: 'Regression', priority: 'P1', severity: 'High',
    preconditions: 'Owner signed in',
    steps: ['Reload the browser'], expected: 'User stays on /home and the dashboard re-renders',
    data: 'n/a', automation: 'tests/web/regression.spec.jssession.spec.js › REG-SES-01 session survives a page reload',
  },
  {
    id: 'REG-SES-02', module: 'Authentication', title: 'Empty credentials do not navigate',
    type: 'Regression', priority: 'P2', severity: 'Medium',
    preconditions: 'App on the login screen',
    steps: ['Tap Log in with both fields empty'], expected: 'No navigation; route stays /login',
    data: 'n/a', automation: 'tests/web/regression.spec.jssession.spec.js › REG-SES-02 empty credentials do not navigate',
  },
  {
    id: 'REG-SES-03', module: 'Authentication', title: 'Every protected route redirects when signed out',
    type: 'Regression', priority: 'P1', severity: 'High',
    preconditions: 'No active session',
    steps: ['Navigate to expenses, complaints, documents, settings, bills'],
    expected: 'Each route redirects to /login',
    data: 'n/a', automation: 'tests/web/regression.spec.jssession.spec.js › REG-SES-03 every protected route redirects to login when signed out',
  },
  {
    id: 'REG-SES-04', module: 'Authentication', title: 'Logout clears the persisted session',
    type: 'Regression', priority: 'P1', severity: 'High',
    preconditions: 'Owner signed in',
    steps: ['Log out', 'Reload the page'], expected: 'App returns to the login screen, no session restored',
    data: 'n/a', automation: 'tests/web/regression.spec.jssession.spec.js › REG-SES-04 logout clears the session',
  },

  // ── Onboarding ────────────────────────────────────────────────────────────
  {
    id: 'E2E-ONB-01', module: 'Onboarding', title: 'New owner sees the setup prompt',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'Owner without a property',
    steps: ['Sign in'], expected: '"Set up your hostel" prompt with a Get started button',
    data: 'fresh owner', automation: 'tests/web/onboarding.spec.js › E2E-ONB-01 new owner sees the setup prompt',
  },
  {
    id: 'E2E-ONB-02', module: 'Onboarding', title: 'Setup wizard opens from the prompt',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'New owner signed in',
    steps: ['Tap Get started'], expected: 'Wizard renders its first step without an error page',
    data: 'n/a', automation: 'tests/web/onboarding.spec.js › E2E-ONB-02 setup wizard opens from the prompt',
  },
  {
    id: 'E2E-ONB-03', module: 'Onboarding', title: 'Property and rooms appear on dashboard and inmates tab',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'Owner with property + room',
    steps: ['Check the dashboard', 'Open Inmates'], expected: 'Property name on both screens; rooms section present',
    data: 'property + room seeded', automation: 'tests/web/onboarding.spec.js › E2E-ONB-03 property + rooms appear on the dashboard and inmates tab',
  },
  {
    id: 'MNL-ONB-01', module: 'Onboarding', title: 'Complete the setup wizard end to end',
    type: 'Manual', priority: 'P1', severity: 'High',
    preconditions: 'New owner, no property',
    steps: ['Tap Get started', 'Fill property name, address, type, rent', 'Add two rooms with capacity', 'Finish'],
    expected: 'Property + rooms created, dashboard reflects them, data persists after reload',
    data: '2 rooms x 2 beds', automation: '',
  },

  // ── Inmates ───────────────────────────────────────────────────────────────
  {
    id: 'E2E-INM-01', module: 'Inmates', title: 'Inmates tab shows property, rooms and residents',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'Property with a room and a resident',
    steps: ['Open Inmates'], expected: 'Property name, Rooms section and the resident are listed',
    data: 'resident seeded', automation: 'tests/web/inmates.spec.js › E2E-INM-01 inmates tab shows the property, rooms and residents',
  },
  {
    id: 'E2E-INM-02', module: 'Inmates', title: 'Owner adds a resident through the form',
    type: 'E2E', priority: 'P1', severity: 'Critical',
    preconditions: 'Room with a free bed',
    steps: ['Inmates -> Add inmate', 'Select the room chip', 'Fill name, phone, email, bed, rent, due day', 'Tap Add inmate'],
    expected: 'Resident created, credentials shown, resident listed afterwards',
    data: 'bed 2, rent 7000, due day 10', automation: 'tests/web/inmates.spec.js › E2E-INM-02 owner adds a resident through the form',
  },
  {
    id: 'E2E-INM-03', module: 'Inmates', title: 'Resident created in the UI exists in the API',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'Room with a free bed',
    steps: ['Add a resident through the UI', 'GET /inmates?property_id=...'],
    expected: 'The API returns the resident with the same room and bed',
    data: 'bed 3', automation: 'tests/web/inmates.spec.js › E2E-INM-03 the resident created in the UI exists in the API',
  },
  {
    id: 'REG-OCC-01', module: 'Inmates', title: 'Room capacity cannot be exceeded',
    type: 'Regression', priority: 'P1', severity: 'High',
    preconditions: 'Room with capacity 3',
    steps: ['Fill the room', 'Attempt a fourth resident'],
    expected: 'API rejects with a "room is full" error', data: 'capacity 3',
    automation: 'tests/web/regression.spec.jsoccupancy.spec.js › REG-OCC-01 a room cannot exceed its capacity',
  },
  {
    id: 'REG-OCC-02', module: 'Inmates', title: 'A bed cannot be assigned twice',
    type: 'Regression', priority: 'P1', severity: 'High',
    preconditions: 'Resident on bed 1',
    steps: ['Attempt another resident on bed 1'],
    expected: 'API rejects with "bed already taken"', data: 'bed 1',
    automation: 'tests/web/regression.spec.jsoccupancy.spec.js › REG-OCC-02 a bed cannot be assigned twice',
  },
  {
    id: 'REG-OCC-03', module: 'Inmates', title: 'Bed number outside the room range is rejected',
    type: 'Regression', priority: 'P2', severity: 'Medium',
    preconditions: 'Room with capacity 3',
    steps: ['Attempt a resident on bed 99'], expected: 'API rejects with "bed out of range"',
    data: 'bed 99', automation: 'tests/web/regression.spec.jsoccupancy.spec.js › REG-OCC-03 bed number outside 1..capacity is rejected',
  },
  {
    id: 'REG-OCC-04', module: 'Inmates', title: 'API-created resident exposes room and bed',
    type: 'Regression', priority: 'P2', severity: 'Medium',
    preconditions: 'Property with a room',
    steps: ['Create a resident via API', 'List residents'],
    expected: 'Listed with the same room_no, bed_no and rent_amount',
    data: 'n/a', automation: 'tests/web/regression.spec.jsoccupancy.spec.js › REG-OCC-04 an API-created resident appears with room and bed',
  },
  {
    id: 'MNL-INM-02', module: 'Inmates', title: 'Regenerate resident credentials',
    type: 'Manual', priority: 'P2', severity: 'Medium',
    preconditions: 'Existing resident',
    steps: ['Open resident detail', 'Regenerate credentials', 'Sign in as the resident with the new password'],
    expected: 'New credentials work; the old password no longer does', data: 'n/a', automation: '',
  },

  // ── Rent ──────────────────────────────────────────────────────────────────
  {
    id: 'MNL-RNT-01', module: 'Rent', title: 'Record a rent payment and view the receipt',
    type: 'Manual', priority: 'P1', severity: 'High',
    preconditions: 'Resident with rent configured',
    steps: ['Open the resident', 'Tap Pay rent', 'Complete the payment', 'Open payment history'],
    expected: "Payment recorded, Today's collection increases, receipt available",
    data: 'Rs 6500', automation: '',
  },
  {
    id: 'MNL-RNT-02', module: 'Rent', title: 'Generate and share a PDF invoice',
    type: 'Manual', priority: 'P2', severity: 'Medium',
    preconditions: 'Resident with rent and email',
    steps: ['Open Bills & invoices', 'Generate the invoice', 'Download/share'],
    expected: 'PDF contains property, resident, amount and total; share works',
    data: 'n/a', automation: '',
  },

  // ── Polls ─────────────────────────────────────────────────────────────────
  {
    id: 'E2E-POLL-01', module: 'Polls', title: 'Polls tab renders an active poll',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'Property with a dinner poll',
    steps: ['Reload', 'Open Polls'], expected: 'Poll is listed with its meal and options',
    data: 'meal=dinner', automation: 'tests/web/polls.spec.js › E2E-POLL-01 polls tab renders an active poll',
  },
  {
    id: 'E2E-POLL-02', module: 'Polls', title: 'Poll options are an array and recurring is a boolean',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Poll created', steps: ['GET /polls?property_id=...'],
    expected: 'options === ["Yes","No"], recurring is true/false',
    data: 'n/a', automation: 'tests/web/polls.spec.js › E2E-POLL-02 API returns poll options as an array and recurring as boolean',
  },
  {
    id: 'E2E-POLL-03', module: 'Polls', title: 'Polls are scoped to their property',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Two properties',
    steps: ['Create a poll', 'List polls for the property'],
    expected: 'Every returned poll belongs to the requested property',
    data: 'n/a', automation: 'tests/web/polls.spec.js › E2E-POLL-03 poll creation is scoped to the property',
  },
  {
    id: 'MNL-POLL-01', module: 'Polls', title: 'Resident answers a poll and the owner sees the headcount',
    type: 'Manual', priority: 'P1', severity: 'High',
    preconditions: 'Open poll, active resident account',
    steps: ['Sign in as resident', 'Tap Yes', 'Sign in as owner', 'Open the poll'],
    expected: 'Headcount increases and the resident is listed as responding', data: 'n/a', automation: '',
  },

  // ── Operations ────────────────────────────────────────────────────────────
  {
    id: 'E2E-OPS-01', module: 'Operations', title: 'Complaints screen renders',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Owner signed in', steps: ['Open Complaints'],
    expected: 'Complaints list renders with an empty state or entries',
    data: 'n/a', automation: 'tests/web/ops.spec.js › E2E-OPS-01 complaints screen renders',
  },
  {
    id: 'E2E-OPS-02', module: 'Operations', title: 'Documents screen renders with its upload action',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Owner signed in', steps: ['Open Documents'],
    expected: 'Documents screen plus "Add hostel document"',
    data: 'n/a', automation: 'tests/web/ops.spec.js › E2E-OPS-02 documents screen renders with its upload action',
  },
  {
    id: 'E2E-OPS-03', module: 'Operations', title: 'Expenses screen shows the P&L summary',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Owner signed in', steps: ['Open Expenses'],
    expected: 'P&L header, income, expenses and net are displayed',
    data: 'n/a', automation: 'tests/web/ops.spec.js › E2E-OPS-03 expenses screen shows the P&L summary',
  },
  {
    id: 'E2E-OPS-04', module: 'Operations', title: 'Visitors, deposits, ratings and SOS render',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Owner signed in', steps: ['Open each screen'],
    expected: 'Each screen renders its heading with no router error page',
    data: 'n/a', automation: 'tests/web/ops.spec.js › E2E-OPS-04 visitors, deposits, ratings and SOS render',
  },
  {
    id: 'E2E-OPS-05', module: 'Operations', title: 'Settings, bills and chat render',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Owner signed in', steps: ['Open each screen'],
    expected: 'Each screen renders its heading with no router error page',
    data: 'n/a', automation: 'tests/web/ops.spec.js › E2E-OPS-05 settings, bills and chat render',
  },
  {
    id: 'E2E-OPS-06', module: 'Operations', title: 'Adding an expense reaches the P&L endpoint',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Owner signed in', steps: ['Open Expenses', 'Add expense (title, amount)', 'Save'],
    expected: 'GET /pnl returns income, expense and net as numbers',
    data: 'Electricity 1200', automation: 'tests/web/ops.spec.js › E2E-OPS-06 adding an expense reaches the P&L endpoint',
  },
  {
    id: 'MNL-OPS-01', module: 'Operations', title: 'Raise and resolve a complaint',
    type: 'Manual', priority: 'P1', severity: 'High',
    preconditions: 'Resident + owner accounts',
    steps: ['Resident raises a complaint', 'Owner opens Complaints', 'Move to In progress', 'Resolve with a note'],
    expected: 'Status open -> in progress -> resolved; resident sees the resolution',
    data: 'category=Plumbing', automation: '',
  },
  {
    id: 'MNL-OPS-02', module: 'Operations', title: 'Broadcast a notice to residents',
    type: 'Manual', priority: 'P2', severity: 'Medium',
    preconditions: 'Owner + resident accounts',
    steps: ['Owner posts a notice', 'Resident opens Notices'],
    expected: 'Notice appears with title and body', data: 'Water supply off 2-4pm', automation: '',
  },

  // ── API contract ──────────────────────────────────────────────────────────
  {
    id: 'REG-API-01', module: 'API', title: '/health and /pricing keep their shape',
    type: 'Regression', priority: 'P1', severity: 'High',
    preconditions: 'Worker deployed', steps: ['GET /health', 'GET /pricing'],
    expected: 'health is {status:"ok"}; pricing.global has monthly, yearly, extra_property numbers',
    data: 'n/a', automation: 'tests/web/regression.spec.jsapi.contract.spec.js › REG-API-01',
  },
  {
    id: 'REG-API-02', module: 'API', title: 'Register and login issue a signed JWT',
    type: 'Regression', priority: 'P1', severity: 'Critical',
    preconditions: 'None', steps: ['POST /auth/register', 'POST /auth/login'],
    expected: 'Three-part JWT; user payload never contains the password',
    data: 'new owner', automation: 'tests/web/regression.spec.jsapi.contract.spec.js › REG-API-02',
  },
  {
    id: 'REG-API-03', module: 'API', title: 'Wrong password is 401 without echoing the password',
    type: 'Regression', priority: 'P1', severity: 'High',
    preconditions: 'Existing owner', steps: ['POST /auth/login with a wrong password'],
    expected: '401 and the response body does not contain the password',
    data: 'WrongPass!1', automation: 'tests/web/regression.spec.jsapi.contract.spec.js › REG-API-03',
  },
  {
    id: 'REG-API-04', module: 'API', title: 'Duplicate username is rejected',
    type: 'Regression', priority: 'P2', severity: 'Medium',
    preconditions: 'Existing username', steps: ['POST /auth/register with the same username'],
    expected: '400 or 409 with a clear message', data: 'existing username',
    automation: 'tests/web/regression.spec.jsapi.contract.spec.js › REG-API-04',
  },
  {
    id: 'REG-API-05', module: 'API', title: 'Boolean fields are real JSON booleans',
    type: 'Regression', priority: 'P1', severity: 'High',
    preconditions: 'Newly registered user', steps: ['Inspect kyc_verified'],
    expected: 'true/false (a 0 breaks the Flutter models)', data: 'n/a',
    automation: 'tests/web/regression.spec.jsapi.contract.spec.js › REG-API-05',
  },
  {
    id: 'REG-API-06', module: 'API', title: 'Tenants are isolated',
    type: 'Regression', priority: 'P1', severity: 'Critical',
    preconditions: 'Two owner accounts', steps: ['Create a property for each', 'List properties per owner'],
    expected: 'Each owner sees only their own property', data: 'tenant A / B',
    automation: 'tests/web/regression.spec.jsapi.contract.spec.js › REG-API-06',
  },
  {
    id: 'MNL-API-01', module: 'API', title: 'Worker secrets are configured',
    type: 'Manual', priority: 'P1', severity: 'High',
    preconditions: 'Wrangler access', steps: ['Run wrangler secret list'],
    expected: 'JWT_SECRET and BETTER_AUTH_SECRET present; email key present if mail is live',
    data: 'n/a', automation: '',
  },

  // ── Platform / deployment ─────────────────────────────────────────────────
  {
    id: 'MNL-PLT-01', module: 'Platform', title: 'Custom domain serves the app over HTTPS',
    type: 'Manual', priority: 'P1', severity: 'Critical',
    preconditions: 'DNS CNAME in place', steps: ['Open https://hostelhub.mynilam.in', 'Inspect the certificate'],
    expected: '200, valid certificate for the hostname, http redirects to https',
    data: 'n/a', automation: '',
  },
  {
    id: 'MNL-PLT-02', module: 'Platform', title: 'Deep links work after a hard refresh',
    type: 'Manual', priority: 'P2', severity: 'Medium',
    preconditions: 'Deployed build', steps: ['Open https://hostelhub.mynilam.in/login in a new tab'],
    expected: 'SPA fallback serves the app and routes to login', data: 'n/a', automation: '',
  },
  {
    id: 'MNL-PLT-03', module: 'Platform', title: 'Mobile web layout is usable',
    type: 'Manual', priority: 'P2', severity: 'Medium',
    preconditions: 'Phone or device emulation', steps: ['Open the app at 390px width', 'Check dashboard, inmates and forms'],
    expected: 'Two-column cards, no horizontal overflow, bottom nav reachable',
    data: '390x844', automation: 'playwright project chromium-mobile-web (smoke)',
  },

  // ── Native mobile ─────────────────────────────────────────────────────────
  {
    id: 'MOB-AUTH-01', module: 'Mobile', title: 'Native app starts on the login screen',
    type: 'E2E', priority: 'P1', severity: 'High',
    preconditions: 'APK installed on a device/emulator',
    steps: ['Launch the app'], expected: 'Login screen with Username and Password fields',
    data: 'n/a', automation: 'tests/native/auth.mobile.test.js › MOB-AUTH-01',
  },
  {
    id: 'MOB-AUTH-02', module: 'Mobile', title: 'Native app signs in with valid credentials',
    type: 'E2E', priority: 'P1', severity: 'Critical',
    preconditions: 'APK installed, owner account',
    steps: ['Enter credentials', 'Tap Log in'], expected: 'Dashboard renders with the owner tabs',
    data: 'owner seeded', automation: 'tests/native/auth.mobile.test.js › MOB-AUTH-02',
  },
  {
    id: 'MOB-NAV-01', module: 'Mobile', title: 'Native shell navigation works',
    type: 'E2E', priority: 'P2', severity: 'Medium',
    preconditions: 'Signed in on the device',
    steps: ['Open Inmates', 'Return to Home'], expected: 'Residents listed, dashboard restored',
    data: 'n/a', automation: 'tests/native/navigation.mobile.test.js › MOB-NAV-01',
  },
];

export const jiraProject = {
  key: process.env.JIRA_PROJECT_KEY || '',
  // Stock Jira issue types are Task/Story/Bug. Switch to "Test" if the project
  // has Xray or Zephyr installed.
  issueType: process.env.JIRA_ISSUE_TYPE || 'Task',
  labels: ['hostelhub', 'qa'],
};
