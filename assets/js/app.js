/* =========================================================
   PROJECT PULSE — Interactive Prototype
   All data is fictional and stays in this browser tab.
   Nothing is sent to any server.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- CONFIG ---------- */
  var CONFIG = {
    // Where "Exit Prototype" takes people. Change this to the main Project PULSE website address.
    MAIN_SITE: "https://tyler-nicholas-foundation.online/",
    BOOT_MS: 1800
  };

  var D = window.PULSE_DATA, C = window.PulseCharts;
  var app = document.getElementById("app");
  var modalRoot = document.getElementById("modal-root");
  var toastRoot = document.getElementById("toast-root");

  /* ---------- Utilities ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function nowTime() { var d = new Date(); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function dayLabel(daysAgo) {
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    var d = new Date(); d.setDate(d.getDate() - daysAgo);
    return d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"][d.getMonth()];
  }
  function greeting() { var h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }
  function mood(id) { return D.MOODS.filter(function (m) { return m.id === id; })[0] || D.MOODS[2]; }
  function num(n) { return Number(n).toLocaleString(); }

  /* ---------- Icons (24px stroke icons) ---------- */
  var ICONS = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    pulse: '<path d="M2 12h4l2.5-6 4 13 3-9 1.5 2H22"/>',
    hand: '<path d="M7 11V6a1.5 1.5 0 013 0v5"/><path d="M10 10V4.5a1.5 1.5 0 013 0V10"/><path d="M13 10V5.5a1.5 1.5 0 013 0V12"/><path d="M16 9.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-1a6 6 0 01-5-2.7L4.3 14a1.6 1.6 0 012.6-1.9L8 13.5"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    history: '<path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.4"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/>',
    book: '<path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5z"/><path d="M20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-7 8-7s7 2.5 8 7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.8 3.3-6 6.5-6s5.7 2.2 6.5 6"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14c2.6 0 4.2 1.8 4.8 5"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
    bell: '<path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 20a2 2 0 004 0"/>',
    alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.2v.3"/>',
    folder: '<path d="M3 6.5A1.5 1.5 0 014.5 5H10l2 2.5h7.5A1.5 1.5 0 0121 9v9.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5z"/>',
    chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6M20 16V6"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>',
    school: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><path d="M22 9v6"/>',
    building: '<path d="M3 21h18"/><path d="M5 21V10l7-5 7 5v11"/><path d="M9 21v-5h6v5"/><path d="M9 12h.01M15 12h.01"/>',
    shield: '<path d="M12 3l8 3.5V12c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6.5z"/><path d="M9 12l2 2 4-4"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 018 0v3.5"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    capacity: '<circle cx="12" cy="12" r="9"/><path d="M12 12l5-3"/><path d="M12 3v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 7l1.4-1.4"/>',
    logout: '<path d="M10 4H5v16h5"/><path d="M15 8l4 4-4 4"/><path d="M9 12h10"/>',
    swap: '<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 12l4 4-4 4"/><path d="M21 16H7"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 20h16"/>',
    print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18h2"/>',
    map: '<path d="M9 4L3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    counsellor: '<circle cx="8" cy="8" r="3"/><path d="M2.5 19c.6-3.4 2.7-5.5 5.5-5.5s4.9 2.1 5.5 5.5"/><path d="M14 6h7v6h-3l-3 2.5V12h-1z"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>'
  };
  function icon(name, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || "") + '>' + (ICONS[name] || "") + '</svg>'; }

  // Mood faces
  function face(id, color) {
    var mouths = { 5: "M8 14c1.2 2 2.5 3 4 3s2.8-1 4-3", 4: "M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8", 3: "M8.5 15h7", 2: "M8.5 16c1-1.2 2.2-1.8 3.5-1.8s2.5.6 3.5 1.8", 1: "M8 17c1.2-2 2.5-3 4-3s2.8 1 4 3" };
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="' + color + '" opacity=".14"/><circle cx="12" cy="12" r="10" stroke="' + color + '" stroke-width="1.6"/><circle cx="9" cy="10" r="1.2" fill="' + color + '"/><circle cx="15" cy="10" r="1.2" fill="' + color + '"/><path d="' + mouths[id] + '" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }

  /* ---------- Session + state (sessionStorage only, never sent anywhere) ---------- */
  var KEY = "pulse-proto-v1";
  var S = load();
  function fresh() {
    return {
      email: null, booted: false,
      student: clone(D.student),
      myRequests: [], myConcerns: [],
      requests: clone(D.requests), alerts: clone(D.alerts), threads: clone(D.threads),
      log: {},             // case action log by student id
      notifs: {
        student: [
          { id: "n1", title: "Ms Marie sent you a message", body: "\"Well done for getting through them...\"", go: "#/student/messages" },
          { id: "n2", title: "Weekly check-in is open", body: "Takes about one minute.", go: "#/student/checkin" }
        ],
        counsellor: [
          { id: "n3", title: "New support request: STU-1172", body: "Bullying, High priority", go: "case:STU-1172" },
          { id: "n4", title: "Wellbeing indicator: STU-1311", body: "Repeated low wellbeing. Review recommended.", go: "#/counsellor/alerts" },
          { id: "n5", title: "STU-0877 asked to move a meeting", body: "Can we move our meeting to Thursday?", go: "#/counsellor/messages" }
        ],
        ministry: [
          { id: "n6", title: "Monthly summary ready", body: "National Student Wellbeing Summary (September)", go: "#/ministry/reports" },
          { id: "n7", title: "Capacity notice", body: D.schools.filter(function (x) { return x.ratio > 400; }).length + " schools are above the recommended student-to-counsellor ratio.", go: "#/ministry/capacity" }
        ]
      },
      privacy: { tutor: true, trends: true, reminders: true }
    };
  }
  function load() {
    try { var raw = sessionStorage.getItem(KEY); if (raw) return Object.assign(fresh(), JSON.parse(raw)); } catch (e) {}
    return fresh();
  }
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------- Toasts, modals, drawers ---------- */
  function toast(msg) {
    var el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = icon("check") + "<span>" + esc(msg) + "</span>";
    toastRoot.appendChild(el);
    setTimeout(function () { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 2600);
    setTimeout(function () { el.remove(); }, 3000);
  }
  var lastFocus = null;
  function openModal(html, opts) {
    opts = opts || {};
    lastFocus = document.activeElement;
    modalRoot.innerHTML = '<div class="modal-backdrop" data-close><div class="modal' + (opts.wide ? " modal--wide" : "") + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.label || "Dialog") + '">' + html + '</div></div>';
    var bd = $(".modal-backdrop", modalRoot);
    bd.addEventListener("click", function (e) { if (e.target === bd || e.target.closest("[data-dismiss]")) closeModal(); });
    var f = $("button, input, select, textarea, a", bd); if (f) f.focus();
    return bd;
  }
  function closeModal() { modalRoot.innerHTML = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function openDrawer(html) {
    lastFocus = document.activeElement;
    modalRoot.innerHTML = '<div class="drawer-backdrop" data-dismiss></div><aside class="drawer" role="dialog" aria-modal="true">' + html + '</aside>';
    $$("[data-dismiss]", modalRoot).forEach(function (el) { el.addEventListener("click", closeModal); });
    var f = $(".drawer button", modalRoot); if (f) f.focus();
    return $(".drawer", modalRoot);
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modalRoot.innerHTML) closeModal(); });
  function modalHead(title, sub) {
    return '<div class="modal__head"><div><h2>' + title + '</h2>' + (sub ? '<p class="muted small" style="margin:.3rem 0 0">' + sub + '</p>' : "") + '</div><button class="icon-btn" data-dismiss aria-label="Close">' + icon("close") + '</button></div>';
  }

  /* ---------- Shared bits ---------- */
  function notice(title, text, type) {
    return '<div class="notice' + (type ? " notice--" + type : "") + '">' + icon(type === "red" ? "alert" : "info") + '<p><strong>' + title + '</strong>' + text + '</p></div>';
  }
  function statusPill(s) {
    var map = { "New": "red", "Accepted": "blue", "Scheduled": "blue", "Follow-up": "orange", "Referred": "yellow", "Closed": "grey", "Open": "red", "Reviewed": "green", "Dismissed": "grey", "Sent (demo)": "blue" };
    return '<span class="pill pill--' + (map[s] || "grey") + '">' + esc(s) + '</span>';
  }
  function prioPill(p) { return '<span class="pill pill--' + ({ High: "red", Medium: "orange", Low: "green" }[p] || "grey") + '">' + p + '</span>'; }
  function levelPill(l) { return '<span class="pill pill--' + ({ "Review recommended": "red", "Flag for review": "orange", "For awareness": "blue" }[l] || "grey") + '">' + l + '</span>'; }
  function tabs(name, items, active) {
    return '<div class="tabs" role="tablist" data-tabs="' + name + '">' + items.map(function (it) {
      var v = it.value || it, l = it.label || it;
      return '<button class="tab" role="tab" data-tab="' + v + '" aria-selected="' + (v === active) + '">' + l + '</button>';
    }).join("") + '</div>';
  }
  function pageHead(title, sub, right) {
    return '<div class="page-head"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : "") + '</div>' + (right || "") + '</div>';
  }
  function emptyState(text, ic) { return '<div class="empty">' + icon(ic || "inbox") + '<p>' + text + '</p></div>'; }

  /* =========================================================
     GATE: ACCESS PAGE
     ========================================================= */
  function gateFrame(inner, showWho) {
    return '<div class="gate">' +
      '<div class="gate__top"><a class="gate__brand" href="#/" aria-label="Project PULSE prototype">' +
      '<img src="assets/img/pulse-mark.png" alt="" width="42" height="33"><span class="brandword"><small>Project</small><b>PULSE</b></span></a>' +
      '<div style="display:flex;align-items:center;gap:.75rem">' +
      (showWho && S.email ? '<span class="roles__who">' + icon("user", ' width="16" height="16"') + esc(S.email) + '</span>' : "") +
      '<span class="badge-proto">PROTOTYPE</span>' +
      '<a class="btn btn--ghost btn--sm" href="' + CONFIG.MAIN_SITE + '" data-exit>' + icon("logout") + '<span class="btn__text">Exit Prototype</span></a></div></div>' +
      '<div class="gate__ribbon" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
      '<main class="gate__main">' + inner + '</main>' +
      '<footer class="gate__foot"><span>Project PULSE prototype. All information shown is fictional and for demonstration only.</span>' +
      '<a href="https://tyler-nicholas-foundation.online/" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:.6rem;color:inherit;text-decoration:none">A flagship project of <img src="assets/img/tnf-logo.png" alt="Tyler Nicholas Foundation" width="70" height="51"></a></footer>' +
      '</div>';
  }

  function viewAccess() {
    var html = gateFrame(
      '<div class="access">' +
        '<div>' +
          '<h1>Explore the Project PULSE Prototype</h1>' +
          '<p class="access__sub">Experience how Project PULSE could work for students, counsellors and education authorities.</p>' +
          notice("Prototype demonstration", "This is an interactive demonstration of the proposed Project PULSE system. It does not contain real student, school or counselling data and is not an operational Ministry of Education or OpenEMIS system.") +
          '<p class="access__status">Project PULSE is currently under development. This prototype demonstrates the proposed concept and does not represent a live Ministry of Education or OpenEMIS implementation.</p>' +
        '</div>' +
        '<form class="access__card" id="accessForm" novalidate>' +
          '<h2>Enter your email to continue</h2>' +
          '<div class="field"><label for="email">Email address</label>' +
          '<input class="input" id="email" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com" value="' + esc(S.email || "") + '" required>' +
          '<p class="error-text" id="emailError" hidden>Enter an email address in the format name@example.com</p></div>' +
          '<button class="btn btn--primary btn--lg btn--block" type="submit">Access Prototype ' + icon("arrow") + '</button>' +
          '<p class="access__note">No account, password or code needed. Your email is only kept in this browser tab for this visit. It is not sent to or stored by Project PULSE.</p>' +
        '</form>' +
      '</div>');
    return { html: html, bind: function () {
      var f = $("#accessForm"), input = $("#email"), err = $("#emailError");
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = input.value.trim();
        var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
        input.classList.toggle("is-invalid", !ok);
        err.hidden = ok;
        if (!ok) { input.focus(); return; }
        S.email = v; save();
        go("#/roles");
      });
    }};
  }

  /* =========================================================
     GATE: ROLE SELECTION
     ========================================================= */
  function viewRoles() {
    var roles = [
      { id: "student", title: "Student", icon: "user", color: "#D3111C", text: "Experience the student wellbeing dashboard, complete check-ins, request support and explore available resources.", cta: "Enter as Student" },
      { id: "counsellor", title: "Psychologist / Counsellor", icon: "counsellor", color: "#0B4EA2", text: "Explore tools for responding to student support requests, reviewing wellbeing indicators and managing cases.", cta: "Enter as Counsellor" },
      { id: "ministry", title: "Ministry / Education Authority", icon: "building", color: "#0A8A43", text: "Explore anonymised wellbeing trends, school-level insights and national support capacity.", cta: "Enter Ministry View" }
    ];
    var html = gateFrame(
      '<div class="roles">' +
        '<div class="roles__head"><h1>Choose your prototype experience</h1><p>Select a role to explore how Project PULSE could work for different users. You can switch roles at any time.</p></div>' +
        '<div class="roles__grid">' + roles.map(function (r) {
          return '<button class="role-card" style="--rc:' + r.color + '" data-role="' + r.id + '">' +
            '<span class="role-card__icon">' + icon(r.icon) + '</span><h2>' + r.title + '</h2><p>' + r.text + '</p>' +
            '<span class="btn">' + r.cta + ' ' + icon("arrow") + '</span></button>';
        }).join("") + '</div>' +
        '<p class="roles__foot">All information shown in this prototype is fictional and provided solely for demonstration purposes.</p>' +
      '</div>', true);
    return { html: html, bind: function () {
      $$("[data-role]").forEach(function (b) { b.addEventListener("click", function () { go("#/" + b.dataset.role + "/home"); }); });
    }};
  }

  /* =========================================================
     APP SHELL
     ========================================================= */
  var ROLES = {
    student: {
      name: "Student", who: "Alex D.", initials: "AD", color: "#D3111C", sub: "S3 Blue",
      nav: [
        ["home", "Home", "home"], ["checkin", "Wellbeing Check-In", "pulse"], ["support", "Request Support", "hand"],
        ["concern", "Report a Concern", "flag"], ["messages", "Messages", "chat"], ["history", "My Check-Ins", "history"],
        ["resources", "Resources", "book"], ["profile", "My Profile", "user"]
      ]
    },
    counsellor: {
      name: "Counsellor", who: "Ms Marie", initials: "MM", color: "#0B4EA2", sub: "School Counsellor",
      nav: [
        ["home", "Home", "home"], ["requests", "Support Requests", "inbox"], ["alerts", "Wellbeing Alerts", "alert"],
        ["students", "Students", "users"], ["cases", "Cases", "folder"], ["messages", "Messages", "chat"],
        ["trends", "School Trends", "chart"], ["referrals", "Resources & Referrals", "link"]
      ]
    },
    ministry: {
      name: "Ministry", who: "Education Authority", initials: "MoE", color: "#0A8A43", sub: "National view",
      nav: [
        ["home", "Home", "home"], ["overview", "National Overview", "globe"], ["trends", "Wellbeing Trends", "trend"],
        ["schools", "Schools", "school"], ["capacity", "Counselling Capacity", "capacity"], ["safeguarding", "Safeguarding Overview", "shield"],
        ["reports", "Reports", "file"], ["privacy", "Data & Privacy", "lock"]
      ]
    }
  };

  function navCount(role, page) {
    if (role === "counsellor") {
      if (page === "requests") return S.requests.filter(function (r) { return r.status === "New"; }).length;
      if (page === "alerts") return S.alerts.filter(function (a) { return a.status === "Open"; }).length;
      if (page === "messages") return S.threads.filter(function (t) { return t.unread; }).length;
    }
    if (role === "student" && page === "messages") return S.notifs.student.filter(function (n) { return n.go === "#/student/messages"; }).length;
    return 0;
  }

  function shell(role, page, title, content) {
    var R = ROLES[role], ncount = S.notifs[role].length;
    var nav = R.nav.map(function (n) {
      var c = navCount(role, n[0]);
      var active = page === n[0] || (page === "school" && n[0] === "schools");
      return '<a class="side-link' + (active ? " is-active" : "") + '" href="#/' + role + '/' + n[0] + '"' + (active ? ' aria-current="page"' : "") + '>' + icon(n[2]) + '<span>' + n[1] + '</span>' + (c ? '<span class="side-link__count">' + c + '</span>' : "") + '</a>';
    }).join("");
    return '<div class="shell">' +
      '<header class="topbar">' +
        '<button class="icon-btn menu-btn" id="menuBtn" aria-label="Open navigation" aria-expanded="false">' + icon("menu") + '</button>' +
        '<a class="topbar__brand" href="#/' + role + '/home" aria-label="PULSE home"><img src="assets/img/pulse-mark.png" alt="" width="36" height="28"><span class="brandword"><small>Project</small><b>PULSE</b></span><span class="badge-proto">PROTOTYPE</span></a>' +
        '<div class="topbar__crumbs"><span class="topbar__emis">OpenEMIS (demo)</span><span>/</span><span>Project PULSE</span><span>/</span><b>' + title + '</b></div>' +
        '<div class="topbar__right">' +
          '<span class="role-chip" style="--rc:' + R.color + '"><span class="role-chip__av">' + R.initials + '</span><span class="role-chip__name">' + R.who + '<small>' + R.name + ' view</small></span></span>' +
          '<div class="relative"><button class="icon-btn" id="bellBtn" aria-label="Notifications (' + ncount + ')" aria-expanded="false">' + icon("bell") + (ncount ? '<span class="icon-btn__count">' + ncount + '</span>' : "") + '</button><div id="notifBox"></div></div>' +
          '<a class="btn btn--outline btn--sm" href="#/roles">' + icon("swap") + '<span class="btn__text">Switch Role</span></a>' +
          '<a class="btn btn--ghost btn--sm" href="' + CONFIG.MAIN_SITE + '" data-exit>' + icon("logout") + '<span class="btn__text">Exit Prototype</span></a>' +
        '</div>' +
      '</header>' +
      '<div class="protobar">' + icon("info") + '<span><strong>Prototype environment.</strong> Fictional demonstration data only. Submissions are not monitored or sent to real schools, counsellors or authorities.</span></div>' +
      '<nav class="sidebar" id="sidebar" aria-label="' + R.name + ' navigation"><div class="sidebar__module"><span></span>PULSE wellbeing module</div>' + nav +
        '<div class="sidebar__sep"></div>' +
        '<a class="side-link" href="#/roles">' + icon("swap") + '<span>Switch Role</span></a>' +
        '<a class="side-link" href="' + CONFIG.MAIN_SITE + '" data-exit>' + icon("logout") + '<span>Exit Prototype</span></a>' +
      '</nav>' +
      '<main class="main" id="main"><div class="main__inner">' + content + '</div></main>' +
    '</div>';
  }

  function bindShell(role) {
    var menuBtn = $("#menuBtn"), side = $("#sidebar");
    if (menuBtn) menuBtn.addEventListener("click", function () {
      var open = side.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      var bd = $(".side-backdrop");
      if (open && !bd) { bd = document.createElement("div"); bd.className = "side-backdrop"; bd.addEventListener("click", function () { side.classList.remove("is-open"); bd.remove(); }); document.body.appendChild(bd); }
      if (!open && bd) bd.remove();
    });
    var bell = $("#bellBtn"), box = $("#notifBox");
    bell.addEventListener("click", function (e) {
      e.stopPropagation();
      if (box.innerHTML) { box.innerHTML = ""; bell.setAttribute("aria-expanded", "false"); return; }
      bell.setAttribute("aria-expanded", "true");
      var list = S.notifs[role];
      box.innerHTML = '<div class="notif"><div class="notif__head">Notifications ' + (list.length ? '<button class="btn btn--ghost btn--sm" id="clearN">Mark all as read</button>' : "") + '</div>' +
        (list.length ? list.map(function (n) {
          return '<button class="notif__item" data-n="' + n.id + '"><span class="notif__dot"></span><span><strong>' + esc(n.title) + '</strong><span>' + esc(n.body) + '</span></span></button>';
        }).join("") : '<div class="notif__empty">You\'re all caught up.</div>') + '</div>';
      $$("[data-n]", box).forEach(function (b) {
        b.addEventListener("click", function () {
          var n = list.filter(function (x) { return x.id === b.dataset.n; })[0];
          S.notifs[role] = list.filter(function (x) { return x.id !== n.id; }); save();
          box.innerHTML = "";
          if (n.go.indexOf("case:") === 0) { render(); openCase(n.go.slice(5)); }
          else go(n.go);
        });
      });
      var clr = $("#clearN"); if (clr) clr.addEventListener("click", function (ev) { ev.stopPropagation(); S.notifs[role] = []; save(); render(); toast("All notifications marked as read"); });
    });
  }
  // Close the notification panel when clicking anywhere else
  document.addEventListener("click", function (e) {
    var box = $("#notifBox"), bell = $("#bellBtn");
    if (box && box.innerHTML && !box.contains(e.target) && !(bell && bell.contains(e.target))) {
      box.innerHTML = ""; if (bell) bell.setAttribute("aria-expanded", "false");
    }
  });

  // Exit: clear the role session but keep this tab's email so visitors can come back easily
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-exit]");
    if (a) { var bd = $(".side-backdrop"); if (bd) bd.remove(); }
  });

  // Delegated tab clicks (views read the active tab from view state)
  var VS = {}; // view state, survives re-renders within a session
  function bindTabs(onChange) {
    $$("[data-tabs]").forEach(function (group) {
      $$("[data-tab]", group).forEach(function (t) {
        t.addEventListener("click", function () { onChange(group.dataset.tabs, t.dataset.tab); });
      });
    });
  }

  /* expose for the view files below */
  window.__PULSE = {
    CONFIG: CONFIG, D: D, C: C, S: function () { return S; }, save: save, go: go, render: function () { render(); },
    esc: esc, $: $, $$: $$, icon: icon, face: face, mood: mood, dayLabel: dayLabel, greeting: greeting, num: num, nowTime: nowTime,
    toast: toast, openModal: openModal, closeModal: closeModal, openDrawer: openDrawer, modalHead: modalHead,
    notice: notice, statusPill: statusPill, prioPill: prioPill, levelPill: levelPill, tabs: tabs, pageHead: pageHead, emptyState: emptyState,
    bindTabs: bindTabs, VS: VS, ROLES: ROLES
  };

  /* =========================================================
     ROUTER
     ========================================================= */
  var VIEWS = {}; // filled by views-*.js
  window.__PULSE.VIEWS = VIEWS;
  function openCase(id) { if (VIEWS.openCase) VIEWS.openCase(id); }

  function render() {
    var hash = location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/").filter(Boolean);
    closeModal();
    var bd = $(".side-backdrop"); if (bd) bd.remove();

    if (!S.email) { if (parts[0] && parts[0] !== "") { history.replaceState(null, "", "#/"); } return mount(viewAccess()); }
    if (!parts.length) return mount(viewAccess());
    if (parts[0] === "roles") return mount(viewRoles());

    var role = parts[0], page = parts[1] || "home", arg = parts[2];
    var key = role + "/" + page;
    var v = VIEWS[key];
    if (!ROLES[role] || !v) { go("#/" + (ROLES[role] ? role + "/home" : "roles")); return; }
    var out = v(arg);
    app.innerHTML = shell(role, page, out.title, out.html);
    bindShell(role);
    if (out.bind) out.bind();
    document.title = out.title + " | Project PULSE Prototype";
    window.scrollTo(0, 0);
    var m = $("#main"); if (m) m.setAttribute("tabindex", "-1");
  }
  function mount(v) {
    app.innerHTML = v.html; if (v.bind) v.bind();
    document.title = "Project PULSE Prototype";
    window.scrollTo(0, 0);
  }
  window.__PULSE.openCase = openCase;
  window.addEventListener("hashchange", render);

  /* ---------- Boot ---------- */
  function boot() {
    var b = document.getElementById("boot");
    var ms = S.booted ? 300 : CONFIG.BOOT_MS;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) ms = 200;
    render();
    setTimeout(function () { b.classList.add("is-done"); S.booted = true; save(); setTimeout(function () { b.remove(); }, 600); }, ms);
  }
  // views are defined in views-*.js which load after this file
  window.__PULSE.boot = boot;
})();
