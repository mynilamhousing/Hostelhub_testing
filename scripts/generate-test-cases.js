#!/usr/bin/env node
/**
 * Generates the QA deliverables from scripts/testcases.data.js:
 *
 *   docs/HostelHub_TestCases.xlsx  — Summary · Test Cases · Jira Import
 *   docs/jira-import.csv           — Jira → Issues → Import (CSV)
 *   docs/TEST-CASES.md             — human-readable catalogue for the repo
 *
 * Usage: npm run testcases
 */
import ExcelJS from 'exceljs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { testCases, jiraProject } from './testcases.data.js';
import { env } from '../src/config/env.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(here, '..', 'docs');
const xlsxPath = path.join(docsDir, 'HostelHub_TestCases.xlsx');
const csvPath = path.join(docsDir, 'jira-import.csv');
const mdPath = path.join(docsDir, 'TEST-CASES.md');

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3A8A' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
const ZEBRA = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6FC' } };
const PRIORITY_COLOR = { P1: 'FFFFE2E2', P2: 'FFFFF4E0', P3: 'FFEDFBE6' };
const TYPE_COLOR = { Smoke: 'FFE6F7EC', E2E: 'FFE7EEFF', Regression: 'FFFFF0E6', Manual: 'FFF1F1F1' };

const stepsText = (steps) => steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
const jiraPriority = (p) => ({ P1: 'Highest', P2: 'High', P3: 'Medium' }[p] || 'Medium');
const labels = (tc) => [...jiraProject.labels, tc.type.toLowerCase(), tc.priority.toLowerCase()].join(' ');
const jiraDescription = (tc) => [
  `h3. ${tc.title}`,
  '',
  `*Test case ID:* ${tc.id}`,
  `*Module:* ${tc.module}`,
  `*Type:* ${tc.type}`,
  `*Priority:* ${tc.priority}`,
  `*Severity:* ${tc.severity}`,
  '',
  '*Preconditions:*',
  tc.preconditions,
  '',
  '*Steps:*',
  ...tc.steps.map((s) => `# ${s}`),
  '',
  '*Expected result:*',
  tc.expected,
  '',
  `*Test data:* ${tc.data || 'n/a'}`,
  tc.automation ? `*Automated by:* ${tc.automation}` : '*Automated by:* manual check',
].join('\n');

// ── Workbook ────────────────────────────────────────────────────────────────
const wb = new ExcelJS.Workbook();
wb.creator = 'HostelHub QA';
wb.created = new Date();

const styleHeader = (ws, columns) => {
  const row = ws.getRow(1);
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  });
  row.height = 24;
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.columns.forEach((col, i) => { col.width = columns[i] || 20; });
  ws.autoFilter = { from: 'A1', to: { row: 1, column: columns.length } };
};

const styleBody = (ws, rows) => {
  for (let r = 2; r <= rows; r += 1) {
    const row = ws.getRow(r);
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = { bottom: { style: 'hair', color: { argb: 'FFDDDDDD' } } };
      if (r % 2 === 0) cell.fill = ZEBRA;
    });
  }
};

