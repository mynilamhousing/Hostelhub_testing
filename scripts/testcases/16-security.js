import { tc } from './_helpers.js';

const API = 'API';

export const cases = [
  tc('SEC-001', 'Security', 'Tenant isolation', 'Owner A cannot read any of owner B\'s resources', {
    t: 'Security', p: 'P0', role: 'Owner', plat: API,
    pre: 'Two owners each with a property, rooms, residents, payments, polls, notices',
    steps: [
      'With owner A token, GET every collection filtered by B\'s property_id => Empty array or 403, never B rows',
      'GET /properties?owner_id=<B> => Empty or 403',
      'Compare record counts => No leakage through counts either',
    ],
    auto: 'tests/web/regression.spec.js › REG-API-06',
  }),

  tc('SEC-002', 'Security', 'IDOR', 'Direct object access by guessed id is refused', {
    t: 'Security', p: 'P0', role: 'Owner', plat: API,
    steps: [
      'PATCH /inmates/<B resident id> => 403/404',
      'DELETE /notices/<B notice id> => 403/404 and the notice still exists for B',
      'GET /inmates/<B id>/invoice => 403/404',
      'PATCH /rent-plans/<B plan id> => 403/404',
    ],
  }),

  tc('SEC-003', 'Security', 'Privilege escalation', 'A user cannot change their own role', {
    t: 'Security', p: 'P0', role: 'Resident', plat: API,
    steps: [
      'PATCH /auth/user or /users/<self> with role=owner => Rejected or ignored',
      'Re-login and inspect the JWT payload => role is still inmate',
      'Attempt to reach /setup => Still redirected',
    ],
  }),

  tc('SEC-004', 'Security', 'Token integrity', 'Tokens are signed and verified', {
    t: 'Security', p: 'P0', role: 'Owner', plat: API,
    steps: [
      'Decode a token and flip a character in the payload => 401 on the next request',
      'Change the alg header to "none" => 401',
      'Use a token signed with another secret => 401',
      'Use an expired token => 401',
    ],
  }),

  tc('SEC-005', 'Security', 'Mass assignment', 'Unexpected fields are ignored', {
    t: 'Security', p: 'P1', role: 'Owner', plat: API,
    steps: [
      'POST /inmates with extra fields like owner_id or property_id of another property => Rejected or ignored',
      'POST /properties with owner_id = another owner => Created under the caller, never the other owner',
      'PATCH a resident with a balance field => Ignored',
    ],
  }),

  tc('SEC-006', 'Security', 'Injection', 'SQL injection attempts are neutralised', {
    t: 'Security', p: 'P0', role: 'Owner', plat: API,
    steps: [
      'Use "R101\' OR 1=1 --" as a room number => Stored verbatim, no extra rows returned',
      'Use the same payload in the property name and notice title => Stored as text',
      'Verify the tables still load and no other tenant\'s data appears',
    ],
  }),

  tc('SEC-007', 'Security', 'XSS', 'User content never executes script', {
    t: 'Security', p: 'P0', role: 'Owner',
    steps: [
      'Post "<img src=x onerror=alert(1)>" as a notice title and a chat message => Rendered as text',
      'Raise a complaint containing "<script>alert(1)</script>" => Displayed literally',
      'Check the console => No alert, no injected DOM node',
    ],
  }),

  tc('SEC-008', 'Security', 'Transport', 'HTTPS and headers are enforced', {
    t: 'Security', p: 'P1', role: 'Guest', plat: 'Web',
    steps: [
      'Request http://hostelhub.mynilam.in => 301 to https',
      'Inspect response headers => HSTS, X-Content-Type-Options: nosniff, sensible CSP',
      'Check the certificate => Valid, not self-signed, correct hostname',
      'Call the Worker over http => Upgraded or refused',
    ],
  }),

  tc('SEC-009', 'Security', 'Secrets', 'No secrets ship in the client bundle', {
    t: 'Security', p: 'P0', role: 'Guest', plat: 'Web',
    steps: [
      'Download main.dart.js and grep for JWT_SECRET, BETTER_AUTH_SECRET, rzp_live, sk_live, AKIA => No matches',
      'Grep the Worker bundle for hardcoded secrets => Only env bindings',
      'Check the repo history for committed .env => Not tracked (gitignore)',
    ],
  }),

  tc('SEC-010', 'Security', 'Enumeration', 'Auth flows do not confirm account existence', {
    t: 'Security', p: 'P2', role: 'Guest',
    steps: [
      'Forgot password for a known and an unknown email => Same confirmation',
      'Login with an unknown username vs a wrong password => Same generic error',
      'Register with a taken username => A specific conflict is acceptable only here (needed for UX)',
    ],
  }),

  tc('SEC-011', 'Security', 'Rate limiting', 'Abuse-prone endpoints are throttled', {
    t: 'Security', p: 'P2', role: 'Guest', plat: API,
    steps: [
      'Fire 30 login attempts in 10s => Throttled (429) or documented as unthrottled',
      'Fire 30 register attempts => Same expectation',
      'Fire 100 GET /health => Should remain cheap; check for 429 or edge caching',
    ],
    notes: 'Record the observed state; this is a hardening gap rather than a UI defect.',
  }),

  tc('SEC-012', 'Security', 'File access', 'Uploaded documents are not publicly listable', {
    t: 'Security', p: 'P1', role: 'Guest', plat: 'API',
    steps: [
      'Try to fetch a document URL without a token => 401/403',
      'Try a predictable path traversal ("../") => Refused',
      'Confirm documents are only reachable through the authenticated API',
    ],
  }),

  tc('SEC-013', 'Security', 'Session fixation', 'A new login issues a new token', {
    t: 'Security', p: 'P1', role: 'Owner', plat: 'API',
    steps: [
      'Note the token from the first login',
      'Log in again => A different token is issued',
      'Use the first token after logout => Rejected if logout revokes tokens; record the behaviour',
    ],
  }),

  tc('SEC-014', 'Security', 'Owner impersonation', 'An owner cannot log in as a resident', {
    t: 'Security', p: 'P0', role: 'Owner',
    steps: [
      'Try the generated resident credentials on the owner app => Resident shell opens only if the credentials are the resident\'s',
      'Try to fetch a resident token through any owner endpoint => No such endpoint exists',
      'Regenerating credentials changes the resident password, not the owner\'s access',
    ],
  }),

  tc('SEC-015', 'Security', 'Error hygiene', 'Errors do not leak internals', {
    t: 'Security', p: 'P1', role: 'Guest', plat: API,
    steps: [
      'Trigger a 500 (malformed payload deep in a handler) => Generic message, no stack trace, no SQL text',
      'Check the response for table names, file paths or D1 ids => None',
      'Verify the Worker logs contain the detail instead',
    ],
  }),

  tc('SEC-016', 'Security', 'CSRF', 'State-changing calls are not trivially forgeable', {
    t: 'Security', p: 'P1', role: 'Owner', plat: 'Web',
    steps: [
      'Check how the token is stored and sent => Authorization header (not an ambient cookie) implies no classic CSRF',
      'If cookies are used anywhere, verify SameSite and a CSRF token',
      'Attempt a cross-site form POST to /notices without the header => Rejected',
    ],
  }),
];
