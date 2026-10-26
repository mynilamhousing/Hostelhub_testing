/**
 * Test-case workbook generator.
 *
 * Source of truth: scripts/testcases/*.js (one file per module).
 * Outputs:
 *   docs/HostelHub_TestCases.xlsx   — 7-sheet execution workbook
 *   docs/jira-import.csv            — paste into Jira's CSV importer
 *   docs/TEST-CASES.md              — readable catalogue for PRs and reviews
 *
 * Run: npm run testcases
 */
import ExcelJS from 'exceljs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALL_CASES, MODULES } from './testcases/index.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = `${root}/docs`;
mkdirSync(outDir, { recursive: true });

const CASES = ALL_CASES;
const TODAY = new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- palette
const COLORS = {
  ink: 'FF1E293B',
  brand: 'FF2563EB',
  brandDark: 'FF1D4ED8',
  band: 'FFF1F5F9',
  border: 'FFCBD5E1',
  p0: 'FFFEE2E2',
  p0Text: 'FF991B1B',
  p1: 'FFFFEDD5',
  p1Text: 'FF9A3412',
  p2: 'FFDBEAFE',
  p2Text: 'FF1E40AF',
  p3: 'FFF1F5F9',
  p3Text: 'FF475569',
  neg: 'FFFFF1F2',
  auto: 'FFDCFCE7',
  autoText: 'FF166534',
  manual: 'FFFEF9C3',
  manualText: 'FF854D0E',
};

const thin = { style: 'thin', color: { argb: COLORS.border } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };

function styleHeader(row) {
  row.height = 30;
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.brand } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = allBorders;
  });
}

function titleBlock(sheet, title, subtitle, span) {
  sheet.mergeCells(1, 1, 1, span);
  const t = sheet.getCell(1, 1);
  t.value = title;
  t.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
  t.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  sheet.getRow(1).height = 34;
  sheet.getCell(1, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.brandDark } };

  if (subtitle) {
    sheet.mergeCells(2, 1, 2, span);
    const s = sheet.getCell(2, 1);
    s.value = subtitle;
    s.font = { size: 10, color: { argb: 'FF475569' }, italic: true };
    s.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    sheet.getRow(2).height = 20;
  }
}

const wb = new ExcelJS.Workbook();
wb.creator = 'HostelHub QA';
wb.title = 'HostelHub — Test Case Catalogue';
wb.company = 'HostelHub';

