/**
 * Catalogue index — module order defines workbook order.
 *
 * Each module contributes cases via `cases`, written with tc() from _helpers.js.
 */
import { cases as auth } from './01-auth.js';
import { cases as onboarding } from './02-onboarding.js';
import { cases as residents } from './03-residents.js';
import { cases as rent } from './04-rent.js';
import { cases as polls } from './05-polls.js';
import { cases as chat } from './06-chat.js';
import { cases as notices } from './07-notices.js';
import { cases as complaints } from './08-complaints.js';
import { cases as visitors } from './09-visitors-leave.js';
import { cases as deposits } from './10-deposits-checkout.js';
import { cases as documents } from './11-documents.js';
import { cases as residentApp } from './12-resident-app.js';
import { cases as ops } from './13-ops-misc.js';
import { cases as admin } from './14-admin.js';
import { cases as api } from './15-api-contract.js';
import { cases as security } from './16-security.js';
import { cases as webUi } from './17-web-ui.js';
import { cases as e2e } from './18-e2e.js';

export const MODULES = [
  { key: 'Authentication', cases: auth },
  { key: 'Onboarding', cases: onboarding },
  { key: 'Residents', cases: residents },
  { key: 'Rent', cases: rent },
  { key: 'Polls', cases: polls },
  { key: 'Chat', cases: chat },
  { key: 'Notices', cases: notices },
  { key: 'Complaints', cases: complaints },
  { key: 'Visitors', cases: visitors },
  { key: 'Deposits', cases: deposits },
  { key: 'Documents', cases: documents },
  { key: 'Resident app', cases: residentApp },
  { key: 'Settings', cases: ops },
  { key: 'Admin', cases: admin },
  { key: 'API', cases: api },
  { key: 'Security', cases: security },
  { key: 'Web UI', cases: webUi },
  { key: 'End-to-end', cases: e2e },
];

export const ALL_CASES = MODULES.flatMap((m) => m.cases);