// Summary
const summary = wb.addWorksheet('Summary', { properties: { tabColor: { argb: 'FF1F3A8A' } } });
summary.columns = [{ width: 36 }, { width: 20 }];
summary.addRow(['HostelHub — Test Case Catalogue']).font = { size: 16, bold: true };
summary.addRow(['Generated', new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC']);
summary.addRow(['Web under test', env.webBaseUrl]);
summary.addRow(['API under test', env.apiBaseUrl]);
summary.addRow(['Total test cases', testCases.length]);
summary.addRow([]);

const countBy = (key) => testCases.reduce((acc, tc) => ({ ...acc, [tc[key]]: (acc[tc[key]] || 0) + 1 }), {});
const automated = testCases.filter((t) => t.automation).length;

summary.addRow(['By type', 'Count']).font = { bold: true };
Object.entries(countBy('type')).forEach(([k, v]) => summary.addRow([k, v]));
summary.addRow(['Automated', automated]);
summary.addRow(['Manual', testCases.length - automated]);
summary.addRow([]);

summary.addRow(['By priority', 'Count']).font = { bold: true };
Object.entries(countBy('priority')).sort().forEach(([k, v]) => summary.addRow([k, v]));
summary.addRow([]);

summary.addRow(['By module', 'Count']).font = { bold: true };
Object.entries(countBy('module')).sort().forEach(([k, v]) => summary.addRow([k, v]));
summary.addRow([]);

summary.addRow(['Jira import', '']).font = { bold: true };
[
  'Use docs/jira-import.csv in Jira → Issues → Import issues from CSV.',
  'Map: Summary, Issue Type, Priority, Labels, Description, External issue ID.',
  'External issue ID = test case ID, so re-imports update instead of duplicating.',
  `Issue type defaults to "${jiraProject.issueType}" (set JIRA_ISSUE_TYPE=Test for Xray/Zephyr).`,
].forEach((line) => summary.addRow(['', line]));

// Test Cases
const ws = wb.addWorksheet('Test Cases', { properties: { tabColor: { argb: 'FF0EA5A0' } } });
ws.addRow([
  'Test Case ID', 'Module', 'Title', 'Type', 'Priority', 'Severity',
  'Preconditions', 'Steps', 'Expected Result', 'Test Data', 'Automated By', 'Status',
]);
testCases.forEach((tc) => {
  const row = ws.addRow([
    tc.id, tc.module, tc.title, tc.type, tc.priority, tc.severity,
    tc.preconditions, stepsText(tc.steps), tc.expected, tc.data || 'n/a',
    tc.automation || '—', tc.automation ? 'Automated' : 'Manual',
  ]);
  row.getCell(1).font = { bold: true };
  row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TYPE_COLOR[tc.type] || 'FFFFFFFF' } };
  const pr = row.getCell(5);
  pr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRIORITY_COLOR[tc.priority] || 'FFFFFFFF' } };
  pr.font = { bold: true };
});
styleHeader(ws, [14, 15, 44, 11, 9, 10, 30, 54, 54, 22, 52, 13]);
styleBody(ws, testCases.length + 1);

// Jira Import
const jira = wb.addWorksheet('Jira Import', { properties: { tabColor: { argb: 'FFFFB020' } } });
jira.addRow(['External issue ID', 'Summary', 'Issue Type', 'Priority', 'Labels', 'Description', 'Test Case ID', 'Module']);
testCases.forEach((tc) => {
  const row = jira.addRow([
    tc.id,
    `${tc.id} — ${tc.title}`,
    jiraProject.issueType,
    jiraPriority(tc.priority),
    labels(tc),
    jiraDescription(tc),
    tc.id,
    tc.module,
  ]);
  row.getCell(1).font = { bold: true };
});
styleHeader(jira, [16, 54, 12, 10, 32, 72, 14, 15]);
styleBody(jira, testCases.length + 1);

await wb.xlsx.writeFile(xlsxPath);

// ── CSV ─────────────────────────────────────────────────────────────────────
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const csvHeader = ['External issue ID', 'Summary', 'Issue Type', 'Priority', 'Labels', 'Description', 'Test Case ID', 'Module'];
const csvRows = [
  csvHeader.map(esc).join(','),
  ...testCases.map((tc) => [
    tc.id,
    `${tc.id} — ${tc.title}`,
    jiraProject.issueType,
    jiraPriority(tc.priority),
    labels(tc),
    jiraDescription(tc),
    tc.id,
    tc.module,
  ].map(esc).join(',')),
];
writeFileSync(csvPath, csvRows.join('\r\n'), 'utf8');

// ── Markdown ────────────────────────────────────────────────────────────────
const md = [
  '# HostelHub — Test Case Catalogue',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} · ${testCases.length} cases · ${automated} automated · ${testCases.length - automated} manual`,
  '',
  `Targets: \`${env.webBaseUrl}\` · \`${env.apiBaseUrl}\``,
  '',
  '| ID | Module | Type | Priority | Title | Automated |',
  '| --- | --- | --- | --- | --- | --- |',
  ...testCases.map((tc) => `| ${tc.id} | ${tc.module} | ${tc.type} | ${tc.priority} | ${tc.title} | ${tc.automation ? 'yes' : '**manual**'} |`),
  '',
];
writeFileSync(mdPath, md.join('\n'), 'utf8');

console.log(`✔ ${testCases.length} test cases written`);
console.log(`  ${xlsxPath}`);
console.log(`  ${csvPath}`);
console.log(`  ${mdPath}`);
console.log(`  automated: ${automated} · manual: ${testCases.length - automated}`);
