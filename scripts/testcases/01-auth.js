import { tc, PRE, DATA } from './_helpers.js';

export const cases = [
  tc('AUTH-001', 'Authentication', 'Login', 'Owner logs in with valid credentials', {
    t: 'Functional', p: 'P0', role: 'Owner', plat: 'Web · Android · iOS',
    pre: 'Owner account qa_owner exists and is not locked; property "QA Hostel" exists',
    data: 'Username: qa_owner / Password: Passw0rd!23',
    steps: [
      'Open https://hostelhub.mynilam.in => Login screen renders with heading "Welcome back", Username, Password, "Log in", "Sign up"',
      'Enter username "qa_owner" and password "Passw0rd!23" => Both fields show the typed values; password is masked',
      'Tap "Log in" => Button shows a progress state; no validation error appears',
      'Wait for the shell => Dashboard opens with occupancy, dues and the bottom tab bar (Home, Inmates, Polls, More)',
    ],
    post: 'Session token stored (localStorage on web); user.role = owner',
    auto: 'tests/web/smoke.spec.js › SMK-03',
  }),

  tc('AUTH-002', 'Authentication', 'Login', 'Login rejected for a wrong password', {
    t: 'Negative', p: 'P0', role: 'Owner',
    data: 'Username: qa_owner / Password: WrongPass1',
    steps: [
      'Enter username "qa_owner" and password "WrongPass1" => Fields accept input',
      'Tap "Log in" => Request to POST /auth/login returns 401',
      'Observe the screen => Error message "Invalid username or password" (or the server error) is shown; user stays on /login',
      'Reload the page => Still on /login, no session created',
    ],
    post: 'No session token written',
    auto: 'tests/web/regression.spec.js › REG-API-03',
  }),

  tc('AUTH-003', 'Authentication', 'Login', 'Login rejected for an unknown username', {
    t: 'Negative', p: 'P1', role: 'Owner',
    data: 'Username: ghost_user / Password: Passw0rd!23',
    steps: [
      'Enter a username that does not exist and any password => Fields accept input',
      'Tap "Log in" => Server responds 401 with the same generic message as AUTH-002',
      'Check the copy => The message does not reveal whether the username exists (no user enumeration)',
    ],
  }),

  tc('AUTH-004', 'Authentication', 'Login', 'Empty credentials are blocked before the request', {
    t: 'Validation', p: 'P1', role: 'Owner',
    data: 'Username: (empty) / Password: (empty)',
    steps: [
      'clear both fields and tap "Log in" => Message "Enter your username and password" appears',
      'Watch the network panel => No POST /auth/login request is issued',
      'Fill username only and tap "Log in" => Same message; request still not issued',
    ],
  }),

  tc('AUTH-005', 'Authentication', 'Login', 'Password field masks input and supports paste', {
    t: 'UI', p: 'P2', role: 'Owner',
    steps: [
      'Type into Password => Characters render as dots',
      'Paste "Passw0rd!23" from the clipboard => Full value is accepted',
      'Toggle the platform password reveal (Android/iOS eye icon, if present) => Reveal shows plain text and reverts on second tap',
    ],
  }),

  tc('AUTH-006', 'Authentication', 'Login', 'Session survives a page reload', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Owner is signed in',
    steps: [
      'Reload the page (F5 / pull-to-refresh on native) => Splash shows briefly',
      'Wait for bootstrap => Dashboard renders without asking for credentials again',
      'Open /home directly in a new tab => Same dashboard, no redirect to /login',
    ],
    auto: 'tests/web/regression.spec.js › REG-SES-01',
  }),

  tc('AUTH-007', 'Authentication', 'Login', 'Log out clears the session everywhere', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Owner is signed in',
    steps: [
      'Open the More tab => "Manage" heading with "Log out" at the bottom of the list',
      'Tap "Log out" => Returned to /login',
      'Reload the page => Still /login; localStorage/sessionStorage hold no token',
      'Paste a protected URL (/inmates, /polls, /expenses) => Redirected to /login',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-AUTH-06 · regression REG-SES-04',
  }),

  tc('AUTH-008', 'Authentication', 'Login', 'Guest is redirected from every protected route', {
    t: 'Security', p: 'P0', role: 'Guest',
    pre: PRE.guest,
    steps: [
      'Open /home => Redirect to /login',
      'Open /inmates and /inmates/new => Redirect to /login',
      'Open /setup, /expenses, /settings, /bills, /chat, /sos => Each redirects to /login',
      'Open the API endpoint /properties without a token => 401 JSON error, no data leak',
    ],
    auto: 'tests/web/regression.spec.js › REG-SES-03',
  }),

  tc('AUTH-009', 'Authentication', 'Register', 'Owner signs up with valid details', {
    t: 'Functional', p: 'P0', role: 'Guest',
    pre: 'No account exists for the generated username',
    data: 'Full name: QA Owner / Username: qa_owner_<ts> / Password: Passw0rd!23 / Email: qa_owner_<ts>@hostelhub.test',
    steps: [
      'Open /register => "Create your account as a property owner." with Full name, Username, Password, Email, Phone',
      'Fill all fields with valid data => No inline errors',
      'Tap "Create account" => Server returns 201; session created',
      'Observe navigation => Land on /home showing the "Set up your hostel" empty state',
    ],
    post: 'users row created with role=owner',
    auto: 'tests/web/e2e.spec.js › E2E-AUTH-03',
  }),

  tc('AUTH-010', 'Authentication', 'Register', 'Register blocks a password shorter than 8 characters', {
    t: 'Validation', p: 'P1', role: 'Guest',
    data: 'Password: abc123',
    steps: [
      'Fill the form with an 6-character password => Field is accepted visually',
      'Tap "Create account" => Inline error "Password must be at least 8 characters"',
      'Check the network => POST /auth/register is not sent (or returns 400)',
    ],
  }),

  tc('AUTH-011', 'Authentication', 'Register', 'Register requires the mandatory fields', {
    t: 'Validation', p: 'P1', role: 'Guest',
    steps: [
      'Leave Full name empty and submit => Message "Fill in name, username and password"',
      'Fill name, leave username empty and submit => Same validation message',
      'Fill name + username, leave password empty and submit => Same validation message',
    ],
  }),

  tc('AUTH-012', 'Authentication', 'Register', 'Duplicate username is rejected', {
    t: 'Negative', p: 'P0', role: 'Guest',
    pre: 'qa_owner already exists',
    data: 'Username: qa_owner',
    steps: [
      'Register with username "qa_owner" and any valid password => Server returns 409/400',
      'Observe the form => Error such as "Username already taken" is shown',
      'Verify the original account => Can still log in with the original password',
    ],
  }),

  tc('AUTH-013', 'Authentication', 'Register', 'Email is optional but validated when present', {
    t: 'Boundary', p: 'P2', role: 'Guest',
    steps: [
      'Register with a blank Email and Phone => Account is created',
      'Register another account with Email "not-an-email" => Submission is rejected or the email is ignored, never stored malformed',
      'Query the API for the created user => email is null, not the string "not-an-email"',
    ],
  }),

  tc('AUTH-014', 'Authentication', 'Register', 'Username length and character boundaries', {
    t: 'Boundary', p: 'P2', role: 'Guest',
    steps: [
      'Try a 1-character username => Accepted or minimal validation message; behaviour recorded',
      'Try a 64-character username => Accepted only if the server also accepts it',
      'Try "user name" (space) and "user@1" => Either rejected with a clear message or stored verbatim; login with that username must work',
    ],
  }),

  tc('AUTH-015', 'Authentication', 'Forgot password', 'Reset link is requested for a known email', {
    t: 'Functional', p: 'P1', role: 'Guest',
    pre: 'An owner account exists with email qa_owner@hostelhub.test',
    steps: [
      'Open /forgot-password => Heading "Forgot password" with Email + "Send reset link"',
      'Enter the registered email and submit => Confirmation "Check your email"',
      'Call the mail provider / check the reset token table => A reset token row is created for that user',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-AUTH-04',
  }),

  tc('AUTH-016', 'Authentication', 'Forgot password', 'Invalid email format is rejected', {
    t: 'Validation', p: 'P2', role: 'Guest',
    steps: [
      'Enter "abc" and submit => Inline error "Enter a valid email address"',
      'Confirm the network => No POST /auth/forgot-password request is issued',
    ],
  }),

  tc('AUTH-017', 'Authentication', 'Forgot password', 'Unknown email does not leak the account list', {
    t: 'Security', p: 'P2', role: 'Guest',
    steps: [
      'Submit "nobody@hostelhub.test" => Same "Check your email" confirmation as the known-email case',
      'Compare response times/status codes with AUTH-015 => No measurable difference that reveals existence',
    ],
  }),

  tc('AUTH-018', 'Authentication', 'Reset password', 'Reset page sets a new password', {
    t: 'Functional', p: 'P0', role: 'Guest',
    pre: 'A valid reset token exists for qa_owner',
    steps: [
      'Open /reset?token=<valid> => Page "Reset your password" with two password fields',
      'Enter "NewPassw0rd!" twice and tap "Reset password" => Message "Password reset! You can now log in."',
      'Log in with the new password => Succeeds',
      'Log in with the old password => 401',
    ],
  }),

  tc('AUTH-019', 'Authentication', 'Reset password', 'Reset rejects mismatched or short passwords', {
    t: 'Negative', p: 'P1', role: 'Guest',
    steps: [
      'Enter "abc123" twice => Message "Password must be at least 6 characters"',
      'Enter "NewPassw0rd!" and "Different1!" => Message "Passwords do not match"',
      'Fix both fields and submit => Reset succeeds',
    ],
  }),

  tc('AUTH-020', 'Authentication', 'Reset password', 'An expired or reused token is refused', {
    t: 'Security', p: 'P0', role: 'Guest',
    pre: 'A reset token that was already used once',
    steps: [
      'Open the reset page with the used token and submit a new password => Error response; password unchanged',
      'Open with a truncated/garbage token => Error response, no 500',
      'Log in with the previously-set password => Still works',
    ],
  }),

  tc('AUTH-021', 'Authentication', 'Role routing', 'Owner is redirected away from resident-only routes', {
    t: 'Security', p: 'P1', role: 'Owner',
    pre: 'Owner is signed in, property exists',
    steps: [
      'Navigate to /complaints/new => Redirected to /home',
      'Navigate to /leave/new => Redirected to /home',
      'Navigate to /deposit => Redirected to /home',
    ],
  }),

  tc('AUTH-022', 'Authentication', 'Role routing', 'Resident is redirected away from owner-only routes', {
    t: 'Security', p: 'P0', role: 'Resident',
    pre: 'Resident is signed in',
    steps: [
      'Navigate to /setup => Redirected to /home',
      'Navigate to /inmates/new, /expenses, /settings, /bills, /visitors, /leave, /deposits, /checkout, /sos, /chat => Each redirects to /home',
      'Confirm the resident tab bar => Only resident tabs (Home, Polls, More/Menu) are present',
    ],
    auto: 'Manual',
  }),

  tc('AUTH-023', 'Authentication', 'Role routing', 'Non-admin cannot open the admin panel', {
    t: 'Security', p: 'P0', role: 'Owner',
    steps: [
      'Sign in as owner and open /admin => Redirected to /home',
      'Call GET /admin/stats with the owner token => 401/403, not 200',
      'Call POST /admin/pricing with the owner token => 401/403 and global rates unchanged',
    ],
  }),

  tc('AUTH-024', 'Authentication', 'Session', 'Expired or tampered token forces re-login', {
    t: 'Security', p: 'P0', role: 'Owner',
    steps: [
      'Replace the stored token with "abc.def.ghi" and reload => Redirected to /login',
      'Clear the token and reload => Redirected to /login',
      'Call /properties with a tampered Bearer token => 401',
    ],
  }),

  tc('AUTH-025', 'Authentication', 'Role routing', 'Splash resolves to the right home per role', {
    t: 'Functional', p: 'P2', role: 'All',
    steps: [
      'Cold start with an owner session => /splash then /home',
      'Cold start with a platform admin session => /splash then /admin',
      'Cold start signed out => /splash then /login',
    ],
  }),

  tc('AUTH-026', 'Authentication', 'Login', 'Rapid repeated login attempts are rate limited', {
    t: 'Security', p: 'P2', role: 'Guest',
    steps: [
      'Submit 10 wrong passwords in a row for the same username => Each returns 401',
      'Observe the 11th attempt => Throttled (429 or a temporary lock), or documented as not implemented',
      'Confirm a valid login still works after the window => If throttling exists, it clears',
    ],
    notes: 'Record the observed behaviour; the Worker currently relies on account-level checks only.',
  }),
];
