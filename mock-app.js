/* ==========================================================
   Tiny Daily Habits - Phase 1 UI Prototype (mock data only)
   This file stands in for JavaScript.html + google.script.run for the
   purpose of a browsable, no-deployment-needed preview. The production
   app (backend/JavaScript.html) talks to real Apps Script functions with
   the exact same shapes used here.
   ========================================================== */

var PILLARS_CLIENT = [
  { code: 'Move', label: 'Move Daily', emoji: '\uD83D\uDEB6', color: '#3b82f6' },
  { code: 'EatSmart', label: 'Eat Smart', emoji: '\uD83E\uDD57', color: '#22c55e' },
  { code: 'Hydrate', label: 'Hydrate Well', emoji: '\uD83D\uDCA7', color: '#06b6d4' },
  { code: 'Sleep', label: 'Sleep to Recover', emoji: '\uD83D\uDE34', color: '#8b5cf6' },
  { code: 'Stress', label: 'Manage Stress', emoji: '\uD83E\uDDD8', color: '#f59e0b' },
  { code: 'Eyes', label: 'Eyes / Screen Health', emoji: '\uD83D\uDC41\uFE0F', color: '#ec4899' }
];

var MOCK_LIBRARY = [
  { Category: 'Move', 'Habit Name': 'Stretch for 60 seconds after a call', 'Habit Description': 'Stand up and stretch right after you hang up.' },
  { Category: 'Move', 'Habit Name': 'Take one flight of stairs', 'Habit Description': 'Skip the lift for just one floor.' },
  { Category: 'Hydrate', 'Habit Name': 'Drink water before coffee', 'Habit Description': 'One glass of water before your first cup of coffee.' },
  { Category: 'Hydrate', 'Habit Name': 'Refill water bottle before meetings', 'Habit Description': 'Top up your bottle right before you walk in.' },
  { Category: 'EatSmart', 'Habit Name': 'Add one fruit to breakfast', 'Habit Description': 'Just one piece of fruit alongside breakfast.' },
  { Category: 'Sleep', 'Habit Name': 'Stop screens 20 minutes before bed', 'Habit Description': 'Put the phone down 20 minutes before sleep.' },
  { Category: 'Stress', 'Habit Name': 'Three slow breaths before a meeting', 'Habit Description': 'Pause and breathe before you join.' },
  { Category: 'Eyes', 'Habit Name': 'Follow the 20-20-20 rule', 'Habit Description': 'Every 20 minutes, look 20 feet away for 20 seconds.' }
];

var mockState = {
  hasHabit: true,
  habit: { habitId: 'HAB-000001', name: 'Drink one glass of water before my first coffee', category: 'Hydrate', categoryLabel: 'Hydrate Well', categoryEmoji: '\uD83D\uDCA7', startDate: '2026-07-19' },
  todayCompleted: false,
  currentStreak: 7,
  longestStreak: 12,
  daysCompleted: 21,
  encouragement: "One week! Your tiny habit is becoming a routine."
};

var APP = { currentView: 'home', selectedPillar: null, selectedHabitName: null, selectedHabitDescription: null, selectedEnergy: null, dayDetailModal: null };

document.addEventListener('DOMContentLoaded', function () {
  APP.dayDetailModal = new bootstrap.Modal(document.getElementById('dayDetailModal'));
  applyTheme('light');
  wireNav();
  wireHome();
  wireOnboarding();
  wireLibrary();
  wireBuddy();
  wireSettingsToggles();

  document.getElementById('loadingOverlay').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
  document.getElementById('orgNameBadge').textContent = 'Prototype Preview - Mock Data';
  document.getElementById('disclaimerNote').textContent = 'This application is intended for general wellbeing and habit-building purposes. It does not provide medical advice, diagnosis or treatment. Individual health needs and recommendations may vary.';
  document.getElementById('greetingText').textContent = greetingFor('Priti Panadi');
  document.getElementById('greetingDate').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  document.getElementById('adminNavLink').style.display = 'flex';
  document.getElementById('adminMoreLink').style.display = 'flex';

  renderHome();
  renderPillarMiniList('homePillarMiniList');
});

