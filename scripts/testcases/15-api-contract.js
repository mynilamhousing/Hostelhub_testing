import { tc } from './_helpers.js';

const API = 'API';

export const cases = [
  tc('API-001', 'API', 'Health', 'Health endpoint reports ready', {
    t: 'API', p: 'P0', role: 'Guest', plat: API,
    steps: [
      'GET /health => 200 with {"status":"ok"}',
      'Check the response headers => application/json and CORS allow-origin',
      'Repeat 3 times => Stable, no cold-start 500',
    ],
    auto: 'tests/web/smoke.spec.js › SMK-01',
  }),

  tc('API-002', 'API', 'CORS', 'CORS allows the web app origin', {
    t: 'API', p: 'P1', role: 'Guest', plat: API,
    steps: [
      'GET /health with Origin: https://hostelhub.mynilam.in => Access-Control-Allow-Origin echoes the origin',
      'Send an OPTIONS preflight for POST /auth/login => 204/200 with allowed methods and headers',
      'Check that a random origin is not granted credentials it should not have',
    ],
  }),

  tc('API-003', 'API', 'Auth', 'Register returns a token and the user object', {
    t: 'API', p: 'P0', role: 'Guest', plat: API,
    steps: [
      'POST /auth/register with valid fields => 200/201 with token and user{id, username, role}',
      'Check role => "owner" for a public registration',
      'Repeat with the same username => 409/400, no duplicate row',
      'POST with a 5-character password => 400',
    ],
    auto: 'tests/web/regression.spec.js › REG-API-04',
  }),

  tc('API-004', 'API', 'Auth', 'Login returns a JWT with the expected shape', {
    t: 'API', p: 'P0', role: 'Guest', plat: API,
    steps: [
      'POST /auth/login with valid credentials => 200 with a token',
      'Decode the token => 3 segments, HMAC algorithm, exp in the future, sub = user id',
      'Use it as Bearer on /properties => 200',
      'POST with a wrong password => 401 and no token',
    ],
    auto: 'tests/web/regression.spec.js › REG-API-02',
  }),

  tc('API-005', 'API', 'Auth', 'Password reset flow round-trips', {
    t: 'API', p: 'P1', role: 'Guest', plat: API,
    steps: [
      'POST /auth/forgot-password with a known email => 200 and a token row created',
      'POST /auth/reset-password with that token and a new password => 200',
      'Login with the new password => 200',
      'Reuse the same reset token => 400/410',
    ],
  }),

  tc('API-006', 'API', 'Resources', 'Every collection endpoint requires auth', {
    t: 'Security', p: 'P0', role: 'Guest', plat: API,
    steps: [
      'Call GET on /properties, /rooms, /inmates, /payments, /polls, /complaints, /notices, /visitors, /leave, /deposits, /checkouts, /chat, /expenses, /ratings, /sos, /documents, /rent-plans, /pnl without a token => 401 on each',
      'Confirm no payload with data is returned alongside the error',
    ],
  }),

  tc('API-007', 'API', 'Types', 'Booleans are real booleans, not 0/1', {
    t: 'API', p: 'P0', role: 'Owner', plat: API,
    steps: [
      'GET /properties => kyc_verified is true/false',
      'GET /polls => recurring is a boolean; options is an array',
      'GET /sos => acknowledged is a boolean',
      'Feed the payload into the Flutter model => No cast error',
    ],
    notes: 'D1 has no boolean type; the Worker coerces 0/1 at the boundary — this regression guards the coercion.',
    auto: 'tests/web/regression.spec.js › REG-API-05',
  }),

  tc('API-008', 'API', 'Filters', 'Collection filters are enforced server-side', {
    t: 'API', p: 'P0', role: 'Owner', plat: API,
    steps: [
      'GET /inmates?property_id=<own> => Only own rows',
      'GET /inmates?property_id=<other> => Empty or 403',
      'GET /payments?inmate_id=<own resident> => Only that resident',
      'GET /chat?inmate_id=<own resident> => Only that thread',
    ],
  }),

  tc('API-009', 'API', 'Errors', 'Not-found and bad requests are well formed', {
    t: 'API', p: 'P1', role: 'Owner', plat: API,
    steps: [
      'GET /nope => 404 JSON, not HTML',
      'POST /inmates with malformed JSON => 400 with a parse error',
      'PUT /health (unsupported method) => 405 or 404, never a 500',
      'PATCH /inmates/<random-id> => 404',
    ],
  }),

  tc('API-010', 'API', 'Inmates', 'Inmate creation validates the room and bed', {
    t: 'API', p: 'P1', role: 'Owner', plat: API,
    steps: [
      'POST /inmates with a non-existent room_id => 400/404',
      'POST with bed_no > capacity => 400',
      'POST with bed_no already taken => 409/400',
      'POST a valid inmate => 200/201 with generated credentials',
    ],
  }),

  tc('API-011', 'API', 'Poll responses', 'Vote endpoint is idempotent per resident', {
    t: 'API', p: 'P1', role: 'Resident', plat: API,
    steps: [
      'POST /poll-responses twice with the same poll and resident => One row; the second call updates',
      'Check GET /polls => Aggregates reflect a single response',
      'POST for a poll of another property => 403/400',
    ],
  }),

  tc('API-012', 'API', 'Payments', 'Payment creation is validated and deduplicated', {
    t: 'API', p: 'P1', role: 'Owner', plat: API,
    steps: [
      'POST /payments with amount 0 => 400',
      'POST for a month already paid => 409/400',
      'POST a valid payment => 200/201 and GET /payments shows it once',
    ],
  }),

  tc('API-013', 'API', 'PnL', 'P&L is computed from stored rows', {
    t: 'API', p: 'P2', role: 'Owner', plat: API,
    steps: [
      'Seed 2 payments (6500 + 6500) and 1 expense (2000)',
      'GET /pnl?property_id=... => income 13000, expenses 2000, net 11000',
      'Delete nothing; call again => Deterministic result',
    ],
  }),

  tc('API-014', 'API', 'Documents', 'Document endpoint enforces owner_type/owner_id pairs', {
    t: 'API', p: 'P2', role: 'Owner', plat: API,
    steps: [
      'POST /documents with owner_type "inmate" and a hostel property id => Rejected or stored with the right owner_id',
      'GET /documents?owner_type=inmate&owner_id=<resident> => Correct rows',
      'DELETE /documents/<id> => Removed; second DELETE => 404',
    ],
  }),

  tc('API-015', 'API', 'Razorpay', 'Order creation fails clearly without live keys', {
    t: 'API', p: 'P2', role: 'Resident', plat: API,
    steps: [
      'POST /razorpay/order in this environment => Structured error (not a 500 stack trace)',
      'POST /razorpay/webhook with a bad signature => 400/401 and no payment row created',
      'POST /razorpay/webhook with a valid signature fixture => Payment recorded once (idempotent on replay)',
    ],
  }),

  tc('API-016', 'API', 'Admin', 'Admin pricing round-trip', {
    t: 'API', p: 'P1', role: 'Admin', plat: API,
    steps: [
      'POST /admin/pricing with new rates => 200',
      'GET /pricing (public) => New values',
      'Restore the original rates => Clients show the restored values',
    ],
  }),

  tc('API-017', 'API', 'Contract', 'Response shapes stay stable across GETs', {
    t: 'API', p: 'P2', role: 'Owner', plat: API,
    steps: [
      'For each collection GET, assert the array key name (properties, rooms, inmates, polls, …)',
      'Assert every row has id, created_at and property_id where applicable',
      'Run twice and diff the key sets => No shape drift between calls',
    ],
  }),

  tc('API-018', 'API', 'Performance', 'Collection endpoints respond quickly at small scale', {
    t: 'API', p: 'P3', role: 'Owner', plat: API,
    steps: [
      'Time GET /inmates?property_id=... with 50 residents => Under ~1s at the edge',
      'Time GET /payments with 200 rows => Under ~1s',
      'Repeat 5 times => No degrading trend from cold starts',
    ],
  }),
];
