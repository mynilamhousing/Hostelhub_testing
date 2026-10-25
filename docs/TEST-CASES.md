# HostelHub — Test Case Catalogue

Generated 2026-10-25 · 54 cases · 44 automated · 10 manual

Targets: `https://hostelhub.mynilam.in` · `https://hostelhub.mynilamhousing.workers.dev`

| ID | Module | Type | Priority | Title | Automated |
| --- | --- | --- | --- | --- | --- |
| SMK-01 | Platform | Smoke | P1 | API health endpoint responds | yes |
| SMK-02 | Authentication | Smoke | P1 | App loads and shows the login screen | yes |
| SMK-03 | Dashboard | Smoke | P1 | Owner signs in and sees the dashboard | yes |
| SMK-04 | Navigation | Smoke | P1 | All owner tabs are reachable | yes |
| SMK-05 | Inmates | Smoke | P1 | Seeded resident is listed on the inmates tab | yes |
| E2E-AUTH-01 | Authentication | E2E | P1 | Owner signs in with valid credentials | yes |
| E2E-AUTH-02 | Authentication | E2E | P1 | Invalid password keeps the user on the login screen | yes |
| E2E-AUTH-03 | Authentication | E2E | P2 | Sign-up screen opens from login | yes |
| E2E-AUTH-04 | Authentication | E2E | P2 | Forgot-password screen opens from login | yes |
| E2E-AUTH-05 | Authentication | E2E | P1 | Protected route redirects to login when signed out | yes |
| E2E-AUTH-06 | Authentication | E2E | P1 | Owner can sign out | yes |
| REG-SES-01 | Authentication | Regression | P1 | Session survives a page reload | yes |
| REG-SES-02 | Authentication | Regression | P2 | Empty credentials do not navigate | yes |
| REG-SES-03 | Authentication | Regression | P1 | Every protected route redirects when signed out | yes |
| REG-SES-04 | Authentication | Regression | P1 | Logout clears the persisted session | yes |
| E2E-ONB-01 | Onboarding | E2E | P1 | New owner sees the setup prompt | yes |
| E2E-ONB-02 | Onboarding | E2E | P1 | Setup wizard opens from the prompt | yes |
| E2E-ONB-03 | Onboarding | E2E | P1 | Property and rooms appear on dashboard and inmates tab | yes |
| MNL-ONB-01 | Onboarding | Manual | P1 | Complete the setup wizard end to end | **manual** |
| E2E-INM-01 | Inmates | E2E | P1 | Inmates tab shows property, rooms and residents | yes |
| E2E-INM-02 | Inmates | E2E | P1 | Owner adds a resident through the form | yes |
| E2E-INM-03 | Inmates | E2E | P1 | Resident created in the UI exists in the API | yes |
| REG-OCC-01 | Inmates | Regression | P1 | Room capacity cannot be exceeded | yes |
| REG-OCC-02 | Inmates | Regression | P1 | A bed cannot be assigned twice | yes |
| REG-OCC-03 | Inmates | Regression | P2 | Bed number outside the room range is rejected | yes |
| REG-OCC-04 | Inmates | Regression | P2 | API-created resident exposes room and bed | yes |
| MNL-INM-02 | Inmates | Manual | P2 | Regenerate resident credentials | **manual** |
| MNL-RNT-01 | Rent | Manual | P1 | Record a rent payment and view the receipt | **manual** |
| MNL-RNT-02 | Rent | Manual | P2 | Generate and share a PDF invoice | **manual** |
| E2E-POLL-01 | Polls | E2E | P1 | Polls tab renders an active poll | yes |
| E2E-POLL-02 | Polls | E2E | P2 | Poll options are an array and recurring is a boolean | yes |
| E2E-POLL-03 | Polls | E2E | P2 | Polls are scoped to their property | yes |
| MNL-POLL-01 | Polls | Manual | P1 | Resident answers a poll and the owner sees the headcount | **manual** |
| E2E-OPS-01 | Operations | E2E | P2 | Complaints screen renders | yes |
| E2E-OPS-02 | Operations | E2E | P2 | Documents screen renders with its upload action | yes |
| E2E-OPS-03 | Operations | E2E | P2 | Expenses screen shows the P&L summary | yes |
| E2E-OPS-04 | Operations | E2E | P2 | Visitors, deposits, ratings and SOS render | yes |
| E2E-OPS-05 | Operations | E2E | P2 | Settings, bills and chat render | yes |
| E2E-OPS-06 | Operations | E2E | P2 | Adding an expense reaches the P&L endpoint | yes |
| MNL-OPS-01 | Operations | Manual | P1 | Raise and resolve a complaint | **manual** |
| MNL-OPS-02 | Operations | Manual | P2 | Broadcast a notice to residents | **manual** |
| REG-API-01 | API | Regression | P1 | /health and /pricing keep their shape | yes |
| REG-API-02 | API | Regression | P1 | Register and login issue a signed JWT | yes |
| REG-API-03 | API | Regression | P1 | Wrong password is 401 without echoing the password | yes |
| REG-API-04 | API | Regression | P2 | Duplicate username is rejected | yes |
| REG-API-05 | API | Regression | P1 | Boolean fields are real JSON booleans | yes |
| REG-API-06 | API | Regression | P1 | Tenants are isolated | yes |
| MNL-API-01 | API | Manual | P1 | Worker secrets are configured | **manual** |
| MNL-PLT-01 | Platform | Manual | P1 | Custom domain serves the app over HTTPS | **manual** |
| MNL-PLT-02 | Platform | Manual | P2 | Deep links work after a hard refresh | **manual** |
| MNL-PLT-03 | Platform | Manual | P2 | Mobile web layout is usable | yes |
| MOB-AUTH-01 | Mobile | E2E | P1 | Native app starts on the login screen | yes |
| MOB-AUTH-02 | Mobile | E2E | P1 | Native app signs in with valid credentials | yes |
| MOB-NAV-01 | Mobile | E2E | P2 | Native shell navigation works | yes |