function applyTheme(t) { document.body.setAttribute('data-theme', t); }
function greetingFor(name) {
  var hour = new Date().getHours();
  var part = hour < 12 ? 'Good morning' : (hour < 17 ? 'Good afternoon' : 'Good evening');
  return part + ', ' + name + ' \uD83D\uDC4B';
}

function wireNav() {
  document.querySelectorAll('[data-view]').forEach(function (el) {
    el.addEventListener('click', function () {
      var view = el.getAttribute('data-view');
      if (view === 'more') { new bootstrap.Offcanvas(document.getElementById('moreOffcanvas')).show(); return; }
      switchView(view);
      if (el.getAttribute('data-close-more')) bootstrap.Offcanvas.getInstance(document.getElementById('moreOffcanvas')).hide();
    });
  });
  document.querySelectorAll('[data-view-link]').forEach(function (el) {
    el.addEventListener('click', function () { switchView(el.getAttribute('data-view-link')); });
  });
}

function switchView(view) {
  document.querySelectorAll('.view-section').forEach(function (el) { el.classList.remove('active'); });
  document.getElementById('view-' + view).classList.add('active');
  document.querySelectorAll('.sidebar .nav-link, .bottom-nav .nav-item').forEach(function (el) {
    el.classList.toggle('active', el.getAttribute('data-view') === view);
  });
  APP.currentView = view;
  if (view === 'library') loadHabitLibrary();
  if (view === 'calendar') loadCalendar();
  if (view === 'progress') loadProgress();
  if (view === 'buddy') loadBuddy();
  if (view === 'achievements') loadAchievements();
  if (view === 'profile') loadProfile();
  if (view === 'admin') loadAdmin();
}

function wireSettingsToggles() {
  function toggle() { applyTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); }
  document.getElementById('themeToggleLink').addEventListener('click', toggle);
  document.getElementById('themeToggleLinkMobile').addEventListener('click', toggle);
}

/* ---------------- Home ---------------- */

function wireHome() {
  document.getElementById('didItBtn').addEventListener('click', openCheckin);
  document.getElementById('notYetBtn').addEventListener('click', function () { document.getElementById('checkinBox').style.display = 'none'; });
  document.getElementById('checkinSaveBtn').addEventListener('click', submitCheckin);
}

function renderHome() {
  document.getElementById('homePillarLabel').textContent = mockState.habit.categoryLabel;
  document.getElementById('homeHabitEmoji').textContent = mockState.habit.categoryEmoji;
  document.getElementById('homeHabitName').textContent = mockState.habit.name;
  document.getElementById('homeCurrentStreak').textContent = mockState.currentStreak;
  document.getElementById('homeLongestStreak').textContent = mockState.longestStreak;
  document.getElementById('homeDaysCompleted').textContent = mockState.daysCompleted + '/30';
  var pct = Math.min(100, Math.round((mockState.daysCompleted / 30) * 100));
  document.getElementById('homePercentLabel').textContent = pct + '%';
  document.getElementById('homeProgressFill').style.width = pct + '%';
  document.getElementById('homeEncouragementText').textContent = mockState.encouragement;

  var didItBtn = document.getElementById('didItBtn'), notYetBtn = document.getElementById('notYetBtn'), doneMsg = document.getElementById('doneMessage');
  if (mockState.todayCompleted) {
    didItBtn.style.display = 'none'; notYetBtn.style.display = 'none'; doneMsg.style.display = 'block';
  } else {
    didItBtn.style.display = 'inline-block'; notYetBtn.style.display = 'inline-block'; doneMsg.style.display = 'none';
  }
}

function openCheckin() {
  document.getElementById('checkinBox').style.display = 'block';
  var row = document.getElementById('energyStarsRow'); row.innerHTML = '';
  APP.selectedEnergy = null;
  for (var i = 1; i <= 5; i++) {
    var star = document.createElement('span');
    star.textContent = '\u2606';
    star.style.cssText = 'font-size:1.6rem;cursor:pointer;color:var(--text-muted);';
    star.dataset.value = i;
    star.addEventListener('click', function () {
      APP.selectedEnergy = Number(this.dataset.value);
      Array.prototype.forEach.call(row.children, function (s) { s.textContent = Number(s.dataset.value) <= APP.selectedEnergy ? '\u2B50' : '\u2606'; });
    });
    row.appendChild(star);
  }
}

