# HostelHub — Test Cases

> Generated 2026-10-26 · 308 cases · 26 automated

| Module | Cases | P0 | P1 | P2 | P3 |
| --- | --- | --- | --- | --- | --- |
| Authentication | 26 | 12 | 7 | 7 | 0 |
| Onboarding | 20 | 6 | 8 | 6 | 0 |
| Residents | 24 | 5 | 11 | 8 | 0 |
| Rent | 22 | 4 | 10 | 8 | 0 |
| Polls | 22 | 4 | 9 | 9 | 0 |
| Chat | 14 | 3 | 3 | 7 | 1 |
| Notices | 10 | 2 | 3 | 5 | 0 |
| Complaints | 14 | 4 | 4 | 6 | 0 |
| Visitors | 14 | 2 | 6 | 6 | 0 |
| Deposits | 16 | 4 | 9 | 3 | 0 |
| Documents | 10 | 1 | 4 | 4 | 1 |
| Resident app | 22 | 8 | 8 | 6 | 0 |
| Settings | 20 | 3 | 3 | 12 | 2 |
| Admin | 10 | 2 | 5 | 2 | 1 |
| API | 18 | 6 | 7 | 4 | 1 |
| Security | 16 | 8 | 6 | 2 | 0 |
| Web UI | 15 | 2 | 5 | 6 | 2 |
| End-to-end | 15 | 5 | 8 | 2 | 0 |

---

## Authentication

### AUTH-001 — Owner logs in with valid credentials
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner account qa_owner exists and is not locked; property "QA Hostel" exists
- **Test data:** Username: qa_owner / Password: Passw0rd!23

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open https://hostelhub.mynilam.in | Login screen renders with heading "Welcome back", Username, Password, "Log in", "Sign up" |
| 2 | Enter username "qa_owner" and password "Passw0rd!23" | Both fields show the typed values; password is masked |
| 3 | Tap "Log in" | Button shows a progress state; no validation error appears |
| 4 | Wait for the shell | Dashboard opens with occupancy, dues and the bottom tab bar (Home, Inmates, Polls, More) |

- **Postconditions:** Session token stored (localStorage on web); user.role = owner
- **Automation:** tests/web/smoke.spec.js › SMK-03

### AUTH-002 — Login rejected for a wrong password
**Negative** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Username: qa_owner / Password: WrongPass1

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter username "qa_owner" and password "WrongPass1" | Fields accept input |
| 2 | Tap "Log in" | Request to POST /auth/login returns 401 |
| 3 | Observe the screen | Error message "Invalid username or password" (or the server error) is shown; user stays on /login |
| 4 | Reload the page | Still on /login, no session created |

- **Postconditions:** No session token written
- **Automation:** tests/web/regression.spec.js › REG-API-03

### AUTH-003 — Login rejected for an unknown username
**Negative** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Username: ghost_user / Password: Passw0rd!23

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter a username that does not exist and any password | Fields accept input |
| 2 | Tap "Log in" | Server responds 401 with the same generic message as AUTH-002 |
| 3 | Check the copy | The message does not reveal whether the username exists (no user enumeration) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-004 — Empty credentials are blocked before the request
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Username: (empty) / Password: (empty)

| # | Action | Expected |
| --- | --- | --- |
| 1 | clear both fields and tap "Log in" | Message "Enter your username and password" appears |
| 2 | Watch the network panel | No POST /auth/login request is issued |
| 3 | Fill username only and tap "Log in" | Same message; request still not issued |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-005 — Password field masks input and supports paste
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Type into Password | Characters render as dots |
| 2 | Paste "Passw0rd!23" from the clipboard | Full value is accepted |
| 3 | Toggle the platform password reveal (Android/iOS eye icon, if present) | Reveal shows plain text and reverts on second tap |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-006 — Session survives a page reload
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in

| # | Action | Expected |
| --- | --- | --- |
| 1 | Reload the page (F5 / pull-to-refresh on native) | Splash shows briefly |
| 2 | Wait for bootstrap | Dashboard renders without asking for credentials again |
| 3 | Open /home directly in a new tab | Same dashboard, no redirect to /login |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/regression.spec.js › REG-SES-01

### AUTH-007 — Log out clears the session everywhere
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the More tab | "Manage" heading with "Log out" at the bottom of the list |
| 2 | Tap "Log out" | Returned to /login |
| 3 | Reload the page | Still /login; localStorage/sessionStorage hold no token |
| 4 | Paste a protected URL (/inmates, /polls, /expenses) | Redirected to /login |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-AUTH-06 · regression REG-SES-04

### AUTH-008 — Guest is redirected from every protected route
**Security** · P0 (Blocker) · Guest · Web · Android · iOS

- **Preconditions:** No session cookie or token is present

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /home | Redirect to /login |
| 2 | Open /inmates and /inmates/new | Redirect to /login |
| 3 | Open /setup, /expenses, /settings, /bills, /chat, /sos | Each redirects to /login |
| 4 | Open the API endpoint /properties without a token | 401 JSON error, no data leak |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/regression.spec.js › REG-SES-03

### AUTH-009 — Owner signs up with valid details
**Functional** · P0 (Blocker) · Guest · Web · Android · iOS

- **Preconditions:** No account exists for the generated username
- **Test data:** Full name: QA Owner / Username: qa_owner_<ts> / Password: Passw0rd!23 / Email: qa_owner_<ts>@hostelhub.test

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /register | "Create your account as a property owner." with Full name, Username, Password, Email, Phone |
| 2 | Fill all fields with valid data | No inline errors |
| 3 | Tap "Create account" | Server returns 201; session created |
| 4 | Observe navigation | Land on /home showing the "Set up your hostel" empty state |

- **Postconditions:** users row created with role=owner
- **Automation:** tests/web/e2e.spec.js › E2E-AUTH-03

### AUTH-010 — Register blocks a password shorter than 8 characters
**Validation** · P1 (Critical) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Password: abc123

| # | Action | Expected |
| --- | --- | --- |
| 1 | Fill the form with an 6-character password | Field is accepted visually |
| 2 | Tap "Create account" | Inline error "Password must be at least 8 characters" |
| 3 | Check the network | POST /auth/register is not sent (or returns 400) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-011 — Register requires the mandatory fields
**Validation** · P1 (Critical) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Leave Full name empty and submit | Message "Fill in name, username and password" |
| 2 | Fill name, leave username empty and submit | Same validation message |
| 3 | Fill name + username, leave password empty and submit | Same validation message |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-012 — Duplicate username is rejected
**Negative** · P0 (Blocker) · Guest · Web · Android · iOS

- **Preconditions:** qa_owner already exists
- **Test data:** Username: qa_owner

| # | Action | Expected |
| --- | --- | --- |
| 1 | Register with username "qa_owner" and any valid password | Server returns 409/400 |
| 2 | Observe the form | Error such as "Username already taken" is shown |
| 3 | Verify the original account | Can still log in with the original password |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-013 — Email is optional but validated when present
**Boundary** · P2 (Major) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Register with a blank Email and Phone | Account is created |
| 2 | Register another account with Email "not-an-email" | Submission is rejected or the email is ignored, never stored malformed |
| 3 | Query the API for the created user | email is null, not the string "not-an-email" |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-014 — Username length and character boundaries
**Boundary** · P2 (Major) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Try a 1-character username | Accepted or minimal validation message; behaviour recorded |
| 2 | Try a 64-character username | Accepted only if the server also accepts it |
| 3 | Try "user name" (space) and "user@1" | Either rejected with a clear message or stored verbatim; login with that username must work |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-015 — Reset link is requested for a known email
**Functional** · P1 (Critical) · Guest · Web · Android · iOS

- **Preconditions:** An owner account exists with email qa_owner@hostelhub.test

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /forgot-password | Heading "Forgot password" with Email + "Send reset link" |
| 2 | Enter the registered email and submit | Confirmation "Check your email" |
| 3 | Call the mail provider / check the reset token table | A reset token row is created for that user |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-AUTH-04

### AUTH-016 — Invalid email format is rejected
**Validation** · P2 (Major) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter "abc" and submit | Inline error "Enter a valid email address" |
| 2 | Confirm the network | No POST /auth/forgot-password request is issued |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-017 — Unknown email does not leak the account list
**Security** · P2 (Major) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit "nobody@hostelhub.test" | Same "Check your email" confirmation as the known-email case |
| 2 | Compare response times/status codes with AUTH-015 | No measurable difference that reveals existence |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-018 — Reset page sets a new password
**Functional** · P0 (Blocker) · Guest · Web · Android · iOS

- **Preconditions:** A valid reset token exists for qa_owner

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /reset?token=<valid> | Page "Reset your password" with two password fields |
| 2 | Enter "NewPassw0rd!" twice and tap "Reset password" | Message "Password reset! You can now log in." |
| 3 | Log in with the new password | Succeeds |
| 4 | Log in with the old password | 401 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-019 — Reset rejects mismatched or short passwords
**Negative** · P1 (Critical) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter "abc123" twice | Message "Password must be at least 6 characters" |
| 2 | Enter "NewPassw0rd!" and "Different1!" | Message "Passwords do not match" |
| 3 | Fix both fields and submit | Reset succeeds |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-020 — An expired or reused token is refused
**Security** · P0 (Blocker) · Guest · Web · Android · iOS

- **Preconditions:** A reset token that was already used once

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the reset page with the used token and submit a new password | Error response; password unchanged |
| 2 | Open with a truncated/garbage token | Error response, no 500 |
| 3 | Log in with the previously-set password | Still works |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-021 — Owner is redirected away from resident-only routes
**Security** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in, property exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Navigate to /complaints/new | Redirected to /home |
| 2 | Navigate to /leave/new | Redirected to /home |
| 3 | Navigate to /deposit | Redirected to /home |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-022 — Resident is redirected away from owner-only routes
**Security** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Resident is signed in

| # | Action | Expected |
| --- | --- | --- |
| 1 | Navigate to /setup | Redirected to /home |
| 2 | Navigate to /inmates/new, /expenses, /settings, /bills, /visitors, /leave, /deposits, /checkout, /sos, /chat | Each redirects to /home |
| 3 | Confirm the resident tab bar | Only resident tabs (Home, Polls, More/Menu) are present |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-023 — Non-admin cannot open the admin panel
**Security** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Sign in as owner and open /admin | Redirected to /home |
| 2 | Call GET /admin/stats with the owner token | 401/403, not 200 |
| 3 | Call POST /admin/pricing with the owner token | 401/403 and global rates unchanged |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-024 — Expired or tampered token forces re-login
**Security** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Replace the stored token with "abc.def.ghi" and reload | Redirected to /login |
| 2 | Clear the token and reload | Redirected to /login |
| 3 | Call /properties with a tampered Bearer token | 401 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-025 — Splash resolves to the right home per role
**Functional** · P2 (Major) · All · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Cold start with an owner session | /splash then /home |
| 2 | Cold start with a platform admin session | /splash then /admin |
| 3 | Cold start signed out | /splash then /login |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### AUTH-026 — Rapid repeated login attempts are rate limited
**Security** · P2 (Major) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit 10 wrong passwords in a row for the same username | Each returns 401 |
| 2 | Observe the 11th attempt | Throttled (429 or a temporary lock), or documented as not implemented |
| 3 | Confirm a valid login still works after the window | If throttling exists, it clears |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual
- **Notes:** Record the observed behaviour; the Worker currently relies on account-level checks only.

## Onboarding

### ONB-001 — New owner is pushed into setup
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; no property has been created yet

| # | Action | Expected |
| --- | --- | --- |
| 1 | Sign in with a fresh owner account | Dashboard shows "Set up your hostel" with a "Get started" action |
| 2 | Tap "Get started" | /setup opens with "Set up your property" |
| 3 | Open the Inmates tab | Empty state "No hostel yet · Set up your hostel to start adding rooms and inmates" |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-ONB-01

### ONB-002 — Owner creates a hostel with valid details
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner signed in with no property
- **Test data:** Property name: QA Hostel / Type: Hostel / Address: 12 Test Road, Pune

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /setup | Section "Tell us about your hostel" with Property name, Property type, Address (optional) |
| 2 | Enter name, pick type "Hostel", enter the address | Fields accept the values |
| 3 | Tap "Next" | Section "Add your rooms" appears |
| 4 | Observe the header | "Room number + bed capacity. Add as many as you need." |

- **Postconditions:** properties row created for owner_id
- **Automation:** tests/web/e2e.spec.js › E2E-ONB-02 · E2E-ONB-03

