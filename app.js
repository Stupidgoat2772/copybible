(() => {
  "use strict";

  let bible = null;
  let currentBook = null;
  let currentChapter = null;

  // Selection state
  let selecting = false;
  let selStart = null;
  let selEnd = null;
  let scrollRAF = null;

  const SCROLL_ZONE = 60; // px from edge to trigger auto-scroll
  const SCROLL_SPEED = 8; // px per frame

  const grid = document.getElementById("grid");
  const chapterView = document.getElementById("chapter-view");
  const breadcrumb = document.getElementById("breadcrumb");
  const searchInput = document.getElementById("search");
  const siteTitle = document.getElementById("site-title");

  // Load Bible data
  fetch("kjv.json")
    .then((r) => r.json())
    .then((data) => {
      bible = data;
      showBooks();
    });

  // Reset on title click
  siteTitle.addEventListener("click", () => {
    currentBook = null;
    currentChapter = null;
    searchInput.value = "";
    showBooks();
  });

  // Search filter
  searchInput.addEventListener("input", () => {
    if (currentBook) return;
    showBooks(searchInput.value.trim().toLowerCase());
  });

  // --- Panels ---

  function showBooks(filter) {
    currentBook = null;
    currentChapter = null;
    clearSelection();
    chapterView.className = "";
    chapterView.innerHTML = "";
    grid.style.display = "";
    searchInput.parentElement.style.display = "";
    grid.className = "tile-grid";
    breadcrumb.innerHTML = "";
    grid.innerHTML = "";

    const books = Object.keys(bible);
    const filtered = filter
      ? books.filter((b) => b.toLowerCase().includes(filter))
      : books;

    filtered.forEach((book) => {
      const tile = makeTile(book);
      tile.addEventListener("click", () => selectBook(book));
      grid.appendChild(tile);
    });
  }

  function selectBook(book) {
    currentBook = book;
    currentChapter = null;
    clearSelection();
    chapterView.className = "";
    chapterView.innerHTML = "";
    grid.style.display = "";
    searchInput.parentElement.style.display = "none";
    grid.className = "tile-grid numbers";
    grid.innerHTML = "";

    updateBreadcrumb();

    const chapters = Object.keys(bible[book]);
    chapters.forEach((ch) => {
      const tile = makeTile(ch);
      tile.addEventListener("click", () => openChapter(ch));
      grid.appendChild(tile);
    });
  }

  function openChapter(chapter) {
    currentChapter = chapter;
    clearSelection();
    grid.style.display = "none";
    searchInput.parentElement.style.display = "none";
    chapterView.innerHTML = "";
    chapterView.className = "active";

    updateBreadcrumb();

    const verses = bible[currentBook][chapter];
    const keys = Object.keys(verses);

    // Verse number tiles at top
    const tileBar = document.createElement("div");
    tileBar.className = "tile-grid numbers verse-tiles";
    keys.forEach((v) => {
      const tile = makeTile(v);
      tile.dataset.versetile = v;
      tile.addEventListener("click", () => jumpToVerse(v));
      tileBar.appendChild(tile);
    });
    chapterView.appendChild(tileBar);

    // Spacer
    const spacer = document.createElement("div");
    spacer.style.height = "1rem";
    chapterView.appendChild(spacer);

    // Full verse list
    const verseList = document.createElement("div");
    verseList.id = "verse-list";

    keys.forEach((v) => {
      const row = document.createElement("div");
      row.className = "verse-row";
      row.dataset.verse = v;
      row.id = `v-${v}`;

      const num = document.createElement("span");
      num.className = "verse-num";
      num.textContent = v;

      const body = document.createElement("span");
      body.className = "verse-body";
      body.textContent = verses[v];

      row.appendChild(num);
      row.appendChild(body);
      verseList.appendChild(row);
    });

    chapterView.appendChild(verseList);

    // Drag selection listeners on the verse list
    verseList.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function jumpToVerse(v) {
    // Clear any existing highlight
    const rows = chapterView.querySelectorAll(".verse-row");
    rows.forEach((r) => r.classList.remove("jumped"));

    const target = document.getElementById(`v-${v}`);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("jumped");

    // Also highlight the tile
    const tiles = chapterView.querySelectorAll("[data-versetile]");
    tiles.forEach((t) => t.classList.toggle("tile-active", t.dataset.versetile === v));

    setTimeout(() => {
      target.classList.remove("jumped");
      tiles.forEach((t) => t.classList.remove("tile-active"));
    }, 2000);
  }

  // --- Copy verses (single or range) ---

  function copyVerses(lo, hi) {
    const verses = bible[currentBook][currentChapter];
    const lines = [];
    for (let i = lo; i <= hi; i++) {
      const key = String(i);
      if (verses[key]) lines.push(verses[key]);
    }

    const ref =
      lo === hi
        ? `${currentBook} ${currentChapter}:${lo}`
        : `${currentBook} ${currentChapter}:${lo}-${hi}`;

    const out = `\u201c${lines.join(" ")}\u201d \u2014 ${ref}`;

    navigator.clipboard.writeText(out).then(() => {
      showToast(ref);
      setTimeout(() => clearSelection(), 1200);
    });
  }

  function showToast(ref) {
    // Remove existing toast
    const old = document.getElementById("toast");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.id = "toast";
    toast.textContent = `Copied ${ref}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 1200);
  }

  // --- Range selection via drag ---

  function onMouseDown(e) {
    const row = e.target.closest(".verse-row");
    if (!row || e.target.closest(".copy-inline")) return;

    e.preventDefault();
    selecting = true;
    selStart = parseInt(row.dataset.verse);
    selEnd = selStart;
    highlightRange();
  }

  function onMouseMove(e) {
    if (!selecting) return;
    e.preventDefault();

    // Find verse under cursor
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el) {
      const row = el.closest(".verse-row");
      if (row) {
        selEnd = parseInt(row.dataset.verse);
        highlightRange();
      }
    }

    // Auto-scroll near edges
    autoScroll(e.clientY);
  }

  function onMouseUp(e) {
    if (!selecting) return;
    selecting = false;
    stopAutoScroll();

    const lo = Math.min(selStart, selEnd);
    const hi = Math.max(selStart, selEnd);

    copyVerses(lo, hi);
  }

  function highlightRange() {
    const lo = Math.min(selStart, selEnd);
    const hi = Math.max(selStart, selEnd);
    const rows = chapterView.querySelectorAll(".verse-row");

    rows.forEach((row) => {
      const v = parseInt(row.dataset.verse);
      const inRange = v >= lo && v <= hi;
      row.classList.toggle("selected", inRange);
      row.classList.toggle("sel-first", inRange && v === lo);
      row.classList.toggle("sel-last", inRange && v === hi);
    });

    // Hide inline copy buttons during multi-select drag
    if (lo !== hi) {
      chapterView.classList.add("dragging");
    }
  }

  function clearSelection() {
    selecting = false;
    selStart = null;
    selEnd = null;
    stopAutoScroll();

    const rows = chapterView.querySelectorAll(".verse-row");
    rows.forEach((r) => r.classList.remove("selected", "sel-first", "sel-last"));
    chapterView.classList.remove("dragging");
  }

  // --- Auto-scroll ---

  function autoScroll(clientY) {
    stopAutoScroll();
    const vh = window.innerHeight;

    let dir = 0;
    if (clientY > vh - SCROLL_ZONE) dir = 1;
    else if (clientY < SCROLL_ZONE) dir = -1;

    if (dir === 0) return;

    function step() {
      window.scrollBy(0, dir * SCROLL_SPEED);
      scrollRAF = requestAnimationFrame(step);
    }
    scrollRAF = requestAnimationFrame(step);
  }

  function stopAutoScroll() {
    if (scrollRAF) {
      cancelAnimationFrame(scrollRAF);
      scrollRAF = null;
    }
  }


  // Click anywhere outside chapter view to clear selection
  document.addEventListener("mousedown", (e) => {
    if (
      selStart !== null &&
      !e.target.closest("#chapter-view") &&
      !e.target.closest("#range-bar")
    ) {
      clearSelection();
    }
  });

  // --- Breadcrumb ---

  function updateBreadcrumb() {
    breadcrumb.innerHTML = "";

    if (currentBook) {
      const bookSpan = document.createElement("span");
      bookSpan.textContent = currentBook;
      bookSpan.addEventListener("click", () => showBooks());
      breadcrumb.appendChild(bookSpan);
    }

    if (currentChapter) {
      breadcrumb.appendChild(document.createTextNode(" > "));
      const chSpan = document.createElement("span");
      chSpan.textContent = `Chapter ${currentChapter}`;
      chSpan.addEventListener("click", () => selectBook(currentBook));
      breadcrumb.appendChild(chSpan);
    }
  }

  // --- Tile factory ---

  function makeTile(label) {
    const div = document.createElement("div");
    div.className = "tile";
    div.textContent = label;
    return div;
  }
})();
