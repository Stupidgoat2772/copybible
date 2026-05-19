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
  const suggestions = document.getElementById("suggestions");
  const siteTitle = document.getElementById("site-title");

  // --- Book alias map ---
  const ALIASES = {
    "genesis": "Genesis", "gen": "Genesis", "ge": "Genesis", "gn": "Genesis",
    "exodus": "Exodus", "ex": "Exodus", "exod": "Exodus",
    "leviticus": "Leviticus", "lev": "Leviticus", "le": "Leviticus",
    "numbers": "Numbers", "num": "Numbers", "nu": "Numbers", "nm": "Numbers",
    "deuteronomy": "Deuteronomy", "deut": "Deuteronomy", "de": "Deuteronomy", "dt": "Deuteronomy",
    "joshua": "Joshua", "josh": "Joshua", "jos": "Joshua",
    "judges": "Judges", "judg": "Judges", "jdg": "Judges",
    "ruth": "Ruth", "ru": "Ruth", "rth": "Ruth",
    "1 samuel": "1 Samuel", "1samuel": "1 Samuel", "1sam": "1 Samuel", "1sa": "1 Samuel", "1s": "1 Samuel",
    "2 samuel": "2 Samuel", "2samuel": "2 Samuel", "2sam": "2 Samuel", "2sa": "2 Samuel", "2s": "2 Samuel",
    "1 kings": "1 Kings", "1kings": "1 Kings", "1ki": "1 Kings", "1k": "1 Kings", "1kgs": "1 Kings",
    "2 kings": "2 Kings", "2kings": "2 Kings", "2ki": "2 Kings", "2k": "2 Kings", "2kgs": "2 Kings",
    "1 chronicles": "1 Chronicles", "1chronicles": "1 Chronicles", "1chr": "1 Chronicles", "1ch": "1 Chronicles",
    "2 chronicles": "2 Chronicles", "2chronicles": "2 Chronicles", "2chr": "2 Chronicles", "2ch": "2 Chronicles",
    "ezra": "Ezra", "ezr": "Ezra",
    "nehemiah": "Nehemiah", "neh": "Nehemiah", "ne": "Nehemiah",
    "esther": "Esther", "est": "Esther", "es": "Esther",
    "job": "Job", "jb": "Job",
    "psalms": "Psalms", "psalm": "Psalms", "ps": "Psalms", "psa": "Psalms",
    "proverbs": "Proverbs", "prov": "Proverbs", "pro": "Proverbs", "pr": "Proverbs",
    "ecclesiastes": "Ecclesiastes", "ecc": "Ecclesiastes", "eccl": "Ecclesiastes", "ec": "Ecclesiastes",
    "song of solomon": "Song of Solomon", "song": "Song of Solomon", "sos": "Song of Solomon", "so": "Song of Solomon", "ss": "Song of Solomon",
    "isaiah": "Isaiah", "isa": "Isaiah", "is": "Isaiah",
    "jeremiah": "Jeremiah", "jer": "Jeremiah", "je": "Jeremiah",
    "lamentations": "Lamentations", "lam": "Lamentations", "la": "Lamentations",
    "ezekiel": "Ezekiel", "ezek": "Ezekiel", "eze": "Ezekiel",
    "daniel": "Daniel", "dan": "Daniel", "da": "Daniel",
    "hosea": "Hosea", "hos": "Hosea", "ho": "Hosea",
    "joel": "Joel", "joe": "Joel", "jl": "Joel",
    "amos": "Amos", "am": "Amos",
    "obadiah": "Obadiah", "obad": "Obadiah", "ob": "Obadiah",
    "jonah": "Jonah", "jon": "Jonah",
    "micah": "Micah", "mic": "Micah",
    "nahum": "Nahum", "nah": "Nahum", "na": "Nahum",
    "habakkuk": "Habakkuk", "hab": "Habakkuk",
    "zephaniah": "Zephaniah", "zeph": "Zephaniah", "zep": "Zephaniah",
    "haggai": "Haggai", "hag": "Haggai",
    "zechariah": "Zechariah", "zech": "Zechariah", "zec": "Zechariah",
    "malachi": "Malachi", "mal": "Malachi",
    "matthew": "Matthew", "matt": "Matthew", "mat": "Matthew", "mt": "Matthew",
    "mark": "Mark", "mk": "Mark", "mr": "Mark",
    "luke": "Luke", "lk": "Luke", "lu": "Luke",
    "john": "John", "jn": "John", "joh": "John",
    "acts": "Acts", "act": "Acts", "ac": "Acts",
    "romans": "Romans", "rom": "Romans", "ro": "Romans",
    "1 corinthians": "1 Corinthians", "1corinthians": "1 Corinthians", "1cor": "1 Corinthians", "1co": "1 Corinthians",
    "2 corinthians": "2 Corinthians", "2corinthians": "2 Corinthians", "2cor": "2 Corinthians", "2co": "2 Corinthians",
    "galatians": "Galatians", "gal": "Galatians", "ga": "Galatians",
    "ephesians": "Ephesians", "eph": "Ephesians",
    "philippians": "Philippians", "phil": "Philippians", "php": "Philippians",
    "colossians": "Colossians", "col": "Colossians",
    "1 thessalonians": "1 Thessalonians", "1thessalonians": "1 Thessalonians", "1thess": "1 Thessalonians", "1th": "1 Thessalonians",
    "2 thessalonians": "2 Thessalonians", "2thessalonians": "2 Thessalonians", "2thess": "2 Thessalonians", "2th": "2 Thessalonians",
    "1 timothy": "1 Timothy", "1timothy": "1 Timothy", "1tim": "1 Timothy", "1ti": "1 Timothy",
    "2 timothy": "2 Timothy", "2timothy": "2 Timothy", "2tim": "2 Timothy", "2ti": "2 Timothy",
    "titus": "Titus", "tit": "Titus", "ti": "Titus",
    "philemon": "Philemon", "phm": "Philemon", "philem": "Philemon",
    "hebrews": "Hebrews", "heb": "Hebrews",
    "james": "James", "jas": "James", "jm": "James",
    "1 peter": "1 Peter", "1peter": "1 Peter", "1pet": "1 Peter", "1pe": "1 Peter", "1p": "1 Peter",
    "2 peter": "2 Peter", "2peter": "2 Peter", "2pet": "2 Peter", "2pe": "2 Peter", "2p": "2 Peter",
    "1 john": "1 John", "1john": "1 John", "1jn": "1 John", "1j": "1 John",
    "2 john": "2 John", "2john": "2 John", "2jn": "2 John", "2j": "2 John",
    "3 john": "3 John", "3john": "3 John", "3jn": "3 John", "3j": "3 John",
    "jude": "Jude", "jud": "Jude",
    "revelation": "Revelation", "rev": "Revelation", "re": "Revelation",
  };

  function parseRef(input) {
    const raw = input.trim();
    if (!raw) return { book: null, chapter: null, verse: null, verseEnd: null, candidates: [] };

    // Match: optional digit + space + letters, then optional digit, then optional :digit(-digit)
    const m = raw.match(/^(\d?\s*[a-z]+)\s*(\d+)?(?:\s*:\s*(\d+)(?:\s*-\s*(\d+))?)?$/i);
    if (!m) {
      // Try just filtering book names by substring
      if (bible) {
        const lo = raw.toLowerCase();
        const cands = Object.keys(bible).filter((b) => b.toLowerCase().includes(lo));
        return { book: null, chapter: null, verse: null, verseEnd: null, candidates: cands };
      }
      return { book: null, chapter: null, verse: null, verseEnd: null, candidates: [] };
    }

    const bookPart = m[1].replace(/\s+/g, " ").trim().toLowerCase();
    const chapter = m[2] || null;
    const verse = m[3] || null;
    const verseEnd = m[4] || null;

    // Exact alias match first
    if (ALIASES[bookPart]) {
      return { book: ALIASES[bookPart], chapter, verse, verseEnd, candidates: [ALIASES[bookPart]] };
    }

    // Prefix match against alias keys — longest matching alias wins
    const matches = new Set();
    for (const [alias, book] of Object.entries(ALIASES)) {
      if (alias.startsWith(bookPart)) matches.add(book);
    }

    // Also prefix match against full book names
    if (bible) {
      for (const book of Object.keys(bible)) {
        if (book.toLowerCase().startsWith(bookPart)) matches.add(book);
      }
    }

    const candidates = [...matches];
    const book = candidates.length === 1 ? candidates[0] : null;

    return { book, chapter, verse, verseEnd, candidates };
  }

  let lastNavKey = ""; // debounce: avoid re-navigating to same state

  function handleSearch() {
    const parsed = parseRef(searchInput.value);
    renderSuggestions(parsed);

    // Don't auto-navigate while typing book name — wait for chapter/verse or Enter
    const navKey = `${parsed.book}|${parsed.chapter}|${parsed.verse}|${parsed.verseEnd}`;
    if (navKey === lastNavKey) return;

    if (parsed.book && parsed.chapter) {
      // Validate chapter exists
      if (!bible[parsed.book] || !bible[parsed.book][parsed.chapter]) return;

      lastNavKey = navKey;

      if (currentBook !== parsed.book || currentChapter !== parsed.chapter) {
        currentBook = parsed.book;
        openChapter(parsed.chapter);
      }

      if (parsed.verse) {
        const lo = parseInt(parsed.verse);
        const hi = parsed.verseEnd ? parseInt(parsed.verseEnd) : lo;
        // Validate verses exist
        if (!bible[parsed.book][parsed.chapter][String(lo)]) return;

        // Highlight + copy
        selStart = lo;
        selEnd = hi;
        highlightRange();
        copyVerses(lo, hi);

        const target = document.getElementById(`v-${lo}`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else if (!parsed.book && parsed.candidates.length > 0) {
      // Multiple candidates — filter book tiles
      lastNavKey = navKey;
      if (currentBook) {
        showBooks(searchInput.value.trim().toLowerCase());
      } else {
        showBooks(searchInput.value.trim().toLowerCase());
      }
    }
  }

  function renderSuggestions(parsed) {
    suggestions.innerHTML = "";

    if (!parsed.candidates.length && !parsed.book) return;

    if (parsed.book) {
      // Resolved — show the full reference
      const span = document.createElement("span");
      span.className = "suggestion-resolved";
      let text = parsed.book;
      if (parsed.chapter) text += ` ${parsed.chapter}`;
      if (parsed.verse) text += `:${parsed.verse}`;
      if (parsed.verseEnd) text += `-${parsed.verseEnd}`;
      span.textContent = text;
      suggestions.appendChild(span);
    } else {
      // Ambiguous — show pills
      const shown = parsed.candidates.slice(0, 12);
      shown.forEach((book) => {
        const pill = document.createElement("span");
        pill.className = "suggestion-pill";
        pill.textContent = book;
        pill.addEventListener("click", () => {
          searchInput.value = book + " ";
          searchInput.focus();
          selectBook(book);
          lastNavKey = "";
          handleSearch();
        });
        suggestions.appendChild(pill);
      });
      if (parsed.candidates.length > 12) {
        const more = document.createElement("span");
        more.className = "suggestion-pill";
        more.textContent = `+${parsed.candidates.length - 12} more`;
        more.style.opacity = "0.5";
        suggestions.appendChild(more);
      }
    }
  }

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
    suggestions.innerHTML = "";
    lastNavKey = "";
    showBooks();
  });

  // Search input — unified handler
  searchInput.addEventListener("input", () => {
    if (!bible) return;
    handleSearch();
  });

  // Enter key — navigate to resolved reference
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || !bible) return;
    const parsed = parseRef(searchInput.value);

    if (parsed.candidates.length === 1 && !parsed.book) {
      // Single candidate but not yet resolved — force it
      parsed.book = parsed.candidates[0];
    }

    if (!parsed.book) return;

    if (parsed.chapter && parsed.verse) {
      // Full ref — navigate + copy
      if (!bible[parsed.book][parsed.chapter]) return;
      currentBook = parsed.book;
      openChapter(parsed.chapter);
      const lo = parseInt(parsed.verse);
      const hi = parsed.verseEnd ? parseInt(parsed.verseEnd) : lo;
      if (!bible[parsed.book][parsed.chapter][String(lo)]) return;
      selStart = lo;
      selEnd = hi;
      highlightRange();
      copyVerses(lo, hi);
      const target = document.getElementById(`v-${lo}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (parsed.chapter) {
      currentBook = parsed.book;
      openChapter(parsed.chapter);
    } else {
      selectBook(parsed.book);
    }

    lastNavKey = "";
    renderSuggestions(parseRef(searchInput.value));
  });

  // --- Panels ---

  function showBooks(filter) {
    currentBook = null;
    currentChapter = null;
    clearSelection();
    chapterView.className = "";
    chapterView.innerHTML = "";
    grid.style.display = "";
    // search bar stays visible
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
    // search bar stays visible
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
    // search bar stays visible
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