### ONB-003 — Property name is mandatory
**Validation** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /setup and leave Property name empty | "Next" is tappable |
| 2 | Tap "Next" | Message "Enter a hostel name"; stays on step 1 |
| 3 | Enter a name and continue | Advances to rooms |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-004 — Property type drives the label and behaviour
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Select type "House (rent)" | Setup copy refers to the house; saved value is house |
| 2 | Repeat with "Office space" | Saved value is office and the residents list still works |
| 3 | Check /settings after setup | "Type: House (rent)" / "Type: Office space" is displayed correctly |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-005 — Address is optional
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Create a property with the address empty | Setup completes |
| 2 | Open /settings | Address is blank, no placeholder artefact |
| 3 | Enter a very long address (200 chars) in another property | Accepted or truncated, but saved without corruption |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-006 — Owner adds a room with number and capacity
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is on the rooms step of /setup
- **Test data:** Room no.: R101 / Beds: 4

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter "R101" and capacity "4" | Values accepted |
| 2 | Tap "Add room" | Room chip "Room R101" appears in the list; form resets |
| 3 | Add a second room "R102" with 2 beds | Both chips listed |
| 4 | Tap "Finish setup" | Dashboard opens with the property name and occupancy 0/6 |

- **Postconditions:** rooms rows created for the property
- **Automation:** tests/web/e2e.spec.js › E2E-ONB-02 · E2E-ONB-03

### ONB-007 — Room number is required
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Leave Room no. empty and tap "Add room" | No room is created; a validation message is shown |
| 2 | Enter a room number only and add | Room is created with the default capacity |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-008 — Bed capacity boundaries
**Boundary** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter capacity 0 and add | Rejected (must be at least 1) |
| 2 | Enter capacity 1 | Room created with 1 bed |
| 3 | Enter capacity 50 | Accepted; occupancy reads 0/50 |
| 4 | Enter "abc" or negative "-2" | Rejected, no room created |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-009 — Duplicate room numbers are rejected
**Negative** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Add room R101, then add R101 again | Second attempt is refused (duplicate message or existing chip updated, never two R101 rows) |
| 2 | Query GET /rooms?property_id=... | Exactly one R101 row |
| 3 | Add "r101" (lowercase) | Treated as the same room or accepted as distinct; behaviour recorded |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-010 — Rooms can be added later from the Inmates tab
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Inmates | "Rooms" section with "Add room" |
| 2 | Add room "R201" with 3 beds | Appears immediately with "0 / 3 beds" |
| 3 | Reload | Room still present |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-011 — Room chip shows live occupancy
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Room R101 capacity 4 with 1 resident

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Inmates | Room R101 shows "1 / 4 beds" |
| 2 | Add another resident to R101 | Count becomes "2 / 4" without a manual refresh |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-012 — A full room is blocked for new residents
**Negative** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Room R101 (capacity 1) already has 1 resident

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Add inmate" | Room picker lists R101 as "Room R101 (1/1)" |
| 2 | Select R101 | Message "Room R101 is full (1/1)"; the form cannot submit |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-013 — Setup state survives a reload
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | On the rooms step, add one room, then reload the page | Property still exists; rooms step shows the saved room |
| 2 | Complete setup and reload | Dashboard still bound to the property |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-014 — Owner adds a second property
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner already owns "QA Hostel"

| # | Action | Expected |
| --- | --- | --- |
| 1 | From the dashboard property menu choose "Add property" | Setup opens for a new property |
| 2 | Create "QA Annex" with room A1 | Both properties exist for the owner |
| 3 | GET /properties?owner_id=... | Two rows, correct owner_id |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual
- **Notes:** Extra properties are billed — see the Upgrade screen rules (ADM/UPG cases).

### ONB-015 — Owner switches between properties
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner has two properties with distinct residents

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the property switcher on the dashboard | Both properties listed |
| 2 | Select the second property | Dashboard, Inmates and Polls all switch to that property |
| 3 | Reload | The selected property persists |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-016 — Every owner screen explains what is missing
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Newly created property with no residents

| # | Action | Expected |
| --- | --- | --- |
| 1 | Inmates | "No inmates yet — add your first inmate." |
| 2 | Polls | "No polls yet — create your first mess poll." |
| 3 | Expenses | "No expenses logged." |
| 4 | Complaints | "No complaints yet." |
| 5 | Visitors / Leave | "No visitors yet." / "No one on leave." |
| 6 | Documents | "No documents yet." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-017 — Resident cannot open setup
**Security** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Resident is signed in on the resident shell

| # | Action | Expected |
| --- | --- | --- |
| 1 | Navigate to /setup | Redirected to /home |
| 2 | Call POST /properties with the resident token | 401/403; no property created |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-018 — Property creation rejects invalid payloads
**API** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /properties with {} | 400 with an error field |
| 2 | POST with name only (no type) | 400 or type defaults to hostel — value must be one of hostel/house/office |
| 3 | POST with type "castle" | Rejected or normalised; never stored as "castle" |
| 4 | POST a valid payload | 201 with the created property id |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-019 — Rooms cannot belong to another owner
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Two owners, each with a property

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /rooms with property_id belonging to owner B | 401/403 or the row is rejected |
| 2 | GET /rooms?property_id=<B> with owner A token | Empty list or 403, never B rows |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ONB-020 — Setup is usable on a phone viewport
**Compatibility** · P2 (Major) · Owner · Web (390×844) · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /setup at 390×844 | No horizontal scroll, fields full width, buttons reachable |
| 2 | Open the keyboard in the room number field | Field scrolls into view above the keyboard |
| 3 | Rotate to landscape | Layout remains usable |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Residents

### RES-001 — Owner adds a resident with all details
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Property with room R101 (capacity 4) and no residents
- **Test data:** Name: Asha Verma / Phone: 9876500001 / Email: asha.qa@hostelhub.test / Bed 1 / Rent 6500 / Due day 5

| # | Action | Expected |
| --- | --- | --- |
| 1 | Inmates → "Add inmate" | "Add tenant" form with Full name, Phone, Email, Room, Bed no., Rent, Due day |
| 2 | Enter the name, phone and email | Values accepted |
| 3 | Pick room R101 | Room chip highlights; the form shows the room capacity |
| 4 | Enter bed 1, rent 6500, due day 5 and tap "Add inmate" | "Inmate added" confirmation |
| 5 | Read the credentials dialog | Username + Password shown, "Share these login details with the inmate:", Copy / Done actions |
| 6 | Tap "Done" | Returned to the list, resident card "Asha Verma · Room R101 · Bed 1 · ₹6500" |

- **Postconditions:** inmates row created; room occupancy 1/4; credentials hash stored
- **Automation:** tests/web/e2e.spec.js › E2E-INM-02

### RES-002 — Full name is mandatory
**Validation** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Leave Full name empty, fill the rest and submit | Message "Enter a name"; no record created |
| 2 | Enter a single character name | Accepted (record it) and displayed correctly |
| 3 | Enter a 100-character name | Accepted or rejected, never truncated silently in the list |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-003 — A room must be selected
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Fill the name and submit without picking a room | Message "Pick a room"; no record created |
| 2 | With no rooms at all, open Add inmate | Empty state "No rooms yet — add rooms first." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-004 — Bed number is validated against room capacity
**Boundary** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Room R101 capacity 4, bed 1 occupied

| # | Action | Expected |
| --- | --- | --- |
| 1 | Pick R101 and enter bed 5 | Message "Bed 5 is out of range (1-4)" |
| 2 | Enter bed 0 or a negative number | Rejected by the numeric field |
| 3 | Enter bed 1 (already taken) | Message "Bed 1 in room R101 is already taken" |
| 4 | Enter bed 2 | Accepted and the resident is created |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-005 — Phone and email are optional
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Add a resident with name + room + bed only | Created successfully |
| 2 | Open the resident detail | Phone/Email show as empty, invoice-email action reports "This inmate has no email on file" |
| 3 | Open chat for that resident | Still possible from the owner side |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-006 — Rent defaults to the room rent and can be overridden
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Pick room R101 | Rent field prefills 6500 |
| 2 | Override to 5000 and save | Resident saved with ₹5000 |
| 3 | Open the resident detail → Rent | Shows ₹5000 for that resident |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-007 — Due day boundaries
**Boundary** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter due day 31 and save | Accepted |
| 2 | Enter 0 or 32 | Rejected by field validation |
| 3 | Enter 1 | Accepted; the resident dashboard shows "Due on day 1" |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-008 — Each resident gets unique credentials
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Add two residents in the same room | Two different username/password pairs |
| 2 | Copy credentials for the first | Clipboard contains "Username: ... Password: ..." |
| 3 | Log in with the first resident credentials | Resident shell opens; the second resident is not affected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-INM-02

### RES-009 — Regenerating credentials invalidates the old password
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** A resident exists with known credentials

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the resident detail → "Regenerate login credentials" | New username/password dialog appears |
| 2 | Note the new password and dismiss | Detail screen unchanged otherwise |
| 3 | Log in as the resident with the OLD password | 401 |
| 4 | Log in with the NEW password | Succeeds |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-010 — Resident list shows room, bed and rent
**UI** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Two residents in different rooms

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Inmates | Each card reads "<Name> · Room <no> · Bed <n> · ₹<rent>" |
| 2 | Check the Rooms section | Occupancy counts match the number of residents per room |
| 3 | Reload | Same data, no duplicates |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-INM-01 · smoke SMK-05

### RES-011 — Empty state guides the owner
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Property with rooms but no residents

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Inmates | "No inmates yet — add your first inmate." with an "Add inmate" action |
| 2 | With no rooms either | "No rooms yet — add your first room." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-012 — Owner moves a resident to another room
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Resident in R101 bed 1; room R102 has free beds

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the resident detail → "Change room" | Sheet "Move to room" with the list of rooms and free beds |
| 2 | Pick R102 and a free bed | Selection highlighted |
| 3 | Confirm | Toast "Moved to Room R102, bed <n>" |
| 4 | Check occupancy | R101 back to previous count, R102 incremented |
| 5 | Log in as the resident | Resident home shows Room R102, bed <n> |

- **Postconditions:** inmates row updated; both rooms recalculated
- **Automation:** Manual

### RES-013 — Move into a full room is refused
**Negative** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Room R103 is full (capacity reached)

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Change room for a resident | R103 is shown as full or absent from the free-bed list |
| 2 | Force-select R103 if it is selectable and confirm | "Room is full"; the move is not applied |
| 3 | Verify the resident | Still in the original room |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-014 — Moving into the same bed is a no-op
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Change room and pick the current room/bed | Save either refuses with a clear message or succeeds without duplicating the record |
| 2 | Check the list | Exactly one row for the resident; occupancy unchanged |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-015 — Occupancy is recalculated for both rooms
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** R101 1/4, R102 0/2

| # | Action | Expected |
| --- | --- | --- |
| 1 | Move the resident from R101 to R102 | R101 reads 0/4 and R102 reads 1/2 on the Inmates screen |
| 2 | Call GET /rooms twice | Counts are derived from inmates, not cached stale values |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-016 — Resident detail summarises stay, rent and deposit
**UI** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open a resident | Header "Inmate details" with name, "Room R101 · Bed 1", Joined date, status "Current resident" |
| 2 | Scroll | Sections Rent, Security deposit, Stay, Payment history, Complaints, Leave |
| 3 | With no payments | "No payments yet."; no complaints |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-017 — Auto-debit toggle persists per resident
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Toggle "Auto debit (UPI Autopay)" on | Switch turns on; helper text "Auto-collect rent each month from this inmate." |
| 2 | Reload and reopen | Toggle stays on |
| 3 | Toggle off and reopen | Stays off |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual
- **Notes:** Razorpay autopay is scaffolded only; the persisted flag is what is asserted here.

### RES-018 — Generate an invoice PDF for a resident
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the resident → "Generate invoice PDF" | PDF preview/download with the hostel name, resident, period and total due |
| 2 | Check the amounts | Rent for the month plus mess charges; "Total due: Rs. <amount>" matches the API /inmates/:id/invoice |
| 3 | Open the PDF metadata | Generated by HostelHub, no placeholder text |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-019 — Email invoice is blocked without an email
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Resident created without an email

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Email invoice" | Message "This inmate has no email on file" |
| 2 | Add an email via change/edit, then retry | Success toast "Invoice emailed to <email>" |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-020 — WhatsApp invoice needs a phone number
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Resident created without a phone

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Send invoice via WhatsApp" | Message "This inmate has no phone number on file" |
| 2 | With a phone present | WhatsApp deep link opens prefilled with "Hi <name>, here is your bill:" and the line items |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-021 — Checkout starts from the resident detail
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Resident with a recorded deposit

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the resident → Checkout entry point | Deposits/Checkout screen opens with that resident preselected |
| 2 | Confirm the resident name and deposit | Refundable amount is shown |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-022 — Resident cannot read another resident's record
**Security** · P0 (Blocker) · Resident · API

- **Preconditions:** Residents A and B exist in the same property

