import { tc } from './_helpers.js';

export const cases = [
  tc('WEB-001', 'Web UI', 'Breakpoints', 'Layout adapts across the four breakpoints', {
    t: 'UI', p: 'P0', role: 'Owner', plat: 'Web',
    steps: [
      'Open Home at 390×844 => Single column, bottom tab bar, no horizontal scroll',
      'At 820×1180 => Two-column stat grid, comfortable gutters',
      'At 1024×768 => Three/four-column grid begins, content capped',
      'At 1440×900 and 1920×1080 => Four-column grid, max content width ~1180px, no stretched cards',
    ],
    auto: 'Manual — smoke SMK-02 covers the login screen only',
  }),

  tc('WEB-002', 'Web UI', 'Overflow', 'No screen produces a RenderFlex overflow', {
    t: 'UI', p: 'P0', role: 'Owner', plat: 'Web',
    steps: [
      'Walk every owner screen at 390 width => No yellow/black overflow stripes, no console overflow errors',
      'Repeat at 820 and 1440 => Same',
      'Open add-resident, poll creation and expense sheets at 390 => Sheets fit; buttons visible',
    ],
  }),

  tc('WEB-003', 'Web UI', 'Forms', 'Forms are width-capped on desktop', {
    t: 'UI', p: 'P1', role: 'Owner', plat: 'Web',
    steps: [
      'Open Add inmate at 1440 => Form capped (roughly 430–700px), centred, not full width',
      'Open Settings at 1440 => Capped around 820–900px',
      'Open Login at 1440 => Card centred with sensible width',
    ],
  }),

  tc('WEB-004', 'Web UI', 'Navigation', 'Browser back and forward work with the SPA', {
    t: 'Functional', p: 'P1', role: 'Owner', plat: 'Web',
    steps: [
      'Navigate Home → Inmates → Add inmate => History grows',
      'Press browser Back => Returns to Inmates',
      'Press Back again => Home',
      'Press Forward => Inmates again',
    ],
  }),

  tc('WEB-005', 'Web UI', 'Deep link', 'Refreshing a deep route keeps the screen', {
    t: 'Functional', p: 'P1', role: 'Owner', plat: 'Web',
    steps: [
      'Open /inmates/new and press F5 => The add form reloads (SPA fallback), not a 404',
      'Open /settings and refresh => Settings reloads signed in',
      'Open /polls and refresh => Polls reloads',
    ],
  }),

  tc('WEB-006', 'Web UI', 'Loading', 'Async screens show a loading state', {
    t: 'UI', p: 'P2', role: 'Owner', plat: 'Web',
    steps: [
      'Throttle to Slow 3G and open Inmates => A spinner or skeleton appears; no blank white flash or "null"',
      'Open Payments under the same throttle => Same behaviour',
      'Wait for completion => Content replaces the loader',
    ],
  }),

  tc('WEB-007', 'Web UI', 'Errors', 'Failures surface as messages, not crashes', {
    t: 'Negative', p: 'P1', role: 'Owner', plat: 'Web',
    steps: [
      'Block the API domain in devtools and open Inmates => "Error loading inmates" style message with a retry',
      'Submit the add-resident form while blocked => Failure message; the form keeps the entered data',
      'Unblock and retry => Succeeds',
    ],
  }),

  tc('WEB-008', 'Web UI', 'Keyboard', 'Keyboard navigation reaches the primary actions', {
    t: 'Compatibility', p: 'P2', role: 'Owner', plat: 'Web',
    steps: [
      'On the login screen press Tab => Focus moves Username → Password → Log in → Sign up with a visible focus ring',
      'Press Enter in the password field => Submits',
      'On the dashboard press Tab through Quick actions => Focus order is logical, no traps',
    ],
  }),

  tc('WEB-009', 'Web UI', 'Zoom', 'Layout survives 200% zoom', {
    t: 'Compatibility', p: 'P2', role: 'Owner', plat: 'Web',
    steps: [
      'Set browser zoom to 200% at 1440 wide => Effectively 720px; layout reflows, no clipped text',
      'Open a form => Fields remain usable',
      'Reset zoom => Layout returns to the desktop grid',
    ],
  }),

  tc('WEB-010', 'Web UI', 'Contrast', 'Text meets contrast expectations', {
    t: 'UI', p: 'P2', role: 'All', plat: 'Web',
    steps: [
      'Check body text on the glass background => Ratio meets WCAG AA (4.5:1)',
      'Check muted labels (helper text, timestamps) => Still readable',
      'Check buttons => Text on the primary colour is readable',
    ],
  }),

  tc('WEB-011', 'Web UI', 'Tab bar', 'Navigation is reachable at every size', {
    t: 'UI', p: 'P1', role: 'Owner', plat: 'Web · Android · iOS',
    steps: [
      'At 390 width => Bottom tab bar visible with 4 items and labels',
      'At 1440 width => Navigation remains reachable (side rail or bottom bar), no dead end',
      'Tap each item => Correct screen; active item highlighted',
    ],
  }),

  tc('WEB-012', 'Web UI', 'Refresh', 'Pull-to-refresh mirrors the web reload', {
    t: 'Functional', p: 'P2', role: 'Owner', plat: 'Android · iOS',
    steps: [
      'Pull down on Inmates => Refreshes without dropping the session',
      'Pull on Polls => New votes appear',
      'Check that the gesture does not fire inside a dialog/sheet',
    ],
  }),

  tc('WEB-013', 'Web UI', 'PWA', 'Installable web app basics', {
    t: 'Compatibility', p: 'P3', role: 'Owner', plat: 'Web',
    steps: [
      'Open devtools → Application → Manifest => name, icons and start_url present',
      'Check the service worker registration => Present and not caching index.html aggressively',
      'Install to desktop => Launches standalone with the correct title',
    ],
  }),

  tc('WEB-014', 'Web UI', 'Print', 'Invoices and bills print sensibly', {
    t: 'UI', p: 'P3', role: 'Owner', plat: 'Web',
    steps: [
      'Open a generated invoice PDF in the browser => A4-friendly, no clipped margins',
      'Print preview the Bills sheet => No background gradients behind text',
      'Check the header/footer => Hostel name and page number correct',
    ],
  }),

  tc('WEB-015', 'Web UI', 'Touch targets', 'Buttons are thumb-friendly on phones', {
    t: 'Compatibility', p: 'P2', role: 'Owner', plat: 'Android · iOS',
    steps: [
      'Check primary buttons => At least 44×44 logical pixels, with spacing between adjacent actions',
      'Check list row actions (Check out, Acknowledge) => Not overlapping, easy to hit',
      'Test one-handed reach on the bottom bar => All four tabs reachable',
    ],
  }),
];
