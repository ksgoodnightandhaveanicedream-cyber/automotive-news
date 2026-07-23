const READ_KEY = "news-app:read-urls";

const CATEGORIES = [
  { id: "news", label: "ニュース" },
  { id: "press_release", label: "ニュースリリース" },
];

// タブの表示順（ここに載っていないソースは末尾にアルファベット順で追加される）
const SOURCE_ORDER = {
  news: [
    "Car Watch",
    "日刊自動車新聞",
    "carview!",
    "webCG",
    "ベストカーWeb",
    "東洋経済オンライン",
  ],
  press_release: [
    "トヨタ自動車",
    "Honda",
    "日産自動車",
    "SUBARU",
    "マツダ",
    "スズキ",
    "Astemo",
  ],
};

const state = {
  articles: [],
  query: "",
  category: "news",
  source: "all",
};

function loadReadUrls() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function markAsRead(url) {
  const read = loadReadUrls();
  read.add(url);
  localStorage.setItem(READ_KEY, JSON.stringify([...read]));
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function render() {
  const listEl = document.getElementById("article-list");
  const template = document.getElementById("article-item-template");
  const readUrls = loadReadUrls();

  const query = state.query.trim().toLowerCase();
  const filtered = state.articles.filter((a) => {
    if ((a.category || "news") !== state.category) return false;
    if (state.source !== "all" && a.source !== state.source) return false;
    if (query && !a.title.toLowerCase().includes(query)) return false;
    return true;
  });

  listEl.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "該当する記事がありません。";
    listEl.appendChild(empty);
    return;
  }

  for (const article of filtered) {
    const node = template.content.cloneNode(true);
    const el = node.querySelector(".article");
    const titleEl = node.querySelector(".title");
    const sourceEl = node.querySelector(".source");
    const publishedEl = node.querySelector(".published");

    titleEl.textContent = article.title;
    titleEl.href = article.url;
    sourceEl.textContent = article.source;
    publishedEl.textContent = formatDate(article.published_at);

    if (readUrls.has(article.url)) {
      el.classList.add("is-read");
    }

    titleEl.addEventListener("click", () => {
      markAsRead(article.url);
      el.classList.add("is-read");
    });

    listEl.appendChild(node);
  }
}

function renderSourceTabs() {
  const tabsEl = document.getElementById("source-tabs");
  const order = SOURCE_ORDER[state.category] || [];
  const rank = (name) => {
    const i = order.indexOf(name);
    return i === -1 ? order.length : i;
  };
  const sources = [
    ...new Set(
      state.articles
        .filter((a) => (a.category || "news") === state.category)
        .map((a) => a.source)
    ),
  ].sort((a, b) => {
    const diff = rank(a) - rank(b);
    return diff !== 0 ? diff : a.localeCompare(b, "ja");
  });

  tabsEl.innerHTML = "";

  const makeTab = (label, value) => {
    const btn = document.createElement("button");
    btn.className = "source-tab" + (state.source === value ? " active" : "");
    btn.textContent = label;
    btn.dataset.source = value;
    btn.addEventListener("click", () => {
      state.source = value;
      tabsEl.querySelectorAll(".source-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
    return btn;
  };

  tabsEl.appendChild(makeTab("全て", "all"));
  for (const source of sources) {
    tabsEl.appendChild(makeTab(source, source));
  }
}

function renderCategoryTabs() {
  const tabsEl = document.getElementById("category-tabs");
  tabsEl.innerHTML = "";

  for (const category of CATEGORIES) {
    const btn = document.createElement("button");
    btn.className = "category-tab" + (state.category === category.id ? " active" : "");
    btn.textContent = category.label;
    btn.addEventListener("click", () => {
      if (state.category === category.id) return;
      state.category = category.id;
      state.source = "all";
      tabsEl.querySelectorAll(".category-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderSourceTabs();
      render();
    });
    tabsEl.appendChild(btn);
  }
}

function setupControls() {
  document.getElementById("search").addEventListener("input", (e) => {
    state.query = e.target.value;
    render();
  });
}

async function init() {
  setupControls();
  try {
    const res = await fetch("data/articles.json", { cache: "no-store" });
    const data = await res.json();
    state.articles = data.articles || [];
    document.getElementById("updated-at").textContent = `最終更新: ${formatDate(data.updated_at)}（${state.articles.length}件）`;
    renderCategoryTabs();
    renderSourceTabs();
  } catch (err) {
    document.getElementById("updated-at").textContent = "記事データの読み込みに失敗しました。";
    console.error(err);
  }
  render();
}

init();
