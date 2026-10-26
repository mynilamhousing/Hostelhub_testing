import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('DOC-001', 'Documents', 'Owner upload', 'Owner adds a hostel document', {
    t: 'Functional', p: 'P1', role: 'Owner',
    data: 'Name: Rent agreement / File: agreement.pdf (240 KB)',
    steps: [
      'More → Documents → "Add hostel document" => Form with Document name, "Pick file (optional)", Save',
      'Enter the name, pick a PDF and save => Toast "File selected"/saved; "Hostel documents" lists the entry',
      'Read the row => Name and "Uploaded <date>"',
      'Reload => Document persists',
    ],
    post: 'documents row with owner_type=hostel',
  }),

  tc('DOC-002', 'Documents', 'Upload', 'Document name is required', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Save with an empty name => Validation message; nothing saved',
      'Save with a name and no file => Metadata-only entry is created (file is optional)',
      'Verify the list => Entry present with no file link',
    ],
  }),

  tc('DOC-003', 'Documents', 'Resident upload', 'Resident uploads an ID document', {
    t: 'Functional', p: 'P1', role: 'Resident',
    data: 'Name: Aadhaar / File: aadhaar.jpg',
    steps: [
      'Resident → Documents → "Upload document" => "My documents" section is visible',
      'Upload the file => Appears under "My documents"',
      'Owner opens Documents => Sees the resident document attributed to that resident',
    ],
    post: 'documents row with owner_type=inmate',
  }),

  tc('DOC-004', 'Documents', 'Delete', 'Deleting a document asks for confirmation', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'A document exists',
    steps: [
      'Tap Delete => Dialog "Delete document?" with the text "Delete \\"<name>\\"? This cannot be undone."',
      'Tap Cancel => Document remains',
      'Tap Delete again and confirm => Row disappears; reload keeps it gone',
    ],
  }),

  tc('DOC-005', 'Documents', 'Edit', 'Document metadata can be edited', {
    t: 'Functional', p: 'P2', role: 'Owner',
    pre: 'A document exists',
    steps: [
      'Tap Edit => "Edit document" with the current name prefilled',
      'Rename it and save => List shows the new name; the file reference is unchanged',
      'Cancel an edit => No change applied',
    ],
  }),

  tc('DOC-006', 'Documents', 'Validation', 'Unsupported or oversized files are rejected', {
    t: 'Negative', p: 'P2', role: 'Owner',
    steps: [
      'Pick an executable (.exe) => Rejected by the picker filter or the server',
      'Pick a 50 MB file => Rejected with a size message, or uploaded with progress; behaviour must be explicit',
      'Pick a 0-byte file => Rejected or accepted consistently',
    ],
    notes: 'Cloudflare R2 is not enabled on this account, so uploads that need object storage must fail with a clear message rather than a silent no-op.',
  }),

  tc('DOC-007', 'Documents', 'Isolation', 'Documents do not leak between residents or properties', {
    t: 'Security', p: 'P0', role: 'Resident', plat: 'API',
    pre: 'Residents A and B each uploaded a document',
    steps: [
      'As A, GET /documents?owner_type=inmate&owner_id=<B> => Empty or 403',
      'As A, GET /documents?owner_type=hostel&owner_id=<property> => Allowed only for own property',
      'As owner B, GET documents of owner A\'s hostel => Empty or 403',
    ],
  }),

  tc('DOC-008', 'Documents', 'Empty state', 'Documents screen is empty-safe per role', {
    t: 'UI', p: 'P2', role: 'All',
    steps: [
      'Owner with no documents => "No documents yet." and "Add hostel document"',
      'Resident with no documents => "No documents yet." and "Upload document"',
      'With no property (owner) => "Set up your hostel first." / empty state without actions',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-OPS-02',
  }),

  tc('DOC-009', 'Documents', 'API', 'Document API round-trip', {
    t: 'API', p: 'P2', role: 'Owner', plat: 'API',
    steps: [
      'POST /documents with owner_type=hostel and a name => 200/201 with id',
      'GET /documents?owner_type=hostel&owner_id=<property> => Contains the row',
      'DELETE the document => Removed from the GET response',
    ],
  }),

  tc('DOC-010', 'Documents', 'UI', 'Long names and many documents stay usable', {
    t: 'Boundary', p: 'P3', role: 'Owner',
    steps: [
      'Add a 150-character document name => Wrapped/ellipsised, no overflow',
      'Add 20 documents => List scrolls, actions reachable',
      'Check the dates => All show "Uploaded YYYY-MM-DD"',
    ],
  }),
];
