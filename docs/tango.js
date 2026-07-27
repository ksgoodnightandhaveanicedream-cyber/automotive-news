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
    const div = document.createElement("div");
    div.className = "word-item";
    div.innerHTML = `
      <div class="word-term">${escapeHtml(w.term)}</div>
      <div class="word-category">${escapeHtml(w.category || "")}</div>
      <div class="word-meaning">${escapeHtml(w.meaning)}</div>
    `;
    listEl.appendChild(div);
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

  render();
}

init();