| # | Action | Expected |
| --- | --- | --- |
| 1 | As A, call GET /inmates/<B id> | 403/404, not B's data |
| 2 | As A, call GET /payments?inmate_id=<B> | Empty or 403 |
| 3 | As A, call PATCH /inmates/<B> to change the room | Refused |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-023 — Phone and email formats are validated
**Validation** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter phone "abc" | Rejected by the numeric keyboard or validation message |
| 2 | Enter phone "12345" (too short) | Accepted or rejected consistently; record which |
| 3 | Enter email "asha@" | Validation message; record not saved with a malformed email |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RES-024 — Adding a resident updates dashboard counters
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Property with 0 residents

| # | Action | Expected |
| --- | --- | --- |
| 1 | Note the dashboard occupancy | 0/4 |
| 2 | Add a resident | Dashboard occupancy becomes 1/4 and "Total collected" excludes the new resident until a payment exists |
| 3 | Return to Inmates | The resident appears once |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Rent

### RENT-001 — Owner sets a monthly rent plan for a resident
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Resident exists with rent 6500 and due day 5

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the resident detail → Rent section | Amount ₹6500 and "Due on day 5" |
| 2 | Change the amount to 7000 and save | Success; the detail reflects ₹7000 |
| 3 | As the resident, open Home | "Pay rent ₹7000" and "Due on day 5" |

- **Postconditions:** rent_plans row updated for that inmate
- **Automation:** Manual

### RENT-002 — Resident without a plan sees a clear message
**Negative** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Resident exists but the owner has not configured rent

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home as the resident | "Your owner has not set your rent yet." |
| 2 | Check the dashboard | No "Pay rent" button is offered; no error toast |
| 3 | Owner sets a plan and the resident refreshes | "Pay rent ₹<amount>" appears |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-003 — Due-on-day rules produce the right month label
**Boundary** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Due day 1 | "Due on day 1" and the current month is payable |
| 2 | Due day 31 in a 30-day month | Due date clamps to the last day of the month, no invalid date |
| 3 | Due day 5 on the 3rd of the month | Payment is offered for the current month (prepaid window allowed) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-004 — Resident pays rent successfully
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Resident has a rent plan of ₹6500 and no payment for the current month
- **Test data:** Method: UPI (sandbox) / Amount: 6500

| # | Action | Expected |
| --- | --- | --- |
| 1 | Home → "Pay rent ₹6500" | Pay sheet with Amount, Method, Date |
| 2 | Confirm the amount and method and tap "Done" | Progress indicator, then "Payment successful" |
| 3 | Read the receipt | Receipt id/date/amount shown; "Rs. 6500" recorded |
| 4 | Return to Home | "Paid ✓" replaces the pay button for this month; "Paid this month" counter updates |

- **Postconditions:** payments row created; owner dashboard "Total collected" increases
- **Automation:** tests/web/e2e.spec.js › E2E-RENT-01

### RENT-005 — Double payment for the same month is prevented
**Negative** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Resident already paid for the current month

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home | "Paid ✓" is shown instead of the pay action |
| 2 | Deep-link to the pay sheet if reachable and submit again | Blocked with "This month is already paid" or the server rejects the duplicate |
| 3 | Owner opens Payments history | Exactly one row for the month |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-006 — Gateway failure keeps the month unpaid
**Negative** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Razorpay order endpoint is forced to fail (invalid key / sandbox down)

| # | Action | Expected |
| --- | --- | --- |
| 1 | Start a payment | Gateway error surfaces as "Payment failed: <reason>" |
| 2 | Check Home | Still unpaid; the pay button is still available for a retry |
| 3 | Owner dashboard | No phantom payment row |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-007 — Cancelling the pay sheet leaves no trace
**Negative** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the pay sheet and dismiss it without confirming | Back on Home, still unpaid |
| 2 | Check the API | No order/payment created |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-008 — Payment history lists payments for the resident
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Two payments exist (this month and last month)

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Payments → History | Both rows with date, method and amount |
| 2 | Open a row | Receipt details match the stored payment |
| 3 | With no payments | "No payments yet." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-009 — Owner sees collections for the property
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Three residents, one paid

| # | Action | Expected |
| --- | --- | --- |
| 1 | Dashboard → "Total collected" | Equals the single payment, not the number of residents |
| 2 | Open Payments | The paid resident shows "Paid ✓"; the others show "Pending" |
| 3 | Filter by resident (if present) | Only that resident's payments listed |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-010 — Dashboard pending dues reconcile with payments
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Three residents with rent 6500; one has paid

| # | Action | Expected |
| --- | --- | --- |
| 1 | Read "Pending dues" | 2 × 6500 = 13000 |
| 2 | Resident pays through the app and the owner refreshes | Pending drops to 6500, collected rises to 13000 |
| 3 | Add a fourth resident | Pending increases by that resident's rent only |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-011 — Every payment has a downloadable receipt
**Functional** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open a payment from History | Receipt view with hostel name, resident, period, amount, method, date |
| 2 | Tap the download/share action | PDF or share sheet opens with the same values |
| 3 | Check the PDF for placeholder text | None ("Receipt", "Generated by HostelHub") |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-012 — Monthly invoice totals rent plus mess charges
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Resident rent 6500, mess charges 2400 configured on the property

| # | Action | Expected |
| --- | --- | --- |
| 1 | Call GET /inmates/:id/invoice | total = 8900 with a breakdown |
| 2 | Open the resident detail → Generate invoice PDF | Same 8900 total in the PDF |
| 3 | Change a mess charge and regenerate | New total reflected, old invoice unchanged for past months |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-013 — Autopay link creation is handled gracefully when disabled
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Razorpay is not configured with live keys in this environment

| # | Action | Expected |
| --- | --- | --- |
| 1 | Toggle "Auto debit (UPI Autopay)" on | Switch saved |
| 2 | Trigger POST /razorpay/autopay/link | Returns a clear error (not a 500 stack trace) |
| 3 | UI shows a non-blocking message and keeps the manual pay path working | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-014 — Owner logs an expense and the P&L updates
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** One resident paid ₹6500 this month
- **Test data:** Amount 2000 / Notes: Electricity

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Expenses → "Add expense" | Sheet with Amount, Notes (optional), Save |
| 2 | Enter 2000 and "Electricity" and save | Expenses list shows "Electricity ₹2000" |
| 3 | Read the P&L | Income 6500, Expenses 2000, Net 4500 |
| 4 | Reload | Values persist |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-OPS-03

### RENT-015 — Expense validation rejects bad amounts
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit with an empty amount | Validation message; nothing saved |
| 2 | Submit amount 0 or negative | Rejected |
| 3 | Submit a non-numeric amount | Field rejects input |
| 4 | Submit a very large amount (99999999) | Accepted or capped, P&L stays consistent |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-016 — P&L matches the underlying rows
**API** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Call GET /pnl?property_id=...&month=<current> | income/expenses/net |
| 2 | Compare income with GET /payments | Sum matches |
| 3 | Compare expenses with GET /expenses | Sum matches |
| 4 | Check net = income - expenses | Arithmetic exact, no rounding drift |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-017 — Owner generates a consolidated bill
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Two residents with dues

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Bills & invoices | "Total" and a per-inmate breakdown |
| 2 | Choose "Single bill — N inmate(s)" | One PDF with one line per resident |
| 3 | Choose "Split bill" | One PDF per resident |
| 4 | Check the totals | Sum of lines equals the total shown |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-018 — Bills screen is empty-safe
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Property with no residents

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Bills & invoices | "No inmates to bill." and the generate action disabled |
| 2 | With no property | "Set up your property first." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-019 — Payment amounts are validated client-side
**Boundary** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Attempt to edit the amount in the pay sheet (if editable) | Only the plan amount is accepted |
| 2 | Try amount 0 / negative via the API POST /payments | 400, no row created |
| 3 | Pay the exact plan amount | Accepted |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-020 — Resident cannot pay for another resident
**Security** · P0 (Blocker) · Resident · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | As resident A, POST /payments with inmate_id of B | 403/400; no payment created for B |
| 2 | As resident A, GET /payments?inmate_id=<B> | Empty or 403 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-021 — Amounts render in INR with correct formatting
**UI** · P2 (Major) · All · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the pay sheet | "₹6500" (or "Rs. 6500" in PDFs) consistently formatted |
| 2 | Amount ≥ 100000 | Grouped correctly, no scientific notation |
| 3 | Switch to a narrow viewport | Amount never clipped or wrapped mid-number |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RENT-022 — Two devices paying at once create one payment
**Negative** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Start a payment on the phone and on the web at the same time | Both submit |
| 2 | Check the server | Only one payment row for the month; the second is rejected as duplicate |
| 3 | Refresh both clients | Both show "Paid ✓" |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Polls

### POLL-001 — Owner creates a mess poll for tomorrow
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Property with 3 residents
- **Test data:** Meal: Dinner / Date: tomorrow / Options: Yes, No / Repeat daily: off

| # | Action | Expected |
| --- | --- | --- |
| 1 | Polls → "New poll" | Sheet "New mess poll" with Meal, date, options, "Repeat daily" |
| 2 | Pick meal "Dinner" and tomorrow's date | Values accepted |
| 3 | Keep the default Yes/No options and tap "Create poll" | Toast "Poll created"; the poll card appears under "Mess polls" |
| 4 | Read the card | "Are you eating?" with Dinner, "For tomorrow · one-tap Yes/No", and response counts |

- **Postconditions:** polls row created with property_id and options JSON
- **Automation:** tests/web/e2e.spec.js › E2E-POLL-01 (list rendering)

### POLL-002 — Meal selection covers breakfast, lunch and dinner
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Create a poll with meal Breakfast | Card shows Breakfast |
| 2 | Create with Lunch | Card shows Lunch |
| 3 | Check the poll list ordering | Newest first, each with its own meal label |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-003 — Custom options are accepted
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Options: Yes, No, Maybe

| # | Action | Expected |
| --- | --- | --- |
| 1 | Add a third option "Maybe" | Option chip added |
| 2 | Create the poll | Card lists all three options for residents |
| 3 | As a resident vote "Maybe" | Vote recorded against that option |
| 4 | Tally | Maybe = 1, others 0 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-004 — Poll requires at least two options
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Remove all but one option and create | Rejected with a validation message |
| 2 | Remove every option | "Create poll" stays disabled or shows the message |
| 3 | Restore Yes/No and create | Succeeds |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-005 — Duplicate and blank options are rejected
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Add "Yes" twice | Duplicate is refused or collapsed into one chip |
| 2 | Leave an option blank | Blank option is not saved |
| 3 | Create with Yes/No | Poll card shows exactly two options |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-006 — Past dates are refused or clearly marked
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Pick yesterday and create | Rejected, or created and immediately marked closed; record which |
| 2 | Pick today | Poll is open for the current day |
| 3 | Pick 30 days ahead | Accepted |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-007 — Repeat-daily flag is persisted
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Create a poll with "Repeat daily" on | Card shows the recurring marker |
| 2 | Call GET /polls | recurring = true for that poll |
| 3 | Create one with it off | recurring = false |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-008 — Resident votes with one tap
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Open poll exists for the resident's property

| # | Action | Expected |
| --- | --- | --- |
| 1 | Home or Polls tab → poll card | Poll visible with the Yes/No options for the resident |
| 2 | Tap "Yes" | Immediate confirmation; card shows "You said Yes" |
| 3 | Refresh | Vote persists; the option stays selected |
| 4 | Owner side | Response count includes this resident |

- **Postconditions:** poll_responses row created
- **Automation:** Manual

### POLL-009 — A resident can change their vote before the poll closes
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Resident already voted Yes

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "No" | Vote switches; "You said No" |
| 2 | Owner tally | Yes decremented, No incremented (not a duplicate row) |
| 3 | Reload as the resident | No remains selected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-010 — Double-tap does not duplicate a vote
**Negative** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Yes" twice quickly | Only one response row for this resident and poll |
| 2 | Owner tally | Total responses equals the number of distinct residents who voted |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-011 — Voting on a closed poll is blocked
**Negative** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** A poll whose date has passed

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the poll | Marked closed / options disabled |
| 2 | Attempt to vote via the API POST /poll-responses | 400/409, no row created |
| 3 | Owner view | Poll shown as closed with final tallies |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-012 — Only residents of the property can vote
**Security** · P0 (Blocker) · Resident · API

- **Preconditions:** Two properties, each with residents and polls

