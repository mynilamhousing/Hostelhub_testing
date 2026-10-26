/**
 * Test-case authoring helpers.
 *
 * Every case is declared as one `tc(...)` call so the catalogue stays readable
 * in code review, and the generator can emit Excel / CSV / Markdown from the
 * same source.
 *
 * Steps use "action => expected" so the workbook can render a numbered action
 * column and a matching numbered expected-result column.
 */

export const TYPES = ['Functional', 'Negative', 'Validation', 'Boundary', 'UI', 'E2E', 'Security', 'API', 'Compatibility'];
export const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
export const SEVERITY = { P0: 'Blocker', P1: 'Critical', P2: 'Major', P3: 'Minor' };

/** @type {Array<object>} */
export const ALL = [];

export function tc(id, module, feature, title, opts) {
  const steps = (opts.steps || []).map((raw, i) => {
    const [action, expected] = String(raw).split('=>').map((s) => s.trim());
    return { n: i + 1, action, expected: expected || '' };
  });

  const kase = {
    id,
    module,
    feature,
    title,
    type: opts.t || 'Functional',
    priority: opts.p || 'P2',
    severity: opts.sev || SEVERITY[opts.p || 'P2'],
    role: opts.role || 'Owner',
    platform: opts.plat || 'Web · Android · iOS',
    preconditions: opts.pre || 'Owner is signed in; a property with at least one room exists',
    data: opts.data || '',
    steps,
    postconditions: opts.post || 'No side effects beyond those asserted',
    automation: opts.auto || 'Manual',
    requirement: opts.req || `${module} / ${feature}`,
    notes: opts.notes || '',
  };

  ALL.push(kase);
  return kase;
}

/** Common building blocks so preconditions stay consistent across modules. */
export const PRE = {
  owner: 'Owner is signed in; a property with at least one room exists',
  ownerNoProp: 'Owner is signed in; no property has been created yet',
  resident: 'Resident is signed in on the resident shell',
  residentForOwner: (name) => `Owner is signed in; resident "${name}" exists in a room with a free bed`,
  guest: 'No session cookie or token is present',
  admin: 'Platform admin account is signed in at /admin',
};

export const DATA = {
  owner: { username: 'qa_owner', password: 'Passw0rd!23', email: 'qa_owner@hostelhub.test' },
  resident: { username: 'qa_resident', password: 'Resident!23' },
  hostel: { name: 'QA Hostel', type: 'Hostel', address: '12 Test Road, Pune' },
  room: { no: 'R101', capacity: 4, rent: 6500 },
  resident1: { name: 'Asha Verma', phone: '9876500001', email: 'asha.qa@hostelhub.test', bed: 1, rent: 6500, dueDay: 5 },
};
