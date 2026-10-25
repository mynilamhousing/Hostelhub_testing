/**
 * Domain constants shared by pages, flows and tests.
 * Keep magic strings out of the specs — they belong here.
 */

/** SPA hash routes (go_router). Tabs are NOT routes; see TABS. */
export const ROUTES = Object.freeze({
  splash: '/splash',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  home: '/home',
  setup: '/setup',
  addInmate: '/inmates/new',
  inmate: (id) => `/inmates/${id}`,
  complaints: '/complaints',
  raiseComplaint: '/complaints/new',
  visitors: '/visitors',
  leave: '/leave',
  deposits: '/deposits',
  deposit: '/deposit',
  checkout: '/checkout',
  chat: '/chat',
  expenses: '/expenses',
  ratings: '/ratings',
  sos: '/sos',
  documents: '/documents',
  settings: '/settings',
  bills: '/bills',
});

/** Bottom-navigation tabs (role-aware). */
export const TABS = Object.freeze({
  home: 'Home',
  inmates: 'Inmates',
  polls: 'Polls',
  payments: 'Payments',
  notices: 'Notices',
  more: 'More',
});

/** Accessible labels exposed by the Flutter semantics tree. */
export const LABELS = Object.freeze({
  username: 'Username',
  password: 'Password',
  login: 'Log in',
  signUp: 'Sign up',
  forgotPassword: 'Forgot password?',
  fullName: 'Full name',
  phone: 'Phone',
  email: 'Email (for invoices & password reset)',
  bedNo: 'Bed no.',
  rent: 'Rent (₹/mo)',
  dueDay: 'Due day (1-31)',
  addInmate: 'Add inmate',
  addRoom: 'Add room',
  logout: 'Log out',
});

/** Text markers used for assertions. */
export const TEXT = Object.freeze({
  loginHeading: /Welcome back/i,
  loginFailed: /login failed|invalid credentials/i,
  setupPrompt: /Set up your hostel/i,
  pageNotFound: 'Page Not Found',
  setupRequired: /set up your (hostel|property) first/i,
  pnlHeading: /Profit & loss/i,
});

export const TIMEOUTS = Object.freeze({
  appBoot: 45_000,
  navigation: 25_000,
  text: 20_000,
  shortPause: 800,
  uiSettle: 1_500,
});