| # | Action | Expected |
| --- | --- | --- |
| 1 | As a resident of property A, POST a response for a poll of property B | 403/400 |
| 2 | As the owner, attempt to vote on a resident poll | Refused (owner is not a respondent) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-013 — Owner sees live tallies
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** 3 residents, 2 voted

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the poll card | Counts per option and "No response: 1" |
| 2 | A third resident votes | Counts update on refresh |
| 3 | When everyone voted | "All responded ✓" |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-014 — Owner nudges non-responders
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Poll with 3 pending residents

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Nudge 3 non-responders" | Toast "Nudge sent to 3 inmates" |
| 2 | Nudge again immediately | Either cooldown message or another send; record behaviour, no crash |
| 3 | With everyone responded | Nudge action hidden or disabled |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-015 — Empty poll shows zero counts
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Fresh poll with no votes

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the card | 0 per option, pending count equals the number of residents |
| 2 | Check the bar/ring rendering | No divide-by-zero artefacts (NaN, 100% for zero votes) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-016 — Poll list is ordered and complete
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Three polls created on different days

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Polls | Newest first; each card shows meal, date, options and counts |
| 2 | Reload | Same order, no duplicates |
| 3 | Delete/close a poll if the UI offers it | List updates accordingly |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-017 — Polls screen guides a new owner
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** No polls yet

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Polls | "No polls yet — create your first mess poll." with a create action |
| 2 | With no property | "Set up your hostel first." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-018 — Poll creation validates the payload
**API** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /polls with {} | 400 |
| 2 | POST without property_id | 400 |
| 3 | POST with options as a plain string | Stored as a JSON array or rejected, never corrupt |
| 4 | GET /polls?property_id=... | options parsed back into an array for the client |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-019 — Polls are scoped to the property
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Two owners with polls

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /polls?property_id=<other> with owner A token | Empty or 403, never B's polls |
| 2 | Open the Polls tab in the app | Only the selected property's polls |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-020 — Simultaneous votes tally correctly
**Functional** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** 10 residents, open poll

| # | Action | Expected |
| --- | --- | --- |
| 1 | Have 10 residents vote within a few seconds (parallel API calls) | 10 distinct responses |
| 2 | Owner tally | Counts sum to 10, no lost updates |
| 3 | Check the DB | 10 rows, one per resident |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-021 — Resident sees only their own vote state
**Security** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Polls as resident A | "You said Yes" for A's vote only |
| 2 | Check the payload | Other residents' identities are not exposed, only aggregate counts |
| 3 | Resident B opens the same poll | Sees B's own vote state |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### POLL-022 — Poll date reflects the local day, not UTC
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Create a poll "for tomorrow" at 23:50 IST | Card shows the next local day, not the UTC day |
| 2 | Create one at 00:10 IST | Same rule |
| 3 | Resident opens it after midnight IST | Still "today"/closed per the local date |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual
- **Notes:** IST is UTC+5:30; a UTC-based comparison shifts the day boundary by 5.5 hours.

## Chat

### CHAT-001 — Owner opens a chat thread with a resident
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Property with at least one resident

| # | Action | Expected |
| --- | --- | --- |
| 1 | More → "Chat" | Chat list showing residents with "No messages yet — say hello." when empty |
| 2 | Tap a resident | Thread opens with the resident name and a message composer |
| 3 | Send "Hi Asha, rent is due on the 5th" | Message appears on the right with the owner role and a timestamp |
| 4 | Reload | Message still present and ordered correctly |

- **Postconditions:** chat_messages row with sender_role=owner
- **Automation:** Manual

### CHAT-002 — Resident replies to the owner
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Owner sent one message to this resident

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident → More → "Chat with owner" | Thread shows the owner message |
| 2 | Reply "Paid today" and send | Appears on the right as the resident |
| 3 | Owner opens the thread and refreshes | Reply appears on the left with sender_role=inmate |

- **Postconditions:** Second chat_messages row with sender_role=inmate
- **Automation:** Manual

### CHAT-003 — Empty or whitespace messages are blocked
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap send with an empty composer | Nothing is sent; the send action is disabled or ignored |
| 2 | Enter "   " (spaces) and send | Blocked |
| 3 | Enter one character and send | Sent |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-004 — Long messages are handled
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Send a 500-character message | Accepted and wrapped, no overflow |
| 2 | Send a 5000-character message | Either accepted or rejected with a clear limit; never truncated silently |
| 3 | Check the bubble | Text selectable/copyable where the platform allows |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-005 — Multi-line input and special characters survive
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Send "Line 1\nLine 2" | Both lines render, newline preserved |
| 2 | Send emoji "🔔 ₹6500 due" | Rendered correctly, no mojibake |
| 3 | Send "<script>alert(1)</script>" | Displayed as literal text, never executed (XSS guard) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-006 — Chat list ordering follows the latest message
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Two resident threads, different last-message times

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Chat list | Most recent thread first |
| 2 | Send a message in the older thread and return | Its order updates |
| 3 | Reload | Order preserved |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-007 — Chat is empty-safe and property-aware
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Property with no residents

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Chat | "No inmates yet." and no composer |
| 2 | With no property | "Set up your hostel first." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-008 — A resident cannot read another resident thread
**Security** · P0 (Blocker) · Resident · API

- **Preconditions:** Residents A and B, each with messages

| # | Action | Expected |
| --- | --- | --- |
| 1 | As A, GET /chat?inmate_id=<B> | Empty or 403 |
| 2 | As A, POST a message with inmate_id=<B> | Rejected |
| 3 | As A, open the chat UI | Only A's thread is reachable |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-009 — Another owner cannot read the thread
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Two owners, each with residents

| # | Action | Expected |
| --- | --- | --- |
| 1 | As owner B, GET /chat?inmate_id=<resident of A> | Empty or 403 |
| 2 | As owner B, try the app chat list | Does not list A's residents |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-010 — Message order matches send time
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Send three messages in sequence | Displayed oldest → newest |
| 2 | Check timestamps | Monotonic, same timezone display |
| 3 | Send from both sides interleaved | Merged order is still chronological |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-011 — New messages arrive without a full reload
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident sends a message while the owner thread is open | Message appears on the next poll/refresh, or is documented as manual-refresh only |
| 2 | Leave and re-enter the thread | Message is there |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-012 — Draft survives navigation
**Boundary** · P3 (Minor) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Type a draft, leave the thread and come back | Draft retained or cleared; behaviour must be consistent |
| 2 | Type a draft and background the app, then return | No duplicate send and no lost text without warning |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-013 — Chat is usable on mobile and desktop
**Compatibility** · P2 (Major) · All · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open a thread at 390×844 | Composer above the keyboard; bubbles full width |
| 2 | Open at 1440×900 | Thread width capped, not stretched edge to edge |
| 3 | Scroll a 50-message thread | Auto-scrolls to the newest; header stays visible |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CHAT-014 — Chat API validates the payload
**API** · P2 (Major) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /chat without inmate_id | 400 |
| 2 | POST with an empty message | 400 |
| 3 | POST a valid message | 201/200 with the stored row and sender_role |
| 4 | GET /chat?inmate_id=... | Messages for that thread only |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Notices

### NOT-001 — Owner posts a notice
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Title: Water supply / Body: Maintenance 10am-1pm / Pin: off

| # | Action | Expected |
| --- | --- | --- |
| 1 | More → "Post notice" (or Notices → Post) | Sheet "Post notice" with Title, Body (optional), "Pin to top" |
| 2 | Enter the title and body and save | Toast/snackbar confirms; the notice appears in the list |
| 3 | Read the card | Title, body and posted time shown |

- **Postconditions:** notices row created
- **Automation:** Manual

### NOT-002 — Title is mandatory
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Leave Title empty and post | Validation message; nothing saved |
| 2 | Enter a title with body empty | Saved (body is optional), card shows only the title |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### NOT-003 — Pinned notices stay on top
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Two notices, the older one pinned

| # | Action | Expected |
| --- | --- | --- |
| 1 | Post a newer notice without pinning | The pinned notice remains first |
| 2 | Unpin the pinned notice | Normal chronological order resumes |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### NOT-004 — Resident sees notices for their property
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Notice posted in the resident's property

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident → Home/More → Notices | The notice is listed with title and body |
| 2 | Open it | Full body visible, no owner-only controls |
| 3 | Owner deletes/edits it (if supported) | Resident view updates on refresh |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### NOT-005 — Notices screen is empty-safe
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** No notices

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Notices | "No notices yet." with a post action |
| 2 | As a resident with no notices | Same empty state without owner controls |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### NOT-006 — Long and multi-line bodies render correctly
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Post a 1000-character body with line breaks | Rendered with wrapping, no overflow |
| 2 | Post emoji and ₹ symbols | Rendered correctly |
| 3 | Post HTML-looking text | Displayed literally (no injection) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### NOT-007 — Notices do not leak across properties
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Two properties, each with notices

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /notices?property_id=<other> with owner A token | Empty or 403 |
| 2 | Resident of property B cannot see property A notices in the app | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### NOT-008 — Newest notice first when unpinned
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Post three notices | Newest first |
| 2 | Reload | Order stable |
| 3 | Pin the oldest | It jumps to the top, others keep relative order |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### NOT-009 — Whitespace-only title is rejected
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter "   " as the title and post | Rejected |
| 2 | Enter a 200-character title | Accepted or truncated consistently; no layout break |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### NOT-010 — Notice API round-trip
**API** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /notices without property_id | 400 |
| 2 | POST a valid notice | 201/200 with id |
| 3 | GET /notices?property_id=... | Contains the new notice with the right fields |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Complaints

### CMP-001 — Resident raises a complaint
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Description: Geyser not working in bathroom 2

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident → "Raise a complaint" | Form "What needs fixing?" with Describe the issue and "Submit complaint" |
| 2 | Type the description and submit | Toast "Complaint submitted"; the complaint appears in the resident list |
| 3 | Owner opens Complaints | The same complaint is listed with the resident name and timestamp |

- **Postconditions:** complaints row created with status open
- **Automation:** Manual

### CMP-002 — Empty description is blocked
**Validation** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit with an empty description | Message "Enter a description"; nothing saved |
| 2 | Submit whitespace only | Blocked |
| 3 | Submit one word | Accepted |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-003 — Long description is handled
**Boundary** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit 1000 characters | Accepted and wrapped in the list/detail |
| 2 | Submit 10000 characters | Accepted or rejected with a limit message; no crash |
| 3 | Include line breaks and emoji | Preserved |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-004 — Owner sees all complaints for the property
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Two residents, one complaint each

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Complaints | Both complaints with resident, description, status and time |
| 2 | Reload | Same rows, no duplicates |
| 3 | With no complaints | "No complaints yet." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-005 — Owner moves a complaint through statuses
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** An open complaint exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap the status action ("Mark in progress" / "Mark resolved") | Status changes and persists after reload |
| 2 | Resident side | Sees the updated status on their complaint |
| 3 | Dashboard "Open complaints" counter | Decreases when a complaint is resolved |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-006 — Status cannot skip backwards silently
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resolve a complaint, then attempt to mark it open again (if offered) | Allowed with an audit trail or refused; behaviour documented |
| 2 | Confirm the resident view matches the final state | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-007 — Resident sees only their own complaints
**Security** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Residents A and B each raised a complaint

| # | Action | Expected |
| --- | --- | --- |
| 1 | As A, open Complaints | Only A's complaints |
| 2 | As A, GET /complaints?property_id=... | Only A's rows (server-side filter by inmate) |
| 3 | As A, GET /complaints?inmate_id=<B> | Empty or 403 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-008 — Another owner cannot see the complaint
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | As owner B, GET /complaints?property_id=<A> | Empty or 403 |
| 2 | App: B's Complaints screen does not list A's rows | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-009 — Complaints screen adapts by role and setup
**UI** · P2 (Major) · All · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner with no property | "Set up your hostel first." |
| 2 | Owner with a property and no complaints | "No complaints yet." |
| 3 | Resident with no complaints | Empty state with the "Raise a complaint" action |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-OPS-01

### CMP-010 — Complaint detail shows the full thread of facts
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open a complaint | Description in full, resident, room/bed, created time, current status |
| 2 | Check truncation | Long text is fully readable (expand or scroll) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-011 — Open complaint count is accurate
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Three complaints: two open, one resolved

| # | Action | Expected |
| --- | --- | --- |
| 1 | Dashboard "Open complaints" | 2 |
| 2 | Resolve one | Counter becomes 1 |
| 3 | Resident raises a new one | Counter returns to 2 on refresh |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-012 — Injection and special characters are safe
**Security** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit "<img src=x onerror=alert(1)>" | Displayed as text, never executed |
| 2 | Submit SQL-looking text "' OR 1=1 --" | Stored verbatim; the list still loads (parameterised queries) |
| 3 | Submit emoji | Rendered correctly |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-013 — Complaint API validates input
**API** · P1 (Critical) · Resident · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /complaints without property_id | 400 |
| 2 | POST with an empty description | 400 |
| 3 | POST a valid complaint | 201/200 with the created id and status open |
| 4 | PATCH status to an unknown value | 400, status unchanged |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### CMP-014 — Owner cannot raise a complaint on behalf of a resident
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /complaints/new as the owner | Redirected to /home (route is resident-only) |
| 2 | POST /complaints as owner with a resident id | Rejected or accepted as owner-authored; behaviour documented |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Visitors

