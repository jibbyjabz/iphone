/* My Pocket — a tiny offline-first PWA. All data lives on this device
   (localStorage). No accounts, no servers, no tracking. */

const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
};

let transactions = store.get("pocket.tx", []);   // {id, type:'in'|'out', label, amount, date}
let tasks = store.get("pocket.tasks", []);        // {id, label, done}

const $ = (sel) => document.querySelector(sel);
const money = (n) =>
  (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------- Navigation ---------- */
function go(page) {
  document.querySelectorAll(".page").forEach((p) => (p.hidden = p.dataset.page !== page));
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.go === page));
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => go(t.dataset.go)));

/* ---------- Finances ---------- */
let txType = "out";
document.querySelectorAll(".seg-btn").forEach((b) =>
  b.addEventListener("click", () => {
    txType = b.dataset.type;
    document.querySelectorAll(".seg-btn").forEach((x) => x.classList.toggle("active", x === b));
  })
);

$("#tx-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const label = $("#tx-label").value.trim();
  const amount = parseFloat($("#tx-amount").value);
  if (!label || !(amount > 0)) return;
  transactions.unshift({ id: uid(), type: txType, label, amount, date: Date.now() });
  store.set("pocket.tx", transactions);
  e.target.reset();
  $("#tx-label").focus();
  renderFinances();
  renderHome();
});

function totals() {
  let income = 0, expense = 0;
  for (const t of transactions) (t.type === "in" ? (income += t.amount) : (expense += t.amount));
  return { income, expense, net: income - expense };
}

function renderFinances() {
  const { net } = totals();
  $("#fin-balance").textContent = money(net);
  const list = $("#tx-list");
  list.innerHTML = "";
  $("#tx-empty").hidden = transactions.length > 0;

  for (const t of transactions) {
    const li = document.createElement("li");
    const when = new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    li.innerHTML = `
      <div class="li-main">
        <div class="li-title"></div>
        <div class="li-sub">${when}</div>
      </div>
      <span class="amount ${t.type}">${t.type === "in" ? "+" : "-"}${money(t.amount).replace("-", "")}</span>
      <button class="del" aria-label="Delete">&times;</button>`;
    li.querySelector(".li-title").textContent = t.label;
    li.querySelector(".del").addEventListener("click", () => {
      transactions = transactions.filter((x) => x.id !== t.id);
      store.set("pocket.tx", transactions);
      renderFinances();
      renderHome();
    });
    list.appendChild(li);
  }
}

/* ---------- Work ---------- */
$("#task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const label = $("#task-label").value.trim();
  if (!label) return;
  tasks.unshift({ id: uid(), label, done: false });
  store.set("pocket.tasks", tasks);
  e.target.reset();
  $("#task-label").focus();
  renderTasks();
  renderHome();
});

function renderTasks() {
  const list = $("#task-list");
  list.innerHTML = "";
  $("#task-empty").hidden = tasks.length > 0;

  for (const t of tasks) {
    const li = document.createElement("li");
    if (t.done) li.classList.add("done");
    li.innerHTML = `
      <button class="check ${t.done ? "done" : ""}" aria-label="Toggle"></button>
      <div class="li-main"><div class="li-title"></div></div>
      <button class="del" aria-label="Delete">&times;</button>`;
    li.querySelector(".li-title").textContent = t.label;
    li.querySelector(".check").addEventListener("click", () => {
      t.done = !t.done;
      store.set("pocket.tasks", tasks);
      renderTasks();
      renderHome();
    });
    li.querySelector(".del").addEventListener("click", () => {
      tasks = tasks.filter((x) => x.id !== t.id);
      store.set("pocket.tasks", tasks);
      renderTasks();
      renderHome();
    });
    list.appendChild(li);
  }
}

/* ---------- Home ---------- */
function renderHome() {
  const { income, expense, net } = totals();
  $("#home-balance").textContent = money(net);
  $("#home-in").textContent = money(income);
  $("#home-out").textContent = money(expense);

  const open = tasks.filter((t) => !t.done).length;
  const done = tasks.length - open;
  $("#home-tasks").textContent = `${open} open task${open === 1 ? "" : "s"}`;
  $("#home-done").textContent = `${done} done`;

  const h = new Date().getHours();
  $("#greeting").textContent = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* ---------- Boot ---------- */
renderHome();
renderFinances();
renderTasks();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
