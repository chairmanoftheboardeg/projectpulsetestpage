/* =========================================================
   PROJECT PULSE PROTOTYPE — Ministry / Education Authority experience
   Everything here is aggregated. No individual students are ever shown.
   ========================================================= */
(function () {
  "use strict";
  var P = window.__PULSE, V = P.VIEWS, D = P.D, C = P.C;
  var esc = P.esc, $ = P.$, $$ = P.$$, icon = P.icon;

  var FICT = P.notice("Fictional demonstration data.", " All statistics shown are fictional and generated for this prototype. No real schools or students are represented.");
  var PERIODS = [{ value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "term", label: "Term" }, { value: "year", label: "Year" }];
  var REG_COL = ["#D3111C", "#0B4EA2", "#0A8A43", "#E07B12", "#7A4CC2"];
  function wellPill(w) { return '<span class="pill pill--' + ({ Stable: "green", Monitor: "yellow", "Needs attention": "red" }[w]) + '">' + w + '</span>'; }
  function capPill(c) { return '<span class="pill pill--' + ({ Adequate: "green", Stretched: "orange", Limited: "red" }[c]) + '">' + c + '</span>'; }
  function totalCounsellors() { return D.schools.reduce(function (a, s) { return a + s.counsellors; }, 0); }
  function totalStudents() { return D.schools.reduce(function (a, s) { return a + s.students; }, 0); }
  function statCard(label, value, foot, ic, col, href) {
    var tag = href ? 'a href="' + href + '"' : "div";
    return '<' + tag + ' class="card stat' + (href ? " stat--click" : "") + '" style="--sc:' + col + ';text-decoration:none;color:inherit"><span class="stat__icon">' + icon(ic) + '</span><span class="stat__label">' + label + '</span><span class="stat__value">' + value + '</span><span class="stat__foot">' + foot + '</span></' + (href ? "a" : "div") + '>';
  }

  /* ---------------- HOME ---------------- */
  V["ministry/home"] = function () {
    var per = P.VS.minPer || "term", N = D.national[per];
    var html = P.pageHead("National wellbeing dashboard", "Ministry of Education (demo) &middot; Anonymised and aggregated data only", P.tabs("per", PERIODS, per)) + FICT +
      '<div class="grid grid--4 mt">' +
        statCard("Schools participating", "24", "of 24 invited schools", "school", "#0B4EA2", "#/ministry/schools") +
        statCard("Student check-in participation", "78%", '<span class="trend-up">+4 pts</span> on last term', "pulse", "#D3111C", "#/ministry/trends") +
        statCard("Support requests this month", "1,284", '<span class="trend-down">+12%</span> on last month', "inbox", "#E07B12", "#/ministry/trends") +
        statCard("Counselling cases active", "342", "Across all participating schools", "folder", "#0A8A43", "#/ministry/capacity") +
      '</div>' +
      '<div class="grid grid--main mt"><div class="card"><div class="card__head"><div><h2>National wellbeing trend</h2><p class="card__sub">Average student check-in score (1 to 5)</p></div><span class="demo-tag">Fictional data</span></div>' +
        C.line({ labels: N.labels, series: [{ values: N.wellbeing, color: "#D3111C" }], min: 2.5, max: 4.2, label: "National wellbeing trend" }) + '</div>' +
      '<div class="card"><div class="card__head"><h2>Top reported student pressures</h2></div>' + C.hbars(D.nationalPressures, "%") + '</div></div>' +
      '<div class="grid grid--2 mt"><div class="card"><div class="card__head"><div><h2>Support demand by region</h2><p class="card__sub">Support requests this term</p></div></div>' +
        C.bars({ labels: D.regionDemand.map(function (r) { return r.region.replace(" & Inner Islands", "+").replace("Mahé ", "Mahé "); }), values: D.regionDemand.map(function (r) { return r.requests; }), colors: REG_COL, height: 230 }) + '</div>' +
      '<div class="card"><div class="card__head"><div><h2>Counselling capacity</h2><p class="card__sub">Students per counsellor by region (lower is better)</p></div><a class="btn btn--ghost btn--sm" href="#/ministry/capacity">Details</a></div>' +
        C.hbars(D.regionDemand.map(function (r, i) { return { label: r.region, value: r.ratio, color: r.ratio > 500 ? "#D3111C" : r.ratio > 400 ? "#E07B12" : "#0A8A43" }; })) + '</div></div>';
    return { title: "Home", html: html, bind: function () { P.bindTabs(function (_, v) { P.VS.minPer = v; P.render(); }); } };
  };

  /* ---------------- NATIONAL OVERVIEW ---------------- */
  V["ministry/overview"] = function () {
    var stu = totalStudents(), cou = totalCounsellors();
    var html = P.pageHead("National overview", "How PULSE is being used across regions. Anonymised totals only.") + FICT +
      '<div class="grid grid--4 mt">' +
        statCard("Students covered", P.num(stu), "In participating schools", "users", "#0B4EA2") +
        statCard("School counsellors", cou, "Linked to PULSE", "counsellor", "#0A8A43") +
        statCard("Average ratio", "1 : " + Math.round(stu / cou), "Students per counsellor", "capacity", "#E07B12") +
        statCard("Check-ins this term", P.num(Math.round(stu * 0.78 * 9)), "Anonymous and optional", "pulse", "#D3111C") +
      '</div>' +
      '<div class="grid grid--3 mt">' + D.regionDemand.map(function (r, i) {
        var list = D.schools.filter(function (s) { return s.region === r.region; });
        var part = Math.round(list.reduce(function (a, s) { return a + s.participation; }, 0) / list.length);
        var score = (list.reduce(function (a, s) { return a + s.score; }, 0) / list.length).toFixed(1);
        return '<button class="card" style="text-align:left;cursor:pointer;border-top:4px solid ' + REG_COL[i] + '" data-region="' + esc(r.region) + '"><h3 style="margin-bottom:.75rem">' + r.region + '</h3>' +
          '<dl class="kv" style="margin:0"><div><dt>Schools</dt><dd>' + r.schools + '</dd></div><div><dt>Students</dt><dd>' + P.num(r.students) + '</dd></div><div><dt>Participation</dt><dd>' + part + '%</dd></div><div><dt>Avg wellbeing</dt><dd>' + score + ' / 5</dd></div><div><dt>Support requests</dt><dd>' + P.num(r.requests) + '</dd></div><div><dt>Ratio</dt><dd>1 : ' + r.ratio + '</dd></div></dl></button>';
      }).join("") +
      '<div class="card"><h3 style="margin-bottom:.5rem">What students report</h3>' + C.donut(D.nationalPressures, "34%", "school work") +
        '<div class="legend">' + D.nationalPressures.map(function (p) { return '<span style="--c:' + p.color + '"><i></i>' + p.label + '</span>'; }).join("") + '</div></div>' +
      '</div>';
    return { title: "National Overview", html: html, bind: function () {
      $$("[data-region]").forEach(function (b) { b.addEventListener("click", function () { P.VS.schRegion = b.dataset.region; P.go("#/ministry/schools"); }); });
    }};
  };

  /* ---------------- WELLBEING TRENDS ---------------- */
  V["ministry/trends"] = function () {
    var per = P.VS.trPer || "term", reg = P.VS.trReg || "All regions", N = D.national[per];
    var idx = D.REGIONS.indexOf(reg), f = idx < 0 ? 1 : [0.22, 0.27, 0.2, 0.18, 0.13][idx];
    var shift = idx < 0 ? 0 : [0.05, -0.08, 0.1, -0.04, 0.12][idx];
    var well = N.wellbeing.map(function (v) { return Math.round((v + shift) * 10) / 10; });
    var req = N.requests.map(function (v) { return Math.round(v * f); });
    var part = idx < 0 ? N.participation : N.participation + [3, -6, 5, -2, 8][idx];
    var html = P.pageHead("Wellbeing trends", "Filter by period and region. Charts update instantly.",
        '<div class="toolbar" style="margin:0">' + P.tabs("per", PERIODS, per) +
        '<select class="select" id="trReg" style="width:auto;min-height:40px" aria-label="Region">' + ["All regions"].concat(D.REGIONS).map(function (r) { return '<option' + (r === reg ? " selected" : "") + '>' + r + '</option>'; }).join("") + '</select></div>') + FICT +
      '<div class="grid grid--main mt"><div class="card"><div class="card__head"><div><h2>Average wellbeing</h2><p class="card__sub">' + esc(reg) + '</p></div></div>' +
        C.line({ labels: N.labels, series: [{ values: well, color: "#D3111C" }], min: 2.5, max: 4.2 }) + '</div>' +
      '<div class="card"><div class="card__head"><h2>Check-in participation</h2></div>' + C.gauge(part, "#0B4EA2", esc(reg)) + '</div></div>' +
      '<div class="grid grid--2 mt"><div class="card"><div class="card__head"><h2>Support requests</h2></div>' + C.bars({ labels: N.labels, values: req, color: "#0B4EA2", height: 230 }) + '</div>' +
      '<div class="card"><div class="card__head"><h2>Reported pressures</h2></div>' + C.hbars(D.nationalPressures.map(function (p, i) { return { label: p.label, value: Math.max(2, p.value + (idx < 0 ? 0 : [2, -3, 1, 4, -2, 0][i] * (idx + 1) % 5)), color: p.color }; }), "%") + '</div></div>';
    return { title: "Wellbeing Trends", html: html, bind: function () {
      P.bindTabs(function (_, v) { P.VS.trPer = v; P.render(); });
      $("#trReg").addEventListener("change", function (e) { P.VS.trReg = e.target.value; P.render(); });
    }};
  };

  /* ---------------- SCHOOLS ---------------- */
  V["ministry/schools"] = function () {
    var reg = P.VS.schRegion || "All regions", q = (P.VS.schQ || "").toLowerCase(), sort = P.VS.schSort || "name";
    var list = D.schools.filter(function (s) { return (reg === "All regions" || s.region === reg) && (!q || s.name.toLowerCase().indexOf(q) > -1); });
    var sorters = { name: function (a, b) { return a.name.localeCompare(b.name); }, part: function (a, b) { return b.participation - a.participation; }, req: function (a, b) { return b.requests - a.requests; }, well: function (a, b) { return a.score - b.score; } };
    list.sort(sorters[sort]);
    var html = P.pageHead("Schools", "School-level summaries. Select a school for its aggregated dashboard.") +
      '<div class="card"><div class="toolbar"><select class="select" id="schReg" style="width:auto;min-height:40px" aria-label="Region">' + ["All regions"].concat(D.REGIONS).map(function (r) { return '<option' + (r === reg ? " selected" : "") + '>' + r + '</option>'; }).join("") + '</select>' +
        '<input class="input" id="schQ" placeholder="Search schools" value="' + esc(P.VS.schQ || "") + '" aria-label="Search schools">' +
        P.tabs("sort", [{ value: "name", label: "A to Z" }, { value: "well", label: "Needs attention first" }, { value: "req", label: "Most requests" }, { value: "part", label: "Highest participation" }], sort) + '</div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>School</th><th>Region</th><th>Check-in participation</th><th>Wellbeing indicator</th><th>Support requests</th><th>Counsellor capacity</th><th>Trend</th></tr></thead><tbody>' +
      list.map(function (s) {
        var col = s.score >= 3.5 ? "#0A8A43" : s.score >= 3.1 ? "#E9B820" : "#D3111C";
        return '<tr class="is-click" data-school="' + s.id + '" tabindex="0"><td><strong>' + s.name + '</strong><br><span class="muted small">' + s.level + '</span></td><td>' + s.region + '</td>' +
          '<td><div class="bar-cell"><div class="bar-cell__track"><div class="bar-cell__fill" style="width:' + s.participation + '%;--bc:' + (s.participation < 65 ? "#E07B12" : "#0B4EA2") + '"></div></div>' + s.participation + '%</div></td>' +
          '<td>' + wellPill(s.wellbeing) + '</td><td>' + s.requests + '</td><td>' + capPill(s.capacity) + '</td><td>' + C.spark(s.trend.map(function (v) { return (v - 2.5) * 2.5 + 1; }), col) + '</td></tr>';
      }).join("") + '</tbody></table></div><p class="muted small" style="margin:1rem 0 0">' + list.length + ' schools shown. All school names and figures are fictional.</p></div>';
    return { title: "Schools", html: html, bind: function () {
      $("#schReg").addEventListener("change", function (e) { P.VS.schRegion = e.target.value; P.render(); });
      var inp = $("#schQ"); inp.addEventListener("input", function () { P.VS.schQ = inp.value; var pos = inp.selectionStart; P.render(); var n = $("#schQ"); n.focus(); n.setSelectionRange(pos, pos); });
      P.bindTabs(function (_, v) { P.VS.schSort = v; P.render(); });
      $$("[data-school]").forEach(function (r) {
        r.addEventListener("click", function () { P.go("#/ministry/school/" + r.dataset.school); });
        r.addEventListener("keydown", function (e) { if (e.key === "Enter") P.go("#/ministry/school/" + r.dataset.school); });
      });
    }};
  };

  /* ---------------- SCHOOL DASHBOARD (aggregated) ---------------- */
  V["ministry/school"] = function (id) {
    var s = D.schools.filter(function (x) { return x.id === id; })[0];
    if (!s) return { title: "School", html: P.emptyState("School not found.") };
    var labels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    var html = '<p class="small"><a href="#/ministry/schools">&larr; All schools</a></p>' +
      P.pageHead(s.name, s.level + " &middot; " + s.region + " &middot; aggregated school dashboard", '<div class="btn-row">' + wellPill(s.wellbeing) + capPill(s.capacity) + '</div>') +
      P.notice("No individual student data.", " The Ministry view only shows anonymised totals for each school. Names, IDs and counselling conversations are never available at this level.", "blue") +
      '<div class="grid grid--4 mt">' +
        statCard("Students", P.num(s.students), "Enrolled (fictional)", "users", "#0B4EA2") +
        statCard("Check-in participation", s.participation + "%", "This term", "pulse", "#D3111C") +
        statCard("Support requests", s.requests, "This term", "inbox", "#E07B12") +
        statCard("Counsellors", s.counsellors, "1 : " + s.ratio + " ratio", "counsellor", "#0A8A43") +
      '</div>' +
      '<div class="grid grid--2 mt"><div class="card"><div class="card__head"><h2>Wellbeing trend</h2></div>' + C.line({ labels: labels, series: [{ values: s.trend, color: "#D3111C" }], min: 2.5, max: 4.2, height: 220 }) + '</div>' +
      '<div class="card"><div class="card__head"><h2>Reported pressures</h2></div>' + C.hbars(D.pressureLabels.map(function (l, i) { return { label: l, value: s.pressures[i], color: ["#D3111C", "#0B4EA2", "#7A4CC2", "#E07B12", "#0E8FA8", "#9AA3B5"][i] }; }), "%") + '</div></div>' +
      '<div class="card mt"><div class="card__head"><h2>Planning note</h2><button class="btn btn--outline btn--sm" id="schReport">' + icon("file") + 'Generate school report</button></div><p class="muted" style="margin:0">' +
        (s.capacity === "Limited" ? "This school is above the recommended student-to-counsellor ratio. Additional counselling capacity may be needed." : s.capacity === "Stretched" ? "Counselling capacity is stretched. Monitor support request volume over the next term." : "Counselling capacity appears adequate for current demand.") +
      '</p></div>';
    return { title: s.name, html: html, bind: function () { $("#schReport").addEventListener("click", function () { generate("School Support Capacity Report", s); }); } };
  };

  /* ---------------- COUNSELLING CAPACITY ---------------- */
  V["ministry/capacity"] = function () {
    var add = P.VS.addC || 0, cou = totalCounsellors(), stu = totalStudents();
    var target = 400;
    var needs = D.schools.filter(function (s) { return s.ratio > target; }).sort(function (a, b) { return b.ratio - a.ratio; });
    // Model: extra counsellors go to the schools with the highest ratio first
    var sim = D.schools.map(function (s) { return { id: s.id, students: s.students, c: s.counsellors }; });
    for (var i = 0; i < add; i++) { sim.sort(function (a, b) { return b.students / b.c - a.students / a.c; }); sim[0].c++; }
    var after = sim.filter(function (s) { return s.students / s.c > target; }).length;
    var avgReq = Math.round(D.schools.reduce(function (a, s) { return a + s.requests; }, 0) / 4);
    var html = P.pageHead("Counselling capacity", "How PULSE data could support resource planning.") + FICT +
      '<div class="grid grid--4 mt">' +
        statCard("Number of counsellors", cou + (add ? ' <span class="trend-up" style="font-size:1rem">+' + add + '</span>' : ""), "Across 24 schools", "counsellor", "#0A8A43") +
        statCard("Student-to-counsellor ratio", "1 : " + Math.round(stu / (cou + add)), "Approximate national average", "capacity", "#0B4EA2") +
        statCard("Active cases", "342", "About " + Math.round(342 / cou) + " per counsellor", "folder", "#D3111C") +
        statCard("Average support requests", P.num(avgReq), "Per month, all schools", "inbox", "#E07B12") +
      '</div>' +
      '<div class="grid grid--main mt"><div class="card"><div class="card__head"><div><h2>Schools requiring additional capacity</h2><p class="card__sub">Above 1 counsellor per ' + target + ' students</p></div><span class="pill pill--red">' + needs.length + ' schools</span></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>School</th><th>Region</th><th>Students</th><th>Counsellors</th><th>Ratio</th><th>Capacity</th></tr></thead><tbody>' +
        needs.map(function (s) { return '<tr class="is-click" data-school="' + s.id + '"><td><strong>' + s.name + '</strong></td><td>' + s.region + '</td><td>' + P.num(s.students) + '</td><td>' + s.counsellors + '</td><td style="white-space:nowrap">1 : ' + s.ratio + '</td><td>' + capPill(s.capacity) + '</td></tr>'; }).join("") +
        '</tbody></table></div></div>' +
      '<div class="card"><div class="card__head"><div><h2>Planning scenario</h2><p class="card__sub">What if we added counsellors?</p></div></div>' +
        '<div class="range"><label for="addC" class="field__label">Additional counsellors: <span class="range__value" id="addV">' + add + '</span></label><input type="range" id="addC" min="0" max="15" value="' + add + '"><div class="range__ends"><span>0</span><span>15</span></div></div>' +
        '<div class="card" style="box-shadow:none;background:var(--bg);margin-top:1rem"><p style="margin:0 0 .25rem" class="muted small">Schools above the recommended ratio</p><p style="margin:0;font-family:var(--font-head);font-size:2rem;font-weight:700">' + needs.length + ' &rarr; <span style="color:' + (after < needs.length ? "var(--green)" : "inherit") + '">' + after + '</span></p></div>' +
        '<p class="muted small" style="margin-top:.75rem">Demo model. Extra counsellors are placed at the schools with the highest ratio first.</p></div></div>';
    return { title: "Counselling Capacity", html: html, bind: function () {
      var r = $("#addC");
      r.addEventListener("input", function () { $("#addV").textContent = r.value; });
      r.addEventListener("change", function () { P.VS.addC = +r.value; var y = window.scrollY; P.render(); window.scrollTo(0, y); var n = $("#addC"); if (n) n.focus(); });
      $$("[data-school]").forEach(function (row) { row.addEventListener("click", function () { P.go("#/ministry/school/" + row.dataset.school); }); });
    }};
  };

  /* ---------------- SAFEGUARDING OVERVIEW ---------------- */
  V["ministry/safeguarding"] = function () {
    var G = D.safeguarding, total = G.categories.reduce(function (a, c) { return a + c.value; }, 0);
    var html = P.pageHead("Safeguarding overview", "National patterns in concerns raised through PULSE. Counts only.") + FICT +
      '<div class="grid grid--4 mt">' +
        statCard("Concerns raised this term", total, "All categories", "flag", "#D3111C") +
        statCard("Reviewed the same day", G.response.sameDay + "%", "By authorised school staff", "check", "#0A8A43") +
        statCard("Bullying-related", Math.round((G.categories[0].value + G.categories[1].value) / total * 100) + "%", "In person and online", "shield", "#0B4EA2") +
        statCard("Schools reporting", "24", "All participating schools", "school", "#7A4CC2") +
      '</div>' +
      '<div class="grid grid--main mt"><div class="card"><div class="card__head"><h2>Concerns by month</h2></div>' + C.bars({ labels: G.months, values: G.monthly, color: "#D3111C", height: 230 }) + '</div>' +
      '<div class="card"><div class="card__head"><h2>By category</h2></div>' + C.donut(G.categories, total, "concerns") +
        '<div class="legend">' + G.categories.map(function (c) { return '<span style="--c:' + c.color + '"><i></i>' + c.label + ' (' + c.value + ')</span>'; }).join("") + '</div></div></div>' +
      '<div class="card mt"><div class="card__head"><h2>Time to first review</h2></div>' + C.hbars([
        { label: "Same day", value: G.response.sameDay, color: "#0A8A43" }, { label: "Within 3 days", value: G.response.within3, color: "#E9B820" }, { label: "Longer", value: G.response.longer, color: "#D3111C" }], "%", 100) +
        '<p class="muted small" style="margin:1rem 0 0">Individual reports are handled by each school\'s authorised safeguarding staff under agreed procedures. The Ministry view shows totals only.</p></div>';
    return { title: "Safeguarding Overview", html: html };
  };

  /* ---------------- REPORTS ---------------- */
  var REPORTS = [
    { title: "National Student Wellbeing Summary", text: "Headline indicators, participation and trends across all participating schools." },
    { title: "Term Wellbeing Trends", text: "How wellbeing and reported pressures changed over the term, by region." },
    { title: "School Support Capacity Report", text: "Counsellor ratios, demand and schools needing more capacity." },
    { title: "Bullying & Safety Trends", text: "Concerns by category and month, with time to first review." }
  ];
  V["ministry/reports"] = function () {
    var html = P.pageHead("Reports", "Generate summary reports from aggregated data.") + FICT +
      '<div class="grid grid--2 mt">' + REPORTS.map(function (r, i) {
        return '<div class="card report-card"><span class="report-card__icon">' + icon("file") + '</span><h3>' + r.title + '</h3><p>' + r.text + '</p><div class="btn-row"><button class="btn btn--primary btn--sm" data-gen="' + i + '">Generate report</button></div></div>';
      }).join("") + '</div>';
    return { title: "Reports", html: html, bind: function () {
      $$("[data-gen]").forEach(function (b) { b.addEventListener("click", function () { generate(REPORTS[+b.dataset.gen].title); }); });
    }};
  };

  function reportBody(title, school) {
    var date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    var rows, extra = "";
    if (school) {
      rows = [["School", school.name], ["Region", school.region], ["Students", P.num(school.students)], ["Counsellors", school.counsellors], ["Ratio", "1 : " + school.ratio], ["Support requests (term)", school.requests], ["Capacity", school.capacity]];
    } else if (/Capacity/.test(title)) {
      rows = D.regionDemand.map(function (r) { return [r.region, "1 : " + r.ratio + " (" + r.counsellors + " counsellors)"]; });
      extra = "<h4>Schools above recommended ratio</h4><p>" + D.schools.filter(function (s) { return s.ratio > 400; }).map(function (s) { return s.name; }).join(", ") + "</p>";
    } else if (/Bullying/.test(title)) {
      rows = D.safeguarding.categories.map(function (c) { return [c.label, c.value]; });
      extra = "<h4>Time to first review</h4><p>Same day " + D.safeguarding.response.sameDay + "%, within 3 days " + D.safeguarding.response.within3 + "%, longer " + D.safeguarding.response.longer + "%.</p>";
    } else if (/Term/.test(title)) {
      var N = D.national.term; rows = N.labels.map(function (l, i) { return [l, "Wellbeing " + N.wellbeing[i] + " / 5, requests " + P.num(N.requests[i])]; });
    } else {
      rows = [["Schools participating", "24"], ["Check-in participation", "78%"], ["Support requests this month", "1,284"], ["Active counselling cases", "342"], ["Top pressure", "School work (34%)"]];
      var top = D.regionDemand.slice().sort(function (a, b) { return b.requests - a.requests; })[0];
      var over = D.schools.filter(function (s) { return s.ratio > 400; }).length;
      extra = "<h4>Key observations</h4><ul><li>Wellbeing dipped during the March and May exam periods.</li><li>Support demand is highest in " + top.region + ".</li><li>" + over + " schools are above the recommended ratio of 1 counsellor per 400 students.</li></ul>";
    }
    return '<div class="report-paper" id="reportPaper"><div class="report-paper__head"><div><span class="watermark">PROTOTYPE &middot; FICTIONAL DATA</span><h3>' + esc(title) + '</h3><span class="muted small">Ministry of Education (demo) &middot; ' + date + '</span></div><img src="assets/img/pulse-mark.png" alt="Project PULSE"></div>' +
      '<table><tbody>' + rows.map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>"; }).join("") + '</tbody></table>' + extra +
      '<div class="report-paper__foot">Generated using fictional prototype data. Project PULSE is under development and is not a live Ministry of Education or OpenEMIS system. All figures are anonymised and aggregated.</div></div>';
  }
  function generate(title, school) {
    var bd = P.openModal('<div class="modal__body" style="text-align:center;padding:3rem 1.5rem"><div class="spinner"></div><h2 style="font-size:1.2rem">Generating report</h2><p class="muted">' + esc(title) + '</p></div>', { label: "Generating report" });
    setTimeout(function () {
      if (!document.body.contains(bd)) return;
      var body = reportBody(title, school);
      var m = P.openModal(P.modalHead("Report generated", "Generated using fictional prototype data.") + '<div class="modal__body">' + body + '</div>' +
        '<div class="modal__foot"><button class="btn btn--outline" id="rPrint">' + icon("print") + 'Print / save as PDF</button><button class="btn btn--primary" id="rDl">' + icon("download") + 'Download demo report</button></div>', { wide: true, label: "Report generated" });
      $("#rPrint", m).addEventListener("click", function () { window.print(); });
      $("#rDl", m).addEventListener("click", function () {
        var css = "body{font-family:Segoe UI,system-ui,sans-serif;color:#14213D;max-width:760px;margin:2rem auto;padding:0 1rem}table{width:100%;border-collapse:collapse}th,td{text-align:left;border-bottom:1px solid #E3E7EE;padding:.5rem}.report-paper__head{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #D3111C;padding-bottom:1rem;margin-bottom:1rem}.report-paper__head img{display:none}.watermark{color:#D3111C;font-weight:700;font-size:.8rem;letter-spacing:.08em}.report-paper__foot{margin-top:1.5rem;font-size:.8rem;color:#6B7690;border-top:1px solid #E3E7EE;padding-top:.75rem}.muted{color:#6B7690}";
        var html = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>" + esc(title) + " (demo)</title><style>" + css + "</style></head><body>" + body + "</body></html>";
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
        a.download = "PULSE-demo-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".html";
        document.body.appendChild(a); a.click(); a.remove();
        P.toast("Demo report downloaded");
      });
    }, 1800);
  }

  /* ---------------- DATA & PRIVACY ---------------- */
  V["ministry/privacy"] = function () {
    var rows = [
      ["Student's own check-ins and messages", "yes", "yes", "no", "no"],
      ["Individual check-in details", "no", "yes", "no", "no"],
      ["Counselling conversations", "no", "yes", "no", "no"],
      ["That a student asked for support", "no", "yes", "part", "no"],
      ["School-level anonymised trends", "no", "yes", "yes", "yes"],
      ["National anonymised trends", "no", "no", "part", "yes"],
      ["Names or student IDs in reports", "no", "no", "no", "no"]
    ];
    var mark = { yes: '<span class="yes">&#10003;</span>', no: '<span class="no">&#10005;</span>', part: '<span class="part">Limited</span>' };
    var html = P.pageHead("Data & privacy", "Who can see what in the proposed PULSE design.") +
      '<div class="card"><div class="card__head"><div><h2>Role-based access</h2><p class="card__sub">Proposed design principles. Final rules would be set with the Ministry and safeguarding leads.</p></div></div>' +
      '<div class="table-wrap"><table class="table matrix"><thead><tr><th>Information</th><th>Student</th><th>Counsellor</th><th>School leadership</th><th>Ministry</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + r[0] + '</td>' + r.slice(1).map(function (v) { return '<td>' + mark[v] + '</td>'; }).join("") + '</tr>'; }).join("") +
      '</tbody></table></div><p class="muted small" style="margin:1rem 0 0">Teachers do not get automatic access to wellbeing information. Safeguarding procedures may require sharing specific information with authorised people when a student is at risk.</p></div>' +
      '<div class="grid grid--3 mt">' + [
        ["lock", "Confidential by design", "Individual wellbeing information is only available to authorised support staff."],
        ["chart", "Trends, not individuals", "National and school reports use anonymised, aggregated data with minimum group sizes."],
        ["shield", "Support, not surveillance", "Seeking help never affects a student's academic record or becomes a disciplinary matter."],
        ["info", "Transparent", "Students can see what is collected, why, and who can access it."],
        ["users", "Built with students", "Student and stakeholder consultation shapes the final rules."],
        ["building", "Fits OpenEMIS", "Uses existing school accounts and roles rather than a separate database."]
      ].map(function (x) { return '<div class="card"><span class="list__icon" style="margin-bottom:.75rem;color:var(--red);background:var(--red-soft)">' + icon(x[0]) + '</span><h3 style="font-size:1.05rem;margin-bottom:.4rem">' + x[1] + '</h3><p class="muted" style="margin:0">' + x[2] + '</p></div>'; }).join("") + '</div>';
    return { title: "Data & Privacy", html: html };
  };
})();