function submitCheckin() {
  mockState.todayCompleted = true;
  mockState.currentStreak += 1;
  mockState.longestStreak = Math.max(mockState.longestStreak, mockState.currentStreak);
  mockState.daysCompleted += 1;
  document.getElementById('checkinBox').style.display = 'none';
  renderHome();
  if (mockState.currentStreak === 7) setTimeout(function () { alert('New badge earned: \uD83D\uDD25 7-Day Streak'); }, 200);
}

function renderPillarMiniList(targetId) {
  var mock = { Move: 80, EatSmart: 70, Hydrate: 90, Sleep: 75, Stress: 85, Eyes: 60 };
  var el = document.getElementById(targetId);
  el.innerHTML = PILLARS_CLIENT.map(function (p) {
    return '<div class="pillar-row">' +
      '<span class="pillar-emoji">' + p.emoji + '</span>' +
      '<span class="pillar-label">' + p.label + '</span>' +
      '<span class="pillar-bar"><div class="progress-track"><div class="progress-fill" style="width:' + mock[p.code] + '%; background:' + p.color + ';"></div></div></span>' +
      '<span class="pillar-pct">' + mock[p.code] + '%</span></div>';
  }).join('');
}

/* ---------------- Onboarding (preview only) ---------------- */

function wireOnboarding() {
  document.getElementById('onboardStartBtn').addEventListener('click', function () {
    document.getElementById('onboardStep0').style.display = 'none';
    document.getElementById('onboardStep1').style.display = 'block';
    var grid = document.getElementById('pillarChoiceGrid');
    grid.innerHTML = PILLARS_CLIENT.map(function (p) { return '<div class="choice-card" data-pillar="' + p.code + '"><div class="choice-emoji">' + p.emoji + '</div><div class="choice-label">' + p.label + '</div></div>'; }).join('');
    grid.querySelectorAll('.choice-card').forEach(function (c) {
      c.addEventListener('click', function () {
        grid.querySelectorAll('.choice-card').forEach(function (x) { x.classList.remove('selected'); });
        c.classList.add('selected');
        document.getElementById('onboardToStep2Btn').disabled = false;
      });
    });
  });
  document.getElementById('onboardToStep2Btn').addEventListener('click', function () {
    document.getElementById('onboardStep1').style.display = 'none';
    document.getElementById('onboardStep2').style.display = 'block';
    var list = document.getElementById('habitOptionsList');
    list.innerHTML = MOCK_LIBRARY.slice(0, 4).map(function (h) { return '<div class="habit-option"><b>' + h['Habit Name'] + '</b><div class="text-muted small">' + h['Habit Description'] + '</div></div>'; }).join('');
    list.querySelectorAll('.habit-option').forEach(function (o) {
      o.addEventListener('click', function () {
        list.querySelectorAll('.habit-option').forEach(function (x) { x.classList.remove('selected'); });
        o.classList.add('selected');
        document.getElementById('onboardToStep3Btn').disabled = false;
      });
    });
  });
  document.getElementById('onboardToStep3Btn').addEventListener('click', function () {
    document.getElementById('onboardStep2').style.display = 'none';
    document.getElementById('onboardStep3').style.display = 'block';
    document.getElementById('onboardBuddySelect').innerHTML = '<option value="">No buddy for now</option><option>Amit Patel - Engineering</option><option>Neha Shah - Engineering</option>';
  });
  document.getElementById('onboardToStep4Btn').addEventListener('click', function () {
    document.getElementById('onboardStep3').style.display = 'none';
    document.getElementById('onboardStep4').style.display = 'block';
    document.getElementById('onboardStartDate').value = new Date().toISOString().slice(0, 10);
  });
  document.getElementById('onboardFinishBtn').addEventListener('click', function () {
    switchView('home');
  });
  document.getElementById('customHabitToggleBtn').addEventListener('click', function () {
    var box = document.getElementById('customHabitBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    document.getElementById('onboardToStep3Btn').disabled = false;
  });
}

/* ---------------- Habit Library ---------------- */

function wireLibrary() {
  document.getElementById('librarySearchInput').addEventListener('input', renderLibraryResults);
  document.getElementById('addNewHabitBtn').addEventListener('click', function () { alert('New habit added! (prototype only)'); });
}
var librarySelectedPillar = '';
function loadHabitLibrary() {
  document.getElementById('libraryPillarFilters').innerHTML =
    '<span class="badge rounded-pill" style="cursor:pointer;background:var(--accent-soft);color:var(--accent);" data-pillar="">All</span> ' +
    PILLARS_CLIENT.map(function (p) { return '<span class="badge rounded-pill" style="cursor:pointer;background:var(--accent-soft);color:var(--accent);" data-pillar="' + p.code + '">' + p.emoji + ' ' + p.label + '</span>'; }).join(' ');
  document.querySelectorAll('#libraryPillarFilters .badge').forEach(function (b) { b.addEventListener('click', function () { librarySelectedPillar = b.getAttribute('data-pillar'); renderLibraryResults(); }); });
  renderLibraryResults();
}
function renderLibraryResults() {
  var q = document.getElementById('librarySearchInput').value.toLowerCase();
  var filtered = MOCK_LIBRARY.filter(function (h) {
    var mp = !librarySelectedPillar || h.Category === librarySelectedPillar;
    var ms = !q || (h['Habit Name'] + h['Habit Description']).toLowerCase().indexOf(q) !== -1;
    return mp && ms;
  });
  document.getElementById('libraryResultsList').innerHTML = filtered.map(function (h) {
    return '<div class="habit-option"><b>' + h['Habit Name'] + '</b><div class="text-muted small">' + h['Habit Description'] + '</div></div>';
  }).join('') || '<p class="text-muted small">No matching habits.</p>';
}

/* ---------------- Calendar ---------------- */

function loadCalendar() {
  document.getElementById('calendarHabitName').textContent = mockState.habit.name;
  var days = [];
  for (var i = 1; i <= 30; i++) {
    var status = i <= 21 ? (Math.random() > 0.15 ? 'completed' : 'missed') : (i === 22 ? 'today' : 'future');
    if (i > 22) status = 'future';
    if (i === 22) status = 'today';
    days.push({ dayNumber: i, date: '2026-0' + (7 + Math.floor(i / 30)) + '-' + (i < 10 ? '0' + i : i), status: status, energyScore: status === 'completed' ? (3 + Math.floor(Math.random() * 3)) : null, note: status === 'completed' && Math.random() > 0.6 ? 'Felt good today.' : '' });
  }
  document.getElementById('calendarGrid').innerHTML = days.map(function (d) {
    var icon = d.status === 'completed' ? '\u2713' : (d.status === 'missed' ? '\u2715' : d.dayNumber);
    return '<div class="cal-day ' + d.status + '" data-idx="' + (d.dayNumber - 1) + '">' + icon + '</div>';
  }).join('');
  document.querySelectorAll('#calendarGrid .cal-day').forEach(function (el, idx) {
    el.addEventListener('click', function () { showDayDetail(days[idx]); });
  });
}
function showDayDetail(d) {
  document.getElementById('dayDetailTitle').textContent = 'Day ' + d.dayNumber + ' - ' + d.date;
  var label = { completed: 'Completed \u2713', missed: 'Missed', today: 'Today', future: 'Upcoming' }[d.status];
  document.getElementById('dayDetailBody').innerHTML = '<p><b>Status:</b> ' + label + '</p>' +
    (d.energyScore ? '<p><b>Energy:</b> ' + '\u2B50'.repeat(d.energyScore) + '</p>' : '') +
    (d.note ? '<p><b>Note:</b> ' + d.note + '</p>' : '<p class="text-muted small">No note for this day.</p>');
  APP.dayDetailModal.show();
}

/* ---------------- Progress ---------------- */

var weeklyChartInstance = null, monthlyChartInstance = null, adminChartInstance = null;
function loadProgress() {
  document.getElementById('weekCompletion').textContent = '6/7';
  document.getElementById('weekPercent').textContent = '86%';
  document.getElementById('weekEnergy').textContent = '4.1/5';
  var ctx = document.getElementById('weeklyChart').getContext('2d');
  if (weeklyChartInstance) weeklyChartInstance.destroy();
  weeklyChartInstance = new Chart(ctx, { type: 'bar', data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ data: [1, 1, 0, 1, 1, 1, 1], backgroundColor: '#6b615f', borderRadius: 6 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { display: false, max: 1 } } } });

  document.getElementById('monthCompleted').textContent = '21';
  document.getElementById('monthLongest').textContent = '12';
  document.getElementById('monthEnergy').textContent = '4.0/5';
  var ctx2 = document.getElementById('monthlyTrendChart').getContext('2d');
  if (monthlyChartInstance) monthlyChartInstance.destroy();
  monthlyChartInstance = new Chart(ctx2, { type: 'line', data: { labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], datasets: [{ data: [60, 71, 86, 90], borderColor: '#b98356', tension: .35, fill: false }] }, options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } } });

  renderPillarMiniList('progressPillarList');
}