// ------------------------------------------------------------------ cover
{
  const s = wb.addWorksheet('Cover', { properties: { tabColor: { argb: COLORS.brand } } });
  s.columns = [{ width: 3 }, { width: 30 }, { width: 78 }];
  titleBlock(s, 'HostelHub — Test Case Catalogue', 'Flutter web · Android · iOS  •  Cloudflare Workers + D1 backend', 3);

  const total = CASES.length;
  const automated = CASES.filter((c) => c.automation !== 'Manual').length;
  const manual = total - automated;
  const byPrio = ['P0', 'P1', 'P2', 'P3'].map((p) => [p, CASES.filter((c) => c.priority === p).length]);
  const byType = [...new Set(CASES.map((c) => c.type))].map((t) => [t, CASES.filter((c) => c.type === t).length]);

  let r = 4;
  const kv = (k, v, opts = {}) => {
    const kc = s.getCell(r, 2);
    kc.value = k;
    kc.font = { bold: true, size: 11, color: { argb: COLORS.ink } };
    const vc = s.getCell(r, 3);
    vc.value = v;
    vc.font = { size: 11, bold: !!opts.bold, color: { argb: opts.color || COLORS.ink } };
    vc.alignment = { wrapText: true, vertical: 'top' };
    r++;
  };

  kv('Document', 'Test Case Catalogue v2.0');
  kv('Generated', TODAY);
  kv('Application', 'HostelHub — hostel / house / office management');
  kv('Web app', 'https://hostelhub.mynilam.in');
  kv('API', 'https://hostelhub.mynilamhousing.workers.dev');
  kv('Total test cases', total, { bold: true });
  kv('Automated', `${automated} (Playwright web + Appium native)`);
  kv('Manual', String(manual));
  kv('Priority split', byPrio.map(([p, n]) => `${p} ${n}`).join('  ·  '));
  kv('Type split', byType.map(([t, n]) => `${t} ${n}`).join('  ·  '));
  r++;

  const legendTitle = s.getCell(r, 2);
  legendTitle.value = 'Sheets';
  legendTitle.font = { bold: true, size: 12 };
  r++;
  const sheets = [
    ['Summary', 'Case counts per module, priority and type — the review sheet.'],
    ['Test Cases', 'One row per case with preconditions, numbered steps, expected results, automation link.'],
    ['Step Detail', 'One row per step — use this for execution or for pushing a case into a tracker as sub-tasks.'],
    ['Traceability', 'Module → feature → case IDs → automation spec.'],
    ['Execution Log', 'Blank run log with drop-down status, ready to fill for a build.'],
    ['Jira Import', 'Mirror of the CSV in docs/jira-import.csv.'],
  ];
  for (const [name, desc] of sheets) {
    const a = s.getCell(r, 2);
    a.value = name;
    a.font = { bold: true, size: 10, color: { argb: COLORS.brandDark } };
    const b = s.getCell(r, 3);
    b.value = desc;
    b.font = { size: 10, color: { argb: 'FF475569' } };
    r++;
  }

  r++;
  const legend = s.getCell(r, 2);
  legend.value = 'Priority legend';
  legend.font = { bold: true, size: 12 };
  r++;
  const legendRows = [
    ['P0', 'Blocks release — auth, money, data isolation, core CRUD.', COLORS.p0, COLORS.p0Text],
    ['P1', 'Major feature or validation; shipped only with a waived defect.', COLORS.p1, COLORS.p1Text],
    ['P2', 'Secondary flows, edge cases, copy and polish.', COLORS.p2, COLORS.p2Text],
    ['P3', 'Cosmetic, rare conditions, nice-to-have checks.', COLORS.p3, COLORS.p3Text],
  ];
  for (const [p, desc, fill, text] of legendRows) {
    const c1 = s.getCell(r, 2);
    c1.value = p;
    c1.font = { bold: true, color: { argb: text } };
    c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    c1.alignment = { horizontal: 'center' };
    c1.border = allBorders;
    const c2 = s.getCell(r, 3);
    c2.value = desc;
    c2.font = { size: 10 };
    r++;
  }

  r += 1;
  const note = s.getCell(r, 2);
  note.value = 'Conventions';
  note.font = { bold: true, size: 12 };
  r++;
  const notes = [
    'Steps are written as "action => expected result" so a tester can execute without reading the code.',
    'Every UI label quoted in a case matches the shipped build (verified against the Flutter source and production).',
    'Cases are platform-neutral unless the Platform column narrows them (API, Web only, Android/iOS only).',
    'Automation column: a spec path means a Playwright/Appium test exists; "Manual" means execute by hand.',
    'Data used by automation follows the @hostelhub.test convention and is purged by scripts/cleanup.sql.',
  ];
  for (const n of notes) {
    s.mergeCells(r, 2, r, 3);
    const c = s.getCell(r, 2);
    c.value = `•  ${n}`;
    c.font = { size: 10, color: { argb: 'FF334155' } };
    c.alignment = { wrapText: true, vertical: 'top' };
    s.getRow(r).height = 28;
    r++;
  }
}

