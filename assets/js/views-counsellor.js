/* =========================================================
   PROJECT PULSE PROTOTYPE — Counsellor / Psychologist experience
   ========================================================= */
(function () {
  "use strict";
  var P = window.__PULSE, V = P.VIEWS, D = P.D, C = P.C;
  var esc = P.esc, $ = P.$, $$ = P.$$, icon = P.icon;

  function reqs() { return P.S().requests; }
  function find(id) { return reqs().filter(function (r) { return r.id === id; })[0]; }
  function dateTxt(n) { return P.dayLabel(n); }
  function logFor(id) { var L = P.S().log; return (L[id] = L[id] || []); }
  function addLog(id, text, color) { logFor(id).unshift({ text: text, when: "Today " + P.nowTime(), color: color }); P.save(); }

  function queueTable(list, empty) {
    if (!list.length) return P.emptyState(empty || "No requests here.");
    return '<div class="table-wrap"><table class="table"><thead><tr><th>Student ID</th><th>Year</th><th>Reason</th><th>Priority</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>' +
      list.map(function (r) {
        return '<tr class="is-click" data-case="' + r.id + '" tabindex="0"><td class="mono">' + r.id + (r.demo ? ' <span class="demo-tag">from student demo</span>' : "") + '</td><td>' + r.year + '</td><td>' + esc(r.reason) + '</td><td>' + P.prioPill(r.priority) + '</td><td>' + dateTxt(r.daysAgo) + '</td><td>' + P.statusPill(r.status) + '</td><td>' + icon("arrow", ' width="18" height="18" style="color:var(--muted)"') + '</td></tr>';
      }).join("") + '</tbody></table></div>';
  }
  function bindCases() {
    $$("[data-case]").forEach(function (row) {
      function open() { openCase(row.dataset.case); }
      row.addEventListener("click", open);
      row.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
    });
  }

  /* ---------------- CASE DRAWER ---------------- */
  function openCase(id) {
    var r = find(id);
    if (!r) { openStudent(id); return; }
    var log = logFor(id);
    var trendLabels = r.trend.map(function (_, i) { return i === r.trend.length - 1 ? "Latest" : "-" + (r.trend.length - 1 - i) + "w"; });
    var html =
      '<div class="drawer__head"><div><p class="muted small" style="margin:0 0 .2rem">Support request</p><h2 class="mono">' + r.id + '</h2><div class="btn-row" style="margin-top:.5rem">' + P.statusPill(r.status) + P.prioPill(r.priority) + '</div></div><button class="icon-btn" data-dismiss aria-label="Close">' + icon("close") + '</button></div>' +
      '<div class="drawer__body">' +
        '<dl class="kv"><div><dt>Student ID</dt><dd class="mono">' + r.id + '</dd></div><div><dt>Year group</dt><dd>' + r.year + '</dd></div>' +
        '<div><dt>Reason for request</dt><dd>' + esc(r.reason) + '</dd></div><div><dt>Requested</dt><dd>' + dateTxt(r.daysAgo) + '</dd></div>' +
        '<div><dt>Requested support from</dt><dd>' + esc(r.from) + '</dd></div><div><dt>Preferred contact</dt><dd>' + esc(r.contact) + '</dd></div></dl>' +
        '<h3 class="section-title">Student\'s message</h3><div class="card" style="box-shadow:none;background:#FAFBFD">' + (/^\(/.test(r.message) ? '<span class="muted">' + esc(r.message.replace(/[()]/g, "")) + '</span>' : '"' + esc(r.message) + '"') + '</div>' +
        '<h3 class="section-title">Recent check-in trend</h3>' + C.line({ labels: trendLabels, series: [{ values: r.trend, color: "#0B4EA2" }], min: 1, max: 5, height: 170, label: "Check-in trend" }) +
        '<p class="muted small">Check-in scale: 1 Struggling to 5 Very good. Shown for support purposes only.</p>' +
        '<h3 class="section-title">Activity and previous support</h3><ul class="timeline">' +
          log.map(function (l) { return '<li style="--tl:' + (l.color || "var(--blue)") + '">' + esc(l.text) + '<span>' + l.when + '</span></li>'; }).join("") +
          r.history.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join("") +
        '</ul>' +
      '</div>' +
      '<div class="drawer__foot">' +
        (r.status === "New" ? '<button class="btn btn--primary btn--sm" data-act="accept">' + icon("check") + 'Accept case</button>' : "") +
        '<button class="btn btn--outline btn--sm" data-act="schedule">' + icon("calendar") + 'Schedule meeting</button>' +
        '<button class="btn btn--outline btn--sm" data-act="message">' + icon("chat") + 'Send message</button>' +
        '<button class="btn btn--outline btn--sm" data-act="refer">' + icon("link") + 'Refer</button>' +
        (r.status !== "Follow-up" && r.status !== "Closed" ? '<button class="btn btn--outline btn--sm" data-act="follow">' + icon("flag") + 'Mark follow-up required</button>' : "") +
        (r.status !== "Closed" ? '<button class="btn btn--ghost btn--sm" data-act="close">Close case</button>' : '<button class="btn btn--ghost btn--sm" data-act="reopen">Reopen case</button>') +
      '</div>';
    var dr = P.openDrawer(html);
    $$("[data-act]", dr).forEach(function (b) { b.addEventListener("click", function () { act(r, b.dataset.act); }); });
  }
  P.VIEWS.openCase = openCase;

  function refresh(id) { var keep = id; P.render(); setTimeout(function () { openCase(keep); }, 0); }
  function backOnCancel(bd, id) { $$("[data-dismiss]", bd).forEach(function (b) { b.addEventListener("click", function () { setTimeout(function () { openCase(id); }, 0); }); }); }
  function act(r, a) {
    if (a === "accept") { r.status = "Accepted"; addLog(r.id, "Case accepted by Ms Marie", "#0B4EA2"); P.toast("Case accepted"); refresh(r.id); }
    else if (a === "follow") { r.status = "Follow-up"; addLog(r.id, "Marked as follow-up required", "#E07B12"); P.toast("Marked for follow-up"); refresh(r.id); }
    else if (a === "reopen") { r.status = "Accepted"; addLog(r.id, "Case reopened", "#0B4EA2"); P.toast("Case reopened"); refresh(r.id); }
    else if (a === "close") {
      var bd = P.openModal(P.modalHead("Close case " + r.id + "?", "Closed cases stay in the student's support history.") +
        '<div class="modal__body"><div class="field"><label for="closeReason">Outcome</label><select class="select" id="closeReason"><option>Support provided, resolved</option><option>Student no longer requires support</option><option>Referred and handed over</option><option>Other</option></select></div></div>' +
        '<div class="modal__foot"><button class="btn btn--ghost" data-dismiss>Cancel</button><button class="btn btn--navy" id="doClose">Close case</button></div>', { label: "Close case" }); backOnCancel(bd, r.id);
      $("#doClose", bd).addEventListener("click", function () { var o = $("#closeReason", bd).value; r.status = "Closed"; addLog(r.id, "Case closed: " + o, "#6B7690"); P.toast("Case closed"); refresh(r.id); });
    }
    else if (a === "schedule") {
      var days = []; for (var i = 1; i <= 5; i++) { var d = new Date(); d.setDate(d.getDate() + i); if (d.getDay() !== 0 && d.getDay() !== 6) days.push(d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })); }
      var bd2 = P.openModal(P.modalHead("Schedule a meeting", "With " + r.id + " (" + r.year + ")") +
        '<div class="modal__body"><div class="grid grid--2"><div class="field"><label for="mDay">Day</label><select class="select" id="mDay">' + days.map(function (x) { return "<option>" + x + "</option>"; }).join("") + '</select></div>' +
        '<div class="field"><label for="mTime">Time</label><select class="select" id="mTime">' + ["08:30", "09:45 (break)", "10:30", "12:15 (lunch)", "13:30", "14:30"].map(function (x) { return "<option>" + x + "</option>"; }).join("") + '</select></div></div>' +
        '<div class="field"><label for="mWhere">Where</label><select class="select" id="mWhere"><option>Room 12, Student Support Block</option><option>Online (school account)</option></select></div>' +
        '<p class="muted small">In a live system, the student would get a private notification in PULSE.</p></div>' +
        '<div class="modal__foot"><button class="btn btn--ghost" data-dismiss>Cancel</button><button class="btn btn--primary" id="doSched">' + icon("calendar") + 'Schedule</button></div>', { label: "Schedule meeting" }); backOnCancel(bd2, r.id);
      $("#doSched", bd2).addEventListener("click", function () { var t = $("#mDay", bd2).value + ", " + $("#mTime", bd2).value; r.status = "Scheduled"; addLog(r.id, "Meeting scheduled: " + t, "#0A8A43"); P.toast("Meeting scheduled for " + t); refresh(r.id); });
    }
    else if (a === "refer") {
      var bd3 = P.openModal(P.modalHead("Refer " + r.id, "Choose who to refer to. Only the information needed is shared.") +
        '<div class="modal__body"><div class="options" role="radiogroup" style="grid-template-columns:1fr">' + D.referrals.map(function (x, i) {
          return '<button class="option" role="radio" aria-checked="' + (i === 0) + '" data-ref="' + i + '"><span class="option__dot"></span><span><strong>' + x.name + '</strong><small>' + x.type + ' &middot; ' + x.detail + '</small></span></button>';
        }).join("") + '</div><div class="field mt"><label for="refNote">Note for the receiving team</label><textarea class="textarea" id="refNote" placeholder="Keep to what they need to know."></textarea></div></div>' +
        '<div class="modal__foot"><button class="btn btn--ghost" data-dismiss>Cancel</button><button class="btn btn--primary" id="doRef">Send demo referral</button></div>', { label: "Refer" }); backOnCancel(bd3, r.id);
      var pick = 0;
      $$("[data-ref]", bd3).forEach(function (b) { b.addEventListener("click", function () { pick = +b.dataset.ref; $$("[data-ref]", bd3).forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); }); }); });
      $("#doRef", bd3).addEventListener("click", function () { r.status = "Referred"; addLog(r.id, "Referred to " + D.referrals[pick].name, "#E9B820"); P.toast("Demo referral sent"); refresh(r.id); });
    }
    else if (a === "message") {
      var S = P.S(), t = S.threads.filter(function (x) { return x.id === r.id; })[0];
      if (!t) { S.threads.unshift({ id: r.id, year: r.year, unread: false, messages: [] }); }
      P.VS.thread = r.id; P.save(); P.closeModal(); P.go("#/counsellor/messages");
    }
  }

  /* ---------------- STUDENT SUMMARY (no open request) ---------------- */
  function openStudent(id) {
    var s = D.students.filter(function (x) { return x.id === id; })[0] || { id: id, year: "-", trend: [3, 3, 3, 3, 3], lastCheckin: 2, participation: 70 };
    var al = P.S().alerts.filter(function (a) { return a.student === id; });
    var bd = P.openModal(P.modalHead('<span class="mono">' + id + '</span>', "Year " + s.year + " &middot; no open support request") +
      '<div class="modal__body"><dl class="kv"><div><dt>Last check-in</dt><dd>' + P.dayLabel(s.lastCheckin) + '</dd></div><div><dt>Check-in participation</dt><dd>' + s.participation + '%</dd></div></dl>' +
      C.line({ labels: ["-4w", "-3w", "-2w", "-1w", "Latest"], series: [{ values: s.trend, color: "#0B4EA2" }], min: 1, max: 5, height: 160 }) +
      (al.length ? '<h3 class="section-title">Indicators</h3><ul class="list">' + al.map(function (a) { return '<li class="list__item"><span class="list__body"><strong>' + a.indicator + '</strong><span>' + a.detail + '</span></span>' + P.levelPill(a.level) + '</li>'; }).join("") + '</ul>' : "") +
      '</div><div class="modal__foot"><button class="btn btn--outline" id="sMsg">' + icon("chat") + 'Send message</button><button class="btn btn--primary" id="sOpen">Open a support case</button></div>', { label: "Student " + id });
    $("#sOpen", bd).addEventListener("click", function () {
      P.S().requests.unshift({ id: id, year: s.year, reason: al[0] ? al[0].indicator : "Counsellor check-in", priority: "Medium", daysAgo: 0, status: "Accepted", contact: "Either", from: "School Counsellor", message: "(Case opened by counsellor)", trend: s.trend, history: ["Case opened from Students list"] });
      P.S().alerts.forEach(function (a) { if (a.student === id && a.status === "Open") a.status = "Reviewed"; });
      P.save(); P.toast("Case opened for " + id); P.render(); setTimeout(function () { openCase(id); }, 0);
    });
    $("#sMsg", bd).addEventListener("click", function () {
      var S = P.S(); if (!S.threads.filter(function (x) { return x.id === id; })[0]) S.threads.unshift({ id: id, year: s.year, unread: false, messages: [] });
      P.VS.thread = id; P.save(); P.closeModal(); P.go("#/counsellor/messages");
    });
  }

  /* ---------------- HOME ---------------- */
  V["counsellor/home"] = function () {
    var R = reqs(), S = P.S();
    var today = R.filter(function (r) { return r.daysAgo === 0; }).length;
    var follow = R.filter(function (r) { return r.status === "Follow-up" || r.status === "Scheduled"; }).length;
    var unread = S.threads.filter(function (t) { return t.unread; }).length;
    var flagged = S.alerts.filter(function (a) { return a.status === "Open"; }).length;
    var stats = [
      ["Support requests today", today, "inbox", "#D3111C", "#/counsellor/requests"],
      ["Students requiring follow-up", follow, "flag", "#E07B12", "#/counsellor/cases"],
      ["Unread messages", unread, "chat", "#0B4EA2", "#/counsellor/messages"],
      ["Check-ins flagged for review", flagged, "alert", "#7A4CC2", "#/counsellor/alerts"]
    ];
    var active = R.filter(function (r) { return r.status !== "Closed"; }).sort(function (a, b) { return ({ High: 0, Medium: 1, Low: 2 }[a.priority]) - ({ High: 0, Medium: 1, Low: 2 }[b.priority]) || a.daysAgo - b.daysAgo; });
    var html = P.pageHead(P.greeting() + ", Ms Marie", "Demo Secondary School &middot; Student Support") +
      '<div class="grid grid--4">' + stats.map(function (s) {
        return '<a class="card stat stat--click" style="--sc:' + s[3] + ';text-decoration:none;color:inherit" href="' + s[4] + '"><span class="stat__icon">' + icon(s[2]) + '</span><span class="stat__label">' + s[0] + '</span><span class="stat__value">' + s[1] + '</span><span class="stat__foot">View ' + icon("arrow", ' width="14" height="14"') + '</span></a>';
      }).join("") + '</div>' +
      '<div class="card mt"><div class="card__head"><div><h2>Support queue</h2><p class="card__sub">Open requests, highest priority first. Select a row to open the case.</p></div><a class="btn btn--outline btn--sm" href="#/counsellor/requests">All requests</a></div>' + queueTable(active.slice(0, 7), "No open requests. Nice work.") + '</div>' +
      '<div class="grid grid--2 mt"><div class="card"><div class="card__head"><h2>Wellbeing alerts</h2><a class="btn btn--ghost btn--sm" href="#/counsellor/alerts">See all</a></div><ul class="list">' +
        S.alerts.filter(function (a) { return a.status === "Open"; }).slice(0, 3).map(function (a) { return '<li class="list__item list__item--click" data-go="#/counsellor/alerts"><span class="list__icon" style="color:#7A4CC2">' + icon("alert") + '</span><span class="list__body"><strong>' + a.indicator + '</strong><span class="mono">' + a.student + '</span> <span>' + a.year + '</span></span>' + P.levelPill(a.level) + '</li>'; }).join("") +
      '</ul></div><div class="card"><div class="card__head"><h2>School wellbeing this week</h2><a class="btn btn--ghost btn--sm" href="#/counsellor/trends">Trends</a></div>' +
        C.line({ labels: D.schoolTrends.week.labels, series: [{ values: D.schoolTrends.week.wellbeing, color: "#D3111C" }], min: 2.5, max: 4.5, height: 180, label: "Average wellbeing" }) + '<p class="muted small">Average check-in score, all year groups. Anonymised.</p></div></div>';
    return { title: "Home", html: html, bind: function () { bindCases(); $$("[data-go]").forEach(function (el) { el.addEventListener("click", function () { P.go(el.dataset.go); }); }); } };
  };

  /* ---------------- SUPPORT REQUESTS ---------------- */
  V["counsellor/requests"] = function () {
    var f = P.VS.reqFilter || "all", q = (P.VS.reqQ || "").toLowerCase();
    var groups = { all: null, New: ["New"], active: ["Accepted", "Scheduled", "Referred"], "Follow-up": ["Follow-up"], Closed: ["Closed"] };
    var list = reqs().filter(function (r) { return (!groups[f] || groups[f].indexOf(r.status) > -1) && (!q || (r.id + r.reason + r.year).toLowerCase().indexOf(q) > -1); });
    var html = P.pageHead("Support requests", "Every request from students in your school. Student names are hidden by default.") +
      '<div class="card"><div class="toolbar">' + P.tabs("req", [{ value: "all", label: "All" }, { value: "New", label: "New" }, { value: "active", label: "In progress" }, { value: "Follow-up", label: "Follow-up" }, { value: "Closed", label: "Closed" }], f) +
      '<input class="input" id="reqQ" placeholder="Search ID, reason or year" value="' + esc(P.VS.reqQ || "") + '" aria-label="Search requests"></div>' + queueTable(list) + '</div>';
    return { title: "Support Requests", html: html, bind: function () {
      bindCases();
      P.bindTabs(function (_, v) { P.VS.reqFilter = v; P.render(); });
      var inp = $("#reqQ"); inp.addEventListener("input", function () { P.VS.reqQ = inp.value; var pos = inp.selectionStart; P.render(); var n = $("#reqQ"); n.focus(); n.setSelectionRange(pos, pos); });
    }};
  };

  /* ---------------- WELLBEING ALERTS ---------------- */
  V["counsellor/alerts"] = function () {
    var f = P.VS.alertF || "Open";
    var list = P.S().alerts.filter(function (a) { return f === "all" || a.status === f; });
    var html = P.pageHead("Wellbeing alerts", "Automatic indicators based on check-in patterns.") +
      P.notice("Indicators, not diagnoses.", " Alerts are prompts for a professional to review. They do not diagnose or label students, and a person always decides what happens next.", "blue") +
      '<div class="toolbar mt">' + P.tabs("al", [{ value: "Open", label: "Open" }, { value: "Reviewed", label: "Reviewed" }, { value: "Dismissed", label: "Dismissed" }, { value: "all", label: "All" }], f) + '</div>' +
      (list.length ? '<div class="grid grid--2">' + list.map(function (a) {
        return '<div class="card"><div class="card__head" style="margin-bottom:.5rem"><div><h3>' + a.indicator + '</h3><p class="card__sub"><span class="mono">' + a.student + '</span> &middot; ' + a.year + '</p></div>' + (a.status === "Open" ? P.levelPill(a.level) : P.statusPill(a.status)) + '</div>' +
          '<p class="muted">' + a.detail + '</p><div class="btn-row">' +
          '<button class="btn btn--outline btn--sm" data-open="' + a.student + '">Open student</button>' +
          (a.status === "Open" ? '<button class="btn btn--primary btn--sm" data-rev="' + a.id + '">' + icon("check") + 'Mark reviewed</button><button class="btn btn--ghost btn--sm" data-dis="' + a.id + '">Dismiss</button>' : '<button class="btn btn--ghost btn--sm" data-undo="' + a.id + '">Move back to open</button>') +
          '</div></div>';
      }).join("") + '</div>' : '<div class="card">' + P.emptyState("No alerts in this list.", "check") + '</div>');
    return { title: "Wellbeing Alerts", html: html, bind: function () {
      P.bindTabs(function (_, v) { P.VS.alertF = v; P.render(); });
      function set(id, st, msg) { P.S().alerts.forEach(function (a) { if (a.id === id) a.status = st; }); P.save(); P.toast(msg); P.render(); }
      $$("[data-rev]").forEach(function (b) { b.addEventListener("click", function () { set(b.dataset.rev, "Reviewed", "Alert marked as reviewed"); }); });
      $$("[data-dis]").forEach(function (b) { b.addEventListener("click", function () { set(b.dataset.dis, "Dismissed", "Alert dismissed"); }); });
      $$("[data-undo]").forEach(function (b) { b.addEventListener("click", function () { set(b.dataset.undo, "Open", "Alert moved back to open"); }); });
      $$("[data-open]").forEach(function (b) { b.addEventListener("click", function () { openCase(b.dataset.open); }); });
    }};
  };

  /* ---------------- STUDENTS ---------------- */
  V["counsellor/students"] = function () {
    var q = (P.VS.stuQ || "").toLowerCase(), yf = P.VS.stuY || "All";
    var R = reqs();
    var list = D.students.filter(function (s) { return (yf === "All" || s.year === yf) && (!q || s.id.toLowerCase().indexOf(q) > -1); });
    var html = P.pageHead("Students", "Students who have used PULSE this term. Shown by ID to protect privacy.") +
      '<div class="card"><div class="toolbar">' + P.tabs("yr", ["All", "S1", "S2", "S3", "S4", "S5"], yf) + '<input class="input" id="stuQ" placeholder="Search by student ID" value="' + esc(P.VS.stuQ || "") + '" aria-label="Search students"></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Student ID</th><th>Year</th><th>Last check-in</th><th>5-week trend</th><th>Participation</th><th>Status</th></tr></thead><tbody>' +
      list.map(function (s) {
        var open = R.filter(function (r) { return r.id === s.id && r.status !== "Closed"; })[0];
        var al = P.S().alerts.filter(function (a) { return a.student === s.id && a.status === "Open"; })[0];
        var last = s.trend[s.trend.length - 1], col = last <= 2 ? "#D3111C" : last === 3 ? "#E9B820" : "#0A8A43";
        return '<tr class="is-click" data-case="' + s.id + '" tabindex="0"><td class="mono">' + s.id + '</td><td>' + s.year + '</td><td>' + P.dayLabel(s.lastCheckin) + '</td><td>' + C.spark(s.trend, col) + '</td>' +
          '<td><div class="bar-cell"><div class="bar-cell__track"><div class="bar-cell__fill" style="width:' + s.participation + '%"></div></div>' + s.participation + '%</div></td>' +
          '<td>' + (open ? P.statusPill(open.status) : al ? P.levelPill("Flag for review") : '<span class="muted small">No action needed</span>') + '</td></tr>';
      }).join("") + '</tbody></table></div></div>';
    return { title: "Students", html: html, bind: function () {
      bindCases();
      P.bindTabs(function (_, v) { P.VS.stuY = v; P.render(); });
      var inp = $("#stuQ"); inp.addEventListener("input", function () { P.VS.stuQ = inp.value; var pos = inp.selectionStart; P.render(); var n = $("#stuQ"); n.focus(); n.setSelectionRange(pos, pos); });
    }};
  };

  /* ---------------- CASES ---------------- */
  V["counsellor/cases"] = function () {
    var f = P.VS.caseF || "active";
    var map = { active: ["Accepted", "Scheduled", "Referred"], follow: ["Follow-up"], closed: ["Closed"] };
    var all = reqs(), list = all.filter(function (r) { return map[f].indexOf(r.status) > -1; });
    var count = function (k) { return all.filter(function (r) { return map[k].indexOf(r.status) > -1; }).length; };
    var html = P.pageHead("Cases", "Cases you have accepted. Open a case to schedule, message, refer or close it.") +
      '<div class="toolbar">' + P.tabs("cs", [{ value: "active", label: "Active (" + count("active") + ")" }, { value: "follow", label: "Follow-up (" + count("follow") + ")" }, { value: "closed", label: "Closed (" + count("closed") + ")" }], f) + '</div>' +
      (list.length ? '<div class="grid grid--3">' + list.map(function (r) {
        var log = logFor(r.id)[0];
        return '<button class="card" style="text-align:left;cursor:pointer" data-case="' + r.id + '"><div class="card__head" style="margin-bottom:.5rem"><h3 class="mono">' + r.id + '</h3>' + P.statusPill(r.status) + '</div>' +
          '<p style="margin:0 0 .3rem"><strong>' + esc(r.reason) + '</strong> &middot; ' + r.year + '</p><p class="muted small" style="margin:0 0 .8rem">' + esc(log ? log.text : r.history[0]) + '</p>' +
          C.spark(r.trend, "#0B4EA2") + '</button>';
      }).join("") + '</div>' : '<div class="card">' + P.emptyState("No cases here. Accept a request from the support queue to start one.", "folder") + '</div>');
    return { title: "Cases", html: html, bind: function () { bindCases(); P.bindTabs(function (_, v) { P.VS.caseF = v; P.render(); }); } };
  };

  /* ---------------- MESSAGES ---------------- */
  V["counsellor/messages"] = function () {
    var S = P.S(), threads = S.threads;
    var cur = P.VS.thread || (threads[0] && threads[0].id);
    var t = threads.filter(function (x) { return x.id === cur; })[0];
    if (t && t.unread) { t.unread = false; S.notifs.counsellor = S.notifs.counsellor.filter(function (n) { return n.go !== "#/counsellor/messages"; }); P.save(); }
    var html = P.pageHead("Messages", "Private conversations with students. Shown by student ID.") +
      '<div class="card chat"><div class="chat__list" role="tablist">' + threads.map(function (x) {
        var last = x.messages[x.messages.length - 1];
        return '<button class="chat__thread' + (x.id === cur ? " is-active" : "") + '" data-thread="' + x.id + '"><span class="avatar" style="--ac:#0B4EA2">' + x.year + '</span><span style="min-width:0"><strong class="mono">' + x.id + '</strong><span>' + esc(last ? last.text : "New conversation") + '</span></span>' + (x.unread ? '<span class="chat__unread" aria-label="Unread"></span>' : "") + '</button>';
      }).join("") + '</div>' +
      (t ? '<div class="chat__pane"><div class="chat__head"><span class="avatar" style="--ac:#0B4EA2">' + t.year + '</span><div><strong class="mono">' + t.id + '</strong><span>Year ' + t.year + ' &middot; Demo Secondary School</span></div><button class="btn btn--outline btn--sm" style="margin-left:auto" data-case="' + t.id + '">Open case</button></div>' +
        '<div class="chat__note">Prototype conversation. Messages are not transmitted.</div>' +
        '<div class="chat__body" id="cBody">' + bub(t.messages) + '</div>' +
        '<form class="chat__form" id="cForm"><label class="sr-only" for="cInput">Message</label><input class="input" id="cInput" placeholder="Reply to ' + t.id + '..." autocomplete="off"><button class="btn btn--blue" type="submit">' + icon("send") + '<span class="btn__text">Send</span></button></form></div>'
        : '<div class="chat__pane">' + P.emptyState("No conversations yet.", "chat") + '</div>') + '</div>';
    return { title: "Messages", html: html, bind: function () {
      bindCases();
      $$("[data-thread]").forEach(function (b) { b.addEventListener("click", function () { P.VS.thread = b.dataset.thread; P.render(); }); });
      var body = $("#cBody"); if (body) body.scrollTop = body.scrollHeight;
      var f = $("#cForm"); if (f) f.addEventListener("submit", function (e) {
        e.preventDefault(); var inp = $("#cInput"), v = inp.value.trim(); if (!v) return;
        t.messages.push({ from: "me", text: v, ago: P.nowTime() }); P.save(); P.render();
      });
    }};
  };
  function bub(m) { return m.length ? m.map(function (x) { return '<div class="bubble bubble--' + x.from + '">' + esc(x.text) + '<small>' + esc(x.ago) + '</small></div>'; }).join("") : '<div class="bubble bubble--system">Start the conversation. The student would get a private PULSE notification.</div>'; }

  /* ---------------- SCHOOL TRENDS ---------------- */
  V["counsellor/trends"] = function () {
    var per = P.VS.ctPer || "week", T = D.schoolTrends[per];
    var html = P.pageHead("School trends", "Anonymised totals for Demo Secondary School. No individual students are shown.", P.tabs("per", [{ value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "term", label: "Term" }], per)) +
      '<div class="grid grid--main"><div class="card"><div class="card__head"><div><h2>Student wellbeing</h2><p class="card__sub">Average check-in score (1 to 5)</p></div></div>' +
        C.line({ labels: T.labels, series: [{ values: T.wellbeing, color: "#D3111C" }], min: 2.5, max: 4.5, label: "Average wellbeing" }) + '</div>' +
      '<div class="card"><div class="card__head"><h2>Check-in participation</h2></div>' + C.gauge(T.participation, "#0B4EA2", "of students") + '<p class="muted small" style="text-align:center">Students who completed at least one check-in this ' + per + '.</p></div></div>' +
      '<div class="grid grid--2 mt"><div class="card"><div class="card__head"><h2>Most reported pressures</h2></div>' +
        C.hbars(D.pressureLabels.map(function (l, i) { return { label: l, value: T.pressures[i], color: ["#D3111C", "#0B4EA2", "#7A4CC2", "#E07B12", "#0E8FA8", "#9AA3B5"][i] }; }), "%") + '</div>' +
      '<div class="card"><div class="card__head"><h2>Support request volume</h2></div>' + C.bars({ labels: T.labels, values: T.requests, color: "#0B4EA2", height: 220 }) + '</div></div>' +
      '<div class="card mt"><div class="card__head"><div><h2>Year-group comparison</h2><p class="card__sub">Average wellbeing by year group</p></div></div>' +
        C.bars({ labels: ["S1", "S2", "S3", "S4", "S5"], values: T.years, colors: ["#0A8A43", "#5BB974", "#E9B820", "#E07B12", "#D3111C"], max: 5, decimals: true, height: 220 }) + '</div>';
    return { title: "School Trends", html: html, bind: function () { P.bindTabs(function (_, v) { P.VS.ctPer = v; P.render(); }); } };
  };

  /* ---------------- RESOURCES & REFERRALS ---------------- */
  V["counsellor/referrals"] = function () {
    var html = P.pageHead("Resources & referrals", "Services you can refer students to, and resources to share.") +
      '<div class="grid grid--main"><div class="card"><div class="card__head"><h2>Referral pathways</h2></div><ul class="list">' + D.referrals.map(function (r, i) {
        return '<li class="list__item"><span class="list__icon">' + icon("link") + '</span><span class="list__body"><strong>' + r.name + '</strong><span>' + r.type + ' &middot; ' + r.detail + '</span></span><button class="btn btn--outline btn--sm" data-ref="' + i + '">Start referral</button></li>';
      }).join("") + '</ul></div>' +
      '<div class="card"><div class="card__head"><h2>Share a resource</h2></div><ul class="list">' + D.RESOURCES.map(function (r) {
        return '<li class="list__item"><span class="list__icon" style="color:' + r.color + '">' + icon(r.icon) + '</span><span class="list__body"><strong>' + r.title + '</strong></span><button class="btn btn--ghost btn--sm" data-share="' + r.title + '">Share</button></li>';
      }).join("") + '</ul></div></div>';
    return { title: "Resources & Referrals", html: html, bind: function () {
      $$("[data-share]").forEach(function (b) { b.addEventListener("click", function () {
        var bd = P.openModal(P.modalHead("Share \"" + b.dataset.share + "\"") + '<div class="modal__body"><div class="field"><label for="shTo">Share with</label><select class="select" id="shTo">' + D.students.map(function (s) { return "<option>" + s.id + " (" + s.year + ")</option>"; }).join("") + '<option>All S3 students (anonymous)</option></select></div></div><div class="modal__foot"><button class="btn btn--ghost" data-dismiss>Cancel</button><button class="btn btn--blue" id="doShare">Share</button></div>', { label: "Share resource" });
        $("#doShare", bd).addEventListener("click", function () { var to = $("#shTo", bd).value; P.closeModal(); P.toast("Resource shared with " + to + " (demo)"); });
      }); });
      $$("[data-ref]").forEach(function (b) { b.addEventListener("click", function () {
        var r = D.referrals[+b.dataset.ref];
        var bd = P.openModal(P.modalHead("Referral: " + r.name, r.detail) + '<div class="modal__body"><div class="field"><label for="rfS">Student</label><select class="select" id="rfS">' + D.students.map(function (s) { return "<option>" + s.id + "</option>"; }).join("") + '</select></div><div class="field"><label for="rfN">Reason</label><textarea class="textarea" id="rfN" placeholder="Keep to what they need to know."></textarea></div></div><div class="modal__foot"><button class="btn btn--ghost" data-dismiss>Cancel</button><button class="btn btn--primary" id="doRf">Send demo referral</button></div>', { label: "Referral" });
        $("#doRf", bd).addEventListener("click", function () {
          var id = $("#rfS", bd).value, req = find(id);
          if (req) { req.status = "Referred"; addLog(id, "Referred to " + r.name, "#E9B820"); }
          P.closeModal(); P.toast("Demo referral sent for " + id);
        });
      }); });
    }};
  };
})();