### VIS-001 — Owner logs a visitor checking in
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Visitor: Ravi Kumar / Phone: 9876500010 / Visiting: Asha Verma / Purpose: Family

| # | Action | Expected |
| --- | --- | --- |
| 1 | Visitors → "Log visitor" | Form with Visitor name, Phone, Visiting (inmate), Purpose, "Check in" |
| 2 | Fill the fields and choose the resident | Values accepted |
| 3 | Tap "Check in" | Visitor appears in the list as "Ravi Kumar · Visiting Asha Verma" with "Inside since <time>" |
| 4 | Reload | Visitor still inside |

- **Postconditions:** visitors row with in_time set and out_time null
- **Automation:** Manual

### VIS-002 — Owner checks a visitor out
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** A visitor is inside

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Check out" on the visitor | Row updates to "Left at <time>" and leaves the inside list |
| 2 | Reload | out_time persisted; the entry is not duplicated |
| 3 | Duration | Derived correctly from in/out times |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-003 — Visitor name is required
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit with an empty visitor name | Validation message; no row created |
| 2 | Submit with a name but no resident selected | Blocked with a clear message |
| 3 | Submit with name + resident | Created |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-004 — Phone and purpose rules
**Boundary** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Leave phone and purpose empty | Visitor still logged (they are optional) |
| 2 | Enter phone "abc" | Rejected or accepted as text; verify it does not break the list |
| 3 | Enter a 200-character purpose | Wrapped, no overflow |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-005 — A visitor cannot be checked in twice simultaneously
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Ravi Kumar is currently inside

| # | Action | Expected |
| --- | --- | --- |
| 1 | Log the same visitor again | Either a second row is created (two visits) or blocked; behaviour documented |
| 2 | Check the inside list | Exactly one "Inside since" row per open visit |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-006 — Check out is not offered for a visitor already out
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** A visitor who already left

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the Visitors list | The checked-out visitor shows "Left at <time>" without a Check out action |
| 2 | Force POST a second checkout | Rejected or idempotent; out_time not overwritten silently |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-007 — Owner marks a resident on leave
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** A resident exists
- **Test data:** Start: today / Return: today+3 / Reason: Home visit

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open "Leave / attendance" → "Mark leave" | Form with Start date, Return date, Reason (optional) |
| 2 | Fill the dates and submit | Toast "Leave marked"; the resident appears under leave with dates |
| 3 | Reload | Record persists with the same dates |

- **Postconditions:** leave_records row created
- **Automation:** Manual

### VIS-008 — Leave dates are validated
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter a return date before the start date | Rejected with a clear message |
| 2 | Enter a malformed date ("31-02-2026") | Rejected |
| 3 | Leave the start date empty | Blocked |
| 4 | Use the same date for start and return | Accepted (one-day leave) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-009 — Resident sees their own leave record
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner marked a leave for this resident

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident → "Mark leave" / leave section | The record with dates is visible |
| 2 | Another resident's leave is not visible | — |
| 3 | Resident can request leave (if the "Mark leave" resident action exists) | Creates a record the owner can see |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-010 — Leave list is empty-safe
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** No leave records

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Leave | "No one on leave." |
| 2 | With no property | "Set up your hostel first." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-011 — Visitors are scoped per property and per resident
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Two properties with visitors

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /visitors?property_id=<other> with owner A token | Empty or 403 |
| 2 | As a resident, GET /visitors | Only visits addressed to them (or 403), never the whole property |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-012 — Leave records do not cross properties
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /leave?property_id=<other> | Empty or 403 |
| 2 | As resident A, GET /leave?inmate_id=<B> | Empty or 403 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-013 — Visitor and leave endpoints validate payloads
**API** · P2 (Major) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /visitors with {} | 400 |
| 2 | POST /visitors with a valid body | 200/201 with in_time |
| 3 | POST /leave with return_date < start_date | 400 |
| 4 | GET both resources | Arrays with the created rows |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### VIS-014 — Visitor list shows who is inside right now
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Two visitors inside, one already left

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Visitors | The two inside rows show "Inside since <time>" and a Check out action |
| 2 | The departed visitor shows "Left at <time>" without the action | — |
| 3 | Counts on screen match the rows | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Deposits

### DEP-001 — Owner records a security deposit
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** A resident exists with no deposit
- **Test data:** Amount: 10000

| # | Action | Expected |
| --- | --- | --- |
| 1 | Deposits → select the resident → "Record deposit" | Form with "Amount (₹)" and Save |
| 2 | Enter 10000 and save | Summary shows "Collected ₹10000 · Refundable ₹10000" |
| 3 | Open the resident detail → Security deposit | Same amount, refundable |
| 4 | Reload | Deposit persists |

- **Postconditions:** deposits row created
- **Automation:** Manual

### DEP-002 — An inmate must be selected first
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Two residents with no selection made

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Deposits without tapping a resident | "Tap an inmate to select them" |
| 2 | Attempt to save a deposit | Message "Select an inmate first"; nothing saved |
| 3 | Select a resident and save | Deposit recorded for that resident only |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-003 — Amount validation
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Save with an empty amount | Message "Enter a valid amount" |
| 2 | Save with 0 or a negative value | Rejected |
| 3 | Save with a non-numeric value | Field rejects input |
| 4 | Save with 1,00,000 | Accepted; refundable equals collected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-004 — Owner adds a deduction
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Deposit of ₹10000 recorded
- **Test data:** Deduction: 1500 / Reason: Broken chair

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the deposit → "Add deduction" | Form with Amount, Reason, Save |
| 2 | Enter 1500 and the reason and save | "Deducted ₹1500 · Refundable ₹8500" |
| 3 | Add a second deduction of 500 | Deducted ₹2000, refundable ₹8000 |
| 4 | Reload | Both deductions listed |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-005 — Deductions cannot exceed the deposit
**Boundary** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Deposit ₹10000 with ₹2000 deducted (refundable ₹8000)

| # | Action | Expected |
| --- | --- | --- |
| 1 | Add a deduction of 9000 | Rejected with a message (would make the refundable negative) |
| 2 | Add exactly 8000 | Accepted; refundable ₹0 |
| 3 | Attempt one more deduction | Rejected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-006 — Deduction reason is required and bounded
**Validation** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Save a deduction without a reason | Rejected or saved with a placeholder; behaviour documented |
| 2 | Enter a 200-character reason | Accepted and wrapped |
| 3 | Enter a negative amount | Rejected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-007 — Owner initiates a checkout
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Resident with a deposit and no open checkout
- **Test data:** Vacate date: today+7

| # | Action | Expected |
| --- | --- | --- |
| 1 | Checkout screen → select the resident → "Initiate checkout" | "Vacating <date>" recorded |
| 2 | Set the vacate date and confirm | The checkout appears under "No checkouts yet." replaced by the new row |
| 3 | Reload | Checkout persists with pending state |

- **Postconditions:** checkouts row created
- **Automation:** Manual

### DEP-008 — Vacate date is required and valid
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Initiate without a vacate date | Blocked with a message |
| 2 | Use a past date | Allowed or rejected; documented, but never a malformed value |
| 3 | Use "31-02-2026" | Rejected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-009 — Owner completes checkout and settles the deposit
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Checkout initiated; deposit ₹10000 with ₹1500 deducted

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Complete checkout & settle deposit" | Confirmation with "Refundable ₹8500" |
| 2 | Enter the refund amount 8500 and confirm | Toast success; "Complete" state shown |
| 3 | Resident room occupancy | Decremented; the resident is marked "Checked out" in the detail |
| 4 | Reload | State persisted, no duplicate checkout rows |

- **Postconditions:** checkout completed; residents can no longer pay rent
- **Automation:** Manual

### DEP-010 — Refund amount is validated
**Boundary** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Refundable ₹8500

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enter a refund above 8500 | Rejected |
| 2 | Enter a negative refund | Rejected |
| 3 | Enter 0 | Accepted (full forfeit) with a clear label |
| 4 | Enter 8500 | Accepted and the summary shows refunded = 8500 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-011 — Completing twice is not possible
**Negative** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** A completed checkout

| # | Action | Expected |
| --- | --- | --- |
| 1 | Re-open the checkout | No "Complete" action remains |
| 2 | Force POST the completion again | Rejected or idempotent; deposit not refunded twice |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-012 — Resident sees their deposit and refundable amount
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Deposit ₹10000, deduction ₹1500

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident → "My deposit" | Collected ₹10000, deducted ₹1500, refundable ₹8500 |
| 2 | No deposit recorded | "No deposit recorded yet." |
| 3 | After checkout completion | Final refunded amount shown |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-013 — Deposits are per resident and per property
**Security** · P0 (Blocker) · Resident · API

- **Preconditions:** Two residents with deposits

| # | Action | Expected |
| --- | --- | --- |
| 1 | As resident A, GET /deposits?inmate_id=<B> | Empty or 403 |
| 2 | As owner A, GET /deposits?property_id=<B> | Empty or 403 |
| 3 | As resident A, POST a deposit row | Rejected (owner-only action) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-014 — Checkout removes the resident from active lists
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Resident completed checkout

| # | Action | Expected |
| --- | --- | --- |
| 1 | Inmates list | Resident marked "Checked out" (or excluded from active occupancy) |
| 2 | Room occupancy | Bed freed and reusable for a new resident |
| 3 | Add resident into that bed | Succeeds |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-015 — Deposit and checkout endpoints validate input
**API** · P2 (Major) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /deposits without inmate_id | 400 |
| 2 | POST /deposits with a negative amount | 400 |
| 3 | POST /checkouts without vacate_date | 400 |
| 4 | POST /checkouts with a valid body | 200/201 with id and status |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DEP-016 — Checkout screen explains the settlement
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Checkout in progress

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the checkout | "Deposit summary" with collected, deductions, refundable |
| 2 | Read the primary action | "Complete checkout & settle deposit" |
| 3 | Check the empty state | "No checkouts yet." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Documents

### DOC-001 — Owner adds a hostel document
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Name: Rent agreement / File: agreement.pdf (240 KB)

| # | Action | Expected |
| --- | --- | --- |
| 1 | More → Documents → "Add hostel document" | Form with Document name, "Pick file (optional)", Save |
| 2 | Enter the name, pick a PDF and save | Toast "File selected"/saved; "Hostel documents" lists the entry |
| 3 | Read the row | Name and "Uploaded <date>" |
| 4 | Reload | Document persists |

- **Postconditions:** documents row with owner_type=hostel
- **Automation:** Manual

### DOC-002 — Document name is required
**Validation** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Save with an empty name | Validation message; nothing saved |
| 2 | Save with a name and no file | Metadata-only entry is created (file is optional) |
| 3 | Verify the list | Entry present with no file link |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DOC-003 — Resident uploads an ID document
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Name: Aadhaar / File: aadhaar.jpg

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident → Documents → "Upload document" | "My documents" section is visible |
| 2 | Upload the file | Appears under "My documents" |
| 3 | Owner opens Documents | Sees the resident document attributed to that resident |

- **Postconditions:** documents row with owner_type=inmate
- **Automation:** Manual

### DOC-004 — Deleting a document asks for confirmation
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** A document exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap Delete | Dialog "Delete document?" with the text "Delete \"<name>\"? This cannot be undone." |
| 2 | Tap Cancel | Document remains |
| 3 | Tap Delete again and confirm | Row disappears; reload keeps it gone |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DOC-005 — Document metadata can be edited
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** A document exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap Edit | "Edit document" with the current name prefilled |
| 2 | Rename it and save | List shows the new name; the file reference is unchanged |
| 3 | Cancel an edit | No change applied |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DOC-006 — Unsupported or oversized files are rejected
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Pick an executable (.exe) | Rejected by the picker filter or the server |
| 2 | Pick a 50 MB file | Rejected with a size message, or uploaded with progress; behaviour must be explicit |
| 3 | Pick a 0-byte file | Rejected or accepted consistently |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual
- **Notes:** Cloudflare R2 is not enabled on this account, so uploads that need object storage must fail with a clear message rather than a silent no-op.

### DOC-007 — Documents do not leak between residents or properties
**Security** · P0 (Blocker) · Resident · API

- **Preconditions:** Residents A and B each uploaded a document

| # | Action | Expected |
| --- | --- | --- |
| 1 | As A, GET /documents?owner_type=inmate&owner_id=<B> | Empty or 403 |
| 2 | As A, GET /documents?owner_type=hostel&owner_id=<property> | Allowed only for own property |
| 3 | As owner B, GET documents of owner A's hostel | Empty or 403 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DOC-008 — Documents screen is empty-safe per role
**UI** · P2 (Major) · All · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner with no documents | "No documents yet." and "Add hostel document" |
| 2 | Resident with no documents | "No documents yet." and "Upload document" |
| 3 | With no property (owner) | "Set up your hostel first." / empty state without actions |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-OPS-02