// ---------------------------------------------------------------- summary
{
  const s = wb.addWorksheet('Summary', { properties: { tabColor: { argb: 'FF0EA5E9' } } });
  const cols = ['Module', 'Cases', 'P0', 'P1', 'P2', 'P3', 'Functional', 'Negative', 'Validation', 'Boundary', 'Security', 'E2E', 'API', 'UI / Compat', 'Automated', 'Manual', 'Coverage %'];
  s.columns = [{ width: 20 }, ...cols.slice(1).map((c) => ({ width: c === 'Module' ? 20 : c.length > 9 ? 12 : 11 }))];

  titleBlock(s, 'Summary', 'Cases per module, priority and type. Coverage % = automated ÷ total for that module.', cols.length);
  const header = s.getRow(4);
  header.values = cols;
  styleHeader(header);

  const count = (arr, fn) => arr.filter(fn).length;
  let row = 5;
  const totals = new Array(cols.length).fill(0);

  for (const m of MODULES) {
    const cs = m.cases;
    const auto = count(cs, (c) => c.automation !== 'Manual');
    const vals = [
      m.key,
      cs.length,
      count(cs, (c) => c.priority === 'P0'),
      count(cs, (c) => c.priority === 'P1'),
      count(cs, (c) => c.priority === 'P2'),
      count(cs, (c) => c.priority === 'P3'),
      count(cs, (c) => c.type === 'Functional'),
      count(cs, (c) => c.type === 'Negative'),
      count(cs, (c) => c.type === 'Validation'),
      count(cs, (c) => c.type === 'Boundary'),
      count(cs, (c) => c.type === 'Security'),
      count(cs, (c) => c.type === 'E2E'),
      count(cs, (c) => c.type === 'API'),
      count(cs, (c) => c.type === 'UI' || c.type === 'Compatibility'),
      auto,
      cs.length - auto,
      `${Math.round((auto / cs.length) * 100)}%`,
    ];
    const rr = s.getRow(row);
    rr.values = vals;
    rr.height = 20;
    rr.eachCell((cell, i) => {
      cell.border = allBorders;
      cell.alignment = { vertical: 'middle', horizontal: i === 1 ? 'left' : 'center', indent: i === 1 ? 1 : 0 };
      cell.font = { size: 10 };
      if (row % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.band } };
    });
    s.getCell(row, 1).font = { size: 10, bold: true };
    vals.slice(1).forEach((v, i) => {
      if (typeof v === 'number') totals[i + 1] += v;
    });
    row++;
  }

  const totalRow = s.getRow(row);
  totalRow.values = ['TOTAL', ...totals.slice(1, -1), totals[1] ? `${Math.round((totals[14] / totals[1]) * 100)}%` : '0%'];
  totalRow.height = 22;
  totalRow.eachCell((cell, i) => {
    cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.brandDark } };
    cell.alignment = { vertical: 'middle', horizontal: i === 1 ? 'left' : 'center', indent: i === 1 ? 1 : 0 };
    cell.border = allBorders;
  });

  // Type distribution block
  let r2 = row + 3;
  s.mergeCells(r2, 1, r2, 6);
  const t = s.getCell(r2, 1);
  t.value = 'Distribution by type';
  t.font = { bold: true, size: 12 };
  r2++;
  const h2 = s.getRow(r2);
  h2.values = ['Type', 'Cases', 'Share'];
  styleHeader(h2);
  const types = [...new Set(CASES.map((c) => c.type))];
  for (const ty of types) {
    const n = CASES.filter((c) => c.type === ty).length;
    const rr = s.getRow(++r2);
    rr.values = [ty, n, `${Math.round((n / CASES.length) * 100)}%`];
    rr.eachCell((c, i) => {
      c.border = allBorders;
      c.font = { size: 10 };
      c.alignment = { horizontal: i === 1 ? 'left' : 'center', indent: i === 1 ? 1 : 0 };
    });
  }

  // Role distribution
  r2 += 2;
  s.mergeCells(r2, 1, r2, 6);
  const rl = s.getCell(r2, 1);
  rl.value = 'Distribution by role';
  rl.font = { bold: true, size: 12 };
  r2++;
  const h3 = s.getRow(r2);
  h3.values = ['Role', 'Cases', 'Share'];
  styleHeader(h3);
  for (const role of [...new Set(CASES.map((c) => c.role))]) {
    const n = CASES.filter((c) => c.role === role).length;
    const rr = s.getRow(++r2);
    rr.values = [role, n, `${Math.round((n / CASES.length) * 100)}%`];
    rr.eachCell((c, i) => {
      c.border = allBorders;
      c.font = { size: 10 };
      c.alignment = { horizontal: i === 1 ? 'left' : 'center', indent: i === 1 ? 1 : 0 };
    });
  }

  s.views = [{ state: 'frozen', ySplit: 4 }];
  s.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + MODULES.length, column: cols.length } };
}

