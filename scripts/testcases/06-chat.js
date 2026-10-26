import { tc, PRE } from './_helpers.js';

export const cases = [
  tc('CHAT-001', 'Chat', 'Owner thread', 'Owner opens a chat thread with a resident', {
    t: 'Functional', p: 'P1', role: 'Owner',
    pre: 'Property with at least one resident',
    steps: [
      'More → "Chat" => Chat list showing residents with "No messages yet — say hello." when empty',
      'Tap a resident => Thread opens with the resident name and a message composer',
      'Send "Hi Asha, rent is due on the 5th" => Message appears on the right with the owner role and a timestamp',
      'Reload => Message still present and ordered correctly',
    ],
    post: 'chat_messages row with sender_role=owner',
  }),

  tc('CHAT-002', 'Chat', 'Resident thread', 'Resident replies to the owner', {
    t: 'Functional', p: 'P0', role: 'Resident',
    pre: 'Owner sent one message to this resident',
    steps: [
      'Resident → More → "Chat with owner" => Thread shows the owner message',
      'Reply "Paid today" and send => Appears on the right as the resident',
      'Owner opens the thread and refreshes => Reply appears on the left with sender_role=inmate',
    ],
    post: 'Second chat_messages row with sender_role=inmate',
  }),

  tc('CHAT-003', 'Chat', 'Composer', 'Empty or whitespace messages are blocked', {
    t: 'Validation', p: 'P1', role: 'Owner',
    steps: [
      'Tap send with an empty composer => Nothing is sent; the send action is disabled or ignored',
      'Enter "   " (spaces) and send => Blocked',
      'Enter one character and send => Sent',
    ],
  }),

  tc('CHAT-004', 'Chat', 'Composer', 'Long messages are handled', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Send a 500-character message => Accepted and wrapped, no overflow',
      'Send a 5000-character message => Either accepted or rejected with a clear limit; never truncated silently',
      'Check the bubble => Text selectable/copyable where the platform allows',
    ],
  }),

  tc('CHAT-005', 'Chat', 'Composer', 'Multi-line input and special characters survive', {
    t: 'Boundary', p: 'P2', role: 'Owner',
    steps: [
      'Send "Line 1\\nLine 2" => Both lines render, newline preserved',
      'Send emoji "🔔 ₹6500 due" => Rendered correctly, no mojibake',
      'Send "<script>alert(1)</script>" => Displayed as literal text, never executed (XSS guard)',
    ],
  }),

  tc('CHAT-006', 'Chat', 'List', 'Chat list ordering follows the latest message', {
    t: 'Functional', p: 'P2', role: 'Owner',
    pre: 'Two resident threads, different last-message times',
    steps: [
      'Open Chat list => Most recent thread first',
      'Send a message in the older thread and return => Its order updates',
      'Reload => Order preserved',
    ],
  }),

  tc('CHAT-007', 'Chat', 'Empty state', 'Chat is empty-safe and property-aware', {
    t: 'UI', p: 'P2', role: 'Owner',
    pre: 'Property with no residents',
    steps: [
      'Open Chat => "No inmates yet." and no composer',
      'With no property => "Set up your hostel first."',
    ],
  }),

  tc('CHAT-008', 'Chat', 'Isolation', 'A resident cannot read another resident thread', {
    t: 'Security', p: 'P0', role: 'Resident', plat: 'API',
    pre: 'Residents A and B, each with messages',
    steps: [
      'As A, GET /chat?inmate_id=<B> => Empty or 403',
      'As A, POST a message with inmate_id=<B> => Rejected',
      'As A, open the chat UI => Only A\'s thread is reachable',
    ],
  }),

  tc('CHAT-009', 'Chat', 'Isolation', 'Another owner cannot read the thread', {
    t: 'Security', p: 'P0', role: 'Owner', plat: 'API',
    pre: 'Two owners, each with residents',
    steps: [
      'As owner B, GET /chat?inmate_id=<resident of A> => Empty or 403',
      'As owner B, try the app chat list => Does not list A\'s residents',
    ],
  }),

  tc('CHAT-010', 'Chat', 'Ordering', 'Message order matches send time', {
    t: 'Functional', p: 'P1', role: 'Owner',
    steps: [
      'Send three messages in sequence => Displayed oldest → newest',
      'Check timestamps => Monotonic, same timezone display',
      'Send from both sides interleaved => Merged order is still chronological',
    ],
  }),

  tc('CHAT-011', 'Chat', 'Refresh', 'New messages arrive without a full reload', {
    t: 'Functional', p: 'P2', role: 'Owner',
    steps: [
      'Resident sends a message while the owner thread is open => Message appears on the next poll/refresh, or is documented as manual-refresh only',
      'Leave and re-enter the thread => Message is there',
    ],
  }),

  tc('CHAT-012', 'Chat', 'Composer', 'Draft survives navigation', {
    t: 'Boundary', p: 'P3', role: 'Owner',
    steps: [
      'Type a draft, leave the thread and come back => Draft retained or cleared; behaviour must be consistent',
      'Type a draft and background the app, then return => No duplicate send and no lost text without warning',
    ],
  }),

  tc('CHAT-013', 'Chat', 'UI', 'Chat is usable on mobile and desktop', {
    t: 'Compatibility', p: 'P2', role: 'All',
    steps: [
      'Open a thread at 390×844 => Composer above the keyboard; bubbles full width',
      'Open at 1440×900 => Thread width capped, not stretched edge to edge',
      'Scroll a 50-message thread => Auto-scrolls to the newest; header stays visible',
    ],
  }),

  tc('CHAT-014', 'Chat', 'API', 'Chat API validates the payload', {
    t: 'API', p: 'P2', role: 'Owner', plat: 'API',
    steps: [
      'POST /chat without inmate_id => 400',
      'POST with an empty message => 400',
      'POST a valid message => 201/200 with the stored row and sender_role',
      'GET /chat?inmate_id=... => Messages for that thread only',
    ],
  }),
];
