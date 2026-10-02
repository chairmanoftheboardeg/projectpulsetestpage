# Project PULSE — Interactive Prototype

A working concept demo of the proposed Project PULSE student wellbeing system, shown as a module inside an OpenEMIS-style education platform.

Live address: https://projectpulsetestpage.tyler-nicholas-foundation.online

**All data is fictional. Nothing is sent anywhere.** Everything (email, check-ins, messages, case changes) stays in the visitor's browser tab and is cleared when the tab is closed.

## Flow

1. Access page: enter any valid email (format check only, no account, no code)
2. Choose a role: Student, Counsellor, or Ministry
3. Explore the role dashboard
4. Switch Role or Exit Prototype at any time

## Try this demo path

1. Student: complete a check-in, choose "Not great" and tick "Bullying" to see the suggested actions.
2. Student: send a support request.
3. Switch Role, then Counsellor: the request appears as **STU-2031** in the queue. Open it, accept it, schedule a meeting, then close it.
4. Switch Role, then Ministry: change the period on the dashboard, open a school, try the capacity scenario slider, generate a report.

## Files

```
index.html                    App shell
assets/css/app.css            All styles
assets/js/data.js             Fictional demo data
assets/js/charts.js           Small SVG chart helpers (no libraries)
assets/js/app.js              Router, shell, access + role pages, shared helpers
assets/js/views-student.js    Student pages
assets/js/views-counsellor.js Counsellor pages
assets/js/views-ministry.js   Ministry pages
assets/img/                   Logos and favicons
CNAME                         Custom domain for GitHub Pages
```

## Settings

At the top of `assets/js/app.js`:

- `MAIN_SITE`: where "Exit Prototype" goes. **Set this to the main Project PULSE website address.**
- `BOOT_MS`: length of the opening loading animation (milliseconds).

## Publish on GitHub Pages

Upload everything to the root of a repository, then Settings, Pages, Deploy from branch, `main`, `/ (root)`.
The included `CNAME` file sets the custom domain. Your DNS needs a CNAME record for
`projectpulsetestpage` pointing to `<your-github-username>.github.io`.