/* ---------------- Buddy ---------------- */

function wireBuddy() {
  document.getElementById('setBuddyBtn').addEventListener('click', function () { loadBuddy(); });
  document.getElementById('sendEncouragementBtn').addEventListener('click', function () {
    document.getElementById('buddyMessageInput').value = '';
    alert('Sent! \uD83C\uDF89 (prototype only)');
  });
}
function loadBuddy() {
  document.getElementById('buddyHasBuddyBox').style.display = 'block';
  document.getElementById('buddyNoBuddyBox').style.display = 'none';
  document.getElementById('buddyName').textContent = 'Amit Patel';
  document.getElementById('buddyDepartment').textContent = 'Engineering';
  document.getElementById('buddyStreakValue').textContent = '4';
  document.getElementById('buddyPillarEmoji').textContent = '\uD83D\uDC41\uFE0F';
  document.getElementById('buddyPillarLabel').textContent = 'Eyes / Screen Health';
}

/* ---------------- Achievements ---------------- */

function loadAchievements() {
  var badges = [
    { emoji: '\uD83C\uDF31', name: 'First Step', earned: true, earnedDate: '19-Jul-2026' },
    { emoji: '\uD83D\uDD25', name: '3-Day Momentum', earned: true, earnedDate: '22-Jul-2026' },
    { emoji: '\uD83D\uDD25', name: '7-Day Streak', earned: true, earnedDate: '26-Jul-2026' },
    { emoji: '\uD83D\uDD25', name: '14-Day Streak', earned: false },
    { emoji: '\uD83C\uDFC6', name: '30-Day Journey', earned: false }
  ];
  document.getElementById('achievementsGrid').innerHTML = badges.map(function (b) {
    return '<div class="badge-tile ' + (b.earned ? '' : 'locked') + '"><div class="badge-emoji">' + b.emoji + '</div><div class="badge-name">' + b.name + '</div>' +
      (b.earned ? '<div class="text-muted" style="font-size:.65rem;">' + b.earnedDate + '</div>' : '') + '</div>';
  }).join('');
}

