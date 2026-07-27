const state = {
  query: "",
  category: "",
};

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function populateCategoryOptions() {
  const select = document.getElementById("category-filter");
  const cats = [...new Set(WORDS.map((w) => w.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "ja")
  );
  for (const cat of cats) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  }
}

function showScreen(id) {
  document.getElementById("screen-list").classList.toggle("hidden", id !== "list");
  document.getElementById("screen-detail").classList.toggle("hidden", id !== "detail");
  window.scrollTo(0, 0);
}

/* 画面遷移履歴(スマホの戻るボタン対応)
   画面切り替えのたびに履歴(History API)にエントリを積み、
   戻るボタン(popstate)ではアプリを閉じずに一覧画面へ戻す。 */
function applyState(screen, data) {
  if (screen === "detail") {
    const word = data && WORDS.find((w) => w.term === data.term);
    if (word) {
      renderWordDetail(word);
    } else {
      applyState("list");
    }
  } else {
    showScreen("list");
  }
}

function goTo(screen, data) {
  history.pushState({ screen, data: data || null }, "", "");
  applyState(screen, data);
}

window.addEventListener("popstate", (e) => {
  const s = e.state || { screen: "list" };
  applyState(s.screen, s.data);
});

function renderWordDetail(word) {
  document.getElementById("detail-term").textContent = word.term;

  const categoryEl = document.getElementById("detail-category");
  if (word.category) {
    categoryEl.textContent = word.category;
    categoryEl.classList.remove("hidden");
  } else {
    categoryEl.classList.add("hidden");
  }

  document.getElementById("detail-meaning").textContent = word.meaning;

  const relatedSection = document.getElementById("detail-related");
  const relatedList = document.getElementById("detail-related-list");
  relatedList.innerHTML = "";
  const related = word.category
    ? WORDS.filter((w) => w.category === word.category && w.term !== word.term)
    : [];
  if (related.length > 0) {
    relatedSection.classList.remove("hidden");
    for (const w of related) {
      relatedList.appendChild(buildWordItem(w));
    }
  } else {
    relatedSection.classList.add("hidden");
  }

  showScreen("detail");
}

function buildWordItem(w) {
  const div = document.createElement("div");
  div.className = "word-item";
  div.innerHTML = `
    <div class="word-term">${escapeHtml(w.term)}</div>
    <div class="word-category">${escapeHtml(w.category || "")}</div>
    <div class="word-meaning">${escapeHtml(w.meaning)}</div>
  `;
  div.addEventListener("click", () => goTo("detail", { term: w.term }));
  return div;
}

function render() {
  const listEl = document.getElementById("word-list");
  const query = state.query.trim().toLowerCase();

  const filtered = WORDS.filter((w) => {
    if (state.category && w.category !== state.category) return false;
    if (query && !w.term.toLowerCase().includes(query) && !w.meaning.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  }).slice().reverse();

  document.getElementById("word-count").textContent = `${filtered.length} / ${WORDS.length} 語を表示中`;

  listEl.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "該当する用語が見つかりませんでした。";
    listEl.appendChild(empty);
    return;
  }

  for (const w of filtered) {
    listEl.appendChild(buildWordItem(w));
  }
}

function init() {
  populateCategoryOptions();

  document.getElementById("search").addEventListener("input", (e) => {
    state.query = e.target.value;
    render();
  });

  document.getElementById("category-filter").addEventListener("change", (e) => {
    state.category = e.target.value;
    render();
  });

  document.getElementById("detail-back").addEventListener("click", (e) => {
    e.preventDefault();
    goTo("list");
  });

  render();
  history.replaceState({ screen: "list" }, "", "");
}

init();