// ------------------------------------------------------------- test cases
{
  const s = wb.addWorksheet('Test Cases', { properties: { tabColor: { argb: 'FF22C55E' } }, views: [{ state: 'frozen', xSplit: 1, ySplit: 4 }] });
  const cols = [
    ['ID', 12],
    ['Module', 15],
    ['Feature', 18],
    ['Title', 42],
    ['Type', 12],
    ['Priority', 9],
    ['Severity', 10],
    ['Role', 12],
    ['Platform', 18],
    ['Preconditions', 32],
    ['Test Data', 26],
    ['Steps', 62],
    ['Expected Results', 62],
    ['Postconditions', 26],
    ['Automation', 30],
    ['Requirement', 26],
    ['Notes', 32],
  ];
  s.columns = cols.map(([h, w]) => ({ header: h, key: h, width: w }));

  titleBlock(s, 'Test Cases', `${CASES.length} cases · generated ${TODAY} · steps are "action => expected"`, cols.length);
  const header = s.getRow(4);
  header.values = cols.map(([h]) => h);
  styleHeader(header);

  let row = 5;
  let band = false;
  for (const c of CASES) {
    const rr = s.getRow(row);
    rr.values = [
      c.id,
      c.module,
      c.feature,
      c.title,
      c.type,
      c.priority,
      c.severity,
      c.role,
      c.platform,
      c.preconditions,
      c.data || '—',
      c.steps.map((st) => `${st.n}. ${st.action}`).join('\n'),
      c.steps.map((st) => `${st.n}. ${st.expected || '—'}`).join('\n'),
      c.postconditions,
      c.automation,
      c.requirement,
      c.notes || '',
    ];

    rr.height = Math.max(30, Math.min(150, 16 * Math.max(c.steps.length, 1) + 14));
    rr.eachCell((cell, i) => {
      cell.border = allBorders;
      cell.font = { size: 10, name: 'Calibri' };
      cell.alignment = { vertical: 'top', wrapText: true };
      if (band) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.band } };
      if (i === 1) cell.font = { size: 10, bold: true, name: 'Consolas', color: { argb: COLORS.brandDark } };
      if (i === 4) cell.alignment = { vertical: 'top', horizontal: 'center' };
      if (i === 5 || i === 6) cell.alignment = { vertical: 'top', horizontal: 'center' };
    });

    // priority chip
    const p = c.priority;
    const pc = s.getCell(row, 6);
    pc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS[p.toLowerCase()] || COLORS.p3 } };
    pc.font = { bold: true, size: 10, color: { argb: COLORS[`${p.toLowerCase()}Text`] || COLORS.ink } };

    // negative/security tint on Type
    if (['Negative', 'Validation', 'Boundary', 'Security'].includes(c.type)) {
      const tc = s.getCell(row, 5);
      tc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.neg } };
      tc.font = { size: 10, bold: true, color: { argb: 'FF9F1239' } };
    }

    // automation chip
    const ac = s.getCell(row, 15);
    const isAuto = c.automation !== 'Manual';
    ac.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAuto ? COLORS.auto : COLORS.manual } };
    ac.font = { size: 9, color: { argb: isAuto ? COLORS.autoText : COLORS.manualText } };

    band = !band;
    row++;
  }

  s.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + CASES.length, column: cols.length } };
  s.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
}

// ------------------------------------------------------------ step detail
{
  const s = wb.addWorksheet('Step Detail', { properties: { tabColor: { argb: 'FFA855F7' } }, views: [{ state: 'frozen', ySplit: 4 }] });
  const cols = [
    ['Test Case ID', 14],
    ['Module', 14],
    ['Title', 38],
    ['Step #', 8],
    ['Action', 58],
    ['Expected Result', 58],
    ['Type', 12],
    ['Priority', 9],
    ['Platform', 18],
    ['Automation', 28],
  ];
  s.columns = cols.map(([h, w]) => ({ width: w }));
  titleBlock(s, 'Step Detail', 'One row per step — the execution sheet', cols.length);
  const header = s.getRow(4);
  header.values = cols.map(([h]) => h);
  styleHeader(header);

  let row = 5;
  for (const c of CASES) {
    c.steps.forEach((st) => {
      const rr = s.getRow(row);
      rr.values = [c.id, c.module, c.title, st.n, st.action, st.expected || '—', c.type, c.priority, c.platform, c.automation];
      rr.height = 28;
      rr.eachCell((cell, i) => {
        cell.border = allBorders;
        cell.font = { size: 10 };
        cell.alignment = { vertical: 'top', wrapText: true, horizontal: [4, 8].includes(i) ? 'center' : 'left' };
      });
      if (st.n === 1) {
        [1, 2, 3].forEach((i) => (s.getCell(row, i).font = { size: 10, bold: i === 1 }));
      }
      row++;
    });
  }
  s.autoFilter = { from: { row: 4, column: 1 }, to: { row: row - 1, column: cols.length } };
}