/* ---------------- Profile ---------------- */

function loadProfile() {
  document.getElementById('profileName').textContent = 'Priti Panadi';
  document.getElementById('profileMeta').textContent = 'Per \u00B7 Secretary';
  document.getElementById('profileDisclaimer').textContent = document.getElementById('disclaimerNote').textContent;
  document.getElementById('profileHabitsList').innerHTML =
    '<div class="habit-option" style="cursor:default;"><b>\uD83D\uDCA7 Drink one glass of water before my first coffee</b><div class="text-muted small">Started 19-Jul-2026</div></div>';
}

/* ---------------- Admin ---------------- */

function loadAdmin() {
  document.getElementById('adminTotalEmployees').textContent = '128';
  document.getElementById('adminRegistered').textContent = '96';
  document.getElementById('adminActiveParticipants').textContent = '71';
  document.getElementById('adminParticipationPct').textContent = '74%';
  document.getElementById('adminDailyActive').textContent = '52';
  document.getElementById('adminWeeklyActive').textContent = '68';
  document.getElementById('adminMonthlyActive').textContent = '71';
  document.getElementById('adminAvgCompletion').textContent = '81%';
  var ctx = document.getElementById('adminPillarChart').getContext('2d');
  if (adminChartInstance) adminChartInstance.destroy();
  adminChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels: PILLARS_CLIENT.map(function (p) { return p.emoji + ' ' + p.label; }), datasets: [{ data: [18, 14, 22, 9, 12, 16], backgroundColor: '#6b615f', borderRadius: 6 }] },
    options: { plugins: { legend: { display: false } }, indexAxis: 'y' }
  });
}
