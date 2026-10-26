import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('RENT-001', 'Rent', 'Rent plan', 'Owner sets a monthly rent plan for a resident', {
    t: 'Functional', p: 'P0', role: 'Owner',
    pre: 'Resident exists with rent 6500 and due day 5',
    steps: [
      'Open the resident detail → Rent section => Amount ₹6500 and "Due on day 5"',
      'Change the amount to 7000 and save => Success; the detail reflects ₹7000',
      'As the resident, open Home => "Pay rent ₹7000" and "Due on day 5"',
    ],
    post: 'rent_plans row updated for that inmate',
  }),

  tc('RENT-002', 'Rent', 'Rent plan', 'Resident without a plan sees a clear message', {
    t: 'Negative', p: 'P1', role: 'Resident',
    pre: 'Resident exists but the owner has not configured rent',
    steps: [
      'Open Home as the resident => "Your owner has not set your rent yet."',
      'Check the dashboard => No "Pay rent" button is offered; no error toast',
      'Owner sets a plan and the resident refreshes => "Pay rent ₹<amount>" appears',
    ],
  }),

  tc('RENT-003', 'Rent', 'Due dates', 'Due-on-day rules produce the right month label', {
    t: 'Boundary', p: 'P1', role: 'Resident',
    steps: [
      'Due day 1 => "Due on day 1" and the current month is payable',
      'Due day 31 in a 30-day month => Due date clamps to the last day of the month, no invalid date',
      'Due day 5 on the 3rd of the month => Payment is offered for the current month (prepaid window allowed)',
    ],
  }),

  tc('RENT-004', 'Rent', 'Pay rent', 'Resident pays rent successfully', {
    t: 'Functional', p: 'P0', role: 'Resident',
    pre: 'Resident has a rent plan of ₹6500 and no payment for the current month',
    data: 'Method: UPI (sandbox) / Amount: 6500',
    steps: [
      'Home → "Pay rent ₹6500" => Pay sheet with Amount, Method, Date',
      'Confirm the amount and method and tap "Done" => Progress indicator, then "Payment successful"',
      'Read the receipt => Receipt id/date/amount shown; "Rs. 6500" recorded',
      'Return to Home => "Paid ✓" replaces the pay button for this month; "Paid this month" counter updates',
    ],
    post: 'payments row created; owner dashboard "Total collected" increases',
    auto: 'tests/web/e2e.spec.js › E2E-RENT-01',
  }),

  tc('RENT-005', 'Rent', 'Pay rent', 'Double payment for the same month is prevented', {
    t: 'Negative', p: 'P0', role: 'Resident',
    pre: 'Resident already paid for the current month',
    steps: [
      'Open Home => "Paid ✓" is shown instead of the pay action',
      'Deep-link to the pay sheet if reachable and submit again => Blocked with "This month is already paid" or the server rejects the duplicate',
      'Owner opens Payments history => Exactly one row for the month',
    ],
  }),

  tc('RENT-006', 'Rent', 'Pay rent', 'Gateway failure keeps the month unpaid', {
    t: 'Negative', p: 'P1', role: 'Resident',
    pre: 'Razorpay order endpoint is forced to fail (invalid key / sandbox down)',
    steps: [
      'Start a payment => Gateway error surfaces as "Payment failed: <reason>"',
      'Check Home => Still unpaid; the pay button is still available for a retry',
      'Owner dashboard => No phantom payment row',
    ],
  }),

  tc('RENT-007', 'Rent', 'Pay rent', 'Cancelling the pay sheet leaves no trace', {
    t: 'Negative', p: 'P2', role: 'Resident',
    steps: [
      'Open the pay sheet and dismiss it without confirming => Back on Home, still unpaid',
      'Check the API => No order/payment created',
    ],
  }),

  tc('RENT-008', 'Rent', 'History', 'Payment history lists payments for the resident', {
    t: 'Functional', p: 'P1', role: 'Resident',
    pre: 'Two payments exist (this month and last month)',
    steps: [
      'Open Payments → History => Both rows with date, method and amount',
      'Open a row => Receipt details match the stored payment',
      'With no payments => "No payments yet."',
    ],
  }),

  tc('RENT-009', 'Rent', 'History', 'Owner sees collections for the property', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Three residents, one paid',
    steps: [
      'Dashboard → "Total collected" => Equals the single payment, not the number of residents',
      'Open Payments => The paid resident shows "Paid ✓"; the others show "Pending"',
      'Filter by resident (if present) => Only that resident\'s payments listed',
    ],
  }),

  tc('RENT-010', 'Rent', 'Pending dues', 'Dashboard pending dues reconcile with payments', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Three residents with rent 6500; one has paid',
    steps: [
      'Read "Pending dues" => 2 × 6500 = 13000',
      'Resident pays through the app and the owner refreshes => Pending drops to 6500, collected rises to 13000',
      'Add a fourth resident => Pending increases by that resident\'s rent only',
    ],
  }),

  tc('RENT-011', 'Rent', 'Receipts', 'Every payment has a downloadable receipt', {
    t: 'Functional', p: 'P2', role: 'Resident',
    steps: [
      'Open a payment from History => Receipt view with hostel name, resident, period, amount, method, date',
      'Tap the download/share action => PDF or share sheet opens with the same values',
      'Check the PDF for placeholder text => None ("Receipt", "Generated by HostelHub")',
    ],
  }),

  tc('RENT-012', 'Rent', 'Invoice', 'Monthly invoice totals rent plus mess charges', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Resident rent 6500, mess charges 2400 configured on the property',
    steps: [
      'Call GET /inmates/:id/invoice => total = 8900 with a breakdown',
      'Open the resident detail → Generate invoice PDF => Same 8900 total in the PDF',
      'Change a mess charge and regenerate => New total reflected, old invoice unchanged for past months',
    ],
  }),

  tc('RENT-013', 'Rent', 'Autopay', 'Autopay link creation is handled gracefully when disabled', {
    t: 'Negative', p: 'P2', role: 'Owner',
    pre: 'Razorpay is not configured with live keys in this environment',
    steps: [
      'Toggle "Auto debit (UPI Autopay)" on => Switch saved',
      'Trigger POST /razorpay/autopay/link => Returns a clear error (not a 500 stack trace)',
      'UI shows a non-blocking message and keeps the manual pay path working',
    ],
  }),

  tc('RENT-014', 'Rent', 'Expenses', 'Owner logs an expense and the P&L updates', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'One resident paid ₹6500 this month',
    data: 'Amount 2000 / Notes: Electricity',
    steps: [
      'Open Expenses → "Add expense" => Sheet with Amount, Notes (optional), Save',
      'Enter 2000 and "Electricity" and save => Expenses list shows "Electricity ₹2000"',
      'Read the P&L => Income 6500, Expenses 2000, Net 4500',
      'Reload => Values persist',
    ],
    auto: 'tests/web/e2e.spec.js › E2E-OPS-03',
  }),

  tc('RENT-015', 'Rent', 'Expenses', 'Expense validation rejects bad amounts', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Submit with an empty amount => Validation message; nothing saved',
      'Submit amount 0 or negative => Rejected',
      'Submit a non-numeric amount => Field rejects input',
      'Submit a very large amount (99999999) => Accepted or capped, P&L stays consistent',
    ],
  }),

  tc('RENT-016', 'Rent', 'P&L', 'P&L matches the underlying rows', {
    t: 'API', p: 'P1', role: 'Owner', plat: 'API',
    steps: [
      'Call GET /pnl?property_id=...&month=<current> => income/expenses/net',
      'Compare income with GET /payments => Sum matches',
      'Compare expenses with GET /expenses => Sum matches',
      'Check net = income - expenses => Arithmetic exact, no rounding drift',
    ],
  }),

  tc('RENT-017', 'Rent', 'Bills', 'Owner generates a consolidated bill', {
    t: 'Functional', p: 'P2', role: 'Owner',
    pre: 'Two residents with dues',
    steps: [
      'Open Bills & invoices => "Total" and a per-inmate breakdown',
      'Choose "Single bill — N inmate(s)" => One PDF with one line per resident',
      'Choose "Split bill" => One PDF per resident',
      'Check the totals => Sum of lines equals the total shown',
    ],
  }),

  tc('RENT-018', 'Rent', 'Bills', 'Bills screen is empty-safe', {
    t: 'Negative', p: 'P2', role: 'Owner',
    pre: 'Property with no residents',
    steps: [
      'Open Bills & invoices => "No inmates to bill." and the generate action disabled',
      'With no property => "Set up your property first."',
    ],
  }),

  tc('RENT-019', 'Rent', 'Payments', 'Payment amounts are validated client-side', {
    t: 'Boundary', p: 'P2', role: 'Resident',
    steps: [
      'Attempt to edit the amount in the pay sheet (if editable) => Only the plan amount is accepted',
      'Try amount 0 / negative via the API POST /payments => 400, no row created',
      'Pay the exact plan amount => Accepted',
    ],
  }),

  tc('RENT-020', 'Rent', 'Isolation', 'Resident cannot pay for another resident', {
    t: 'Security', p: 'P0', role: 'Resident', plat: 'API',
    steps: [
      'As resident A, POST /payments with inmate_id of B => 403/400; no payment created for B',
      'As resident A, GET /payments?inmate_id=<B> => Empty or 403',
    ],
  }),

  tc('RENT-021', 'Rent', 'Currency', 'Amounts render in INR with correct formatting', {
    t: 'UI', p: 'P2', role: 'All',
    steps: [
      'Open the pay sheet => "₹6500" (or "Rs. 6500" in PDFs) consistently formatted',
      'Amount ≥ 100000 => Grouped correctly, no scientific notation',
      'Switch to a narrow viewport => Amount never clipped or wrapped mid-number',
    ],
  }),

  tc('RENT-022', 'Rent', 'Concurrency', 'Two devices paying at once create one payment', {
    t: 'Negative', p: 'P2', role: 'Resident',
    steps: [
      'Start a payment on the phone and on the web at the same time => Both submit',
      'Check the server => Only one payment row for the month; the second is rejected as duplicate',
      'Refresh both clients => Both show "Paid ✓"',
    ],
  }),
];