### DOC-009 — Document API round-trip
**API** · P2 (Major) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /documents with owner_type=hostel and a name | 200/201 with id |
| 2 | GET /documents?owner_type=hostel&owner_id=<property> | Contains the row |
| 3 | DELETE the document | Removed from the GET response |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### DOC-010 — Long names and many documents stay usable
**Boundary** · P3 (Minor) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Add a 150-character document name | Wrapped/ellipsised, no overflow |
| 2 | Add 20 documents | List scrolls, actions reachable |
| 3 | Check the dates | All show "Uploaded YYYY-MM-DD" |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Resident app

### RAPP-001 — Resident home summarises the stay
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Resident signed in with rent plan, room and deposit

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home | Heading "Inmate · Your stay at a glance" |
| 2 | Read the cards | Room and bed, rent amount with "Due on day <n>", deposit status, "Paid this month"/"Pending dues" |
| 3 | Compare with the owner detail screen | Same room, bed, rent and deposit values |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-002 — Resident sees the owner name and hostel
**UI** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home | Property name and owner name are shown |
| 2 | Owner renames the property | Resident view updates after refresh |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-003 — Every resident action is reachable
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home → "Quick actions" | Pay rent, Raise a complaint, Mark leave, Chat with owner, My deposit, Documents, SOS |
| 2 | Tap each action | Each opens the matching screen without a dead end |
| 3 | Back from each | Returns to Home with state intact |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-004 — Resident menu hides owner-only features
**Security** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open the More tab | Heading "Menu" (not "Manage") |
| 2 | Check the list | No Inmates, Expenses, Settings, Bills, Visitors, Checkout, Admin entries |
| 3 | Owner signs in on the same build | Those entries are present (comparison proves role gating) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-005 — Resident answers a mess poll from Home
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** An open poll exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Home/Polls → poll card | Options Yes / No visible |
| 2 | Tap Yes | "You said Yes"; the card no longer asks |
| 3 | Reopen later | The answer is retained |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-006 — Resident pays rent and sees it reflected
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Rent plan ₹6500, unpaid this month

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Pay rent ₹6500" | Pay sheet with amount and method |
| 2 | Confirm | "Payment successful" and receipt |
| 3 | Return to Home | "Paid ✓" and "Paid this month" |
| 4 | Owner dashboard | Collected total increased by exactly ₹6500 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-007 — Resident raises and tracks a complaint
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Raise a complaint with a description | "Complaint submitted" |
| 2 | Open the complaints list | The complaint is listed with status open |
| 3 | Owner resolves it, resident refreshes | Status shows resolved |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-008 — Resident marks leave
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Mark leave" | Form with start/return dates and reason |
| 2 | Submit valid dates | Confirmation; the record appears for the resident |
| 3 | Owner view | The leave appears in "Leave / attendance" |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-009 — Resident views the deposit ledger
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "My deposit" | Collected, deducted, refundable |
| 2 | With no deposit | "No deposit recorded yet." |
| 3 | Owner adds a deduction and the resident refreshes | Refundable updated |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-010 — Resident chats with the owner
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Chat with owner" | Thread opens (empty state "No messages yet — say hello.") |
| 2 | Send a message | Appears as sent by the resident |
| 3 | Owner replies, resident refreshes | Reply visible |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-011 — Resident manages personal documents
**Functional** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Documents → "Upload document" | "My documents" section present |
| 2 | Upload with a name | Listed |
| 3 | Delete with confirmation | Removed |
| 4 | Verify the owner can see it before deletion and not after | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-012 — Resident sends an SOS alert
**Functional** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Emergency SOS" | Confirmation step ("Alerts your owner instantly") |
| 2 | Confirm | Toast "SOS alert sent to your owner" |
| 3 | Owner → SOS alerts | The alert is listed as unacknowledged with time and resident |

- **Postconditions:** sos_alerts row created
- **Automation:** Manual

### RAPP-013 — Resident rates the stay
**Functional** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap "Rate my stay" | Stars 1–5 and "Comment (optional)" |
| 2 | Pick 4 stars, add a comment, submit | "Thanks for rating!" |
| 3 | Owner → Ratings | The rating with 4 stars and the comment is listed |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-014 — Resident reads notices
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner posted a notice

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Notices | The notice with title and body |
| 2 | No owner-only action (post/pin) is shown | — |
| 3 | With no notices | "No notices yet." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-015 — Resident sees their own account details
**UI** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | More → profile section | Name, Username, Role "Inmate" |
| 2 | Verify the role label | "Inmate", not "Owner" |
| 3 | Log out and back in | Same values |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-016 — Resident logs out cleanly
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | More → "Log out" | Returned to /login |
| 2 | Reload | Still signed out |
| 3 | Open /home | Redirected to /login |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-017 — Resident cannot perform owner actions via the API
**Security** · P0 (Blocker) · Resident · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /inmates | 401/403 |
| 2 | POST /rooms, POST /properties | 401/403 |
| 3 | PATCH rent plan for themselves | 401/403 |
| 4 | Mark a complaint resolved | 401/403 |
| 5 | POST /notices | 401/403 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-018 — Resident without a rent plan or room
**Negative** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Resident created without rent and then moved out of a room (edge fixture)

| # | Action | Expected |
| --- | --- | --- |
| 1 | Home | "Your owner has not set your rent yet." with no Pay action |
| 2 | Room card | Shows a sensible empty state instead of "Room null · Bed null" |
| 3 | Other actions (complaint, chat, SOS) | Still usable |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-019 — Checked-out resident sees the final state
**Functional** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Owner completed checkout for this resident

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home | Stay marked as ended; no active rent action |
| 2 | Deposit | Final refunded amount displayed |
| 3 | Payments history | Previous payments still visible |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-020 — Resident flow works on a phone
**Compatibility** · P2 (Major) · Resident · Web (390×844) · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home at 390×844 | Cards stack, no horizontal scroll |
| 2 | Open the poll and vote with one thumb | Works; no zoom needed |
| 3 | Open the keyboard in chat | Composer stays visible above it |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-021 — Resident preferences survive a reload
**Functional** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Vote in a poll, then reload | Vote retained |
| 2 | Send a chat message, then reload | Message retained |
| 3 | Reload Home | Same rent/deposit values, no flicker to zero |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### RAPP-022 — Resident never sees another resident's data on screen
**Security** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Two residents in the same room, both with payments and complaints

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Payments as A | Only A's payments |
| 2 | Open Complaints as A | Only A's complaints |
| 3 | Open Chat as A | Only the thread with the owner, never B's |
| 4 | Check the poll tallies | Aggregates only, no names |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Settings

### OPS-001 — Owner toggles features visible to residents
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | More → "Property settings" | Toggles under "Visible to inmates" |
| 2 | Turn off Polls and save | Confirmation; the resident reopens the app |
| 3 | Resident view | Polls entry is hidden |
| 4 | Turn it back on | Resident sees it again after refresh |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual
- **Notes:** Copy on screen: "Only inmates can see the features you turn on."

### OPS-002 — Property type is displayed and consistent
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Property created as House (rent)

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Property settings | "Type: House (rent)" |
| 2 | Change the type to Hostel and save | Settings shows "Type: Hostel" after reload |
| 3 | Dashboard copy | Still renders without a stale label |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-003 — Settings requires a property
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; no property has been created yet

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /settings | "Set up your property first." |
| 2 | No toggle is interactive in that state | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/e2e.spec.js › E2E-OPS-05

### OPS-004 — Resident submits a rating with a comment
**Functional** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Stars: 4 / Comment: Clean rooms

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open "Rate my stay" | Star selector and "Comment (optional)" |
| 2 | Select 4 stars, add the comment, submit | "Thanks for rating!" |
| 3 | Owner → Ratings | Shows 4 stars and the comment with the resident name |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-005 — Rating requires at least one star
**Validation** · P2 (Major) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit with no star selected | Blocked with a message |
| 2 | Submit with 1 star | Accepted |
| 3 | Submit a 1000-character comment | Accepted or limited with a message |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-006 — Ratings list is empty-safe and ordered
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** No ratings yet

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Ratings | "No ratings yet." |
| 2 | After two ratings | Newest first with stars and comments |
| 3 | With no property | "Set up your hostel first." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-007 — Owner sees and acknowledges an SOS alert
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Resident sent an SOS alert

| # | Action | Expected |
| --- | --- | --- |
| 1 | More → "SOS alerts" | Alert listed with resident, time and "Acknowledge" |
| 2 | Tap "Acknowledge" | Status "Acknowledged" and the action disappears |
| 3 | Reload | Acknowledged state persisted |
| 4 | Resident view | No error; the alert is not actionable by the resident |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-008 — SOS list is empty-safe
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open SOS alerts with no alerts | "No SOS alerts." |
| 2 | With no property | "Set up your hostel first." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-009 — SOS alerts stay within the property
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /sos?property_id=<other> with owner A token | Empty or 403 |
| 2 | Owner B cannot acknowledge owner A's alert | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-010 — Upgrade screen shows the plan matrix
**UI** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | More → "Upgrade plan" | Monthly and Yearly tabs with prices (Rs. 199 / Rs. 599, Rs. 5,999 yearly) |
| 2 | Read the inclusions | "One property included", "Unlimited inmates", "Extra property ₹/mo", "Priority support" |
| 3 | Check the payment note | "Online payment is being enabled soon." is shown while Razorpay is not live |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-011 — Extra properties are billed per property
**Functional** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner has 2 properties

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Upgrade | The second property is presented as billable |
| 2 | Compare with GET /pricing | The extra-property amount matches the global rate |
| 3 | With an admin override for this owner | The override amount is displayed instead |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-012 — Upgrade purchase is blocked while payments are disabled
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap the purchase action | Message that online payment is not enabled yet; no order created |
| 2 | Confirm nothing was charged and the plan is unchanged | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-013 — Privacy policy renders and is readable
**UI** · P3 (Minor) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /privacy (also reachable from the More menu) | Sections "What we collect", "Why we collect it", "Your rights" |
| 2 | Check the contact | "support@hostelhub.app" present |
| 3 | Verify text is selectable/scrollable on mobile | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-014 — Terms and acceptable use render
**UI** · P3 (Minor) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /terms | Sections "The service", "Accounts", "Payments & billing", "Acceptable use", "Liability" |
| 2 | Check the plans copy | Matches the Upgrade screen prices |
| 3 | No broken links or empty sections | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-015 — Owner dashboard counters are correct
**Functional** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** 3 residents, 1 room capacity 4, 2 complaints (1 open), 1 payment

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home | Occupancy 3/4, Pending dues = unpaid rents, Total collected = paid total, Open complaints = 1 |
| 2 | Resolve a complaint and refresh | Open complaints 0 |
| 3 | Add a resident | Occupancy 4/4 and the room is now full |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-016 — Dashboard uses the viewport on desktop
**UI** · P2 (Major) · Owner · Web (1440×900)

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home at 1440×900 | Stat cards in 4 columns, content capped around 1180px |
| 2 | No blank side gutters and no stretched cards | — |
| 3 | Resize to 820 wide | 2 columns; to 390 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-017 — Owner tabs are all reachable on every platform
**Functional** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Tap Home, Inmates, Polls, More in order | Each tab renders its screen |
| 2 | Return to Home | State preserved |
| 3 | Reload on any tab route | Still on the shell, correct tab selected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/smoke.spec.js › SMK-04

### OPS-018 — Direct URLs resolve to the right screen
**Functional** · P1 (Critical) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /inmates, /polls, /expenses, /settings directly | Each loads the correct screen (SPA fallback, no 404) |
| 2 | Open a nonsense route /xyz | Handled (home or not-found), never a blank page |
| 3 | Open /inmates/new directly | Add tenant form loads |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-019 — App degrades gracefully without a network
**Negative** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Enable airplane mode / offline throttling and open Inmates | "Error loading inmates" style message with a retry, no infinite spinner |
| 2 | Restore the network and retry | Data loads |
| 3 | Submit a form while offline | Clear failure message; no false success |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### OPS-020 — First meaningful paint is acceptable
**Functional** · P2 (Major) · Guest · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Load the app on a cold cache over 4G | Login screen visible within a reasonable budget (record the number) |
| 2 | Check the network waterfall | `main.dart.js` cached on the second visit (immutable headers) |
| 3 | Repeat on a warm cache | Much faster; verify `_headers` behaviour |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Admin

### ADM-001 — Platform admin signs in to /admin
**Functional** · P0 (Blocker) · Admin · Web · Android · iOS

- **Preconditions:** A platform admin account exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /admin signed out | Admin login screen (not the owner login) |
| 2 | Enter admin credentials | /admin dashboard opens with "Admin panel" |
| 3 | Check the redirect from /home | An admin is always routed back to /admin |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-002 — Wrong admin password is rejected
**Negative** · P1 (Critical) · Admin · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Submit a wrong password | Error message; stays on the admin login |
| 2 | Submit a valid owner account on the admin login | Rejected (owners cannot enter /admin) |
| 3 | Confirm the owner session is not created by the admin form | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-003 — Admin dashboard lists clients and owners
**Functional** · P1 (Critical) · Admin · Web · Android · iOS

