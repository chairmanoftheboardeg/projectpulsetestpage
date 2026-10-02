/* =========================================================
   PROJECT PULSE PROTOTYPE — Fictional demonstration data
   Nothing in this file refers to real students, schools,
   counsellors or statistics.
   ========================================================= */
(function () {
  "use strict";

  // Small seeded random generator so the "fake" numbers stay the same on every visit
  function rng(seed) {
    var s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  var R = rng(20261002);
  function between(a, b) { return Math.round(a + R() * (b - a)); }

  var MOODS = [
    { id: 5, label: "Very good", color: "#0A8A43", face: "great" },
    { id: 4, label: "Good", color: "#5BB974", face: "good" },
    { id: 3, label: "Okay", color: "#E9B820", face: "okay" },
    { id: 2, label: "Not great", color: "#E07B12", face: "low" },
    { id: 1, label: "Struggling", color: "#D3111C", face: "struggling" }
  ];

  var PRESSURES = ["School pressure", "Friendships", "Family", "Bullying", "Social media", "Health", "Other", "Prefer not to say"];

  /* ---------------- STUDENT ---------------- */
  var student = {
    first: "Alex",
    last: "D.",
    id: "STU-2031",
    year: "S3",
    form: "S3 Blue",
    school: "Demo Secondary School",
    counsellor: "Ms Marie",
    checkins: [
      { daysAgo: 3, mood: 4, school: 2, connected: 4, tags: [], note: "" },
      { daysAgo: 7, mood: 3, school: 3, connected: 3, tags: ["School pressure"], note: "" },
      { daysAgo: 14, mood: 2, school: 4, connected: 3, tags: ["School pressure", "Friendships"], note: "Mock exams week." },
      { daysAgo: 21, mood: 4, school: 2, connected: 4, tags: [], note: "" },
      { daysAgo: 28, mood: 3, school: 3, connected: 2, tags: ["Social media"], note: "" }
    ],
    supports: [
      { title: "School Counsellor", who: "Ms Marie", detail: "Available Mon to Thu, 08:00 to 15:00. Room 12, Student Support Block.", icon: "counsellor", color: "#D3111C" },
      { title: "Trusted Staff Member", who: "Mr Laporte, Form Tutor", detail: "You chose your form tutor as a trusted adult you can talk to.", icon: "shield", color: "#0B4EA2" },
      { title: "Student Support Resources", who: "7 guides", detail: "Short, practical guides on stress, friendships, exams and more.", icon: "book", color: "#0A8A43" }
    ],
    messages: [
      { from: "them", text: "Hi Alex, thanks for your check-in last week. How did the mock exams go?", ago: "4 days ago" },
      { from: "me", text: "Hi Ms Marie. They were okay, maths was hard.", ago: "4 days ago" },
      { from: "them", text: "Well done for getting through them. If you'd like, we can find a time to talk about a study plan. No pressure at all.", ago: "3 days ago" }
    ]
  };

  var RESOURCES = [
    { id: "stress", title: "Managing school stress", blurb: "Spot the signs early and try small, practical steps.", color: "#D3111C", icon: "pulse",
      body: ["Stress is a normal reaction to pressure. A little can help you focus; too much for too long can make everything feel harder.",
        "Signs to notice: trouble sleeping, headaches, snapping at people, finding it hard to start work.",
        "Things that help: break big tasks into small ones, take short breaks, move your body, and talk to someone you trust."],
      tips: ["Write down the three most important tasks for today", "Take a 10-minute break every hour", "Talk to your counsellor if stress lasts more than two weeks"] },
    { id: "bullying", title: "Understanding bullying", blurb: "What bullying is, what it isn't, and what you can do.", color: "#0B4EA2", icon: "shield",
      body: ["Bullying is repeated behaviour meant to hurt, scare or exclude someone. It can happen in person or online.",
        "It is never your fault, and you do not have to deal with it alone.",
        "You can report bullying to a trusted adult or through the Report a Concern page in PULSE."],
      tips: ["Keep a note of what happened and when", "Save screenshots of online messages", "Tell a trusted adult"] },
    { id: "friends", title: "Healthy friendships", blurb: "What good friendships feel like and how to handle fallouts.", color: "#0A8A43", icon: "users",
      body: ["Healthy friendships are built on respect, trust and kindness. Disagreements happen, but you should feel safe being yourself.",
        "If a friendship often leaves you feeling worse, it is okay to step back."],
      tips: ["Notice how you feel after spending time together", "Talk honestly, calmly and in private", "Ask for advice if you are unsure"] },
    { id: "help", title: "Asking for help", blurb: "Why asking is a strength, and simple ways to start.", color: "#E07B12", icon: "hand",
      body: ["Many students wait until things feel very hard before asking for help. You don't have to wait.",
        "You can start small: send a support request, ask to talk, or just say \"I'm not okay today.\""],
      tips: ["Use Request Support in PULSE", "Choose who you feel most comfortable with", "You can choose to talk in person or by message"] },
    { id: "exams", title: "Exam pressure", blurb: "Plan your revision and look after yourself during exams.", color: "#7A4CC2", icon: "book",
      body: ["Exams can feel overwhelming. A simple plan and enough rest make a bigger difference than studying all night.",
        "It's normal to feel nervous. Breathing slowly for a minute can help calm your body."],
      tips: ["Make a revision timetable", "Sleep 8 to 10 hours", "Eat breakfast on exam days"] },
    { id: "digital", title: "Digital wellbeing", blurb: "Keep social media and screens working for you.", color: "#0E8FA8", icon: "phone",
      body: ["Phones and social media help us stay connected, but they can also affect sleep, mood and confidence.",
        "Notice which apps leave you feeling good and which leave you feeling worse."],
      tips: ["Turn off notifications at night", "Unfollow accounts that make you feel bad", "Report and block harmful messages"] },
    { id: "where", title: "Where to find support", blurb: "Who can help at school and outside school.", color: "#14213D", icon: "map",
      body: ["At school: your school counsellor, form tutor, or any trusted staff member.",
        "Outside school: a parent or guardian, family member, or a health professional.",
        "In an emergency in Seychelles, call 999. (This prototype does not connect to any real service.)"],
      tips: ["Save the number of someone you trust", "Know where the counselling room is", "You can always ask a teacher to help you find support"] }
  ];

  /* ---------------- COUNSELLOR ---------------- */
  var REASONS = ["School pressure", "Friendships", "Family", "Bullying", "Exam stress", "Low mood", "Online behaviour", "Attendance worries"];
  var requests = [
    { id: "STU-1048", year: "S4", reason: "School pressure", priority: "Medium", daysAgo: 0, status: "New", contact: "Message through PULSE", from: "School Counsellor",
      message: "I'm finding it hard to keep up with homework and I'm not sleeping well.", trend: [4, 3, 3, 2, 2], history: ["Wellbeing check-in: Not great (2 days ago)", "Resource viewed: Managing school stress"] },
    { id: "STU-1172", year: "S2", reason: "Bullying", priority: "High", daysAgo: 0, status: "New", contact: "In person", from: "School Counsellor",
      message: "Some students keep saying things to me in the group chat and at break.", trend: [3, 3, 2, 2, 1], history: ["Concern reported: Online behaviour (1 day ago)", "Wellbeing check-in: Struggling (today)"] },
    { id: "STU-0931", year: "S5", reason: "Exam stress", priority: "Medium", daysAgo: 1, status: "Accepted", contact: "Either", from: "Student Support Team",
      message: "Exams are in three weeks and I feel like I'm behind.", trend: [4, 4, 3, 3, 3], history: ["Meeting held: 12 Sept (study planning)", "Wellbeing check-in: Okay (yesterday)"] },
    { id: "STU-1205", year: "S1", reason: "Friendships", priority: "Low", daysAgo: 1, status: "New", contact: "Message through PULSE", from: "Trusted Staff Member",
      message: "I don't really have anyone to sit with at lunch.", trend: [4, 3, 3, 3, 3], history: ["First support request"] },
    { id: "STU-0877", year: "S3", reason: "Family", priority: "High", daysAgo: 2, status: "Follow-up", contact: "In person", from: "School Counsellor",
      message: "Things at home are difficult at the moment.", trend: [3, 2, 2, 2, 2], history: ["Meeting held: 25 Sept", "Follow-up agreed: within 1 week"] },
    { id: "STU-1311", year: "S4", reason: "Low mood", priority: "Medium", daysAgo: 0, status: "New", contact: "Either", from: "School Counsellor",
      message: "I've just been feeling flat for a while.", trend: [3, 3, 2, 2, 2], history: ["Wellbeing check-in: Not great (3 check-ins in a row)"] },
    { id: "STU-0754", year: "S5", reason: "Attendance worries", priority: "Low", daysAgo: 4, status: "Scheduled", contact: "In person", from: "Student Support Team",
      message: "I've missed some days and feel worried about going back to class.", trend: [3, 3, 3, 4, 3], history: ["Meeting scheduled: Thursday 10:30"] },
    { id: "STU-0610", year: "S2", reason: "Online behaviour", priority: "Medium", daysAgo: 6, status: "Closed", contact: "Message through PULSE", from: "School Counsellor",
      message: "Someone made a fake account with my photo.", trend: [2, 2, 3, 4, 4], history: ["Referred to: Safeguarding lead", "Case closed: Resolved with family (28 Sept)"] }
  ];

  var alerts = [
    { id: "AL-301", student: "STU-1311", year: "S4", indicator: "Repeated low wellbeing", detail: "3 consecutive check-ins at \"Not great\" or below.", level: "Review recommended", status: "Open" },
    { id: "AL-302", student: "STU-1172", year: "S2", indicator: "Bullying mentioned in check-in", detail: "\"Bullying\" selected in 2 of the last 3 check-ins.", level: "Review recommended", status: "Open" },
    { id: "AL-303", student: "STU-0877", year: "S3", indicator: "Downward trend", detail: "Wellbeing check-ins have dropped over 4 weeks.", level: "Flag for review", status: "Open" },
    { id: "AL-304", student: "STU-1420", year: "S1", indicator: "Check-ins stopped", detail: "No check-in for 3 weeks after weekly participation.", level: "For awareness", status: "Open" },
    { id: "AL-305", student: "STU-1048", year: "S4", indicator: "School pressure trend", detail: "\"School pressure\" selected in 4 of the last 5 check-ins.", level: "For awareness", status: "Open" },
    { id: "AL-306", student: "STU-0983", year: "S5", indicator: "Sudden change", detail: "Check-in moved from \"Very good\" to \"Struggling\" in one week.", level: "Review recommended", status: "Open" },
    { id: "AL-307", student: "STU-1266", year: "S3", indicator: "Family selected repeatedly", detail: "\"Family\" selected in 3 recent check-ins.", level: "For awareness", status: "Open" },
    { id: "AL-308", student: "STU-1109", year: "S2", indicator: "Repeated low wellbeing", detail: "2 consecutive check-ins at \"Struggling\".", level: "Review recommended", status: "Open" }
  ];

  var studentIds = ["STU-0610","STU-0754","STU-0877","STU-0931","STU-0983","STU-1048","STU-1109","STU-1172","STU-1205","STU-1266","STU-1311","STU-1420","STU-1502","STU-1533"];
  var years = ["S1","S2","S3","S4","S5"];
  var students = studentIds.map(function (id) {
    var req = requests.filter(function (r) { return r.id === id; })[0];
    var al = alerts.filter(function (a) { return a.student === id; })[0];
    var trend = req ? req.trend : [between(2,5), between(2,5), between(2,5), between(2,5), between(2,5)];
    return {
      id: id,
      year: req ? req.year : (al ? al.year : years[between(0, 4)]),
      trend: trend,
      lastCheckin: between(0, 9),
      participation: between(40, 100),
      openCase: !!(req && req.status !== "Closed"),
      flagged: !!al
    };
  });

  var threads = [
    { id: "STU-1048", year: "S4", unread: true, messages: [
      { from: "them", text: "Hi Miss, I sent a support request. Is it okay if we talk this week?", ago: "08:12" } ] },
    { id: "STU-0931", year: "S5", unread: true, messages: [
      { from: "me", text: "Here's the revision plan we made. How is it going so far?", ago: "Yesterday" },
      { from: "them", text: "Better thanks, I finished the first week of it.", ago: "07:40" } ] },
    { id: "STU-0877", year: "S3", unread: true, messages: [
      { from: "them", text: "Can we move our meeting to Thursday?", ago: "Yesterday" } ] },
    { id: "STU-0754", year: "S5", unread: false, messages: [
      { from: "me", text: "See you Thursday at 10:30 in Room 12.", ago: "Mon" },
      { from: "them", text: "Okay thank you.", ago: "Mon" } ] }
  ];

  var referrals = [
    { name: "School safeguarding lead", type: "In school", detail: "For any concern about a student's safety. Same-day response." },
    { name: "School nurse / health team", type: "In school", detail: "Physical health, sleep, eating and general wellbeing." },
    { name: "Educational psychologist (district)", type: "Education service", detail: "Learning and assessment support. Referral form required." },
    { name: "Child and adolescent health services", type: "Health service", detail: "Specialist health support. Referral through the school health team." },
    { name: "Social services liaison", type: "Partner service", detail: "Family support and welfare. Contact through the safeguarding lead." }
  ];

  // School trends (counsellor), per period
  function series(n, lo, hi) { var a = []; for (var i = 0; i < n; i++) a.push(between(lo, hi)); return a; }
  var schoolTrends = {
    week:  { labels: ["Mon","Tue","Wed","Thu","Fri"], wellbeing: [3.6,3.5,3.3,3.4,3.7], participation: 81, requests: [3,5,4,6,2], pressures: [42,18,12,9,14,5], years: [3.8,3.6,3.4,3.2,3.1] },
    month: { labels: ["Wk 1","Wk 2","Wk 3","Wk 4"], wellbeing: [3.5,3.4,3.1,3.4], participation: 76, requests: [18,22,29,20], pressures: [38,20,14,11,12,5], years: [3.7,3.5,3.3,3.1,3.0] },
    term:  { labels: ["Jan","Feb","Mar","Apr"], wellbeing: [3.7,3.5,3.2,3.3], participation: 72, requests: [61,74,96,80], pressures: [35,21,15,10,14,5], years: [3.8,3.5,3.4,3.2,2.9] }
  };
  var pressureLabels = ["School pressure","Friendships","Family","Bullying","Social media","Other"];

  /* ---------------- MINISTRY ---------------- */
  var REGIONS = ["Mahé North", "Mahé Central", "Mahé South", "Praslin", "La Digue & Inner Islands"];
  var letters = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");
  var schools = letters.map(function (L, i) {
    var level = i < 10 ? "Primary" : "Secondary";
    var students = level === "Primary" ? between(220, 560) : between(380, 980);
    var counsellors = Math.max(1, Math.round(students / between(280, 620)));
    var participation = between(52, 92);
    var score = Math.round((2.7 + R() * 1.2) * 10) / 10;
    var requests = Math.round(students * (0.04 + R() * 0.07));
    var ratio = Math.round(students / counsellors);
    return {
      id: "SCH-" + L,
      name: (level === "Primary" ? "Primary School " : "Secondary School ") + L,
      level: level,
      region: REGIONS[i % REGIONS.length],
      students: students,
      counsellors: counsellors,
      ratio: ratio,
      participation: participation,
      score: score,
      wellbeing: score >= 3.5 ? "Stable" : score >= 3.1 ? "Monitor" : "Needs attention",
      requests: requests,
      capacity: ratio <= 400 ? "Adequate" : ratio <= 550 ? "Stretched" : "Limited",
      trend: series(6, 28, 40).map(function (v) { return v / 10; }),
      pressures: [between(25,45), between(12,25), between(8,20), between(5,15), between(5,14), between(3,8)]
    };
  });
  // Make "School A / School B" match the brief's example rows
  schools[0].name = "School A"; schools[0].students = 720; schools[0].counsellors = 2; schools[0].participation = 84; schools[0].wellbeing = "Stable"; schools[0].score = 3.7; schools[0].requests = 32; schools[0].capacity = "Adequate"; schools[0].ratio = 360;
  schools[1].name = "School B"; schools[1].students = 640; schools[1].counsellors = 1; schools[1].participation = 62; schools[1].wellbeing = "Needs attention"; schools[1].score = 2.9; schools[1].requests = 58; schools[1].capacity = "Limited"; schools[1].ratio = 640;

  var national = {
    week:  { labels: ["Mon","Tue","Wed","Thu","Fri"], wellbeing: [3.5,3.4,3.3,3.4,3.6], requests: [52,61,58,70,44], participation: 78 },
    month: { labels: ["Wk 1","Wk 2","Wk 3","Wk 4"], wellbeing: [3.5,3.4,3.2,3.4], requests: [288,301,372,323], participation: 78 },
    term:  { labels: ["Jan","Feb","Mar","Apr","May","Jun"], wellbeing: [3.6,3.5,3.2,3.3,3.1,3.4], requests: [940,1012,1284,1150,1320,1098], participation: 74 },
    year:  { labels: ["T1 '25","T2 '25","T3 '25","T1 '26","T2 '26","T3 '26"], wellbeing: [3.4,3.3,3.5,3.5,3.3,3.4], requests: [3010,3420,2880,3260,3640,3120], participation: 71 }
  };
  var nationalPressures = [
    { label: "School work", value: 34, color: "#D3111C" },
    { label: "Exams", value: 22, color: "#E07B12" },
    { label: "Peer relationships", value: 17, color: "#0B4EA2" },
    { label: "Family", value: 13, color: "#7A4CC2" },
    { label: "Bullying", value: 9, color: "#0A8A43" },
    { label: "Other", value: 5, color: "#9AA3B5" }
  ];
  var regionDemand = REGIONS.map(function (r) {
    var list = schools.filter(function (s) { return s.region === r; });
    var req = list.reduce(function (a, s) { return a + s.requests; }, 0);
    var stu = list.reduce(function (a, s) { return a + s.students; }, 0);
    var c = list.reduce(function (a, s) { return a + s.counsellors; }, 0);
    return { region: r, requests: req, students: stu, counsellors: c, schools: list.length, ratio: Math.round(stu / c) };
  });
  var safeguarding = {
    categories: [
      { label: "Bullying (in person)", value: 128, color: "#D3111C" },
      { label: "Online behaviour", value: 96, color: "#0B4EA2" },
      { label: "Safety concern", value: 41, color: "#E07B12" },
      { label: "Harassment", value: 33, color: "#7A4CC2" },
      { label: "Concern about another student", value: 57, color: "#0A8A43" },
      { label: "Other", value: 19, color: "#9AA3B5" }
    ],
    response: { sameDay: 71, within3: 22, longer: 7 },
    monthly: [44, 51, 63, 58, 72, 86],
    months: ["Apr","May","Jun","Jul","Aug","Sep"]
  };

  window.PULSE_DATA = {
    MOODS: MOODS, PRESSURES: PRESSURES, REASONS: REASONS,
    student: student, RESOURCES: RESOURCES,
    requests: requests, alerts: alerts, students: students, threads: threads, referrals: referrals,
    schoolTrends: schoolTrends, pressureLabels: pressureLabels,
    REGIONS: REGIONS, schools: schools, national: national, nationalPressures: nationalPressures,
    regionDemand: regionDemand, safeguarding: safeguarding
  };
})();