// ----------------------------------------------------------- traceability
{
  const s = wb.addWorksheet('Traceability', { properties: { tabColor: { argb: 'FFF59E0B' } } });
  const cols = [['Module', 18], ['Feature', 26], ['Cases', 9], ['Case IDs', 60], ['Automated specs', 60]];
  s.columns = cols.map(([h, w]) => ({ width: w }));
  titleBlock(s, 'Traceability', 'Module → feature → case IDs → automation', cols.length);
  const header = s.getRow(4);
  header.values = cols.map(([h]) => h);
  styleHeader(header);

  const groups = new Map();
  for (const c of CASES) {
    const key = `${c.module}||${c.feature}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(c);
  }

  let row = 5;
  for (const [key, cases] of groups) {
    const [mod, feature] = key.split('||');
    const specs = [...new Set(cases.filter((c) => c.automation !== 'Manual').map((c) => c.automation))];
    const rr = s.getRow(row);
    rr.values = [mod, feature, cases.length, cases.map((c) => c.id).join(', '), specs.length ? specs.join('\n') : 'Manual only'];
    rr.height = Math.max(22, 14 * (specs.length || 1) + 8);
    rr.eachCell((cell, i) => {
      cell.border = allBorders;
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'top', wrapText: true, horizontal: i === 3 ? 'center' : 'left' };
    });
    row++;
  }
  s.autoFilter = { from: { row: 4, column: 1 }, to: { row: row - 1, column: cols.length } };
}

// --------------------------------------------------------- execution log
{
  const s = wb.addWorksheet('Execution Log', { properties: { tabColor: { argb: 'FFEF4444' } }, views: [{ state: 'frozen', ySplit: 4 }] });
  const cols = [
    ['Test Case ID', 14],
    ['Module', 15],
    ['Title', 44],
    ['Priority', 9],
    ['Build / Env', 18],
    ['Platform', 16],
    ['Tester', 16],
    ['Date', 12],
    ['Status', 14],
    ['Defect ID', 14],
    ['Comments', 40],
  ];
  s.columns = cols.map(([h, w]) => ({ width: w }));
  titleBlock(s, 'Execution Log', 'Fill one line per case per build. Status has a drop-down.', cols.length);
  const header = s.getRow(4);
  header.values = cols.map(([h]) => h);
  styleHeader(header);

  let row = 5;
  for (const c of CASES) {
    const rr = s.getRow(row);
    rr.values = [c.id, c.module, c.title, c.priority, '', c.platform, '', '', 'Not Run', '', ''];
    rr.eachCell((cell, i) => {
      cell.border = allBorders;
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'middle', wrapText: true, horizontal: [1, 4, 8, 9].includes(i) ? 'center' : 'left' };
    });
    s.getCell(row, 9).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Not Run,Pass,Fail,Blocked,Skipped"'],
    };
    row++;
  }
  s.autoFilter = { from: { row: 4, column: 1 }, to: { row: row - 1, column: cols.length } };
}

// ------------------------------------------------------------ jira import
{
  const s = wb.addWorksheet('Jira Import', { properties: { tabColor: { argb: 'FF6366F1' } } });
  const cols = [['Summary', 60], ['Issue Type', 12], ['Priority', 10], ['Labels', 28], ['Component', 18], ['Epic Link', 18], ['Description', 90]];
  s.columns = cols.map(([h, w]) => ({ width: w }));
  titleBlock(s, 'Jira Import', 'Summary / Issue Type / Priority / Labels / Component / Description — matches docs/jira-import.csv', cols.length);
  const header = s.getRow(4);
  header.values = cols.map(([h]) => h);
  styleHeader(header);

  let row = 5;
  for (const c of CASES) {
    const description = [
      `h3. ${c.id} — ${c.title}`,
      `*Module:* ${c.module} / ${c.feature}`,
      `*Type:* ${c.type}   *Role:* ${c.role}   *Platform:* ${c.platform}`,
      `*Preconditions:* ${c.preconditions}`,
      c.data ? `*Test data:* ${c.data}` : '',
      '*Steps:*',
      ...c.steps.map((st) => `# ${st.action}`),
      '*Expected results:*',
      ...c.steps.map((st) => `# ${st.expected || '—'}`),
      `*Postconditions:* ${c.postconditions}`,
      c.notes ? `*Notes:* ${c.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const rr = s.getRow(row);
    rr.values = [
      `[${c.id}] ${c.title}`,
      'Test',
      c.priority === 'P0' ? 'Highest' : c.priority === 'P1' ? 'High' : c.priority === 'P2' ? 'Medium' : 'Low',
      `${c.module.toLowerCase().replace(/\s+/g, '-')},${c.type.toLowerCase()},qa-catalogue`,
      c.module,
      'HostelHub QA',
      description,
    ];
    rr.height = 40;
    rr.eachCell((cell) => {
      cell.border = allBorders;
      cell.font = { size: 9 };
      cell.alignment = { vertical: 'top', wrapText: true };
    });
    row++;
  }
}

const xlsxPath = `${outDir}/HostelHub_TestCases.xlsx`;
await wb.xlsx.writeFile(xlsxPath);

// --------------------------------------------------------------- csv + md
const csvEscape = (v) => `"${String(v).replace(/"/g, '""').replace(/\r?\n/g, '\\n')}"`;
const csvRows = [['Summary', 'Issue Type', 'Priority', 'Labels', 'Component', 'Epic Link', 'Description']];
for (const c of CASES) {
  const description = [
    `h3. ${c.id} — ${c.title}`,
    `*Module:* ${c.module} / ${c.feature}`,
    `*Type:* ${c.type}   *Role:* ${c.role}   *Platform:* ${c.platform}`,
    `*Preconditions:* ${c.preconditions}`,
    c.data ? `*Test data:* ${c.data}` : '',
    '*Steps:*',
    ...c.steps.map((st) => `# ${st.action}`),
    '*Expected results:*',
    ...c.steps.map((st) => `# ${st.expected || '—'}`),
    `*Postconditions:* ${c.postconditions}`,
    c.notes ? `*Notes:* ${c.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  csvRows.push([
    `[${c.id}] ${c.title}`,
    'Test',
    c.priority === 'P0' ? 'Highest' : c.priority === 'P1' ? 'High' : c.priority === 'P2' ? 'Medium' : 'Low',
    `${c.module.toLowerCase().replace(/\s+/g, '-')},${c.type.toLowerCase()},qa-catalogue`,
    c.module,
    'HostelHub QA',
    description,
  ]);
}
writeFileSync(`${outDir}/jira-import.csv`, '\uFEFF' + csvRows.map((r) => r.map(csvEscape).join(',')).join('\r\n'), 'utf8');

let md = `# HostelHub — Test Cases\n\n> Generated ${TODAY} · ${CASES.length} cases · ${CASES.filter((c) => c.automation !== 'Manual').length} automated\n\n`;
md += `| Module | Cases | P0 | P1 | P2 | P3 |\n| --- | --- | --- | --- | --- | --- |\n`;
for (const m of MODULES) {
  const cs = m.cases;
  md += `| ${m.key} | ${cs.length} | ${cs.filter((c) => c.priority === 'P0').length} | ${cs.filter((c) => c.priority === 'P1').length} | ${cs.filter((c) => c.priority === 'P2').length} | ${cs.filter((c) => c.priority === 'P3').length} |\n`;
}
md += `\n---\n`;
for (const m of MODULES) {
  md += `\n## ${m.key}\n`;
  for (const c of m.cases) {
    md += `\n### ${c.id} — ${c.title}\n`;
    md += `**${c.type}** · ${c.priority} (${c.severity}) · ${c.role} · ${c.platform}\n\n`;
    md += `- **Preconditions:** ${c.preconditions}\n`;
    if (c.data) md += `- **Test data:** ${c.data}\n`;
    md += `\n| # | Action | Expected |\n| --- | --- | --- |\n`;
    for (const st of c.steps) md += `| ${st.n} | ${st.action} | ${st.expected || '—'} |\n`;
    md += `\n- **Postconditions:** ${c.postconditions}\n`;
    md += `- **Automation:** ${c.automation}\n`;
    if (c.notes) md += `- **Notes:** ${c.notes}\n`;
  }
}
writeFileSync(`${outDir}/TEST-CASES.md`, md, 'utf8');

const byPrio = ['P0', 'P1', 'P2', 'P3'].map((p) => `${p}:${CASES.filter((c) => c.priority === p).length}`).join(' ');
const steps = CASES.reduce((n, c) => n + c.steps.length, 0);
console.log(`\n  ${xlsxPath}`);
console.log(`  ${outDir}/jira-import.csv`);
console.log(`  ${outDir}/TEST-CASES.md`);
console.log(`\n  cases: ${CASES.length} · steps: ${steps} · automated: ${CASES.filter((c) => c.automation !== 'Manual').length} · manual: ${CASES.filter((c) => c.automation === 'Manual').length}`);
console.log(`  priority: ${byPrio}\n`);