- **Preconditions:** At least two owner accounts with properties

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /admin | "Clients" list with owner names and properties |
| 2 | Read the counts | Owners and properties match the database |
| 3 | With no owners | "No owner accounts yet." |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-004 — Admin saves the global rates
**Functional** · P1 (Critical) · Admin · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists
- **Test data:** Monthly 199 / Yearly 5999 / Extra property 99

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open "Global rates" | Fields Monthly (₹/mo), Yearly (₹/yr), Extra property (₹/mo) |
| 2 | Change the values and tap "Save global rates" | Toast "Global rates saved" |
| 3 | Reload and check GET /pricing | New values returned to every client |
| 4 | Open the owner Upgrade screen | Shows the new prices |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-005 — Global rates validate input
**Validation** · P2 (Major) · Admin · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Save with an empty monthly price | Rejected |
| 2 | Save a negative or zero price | Rejected or accepted with a warning; record which |
| 3 | Save an extremely large value (10^9) | Accepted or capped, no overflow in the UI |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-006 — Admin sets a per-owner price override
**Functional** · P1 (Critical) · Admin · Web · Android · iOS

- **Preconditions:** An owner with a known id

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open "Override for <owner>" | Fields for the override amount |
| 2 | Set 149 and save | "Override" state shown for that owner |
| 3 | Owner opens Upgrade | Sees ₹149 instead of the global rate |
| 4 | Clear override | Owner sees the global rate again |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-007 — Override is scoped to one owner
**Security** · P1 (Critical) · Admin · Web · Android · iOS

- **Preconditions:** Two owners

| # | Action | Expected |
| --- | --- | --- |
| 1 | Set an override for owner A | Only A's billing changes |
| 2 | Owner B opens Upgrade | Global rate, unchanged |
| 3 | Check GET /pricing for B | No override leakage |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-008 — Admin endpoints reject non-admin tokens
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /admin/stats with an owner token | 401/403 |
| 2 | POST /admin/pricing with an owner token | 401/403 and rates unchanged |
| 3 | GET /owners with an owner token | 401/403 |
| 4 | Repeat with no token | 401 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-009 — Admin session behaves like any other session
**Functional** · P2 (Major) · Admin · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Reload /admin | Still signed in |
| 2 | Navigate to /home | Redirected back to /admin |
| 3 | Log out (or clear the token) | /admin requires login again |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### ADM-010 — Admin panel is usable on a laptop screen
**UI** · P3 (Minor) · Admin · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /admin at 1440×900 | Table and forms are readable, no horizontal scroll |
| 2 | Open at 390×844 | Content stacks; actions still reachable |
| 3 | Check long owner names | Wrapped or ellipsised, no overlap |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## API

### API-001 — Health endpoint reports ready
**API** · P0 (Blocker) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /health | 200 with {"status":"ok"} |
| 2 | Check the response headers | application/json and CORS allow-origin |
| 3 | Repeat 3 times | Stable, no cold-start 500 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/smoke.spec.js › SMK-01

### API-002 — CORS allows the web app origin
**API** · P1 (Critical) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /health with Origin: https://hostelhub.mynilam.in | Access-Control-Allow-Origin echoes the origin |
| 2 | Send an OPTIONS preflight for POST /auth/login | 204/200 with allowed methods and headers |
| 3 | Check that a random origin is not granted credentials it should not have | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-003 — Register returns a token and the user object
**API** · P0 (Blocker) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /auth/register with valid fields | 200/201 with token and user{id, username, role} |
| 2 | Check role | "owner" for a public registration |
| 3 | Repeat with the same username | 409/400, no duplicate row |
| 4 | POST with a 5-character password | 400 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/regression.spec.js › REG-API-04

### API-004 — Login returns a JWT with the expected shape
**API** · P0 (Blocker) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /auth/login with valid credentials | 200 with a token |
| 2 | Decode the token | 3 segments, HMAC algorithm, exp in the future, sub = user id |
| 3 | Use it as Bearer on /properties | 200 |
| 4 | POST with a wrong password | 401 and no token |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/regression.spec.js › REG-API-02

### API-005 — Password reset flow round-trips
**API** · P1 (Critical) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /auth/forgot-password with a known email | 200 and a token row created |
| 2 | POST /auth/reset-password with that token and a new password | 200 |
| 3 | Login with the new password | 200 |
| 4 | Reuse the same reset token | 400/410 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-006 — Every collection endpoint requires auth
**Security** · P0 (Blocker) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Call GET on /properties, /rooms, /inmates, /payments, /polls, /complaints, /notices, /visitors, /leave, /deposits, /checkouts, /chat, /expenses, /ratings, /sos, /documents, /rent-plans, /pnl without a token | 401 on each |
| 2 | Confirm no payload with data is returned alongside the error | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-007 — Booleans are real booleans, not 0/1
**API** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /properties | kyc_verified is true/false |
| 2 | GET /polls | recurring is a boolean; options is an array |
| 3 | GET /sos | acknowledged is a boolean |
| 4 | Feed the payload into the Flutter model | No cast error |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/regression.spec.js › REG-API-05
- **Notes:** D1 has no boolean type; the Worker coerces 0/1 at the boundary — this regression guards the coercion.

### API-008 — Collection filters are enforced server-side
**API** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /inmates?property_id=<own> | Only own rows |
| 2 | GET /inmates?property_id=<other> | Empty or 403 |
| 3 | GET /payments?inmate_id=<own resident> | Only that resident |
| 4 | GET /chat?inmate_id=<own resident> | Only that thread |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-009 — Not-found and bad requests are well formed
**API** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | GET /nope | 404 JSON, not HTML |
| 2 | POST /inmates with malformed JSON | 400 with a parse error |
| 3 | PUT /health (unsupported method) | 405 or 404, never a 500 |
| 4 | PATCH /inmates/<random-id> | 404 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-010 — Inmate creation validates the room and bed
**API** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /inmates with a non-existent room_id | 400/404 |
| 2 | POST with bed_no > capacity | 400 |
| 3 | POST with bed_no already taken | 409/400 |
| 4 | POST a valid inmate | 200/201 with generated credentials |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-011 — Vote endpoint is idempotent per resident
**API** · P1 (Critical) · Resident · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /poll-responses twice with the same poll and resident | One row; the second call updates |
| 2 | Check GET /polls | Aggregates reflect a single response |
| 3 | POST for a poll of another property | 403/400 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-012 — Payment creation is validated and deduplicated
**API** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /payments with amount 0 | 400 |
| 2 | POST for a month already paid | 409/400 |
| 3 | POST a valid payment | 200/201 and GET /payments shows it once |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-013 — P&L is computed from stored rows
**API** · P2 (Major) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Seed 2 payments (6500 + 6500) and 1 expense (2000) | — |
| 2 | GET /pnl?property_id=... | income 13000, expenses 2000, net 11000 |
| 3 | Delete nothing; call again | Deterministic result |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-014 — Document endpoint enforces owner_type/owner_id pairs
**API** · P2 (Major) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /documents with owner_type "inmate" and a hostel property id | Rejected or stored with the right owner_id |
| 2 | GET /documents?owner_type=inmate&owner_id=<resident> | Correct rows |
| 3 | DELETE /documents/<id> | Removed; second DELETE |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-015 — Order creation fails clearly without live keys
**API** · P2 (Major) · Resident · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /razorpay/order in this environment | Structured error (not a 500 stack trace) |
| 2 | POST /razorpay/webhook with a bad signature | 400/401 and no payment row created |
| 3 | POST /razorpay/webhook with a valid signature fixture | Payment recorded once (idempotent on replay) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-016 — Admin pricing round-trip
**API** · P1 (Critical) · Admin · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /admin/pricing with new rates | 200 |
| 2 | GET /pricing (public) | New values |
| 3 | Restore the original rates | Clients show the restored values |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-017 — Response shapes stay stable across GETs
**API** · P2 (Major) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | For each collection GET, assert the array key name (properties, rooms, inmates, polls, …) | — |
| 2 | Assert every row has id, created_at and property_id where applicable | — |
| 3 | Run twice and diff the key sets | No shape drift between calls |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### API-018 — Collection endpoints respond quickly at small scale
**API** · P3 (Minor) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Time GET /inmates?property_id=... with 50 residents | Under ~1s at the edge |
| 2 | Time GET /payments with 200 rows | Under ~1s |
| 3 | Repeat 5 times | No degrading trend from cold starts |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Security

### SEC-001 — Owner A cannot read any of owner B's resources
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Two owners each with a property, rooms, residents, payments, polls, notices

| # | Action | Expected |
| --- | --- | --- |
| 1 | With owner A token, GET every collection filtered by B's property_id | Empty array or 403, never B rows |
| 2 | GET /properties?owner_id=<B> | Empty or 403 |
| 3 | Compare record counts | No leakage through counts either |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** tests/web/regression.spec.js › REG-API-06

### SEC-002 — Direct object access by guessed id is refused
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | PATCH /inmates/<B resident id> | 403/404 |
| 2 | DELETE /notices/<B notice id> | 403/404 and the notice still exists for B |
| 3 | GET /inmates/<B id>/invoice | 403/404 |
| 4 | PATCH /rent-plans/<B plan id> | 403/404 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-003 — A user cannot change their own role
**Security** · P0 (Blocker) · Resident · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | PATCH /auth/user or /users/<self> with role=owner | Rejected or ignored |
| 2 | Re-login and inspect the JWT payload | role is still inmate |
| 3 | Attempt to reach /setup | Still redirected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-004 — Tokens are signed and verified
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Decode a token and flip a character in the payload | 401 on the next request |
| 2 | Change the alg header to "none" | 401 |
| 3 | Use a token signed with another secret | 401 |
| 4 | Use an expired token | 401 |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-005 — Unexpected fields are ignored
**Security** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | POST /inmates with extra fields like owner_id or property_id of another property | Rejected or ignored |
| 2 | POST /properties with owner_id = another owner | Created under the caller, never the other owner |
| 3 | PATCH a resident with a balance field | Ignored |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-006 — SQL injection attempts are neutralised
**Security** · P0 (Blocker) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Use "R101' OR 1=1 --" as a room number | Stored verbatim, no extra rows returned |
| 2 | Use the same payload in the property name and notice title | Stored as text |
| 3 | Verify the tables still load and no other tenant's data appears | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-007 — User content never executes script
**Security** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Post "<img src=x onerror=alert(1)>" as a notice title and a chat message | Rendered as text |
| 2 | Raise a complaint containing "<script>alert(1)</script>" | Displayed literally |
| 3 | Check the console | No alert, no injected DOM node |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-008 — HTTPS and headers are enforced
**Security** · P1 (Critical) · Guest · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Request http://hostelhub.mynilam.in | 301 to https |
| 2 | Inspect response headers | HSTS, X-Content-Type-Options: nosniff, sensible CSP |
| 3 | Check the certificate | Valid, not self-signed, correct hostname |
| 4 | Call the Worker over http | Upgraded or refused |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-009 — No secrets ship in the client bundle
**Security** · P0 (Blocker) · Guest · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Download main.dart.js and grep for JWT_SECRET, BETTER_AUTH_SECRET, rzp_live, sk_live, AKIA | No matches |
| 2 | Grep the Worker bundle for hardcoded secrets | Only env bindings |
| 3 | Check the repo history for committed .env | Not tracked (gitignore) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-010 — Auth flows do not confirm account existence
**Security** · P2 (Major) · Guest · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Forgot password for a known and an unknown email | Same confirmation |
| 2 | Login with an unknown username vs a wrong password | Same generic error |
| 3 | Register with a taken username | A specific conflict is acceptable only here (needed for UX) |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-011 — Abuse-prone endpoints are throttled
**Security** · P2 (Major) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Fire 30 login attempts in 10s | Throttled (429) or documented as unthrottled |
| 2 | Fire 30 register attempts | Same expectation |
| 3 | Fire 100 GET /health | Should remain cheap; check for 429 or edge caching |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual
- **Notes:** Record the observed state; this is a hardening gap rather than a UI defect.

