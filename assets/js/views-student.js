/* =========================================================
   PROJECT PULSE PROTOTYPE — Student experience
   ========================================================= */
(function () {
  "use strict";
  var P = window.__PULSE, V = P.VIEWS, D = P.D, C = P.C;
  var esc = P.esc, $ = P.$, $$ = P.$$, icon = P.icon;

  function st() { return P.S().student; }
  function sorted() { return st().checkins.slice().sort(function (a, b) { return a.daysAgo - b.daysAgo; }); }

  /* ---------------- HOME ---------------- */
  V["student/home"] = function () {
    var s = st(), recent = sorted().slice(0, 3);
    var tiles = [
      ["#/student/checkin", "pulse", "#D3111C", "Complete check-in", "Tell us how you're doing. About 1 minute."],
      ["#/student/support", "hand", "#0B4EA2", "Request support", "Ask to talk to a counsellor or trusted adult."],
      ["#/student/concern", "flag", "#E07B12", "Report a concern", "Bullying, safety or something you've seen."],
      ["#/student/resources", "book", "#0A8A43", "View resources", "Short guides on stress, friendships and more."]
    ];
    var my = P.S().myRequests;
    var html =
      '<div class="card welcome"><div><h1>' + P.greeting() + ', ' + esc(s.first) + '</h1><p>Your wellbeing matters.</p></div>' +
      '<a class="btn" href="#/student/checkin">' + icon("pulse") + 'Start today\'s check-in</a></div>' +
      '<div class="tiles mt">' + tiles.map(function (t) {
        return '<a class="tile" style="--tc:' + t[2] + ';text-decoration:none;color:inherit" href="' + t[0] + '"><span class="tile__icon">' + icon(t[1]) + '</span><strong>' + t[3] + '</strong><span>' + t[4] + '</span></a>';
      }).join("") + '</div>' +
      '<div class="grid grid--main mt">' +
        '<div class="card"><div class="card__head"><h2>My recent check-ins</h2><a class="btn btn--ghost btn--sm" href="#/student/history">See all</a></div>' +
          '<ul class="list">' + recent.map(function (c) {
            var m = P.mood(c.mood);
            return '<li class="list__item list__item--click" data-go="#/student/history"><span class="list__icon" style="background:' + m.color + '1a">' + P.face(c.mood, m.color) + '</span>' +
              '<span class="list__body"><strong>' + P.dayLabel(c.daysAgo) + '</strong><span>' + (c.tags.length ? esc(c.tags.join(", ")) : "Nothing extra noted") + '</span></span>' +
              '<span class="list__end"><span class="pill" style="background:' + m.color + '1a;color:' + m.color + '">' + m.label + '</span></span></li>';
          }).join("") + '</ul>' +
          (my.length ? '<h3 class="section-title">My support requests</h3><ul class="list">' + my.map(function (r) {
            return '<li class="list__item"><span class="list__icon">' + icon("hand") + '</span><span class="list__body"><strong>' + esc(r.who) + '</strong><span>' + esc(r.topic) + ' &middot; ' + esc(r.when) + '</span></span><span class="list__end">' + P.statusPill("Sent (demo)") + '</span></li>';
          }).join("") + '</ul>' : "") +
        '</div>' +
        '<div class="card"><div class="card__head"><h2>Your support</h2></div><ul class="list">' + s.supports.map(function (x, i) {
          return '<li class="list__item list__item--click" data-support="' + i + '"><span class="list__icon" style="color:' + x.color + ';background:' + x.color + '14">' + icon(x.icon) + '</span><span class="list__body"><strong>' + x.title + '</strong><span>' + x.who + '</span></span><span class="list__end">' + icon("arrow", ' width="18" height="18"') + '</span></li>';
        }).join("") + '</ul></div>' +
      '</div>';
    return { title: "Home", html: html, bind: function () {
      $$("[data-go]").forEach(function (el) { el.addEventListener("click", function () { P.go(el.dataset.go); }); });
      $$("[data-support]").forEach(function (el) {
        el.addEventListener("click", function () {
          var x = s.supports[+el.dataset.support];
          var actions = x.icon === "book"
            ? '<a class="btn btn--primary" href="#/student/resources">Open resources</a>'
            : '<a class="btn btn--primary" href="#/student/support">Request support</a>' + (x.icon === "counsellor" ? '<a class="btn btn--outline" href="#/student/messages">Message ' + x.who + '</a>' : "");
          var bd = P.openModal(P.modalHead(x.title, x.who) + '<div class="modal__body"><p>' + x.detail + '</p></div><div class="modal__foot">' + actions + '</div>', { label: x.title });
          $$("a", bd).forEach(function (a) { a.addEventListener("click", P.closeModal); });
        });
      });
    }};
  };

  /* ---------------- WELLBEING CHECK-IN ---------------- */
  var CI = null;
  function resetCI() { CI = { mood: null, school: 3, connected: 3, tags: [], note: "", done: false }; }
  resetCI();
  var SCHOOL = ["Very manageable", "Manageable", "Okay", "Difficult", "Very difficult"];
  var CONN = ["Not connected", "A little", "Somewhat", "Connected", "Very connected"];

  V["student/checkin"] = function () {
    if (CI.done) return checkinDone();
    var html = P.pageHead("Wellbeing check-in", "Short and optional. Answer as much or as little as you like.") +
      '<div class="grid grid--main"><div class="card">' +
        '<div class="q"><h3>How are you feeling today?</h3><div class="moods" role="radiogroup" aria-label="How are you feeling today?">' +
          D.MOODS.map(function (m) { return '<button class="mood" role="radio" aria-checked="' + (CI.mood === m.id) + '" data-mood="' + m.id + '" style="--mc:' + m.color + '">' + P.face(m.id, m.color) + m.label + '</button>'; }).join("") +
        '</div></div>' +
        '<div class="q"><h3>How has school felt this week?</h3><div class="range"><input type="range" min="1" max="5" step="1" value="' + CI.school + '" id="rSchool" aria-label="How has school felt this week"><div class="range__ends"><span>Very manageable</span><span class="range__value" id="vSchool">' + SCHOOL[CI.school - 1] + '</span><span>Very difficult</span></div></div></div>' +
        '<div class="q"><h3>How connected do you feel to people around you?</h3><div class="range"><input type="range" min="1" max="5" step="1" value="' + CI.connected + '" id="rConn" aria-label="How connected do you feel"><div class="range__ends"><span>Not connected</span><span class="range__value" id="vConn">' + CONN[CI.connected - 1] + '</span><span>Very connected</span></div></div></div>' +
        '<div class="q"><h3>Is there anything affecting your wellbeing today?<small>Optional, choose any</small></h3><div class="chips">' +
          D.PRESSURES.map(function (t) { return '<button class="chip" aria-pressed="' + (CI.tags.indexOf(t) > -1) + '" data-tag="' + t + '">' + t + '</button>'; }).join("") +
        '</div></div>' +
        '<div class="q"><h3>Is there anything you\'d like to add?<small>Optional</small></h3><textarea class="textarea" id="ciNote" placeholder="Only you and authorised support staff could see this in a live system.">' + esc(CI.note) + '</textarea></div>' +
        '<div class="btn-row"><button class="btn btn--primary btn--lg" id="ciSubmit"' + (CI.mood ? "" : " disabled") + '>Submit check-in</button><span class="muted small" id="ciHint" style="align-self:center">' + (CI.mood ? "" : "Choose how you're feeling to continue.") + '</span></div>' +
      '</div>' +
      '<div class="stack">' +
        '<div class="card"><h2 style="font-size:1.05rem;margin-bottom:.6rem">Who sees my check-in?</h2><p class="muted small">In the proposed system, your answers would only be visible to authorised support staff, such as your school counsellor. Teachers would not see them automatically. School and national reports would only use anonymised totals.</p><a href="#/student/profile" class="small">See my privacy settings</a></div>' +
        P.notice("Prototype only", "This check-in is a demonstration. Answers stay in this browser and are not seen by anyone.") +
      '</div></div>';
    return { title: "Wellbeing Check-In", html: html, bind: function () {
      $$("[data-mood]").forEach(function (b) { b.addEventListener("click", function () {
        CI.mood = +b.dataset.mood;
        $$("[data-mood]").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
        $("#ciSubmit").disabled = false; $("#ciHint").textContent = "";
      }); });
      $("#rSchool").addEventListener("input", function (e) { CI.school = +e.target.value; $("#vSchool").textContent = SCHOOL[CI.school - 1]; });
      $("#rConn").addEventListener("input", function (e) { CI.connected = +e.target.value; $("#vConn").textContent = CONN[CI.connected - 1]; });
      $$("[data-tag]").forEach(function (b) { b.addEventListener("click", function () {
        var t = b.dataset.tag, i = CI.tags.indexOf(t);
        if (i > -1) CI.tags.splice(i, 1); else CI.tags.push(t);
        b.setAttribute("aria-pressed", String(i === -1));
      }); });
      $("#ciNote").addEventListener("input", function (e) { CI.note = e.target.value; });
      $("#ciSubmit").addEventListener("click", function () {
        var S = P.S();
        S.student.checkins = S.student.checkins.filter(function (c) { return c.daysAgo !== 0; });
        S.student.checkins.push({ daysAgo: 0, mood: CI.mood, school: CI.school, connected: CI.connected, tags: CI.tags.slice(), note: CI.note });
        S.notifs.student = S.notifs.student.filter(function (n) { return n.go !== "#/student/checkin"; });
        P.save(); CI.done = true; P.render();
      });
    }};
  };

  function checkinDone() {
    var low = CI.mood <= 2 || CI.school >= 5 || CI.connected <= 1;
    var mid = !low && (CI.mood === 3 || CI.school === 4 || CI.connected === 2);
    var bullying = CI.tags.indexOf("Bullying") > -1;
    var suggestions = "";
    if (bullying) suggestions += '<div class="suggest suggest--warm"><p><strong>You mentioned bullying.</strong> You don\'t have to deal with it alone. You can report it or ask to talk to someone.</p><div class="btn-row"><a class="btn btn--primary btn--sm" href="#/student/concern">Report a concern</a><a class="btn btn--outline btn--sm" href="#/student/resources">Understanding bullying</a></div></div>';
    if (low) suggestions += '<div class="suggest suggest--warm"><p>It looks like things may be difficult right now. You can request support from a counsellor if you\'d like.</p><div class="btn-row"><a class="btn btn--primary btn--sm" href="#/student/support">Request support</a><a class="btn btn--outline btn--sm" href="#/student/messages">Message Ms Marie</a></div></div>';
    else if (mid) suggestions += '<div class="suggest suggest--blue"><p>Thanks for being honest. These guides might help this week, and you can always ask to talk.</p><div class="btn-row"><a class="btn btn--blue btn--sm" href="#/student/resources">View resources</a><a class="btn btn--outline btn--sm" href="#/student/support">Request support</a></div></div>';
    else suggestions += '<div class="suggest suggest--calm"><p>Great to hear things are going well. Keep doing what works for you.</p><div class="btn-row"><a class="btn btn--green btn--sm" href="#/student/history">See my check-ins</a></div></div>';
    var m = P.mood(CI.mood);
    var html = '<div class="card success"><div class="success__icon">' + icon("check") + '</div><h2>Check-in submitted</h2>' +
      '<p>You said you\'re feeling <strong style="color:' + m.color + '">' + m.label.toLowerCase() + '</strong> today and school feels <strong>' + SCHOOL[CI.school - 1].toLowerCase() + '</strong>. Thank you for checking in.</p>' +
      suggestions +
      '<div class="btn-row"><a class="btn btn--ghost" href="#/student/home">Back to home</a><button class="btn btn--ghost" id="again">Do another check-in</button></div>' +
      '<p class="muted small" style="margin-top:1rem">Demo logic only. In this prototype, no one receives your answers.</p></div>';
    return { title: "Wellbeing Check-In", html: html, bind: function () {
      $("#again").addEventListener("click", function () { resetCI(); P.render(); });
      $$(".success a").forEach(function (a) { a.addEventListener("click", function () { resetCI(); }); });
    }};
  }

  /* ---------------- REQUEST SUPPORT ---------------- */
  var SR = null;
  function resetSR() { SR = { who: null, topic: "", msg: "", contact: "Message through PULSE", done: false }; }
  resetSR();
  V["student/support"] = function () {
    if (SR.done) {
      return { title: "Request Support", html: '<div class="card success"><div class="success__icon">' + icon("check") + '</div><h2>Demo request submitted</h2><p>In a live system, this request would be securely sent to the appropriate support team. They would reply by your chosen contact method: <strong>' + esc(SR.contact.toLowerCase()) + '</strong>.</p>' +
        '<div class="suggest suggest--blue"><p><strong>Try it from the other side.</strong> Switch to the Counsellor role and you\'ll see this request (STU-2031) waiting in the support queue.</p><div class="btn-row"><a class="btn btn--blue btn--sm" href="#/counsellor/requests">Open Counsellor view</a></div></div>' +
        '<div class="btn-row"><a class="btn btn--ghost" href="#/student/home">Back to home</a><button class="btn btn--ghost" id="again">Make another request</button></div></div>',
        bind: function () { $("#again").addEventListener("click", function () { resetSR(); P.render(); }); $$(".success a").forEach(function (a) { a.addEventListener("click", resetSR); }); } };
    }
    var WHO = [["School Counsellor", "Ms Marie"], ["Trusted Staff Member", "Mr Laporte, Form Tutor"], ["Student Support Team", "Wellbeing team"]];
    var CONTACT = ["Message through PULSE", "In person", "Either"];
    var html = P.pageHead("Request support", "Ask to talk to someone. You choose who and how.") +
      P.notice("This prototype is not monitored.", " Do not use it to submit a real support request. If you need help now, talk to a trusted adult at school.", "red") +
      '<div class="card mt">' +
        '<div class="q"><h3>Who would you like support from?</h3><div class="options" role="radiogroup">' + WHO.map(function (w) {
          return '<button class="option" role="radio" aria-checked="' + (SR.who === w[0]) + '" data-who="' + w[0] + '"><span class="option__dot"></span><span><strong>' + w[0] + '</strong><small>' + w[1] + '</small></span></button>';
        }).join("") + '</div></div>' +
        '<div class="q"><h3>What would you like support with?</h3><select class="select" id="srTopic" style="max-width:420px"><option value="">Choose a topic</option>' +
          ["School pressure", "Exams", "Friendships", "Family", "Bullying", "Feeling low or worried", "Something else"].map(function (t) { return '<option' + (SR.topic === t ? " selected" : "") + '>' + t + '</option>'; }).join("") + '</select></div>' +
        '<div class="q"><h3>Anything you\'d like them to know?<small>Optional</small></h3><textarea class="textarea" id="srMsg" placeholder="You can keep this short.">' + esc(SR.msg) + '</textarea></div>' +
        '<div class="q"><h3>How would you prefer to be contacted?</h3><div class="chips" role="radiogroup">' + CONTACT.map(function (c) {
          return '<button class="chip" role="radio" aria-pressed="' + (SR.contact === c) + '" data-contact="' + c + '">' + c + '</button>';
        }).join("") + '</div></div>' +
        '<div class="btn-row"><button class="btn btn--primary btn--lg" id="srSend" disabled>' + icon("send") + 'Send support request</button><span class="muted small" id="srHint" style="align-self:center">Choose who and what to continue.</span></div>' +
      '</div>';
    return { title: "Request Support", html: html, bind: function () {
      function check() { var ok = SR.who && SR.topic; $("#srSend").disabled = !ok; $("#srHint").textContent = ok ? "" : "Choose who and what to continue."; }
      $$("[data-who]").forEach(function (b) { b.addEventListener("click", function () { SR.who = b.dataset.who; $$("[data-who]").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); }); check(); }); });
      $("#srTopic").addEventListener("change", function (e) { SR.topic = e.target.value; check(); });
      $("#srMsg").addEventListener("input", function (e) { SR.msg = e.target.value; });
      $$("[data-contact]").forEach(function (b) { b.addEventListener("click", function () { SR.contact = b.dataset.contact; $$("[data-contact]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); }); });
      check();
      $("#srSend").addEventListener("click", function () {
        var S = P.S();
        S.myRequests.unshift({ who: SR.who, topic: SR.topic, when: "Today " + P.nowTime() });
        // Cross-role demo: the request appears in the counsellor's queue
        S.requests = S.requests.filter(function (r) { return r.id !== "STU-2031"; });
        var last = S.student.checkins.slice().sort(function (a, b) { return b.daysAgo - a.daysAgo; }).map(function (c) { return c.mood; }).slice(-5);
        S.requests.unshift({ id: "STU-2031", year: "S3", reason: SR.topic, priority: /Bully|low/i.test(SR.topic) ? "High" : "Medium", daysAgo: 0, status: "New", contact: SR.contact, from: SR.who,
          message: SR.msg || "(No message added)", trend: last.length > 1 ? last : [3, 3], history: ["Submitted from the Student view in this demo"], demo: true });
        S.notifs.counsellor.unshift({ id: "n" + Date.now(), title: "New support request: STU-2031", body: SR.topic + " (sent from the Student demo)", go: "case:STU-2031" });
        P.save(); SR.done = true; P.render();
      });
    }};
  };

  /* ---------------- REPORT A CONCERN ---------------- */
  var RC = null;
  function resetRC() { RC = { type: null, about: null, when: "", where: "", detail: "", anon: false, done: false }; }
  resetRC();
  V["student/concern"] = function () {
    if (RC.done) {
      return { title: "Report a Concern", html: '<div class="card success"><div class="success__icon">' + icon("check") + '</div><h2>Demo report submitted</h2><p>In a live system, this concern would be routed to the school\'s authorised safeguarding or wellbeing staff, according to agreed procedures. ' + (RC.anon ? "You chose not to share your name with the report." : "") + '</p>' +
        P.notice("Remember", "This prototype is not monitored. If something is happening right now, please tell a trusted adult. In an emergency in Seychelles, call 999.", "red") +
        '<div class="btn-row"><a class="btn btn--ghost" href="#/student/home">Back to home</a><a class="btn btn--ghost" href="#/student/resources">View resources</a></div></div>',
        bind: function () { $$(".success a").forEach(function (a) { a.addEventListener("click", resetRC); }); } };
    }
    var TYPES = ["Bullying", "Harassment", "Safety concern", "Online behaviour", "Concern about another student", "Other"];
    var html = P.pageHead("Report a concern", "A safe, structured way to tell the right people about something that's worrying you.") +
      P.notice("Prototype only.", " This form is not monitored and must not be used to report a real incident.", "red") +
      '<div class="card mt">' +
        '<div class="q"><h3>What kind of concern is it?</h3><div class="chips" role="radiogroup">' + TYPES.map(function (t) { return '<button class="chip" role="radio" aria-pressed="' + (RC.type === t) + '" data-type="' + t + '">' + t + '</button>'; }).join("") + '</div></div>' +
        '<div class="q"><h3>Who is this report about?</h3><div class="options" role="radiogroup">' +
          [["self", "Report about myself", "Something that is happening to me"], ["witness", "Report something I witnessed", "Something I saw or heard about"]].map(function (o) {
            return '<button class="option" role="radio" aria-checked="' + (RC.about === o[0]) + '" data-about="' + o[0] + '"><span class="option__dot"></span><span><strong>' + o[1] + '</strong><small>' + o[2] + '</small></span></button>';
          }).join("") + '</div></div>' +
        '<div class="q"><div class="grid grid--2">' +
          '<div class="field" style="margin:0"><label for="rcWhen">When did it happen?</label><select class="select" id="rcWhen"><option value="">Choose</option>' + ["Today", "This week", "Earlier this term", "It's ongoing"].map(function (o) { return '<option' + (RC.when === o ? " selected" : "") + '>' + o + '</option>'; }).join("") + '</select></div>' +
          '<div class="field" style="margin:0"><label for="rcWhere">Where did it happen?</label><select class="select" id="rcWhere"><option value="">Choose</option>' + ["In class", "At break or lunch", "On the way to or from school", "Online", "Somewhere else"].map(function (o) { return '<option' + (RC.where === o ? " selected" : "") + '>' + o + '</option>'; }).join("") + '</select></div>' +
        '</div></div>' +
        '<div class="q"><h3>What happened?<small>Share only what you feel comfortable with</small></h3><textarea class="textarea" id="rcDetail" placeholder="Describe what happened.">' + esc(RC.detail) + '</textarea></div>' +
        '<div class="q"><div class="switch"><span class="switch__text"><strong>Don\'t share my name with this report</strong><span>Staff may still need to talk to you to keep everyone safe.</span></span><button class="toggle" role="switch" aria-checked="' + RC.anon + '" id="rcAnon" aria-label="Don\'t share my name"></button></div></div>' +
        '<div class="btn-row"><button class="btn btn--primary btn--lg" id="rcSend" disabled>Submit demo report</button><span class="muted small" id="rcHint" style="align-self:center">Choose a type and who it\'s about.</span></div>' +
      '</div>';
    return { title: "Report a Concern", html: html, bind: function () {
      function check() { var ok = RC.type && RC.about; $("#rcSend").disabled = !ok; $("#rcHint").textContent = ok ? "" : "Choose a type and who it's about."; }
      $$("[data-type]").forEach(function (b) { b.addEventListener("click", function () { RC.type = b.dataset.type; $$("[data-type]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); check(); }); });
      $$("[data-about]").forEach(function (b) { b.addEventListener("click", function () { RC.about = b.dataset.about; $$("[data-about]").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); }); check(); }); });
      $("#rcWhen").addEventListener("change", function (e) { RC.when = e.target.value; });
      $("#rcWhere").addEventListener("change", function (e) { RC.where = e.target.value; });
      $("#rcDetail").addEventListener("input", function (e) { RC.detail = e.target.value; });
      $("#rcAnon").addEventListener("click", function (e) { RC.anon = !RC.anon; e.currentTarget.setAttribute("aria-checked", String(RC.anon)); });
      check();
      $("#rcSend").addEventListener("click", function () { P.S().myConcerns.unshift({ type: RC.type, when: "Today" }); P.save(); RC.done = true; P.render(); });
    }};
  };

  /* ---------------- MESSAGES ---------------- */
  var REPLIES = [
    "Thanks for letting me know, Alex. Would you like to find a time to talk this week?",
    "I'm glad you messaged. You can tell me as much or as little as you want.",
    "That sounds like a lot to deal with. Shall we meet on Thursday at break in Room 12?",
    "Thank you. I'll keep this between us unless I'm worried about your safety, and I'd always talk to you first."
  ];
  V["student/messages"] = function () {
    var S = P.S(), msgs = S.student.messages;
    S.notifs.student = S.notifs.student.filter(function (n) { return n.go !== "#/student/messages"; }); P.save();
    var html = P.pageHead("Messages", "Private messages with your school counsellor.") +
      '<div class="card chat chat--single"><div class="chat__pane">' +
        '<div class="chat__head"><span class="avatar" style="--ac:#D3111C">MM</span><div><strong>School Counsellor, Ms Marie</strong><span>Usually replies within a school day</span></div></div>' +
        '<div class="chat__note">Prototype conversation. Messages are not transmitted.</div>' +
        '<div class="chat__body" id="chatBody">' + bubbles(msgs) + '</div>' +
        '<form class="chat__form" id="chatForm"><label class="sr-only" for="chatInput">Message</label><input class="input" id="chatInput" placeholder="Write a message..." autocomplete="off"><button class="btn btn--primary" type="submit">' + icon("send") + '<span class="btn__text">Send</span></button></form>' +
      '</div></div>';
    return { title: "Messages", html: html, bind: function () {
      var body = $("#chatBody"); body.scrollTop = body.scrollHeight;
      $("#chatForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var inp = $("#chatInput"), v = inp.value.trim(); if (!v) return;
        msgs.push({ from: "me", text: v, ago: P.nowTime() }); P.save();
        body.innerHTML = bubbles(msgs) + '<div class="bubble bubble--them typing" id="typing"><i></i><i></i><i></i></div>';
        body.scrollTop = body.scrollHeight; inp.value = "";
        setTimeout(function () {
          var r = REPLIES[(msgs.filter(function (m) { return m.from === "them"; }).length) % REPLIES.length];
          msgs.push({ from: "them", text: r, ago: P.nowTime(), auto: true }); P.save();
          if (document.body.contains(body)) { body.innerHTML = bubbles(msgs); body.scrollTop = body.scrollHeight; }
        }, 1600);
      });
    }};
  };
  function bubbles(msgs) {
    return msgs.map(function (m) {
      return '<div class="bubble bubble--' + m.from + '">' + esc(m.text) + '<small>' + esc(m.ago) + (m.auto ? " &middot; automatic demo reply" : "") + '</small></div>';
    }).join("");
  }

  /* ---------------- MY CHECK-INS ---------------- */
  V["student/history"] = function () {
    var list = sorted(), chrono = list.slice().reverse();
    var avg = list.reduce(function (a, c) { return a + c.mood; }, 0) / (list.length || 1);
    var html = P.pageHead("My check-ins", "Your check-in history. Only you and authorised support staff could see this in a live system.", '<a class="btn btn--primary" href="#/student/checkin">' + icon("pulse") + 'New check-in</a>') +
      '<div class="grid grid--main"><div class="card"><div class="card__head"><div><h2>How I\'ve been feeling</h2><p class="card__sub">1 = Struggling, 5 = Very good</p></div></div>' +
        C.line({ labels: chrono.map(function (c) { return P.dayLabel(c.daysAgo); }), series: [{ values: chrono.map(function (c) { return c.mood; }), color: "#D3111C" }], min: 1, max: 5, label: "My wellbeing over time" }) +
      '</div><div class="card stat"><span class="stat__label">Check-ins completed</span><span class="stat__value">' + list.length + '</span><span class="stat__foot">Average feeling: ' + P.mood(Math.round(avg)).label + '</span>' +
        '<div style="margin-top:1rem">' + P.face(Math.round(avg), P.mood(Math.round(avg)).color).replace("<svg", '<svg width="64" height="64"') + '</div></div></div>' +
      '<div class="card mt"><h2 style="font-size:1.05rem;margin-bottom:.5rem">All check-ins</h2><ul class="list">' + list.map(function (c) {
        var m = P.mood(c.mood);
        return '<li class="list__item"><span class="list__icon" style="background:' + m.color + '1a">' + P.face(c.mood, m.color) + '</span><span class="list__body"><strong>' + P.dayLabel(c.daysAgo) + ' &middot; ' + m.label + '</strong><span>School: ' + SCHOOL[c.school - 1] + ' &middot; Connected: ' + CONN[c.connected - 1] + (c.tags.length ? ' &middot; ' + esc(c.tags.join(", ")) : "") + '</span>' + (c.note ? '<span style="display:block;color:var(--ink-soft)">"' + esc(c.note) + '"</span>' : "") + '</span></li>';
      }).join("") + '</ul></div>';
    return { title: "My Check-Ins", html: html };
  };

  /* ---------------- RESOURCES ---------------- */
  V["student/resources"] = function () {
    var html = P.pageHead("Resources", "Short guides you can read any time. Fictional demo content.") +
      '<div class="resources">' + D.RESOURCES.map(function (r) {
        return '<button class="resource" style="--rc:' + r.color + '" data-res="' + r.id + '"><span class="resource__top">' + icon(r.icon) + '</span><span class="resource__body"><strong>' + r.title + '</strong><span>' + r.blurb + '</span></span></button>';
      }).join("") + '</div>';
    return { title: "Resources", html: html, bind: function () {
      $$("[data-res]").forEach(function (b) { b.addEventListener("click", function () {
        var r = D.RESOURCES.filter(function (x) { return x.id === b.dataset.res; })[0];
        var bd = P.openModal(P.modalHead(r.title, "Student support resource &middot; demo content") + '<div class="modal__body">' + r.body.map(function (p) { return "<p>" + p + "</p>"; }).join("") +
          '<h3 class="section-title">Try this</h3><ul>' + r.tips.map(function (t) { return "<li>" + t + "</li>"; }).join("") + '</ul></div>' +
          '<div class="modal__foot"><a class="btn btn--outline" href="#/student/support">Talk to someone</a><button class="btn btn--primary" id="helpful">' + icon("star") + 'This was helpful</button></div>', { label: r.title });
        $("#helpful", bd).addEventListener("click", function () { P.closeModal(); P.toast("Thanks for the feedback"); });
        $("a", bd).addEventListener("click", P.closeModal);
      }); });
    }};
  };

  /* ---------------- PROFILE ---------------- */
  V["student/profile"] = function () {
    var s = st(), pv = P.S().privacy;
    var rows = [
      ["tutor", "Let my form tutor know I've asked for support", "Only that you asked, never what you said."],
      ["trends", "Include my check-ins in anonymous school trends", "Your name and ID are never shown in trends."],
      ["reminders", "Weekly check-in reminder", "A gentle reminder on Monday mornings."]
    ];
    var html = P.pageHead("My profile", "Your details come from your school account. You control your PULSE settings.") +
      '<div class="grid grid--2"><div class="card"><div style="display:flex;gap:1rem;align-items:center;margin-bottom:1.25rem"><span class="avatar" style="--ac:#D3111C;width:64px;height:64px;font-size:1.2rem">AD</span><div><h2 style="font-size:1.3rem">Alex D.</h2><span class="muted">Fictional student</span></div></div>' +
        '<dl class="kv"><div><dt>Student ID</dt><dd>' + s.id + '</dd></div><div><dt>Year / Form</dt><dd>' + s.form + '</dd></div><div><dt>School</dt><dd>' + s.school + '</dd></div><div><dt>School counsellor</dt><dd>' + s.counsellor + '</dd></div></dl>' +
        P.notice("Linked to your education account", " In the proposed design, PULSE uses your existing OpenEMIS login, so there is no extra account or password.", "blue") + '</div>' +
      '<div class="card"><h2 style="font-size:1.1rem;margin-bottom:.25rem">Privacy settings</h2><p class="muted small">Some safeguarding rules always apply. If staff are worried about your safety, they may need to share information with the right people, and they would talk to you first wherever possible.</p>' +
        '<div class="switch"><span class="switch__text"><strong>My counsellor can see my check-ins</strong><span>Required so support staff can help you. Cannot be turned off.</span></span><button class="toggle" role="switch" aria-checked="true" disabled aria-label="Counsellor access (required)" style="opacity:.6"></button></div>' +
        rows.map(function (r) { return '<div class="switch"><span class="switch__text"><strong>' + r[1] + '</strong><span>' + r[2] + '</span></span><button class="toggle" role="switch" aria-checked="' + pv[r[0]] + '" data-pv="' + r[0] + '" aria-label="' + r[1] + '"></button></div>'; }).join("") +
        '<div class="switch"><span class="switch__text"><strong>Teachers see my check-ins</strong><span>Never. Teachers do not get automatic access to wellbeing information.</span></span><button class="toggle" role="switch" aria-checked="false" disabled aria-label="Teacher access (never)" style="opacity:.6"></button></div>' +
      '</div></div>';
    return { title: "My Profile", html: html, bind: function () {
      $$("[data-pv]").forEach(function (b) { b.addEventListener("click", function () {
        var k = b.dataset.pv; pv[k] = !pv[k]; P.save(); b.setAttribute("aria-checked", String(pv[k])); P.toast("Setting updated");
      }); });
    }};
  };
})();