### SEC-012 — Uploaded documents are not publicly listable
**Security** · P1 (Critical) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Try to fetch a document URL without a token | 401/403 |
| 2 | Try a predictable path traversal ("../") | Refused |
| 3 | Confirm documents are only reachable through the authenticated API | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-013 — A new login issues a new token
**Security** · P1 (Critical) · Owner · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Note the token from the first login | — |
| 2 | Log in again | A different token is issued |
| 3 | Use the first token after logout | Rejected if logout revokes tokens; record the behaviour |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-014 — An owner cannot log in as a resident
**Security** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Try the generated resident credentials on the owner app | Resident shell opens only if the credentials are the resident's |
| 2 | Try to fetch a resident token through any owner endpoint | No such endpoint exists |
| 3 | Regenerating credentials changes the resident password, not the owner's access | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-015 — Errors do not leak internals
**Security** · P1 (Critical) · Guest · API

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Trigger a 500 (malformed payload deep in a handler) | Generic message, no stack trace, no SQL text |
| 2 | Check the response for table names, file paths or D1 ids | None |
| 3 | Verify the Worker logs contain the detail instead | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### SEC-016 — State-changing calls are not trivially forgeable
**Security** · P1 (Critical) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Check how the token is stored and sent | Authorization header (not an ambient cookie) implies no classic CSRF |
| 2 | If cookies are used anywhere, verify SameSite and a CSRF token | — |
| 3 | Attempt a cross-site form POST to /notices without the header | Rejected |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## Web UI

### WEB-001 — Layout adapts across the four breakpoints
**UI** · P0 (Blocker) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Home at 390×844 | Single column, bottom tab bar, no horizontal scroll |
| 2 | At 820×1180 | Two-column stat grid, comfortable gutters |
| 3 | At 1024×768 | Three/four-column grid begins, content capped |
| 4 | At 1440×900 and 1920×1080 | Four-column grid, max content width ~1180px, no stretched cards |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual — smoke SMK-02 covers the login screen only

### WEB-002 — No screen produces a RenderFlex overflow
**UI** · P0 (Blocker) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Walk every owner screen at 390 width | No yellow/black overflow stripes, no console overflow errors |
| 2 | Repeat at 820 and 1440 | Same |
| 3 | Open add-resident, poll creation and expense sheets at 390 | Sheets fit; buttons visible |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-003 — Forms are width-capped on desktop
**UI** · P1 (Critical) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open Add inmate at 1440 | Form capped (roughly 430–700px), centred, not full width |
| 2 | Open Settings at 1440 | Capped around 820–900px |
| 3 | Open Login at 1440 | Card centred with sensible width |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-004 — Browser back and forward work with the SPA
**Functional** · P1 (Critical) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Navigate Home → Inmates → Add inmate | History grows |
| 2 | Press browser Back | Returns to Inmates |
| 3 | Press Back again | Home |
| 4 | Press Forward | Inmates again |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-005 — Refreshing a deep route keeps the screen
**Functional** · P1 (Critical) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open /inmates/new and press F5 | The add form reloads (SPA fallback), not a 404 |
| 2 | Open /settings and refresh | Settings reloads signed in |
| 3 | Open /polls and refresh | Polls reloads |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-006 — Async screens show a loading state
**UI** · P2 (Major) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Throttle to Slow 3G and open Inmates | A spinner or skeleton appears; no blank white flash or "null" |
| 2 | Open Payments under the same throttle | Same behaviour |
| 3 | Wait for completion | Content replaces the loader |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-007 — Failures surface as messages, not crashes
**Negative** · P1 (Critical) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Block the API domain in devtools and open Inmates | "Error loading inmates" style message with a retry |
| 2 | Submit the add-resident form while blocked | Failure message; the form keeps the entered data |
| 3 | Unblock and retry | Succeeds |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-008 — Keyboard navigation reaches the primary actions
**Compatibility** · P2 (Major) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | On the login screen press Tab | Focus moves Username → Password → Log in → Sign up with a visible focus ring |
| 2 | Press Enter in the password field | Submits |
| 3 | On the dashboard press Tab through Quick actions | Focus order is logical, no traps |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-009 — Layout survives 200% zoom
**Compatibility** · P2 (Major) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Set browser zoom to 200% at 1440 wide | Effectively 720px; layout reflows, no clipped text |
| 2 | Open a form | Fields remain usable |
| 3 | Reset zoom | Layout returns to the desktop grid |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-010 — Text meets contrast expectations
**UI** · P2 (Major) · All · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Check body text on the glass background | Ratio meets WCAG AA (4.5:1) |
| 2 | Check muted labels (helper text, timestamps) | Still readable |
| 3 | Check buttons | Text on the primary colour is readable |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-011 — Navigation is reachable at every size
**UI** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | At 390 width | Bottom tab bar visible with 4 items and labels |
| 2 | At 1440 width | Navigation remains reachable (side rail or bottom bar), no dead end |
| 3 | Tap each item | Correct screen; active item highlighted |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-012 — Pull-to-refresh mirrors the web reload
**Functional** · P2 (Major) · Owner · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Pull down on Inmates | Refreshes without dropping the session |
| 2 | Pull on Polls | New votes appear |
| 3 | Check that the gesture does not fire inside a dialog/sheet | — |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-013 — Installable web app basics
**Compatibility** · P3 (Minor) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open devtools → Application → Manifest | name, icons and start_url present |
| 2 | Check the service worker registration | Present and not caching index.html aggressively |
| 3 | Install to desktop | Launches standalone with the correct title |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-014 — Invoices and bills print sensibly
**UI** · P3 (Minor) · Owner · Web

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Open a generated invoice PDF in the browser | A4-friendly, no clipped margins |
| 2 | Print preview the Bills sheet | No background gradients behind text |
| 3 | Check the header/footer | Hostel name and page number correct |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### WEB-015 — Buttons are thumb-friendly on phones
**Compatibility** · P2 (Major) · Owner · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Check primary buttons | At least 44×44 logical pixels, with spacing between adjacent actions |
| 2 | Check list row actions (Check out, Acknowledge) | Not overlapping, easy to hit |
| 3 | Test one-handed reach on the bottom bar | All four tabs reachable |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

## End-to-end

### E2E-001 — New owner goes from sign-up to first resident
**E2E** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** No account, no property

| # | Action | Expected |
| --- | --- | --- |
| 1 | Register a new owner account | Lands on /home with "Set up your hostel" |
| 2 | Complete setup: name "QA Hostel", type Hostel, address, room R101 with 4 beds | Dashboard shows 0/4 occupancy |
| 3 | Add resident Asha with bed 1, rent 6500, due day 5 | Credentials dialog with username and password |
| 4 | Copy the credentials and dismiss | Resident listed with Room R101 · Bed 1 · ₹6500 |
| 5 | Reload the app | Property, room and resident all persist |

- **Postconditions:** A resident can now log in with the copied credentials
- **Automation:** Manual

### E2E-002 — Resident pays rent and the owner sees the collection
**E2E** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Owner created a resident with rent 6500 and due day 5

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident logs in with the generated credentials | "Your stay at a glance" with ₹6500 due |
| 2 | Tap "Pay rent ₹6500" and confirm | "Payment successful" and a receipt |
| 3 | Return to Home | "Paid ✓" for the month |
| 4 | Owner signs in and opens Home | "Total collected" increased by ₹6500 and pending dues dropped by the same amount |
| 5 | Owner opens the resident → Payment history | One payment with today's date and the right amount |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-003 — Full poll cycle from creation to all-responded
**E2E** · P0 (Blocker) · Owner · Web · Android · iOS

- **Preconditions:** Three residents in the property

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner creates a Dinner poll for tomorrow with Yes/No | Card with 0 responses and "No response: 3" |
| 2 | Resident 1 votes Yes, resident 2 votes No | Owner tally 1/1 and pending 1 |
| 3 | Owner taps "Nudge 1 non-responders" | "Nudge sent to 1 inmates" |
| 4 | Resident 3 votes Yes | Owner sees "All responded ✓" |
| 5 | Reload the polls screen | Counts preserved |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-004 — Complaint from raise to resolution
**E2E** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Resident signed in

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident raises "Geyser not working" | "Complaint submitted" |
| 2 | Owner opens Complaints | Complaint present with status open and "Open complaints" counter at 1 |
| 3 | Owner marks it resolved | Status resolved; counter 0 |
| 4 | Resident refreshes | Sees the resolved status |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-005 — Resident moves rooms and everything follows
**E2E** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Resident in R101; R102 has free beds

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner opens the resident → Change room → picks R102 bed 1 | "Moved to Room R102, bed 1" |
| 2 | Inmates screen | R101 count decremented, R102 incremented |
| 3 | Resident logs in | Home shows Room R102, bed 1 |
| 4 | Owner generates an invoice | The invoice carries the new room |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-006 — Deposit to refund in one flow
**E2E** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Resident with deposit ₹10000

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner records a deduction of ₹1500 with a reason | Refundable ₹8500 |
| 2 | Owner initiates checkout with a vacate date | Checkout listed as pending |
| 3 | Owner completes the checkout and settles ₹8500 | Success state |
| 4 | Resident opens My deposit | Collected 10000, deducted 1500, refunded 8500 |
| 5 | Owner opens Inmates | Resident checked out, bed freed, room occupancy reduced |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-007 — Two-way conversation between owner and resident
**E2E** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner sends "Rent due on the 5th" | Message in the thread with the owner role |
| 2 | Resident opens Chat with owner and replies "Paying today" | Message visible as the resident |
| 3 | Owner reopens the thread | Both messages in chronological order |
| 4 | Owner opens the chat list | The thread is first |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-008 — Pinned notice reaches every resident
**E2E** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner posts "Water supply" with a body and Pin to top | Notice appears first in the owner list |
| 2 | Resident 1 opens Notices | Same notice on top with the full body |
| 3 | Owner posts a newer unpinned notice | The pinned notice is still first |
| 4 | Owner unpins | Chronological order returns for both roles |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-009 — Emergency alert is delivered and acknowledged
**E2E** · P0 (Blocker) · Resident · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Resident taps Emergency SOS and confirms | "SOS alert sent to your owner" |
| 2 | Owner opens SOS alerts | Unacknowledged alert with the resident and time |
| 3 | Owner taps Acknowledge | "Acknowledged"; the action disappears |
| 4 | Reload both apps | State consistent |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-010 — Visitor logs in and out
**E2E** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner logs visitor Ravi for resident Asha with a purpose | Row "Inside since <time>" |
| 2 | Owner taps Check out | "Left at <time>" |
| 3 | Reload | The visit keeps both timestamps and is not duplicated |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-011 — Three residents, mixed states, consistent dashboard
**E2E** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** 3 residents: one paid, one pending, one on leave

| # | Action | Expected |
| --- | --- | --- |
| 1 | Dashboard | Occupancy 3/4, collected = paid rent, pending = unpaid rent, open complaints correct |
| 2 | Create a poll and have two residents vote | Tally matches |
| 3 | Move one resident to another room | Occupancy moves with them |
| 4 | Reload | Every number still consistent with the underlying rows |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-012 — Owner and resident share one device
**E2E** · P1 (Critical) · All · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | Owner signs in and uses the app | Owner tabs and Manage menu |
| 2 | Log out and sign in as the resident | Resident tabs, Menu heading, no owner items |
| 3 | Log out and sign back in as the owner | Owner data intact, no resident session bleed |
| 4 | Check localStorage/tokens | Only one session at a time |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-013 — Owner runs two properties in parallel
**E2E** · P2 (Major) · Owner · Web · Android · iOS

- **Preconditions:** Owner has QA Hostel and QA Annex, each with a resident

| # | Action | Expected |
| --- | --- | --- |
| 1 | Switch to QA Annex | Inmates/Polls/Dashboard show only Annex data |
| 2 | Create a poll in Annex | The Hostel property does not see it |
| 3 | Switch back to QA Hostel | Its own polls and residents are unchanged |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-014 — Every owner menu entry opens and closes cleanly
**E2E** · P1 (Critical) · Owner · Web · Android · iOS

- **Preconditions:** Owner is signed in; a property with at least one room exists

| # | Action | Expected |
| --- | --- | --- |
| 1 | From More, open each entry: Notices, Complaints, Visitors, Leave, Deposits, Checkout, Chat, Expenses, Bills, Ratings, SOS, Documents, Settings, Upgrade, Privacy, Terms | — |
| 2 | Each screen renders content or a proper empty state | No blank screen, no crash, no console error |
| 3 | Back from each | Returns to the shell with the tab bar intact |
| 4 | Log out from the same menu | Returns to /login |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual

### E2E-015 — Resident completes every first-session action
**E2E** · P1 (Critical) · Resident · Web · Android · iOS

- **Preconditions:** Fresh resident with rent, deposit and an open poll

| # | Action | Expected |
| --- | --- | --- |
| 1 | Log in | Home shows room, rent, deposit and the quick actions |
| 2 | Vote in the poll | "You said Yes" |
| 3 | Raise a complaint | Confirmed |
| 4 | Mark leave for tomorrow | Recorded |
| 5 | Upload a document | Listed under My documents |
| 6 | Send a chat message | Visible in the thread |
| 7 | Reload | All six actions persisted |

- **Postconditions:** No side effects beyond those asserted
- **Automation:** Manual
