(() => {
  "use strict";

  const IMAGE_BASE = "https://dz3we2x72f7ol.cloudfront.net/expansions/pitch-black/en-us/KD5B_EN_";
  const SECTION_LABELS = { base: "Base cards", reverse: "Reverse holos", secret: "Secret rares" };
  const IS_EDITOR = document.body.dataset.mode === "editor";
  const filter = { section: "all", status: "all", query: "" };
  let cards = [];
  let slots = [];
  let counts = {};
  let editing = false;
  let updatedAt = null;
  let dirty = false;

  const $ = (selector) => document.querySelector(selector);

  function imageUrl(number) {
    return `${IMAGE_BASE}${Number(number)}.png`;
  }

  function fallbackImage(number, name) {
    const safeName = name.replace(/[<>&"']/g, "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 372 518"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#19102c"/><stop offset="1" stop-color="#392466"/></linearGradient></defs><rect width="372" height="518" rx="22" fill="url(#g)"/><circle cx="186" cy="215" r="72" fill="none" stroke="#a991ff" stroke-width="8" opacity=".5"/><path d="M112 215h148M186 141v148" stroke="#a991ff" stroke-width="8" opacity=".35"/><text x="186" y="350" text-anchor="middle" fill="#f4f0ff" font-family="system-ui" font-size="28" font-weight="700">${number}</text><text x="186" y="386" text-anchor="middle" fill="#c8baff" font-family="system-ui" font-size="18">${safeName}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function buildSlots() {
    const result = [];
    cards.forEach((card) => {
      if (Number(card.number) <= 84) {
        result.push({ ...card, key: `${card.number}-regular`, section: "base", variant: card.holo ? "Holo" : "" });
      }
    });
    cards.forEach((card) => {
      if (Number(card.number) <= 84 && card.reverse) {
        result.push({ ...card, key: `${card.number}-reverse`, section: "reverse", variant: "Reverse holo" });
      }
    });
    cards.forEach((card) => {
      if (Number(card.number) > 84) {
        result.push({ ...card, key: `${card.number}-regular`, section: "secret", variant: "" });
      }
    });
    return result;
  }

  function quantity(key) {
    return Number(counts[key] || 0);
  }

  function setQuantity(key, value) {
    if (!IS_EDITOR || !editing) return;
    const next = Math.max(0, Math.min(99, Number(value) || 0));
    if (next === 0) delete counts[key];
    else counts[key] = next;
    dirty = true;
    updateDownloadState();
    render();
  }

  function updateDownloadState() {
    const button = $("#download-button");
    if (!button) return;
    button.textContent = dirty ? "Download collection.json" : "Download collection.json";
  }

  function makeFilterGroup(target, options, field) {
    const parent = $(target);
    parent.replaceChildren(...options.map(([value, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter";
      button.textContent = label;
      button.dataset.value = value;
      button.setAttribute("aria-pressed", String(filter[field] === value));
      button.addEventListener("click", () => {
        filter[field] = value;
        parent.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.value === value)));
        render();
      });
      return button;
    }));
  }

  function matches(slot) {
    const owned = quantity(slot.key) > 0;
    const text = `${slot.number} ${slot.name}`.toLowerCase();
    return (filter.section === "all" || slot.section === filter.section)
      && (filter.status === "all" || (filter.status === "owned" ? owned : !owned))
      && (!filter.query || text.includes(filter.query));
  }

  function cardElement(slot) {
    const owned = quantity(slot.key) > 0;
    const article = document.createElement("article");
    article.className = `card ${owned ? "owned" : ""} ${slot.section === "reverse" ? "reverse" : ""}`;

    const imageWrap = document.createElement("div");
    imageWrap.className = "card__image-wrap";
    imageWrap.tabIndex = editing ? 0 : -1;
    imageWrap.setAttribute("role", editing ? "button" : "presentation");
    if (editing) imageWrap.setAttribute("aria-label", `Add one ${slot.name} ${slot.number}`);

    const image = document.createElement("img");
    image.className = "card__image";
    image.src = imageUrl(slot.number);
    image.alt = `${slot.name} ${slot.number}${slot.variant ? `, ${slot.variant}` : ""}`;
    image.width = 372;
    image.height = 518;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => { image.src = fallbackImage(slot.number, slot.name); }, { once: true });
    imageWrap.append(image);

    if (slot.variant) {
      const tag = document.createElement("span");
      tag.className = "variant-tag";
      tag.textContent = slot.variant;
      imageWrap.append(tag);
    }

    const badge = document.createElement("span");
    badge.className = "quantity-badge";
    badge.textContent = `×${quantity(slot.key)}`;
    imageWrap.append(badge);

    if (editing) {
      imageWrap.addEventListener("click", () => setQuantity(slot.key, quantity(slot.key) + 1));
      imageWrap.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setQuantity(slot.key, quantity(slot.key) + 1);
        }
      });
    }

    const caption = document.createElement("div");
    caption.className = "card__caption";
    caption.innerHTML = `<span class="card__number">${slot.number}</span><span class="card__name"></span>`;
    caption.querySelector(".card__name").textContent = slot.name;

    const rarity = document.createElement("div");
    rarity.className = "card__rarity";
    rarity.textContent = slot.rarity;

    const stepper = document.createElement("div");
    stepper.className = "stepper";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", `Remove one ${slot.name} ${slot.number}`);
    minus.addEventListener("click", () => setQuantity(slot.key, quantity(slot.key) - 1));
    const output = document.createElement("output");
    output.textContent = quantity(slot.key);
    output.setAttribute("aria-label", "Quantity owned");
    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", `Add one ${slot.name} ${slot.number}`);
    plus.addEventListener("click", () => setQuantity(slot.key, quantity(slot.key) + 1));
    stepper.append(minus, output, plus);

    article.append(imageWrap, caption, rarity, stepper);
    return article;
  }

  function statistics() {
    const result = {
      totalOwned: 0,
      copies: 0,
      unique: new Set(),
      sections: { base: 0, reverse: 0, secret: 0 },
      totals: { base: 0, reverse: 0, secret: 0 }
    };
    slots.forEach((slot) => {
      result.totals[slot.section] += 1;
      const value = quantity(slot.key);
      if (value > 0) {
        result.totalOwned += 1;
        result.copies += value;
        result.unique.add(slot.number);
        result.sections[slot.section] += 1;
      }
    });
    return result;
  }

  function renderProgress(stats) {
    const rows = [
      ["Master set", stats.totalOwned, slots.length],
      ["Base cards", stats.sections.base, stats.totals.base],
      ["Reverse holos", stats.sections.reverse, stats.totals.reverse],
      ["Secret rares", stats.sections.secret, stats.totals.secret]
    ];
    $("#progress-list").innerHTML = rows.map(([label, value, total]) => `
      <div class="progress-row">
        <span class="progress-row__label">${label}</span>
        <div class="progress-row__track"><div class="progress-row__fill" style="width:${total ? Math.round(value / total * 100) : 0}%"></div></div>
        <span class="progress-row__value">${value} / ${total}</span>
      </div>`).join("");
    $("#unique-count").textContent = stats.unique.size;
    $("#copy-count").textContent = stats.copies;
  }

  function render() {
    document.body.classList.toggle("editing", editing);
    const editDock = $("#edit-dock");
    const editButton = $("#edit-button");
    if (editDock) editDock.hidden = !editing;
    if (editButton) editButton.hidden = editing;

    const stats = statistics();
    renderProgress(stats);
    const visible = slots.filter(matches);
    const nodes = [];
    ["base", "reverse", "secret"].forEach((section) => {
      const sectionSlots = visible.filter((slot) => slot.section === section);
      if (!sectionSlots.length) return;
      const heading = document.createElement("div");
      heading.className = "section-heading";
      const title = document.createElement("h2");
      title.textContent = SECTION_LABELS[section];
      const meta = document.createElement("span");
      meta.textContent = `${stats.sections[section]} of ${stats.totals[section]} owned`;
      heading.append(title, meta);
      nodes.push(heading, ...sectionSlots.map(cardElement));
    });
    $("#card-grid").replaceChildren(...nodes);

    $("#empty-state").hidden = visible.length > 0;
    $("#result-count").textContent = `${visible.length} ${visible.length === 1 ? "slot" : "slots"}`;
    const filtered = filter.section !== "all" || filter.status !== "all" || filter.query;
    $("#clear-filters").hidden = !filtered;
  }

  function clearFilters() {
    filter.section = "all";
    filter.status = "all";
    filter.query = "";
    $("#search-input").value = "";
    document.querySelectorAll(".filter").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.value === "all"));
    });
    render();
  }

  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { element.hidden = true; }, 3800);
  }

  function downloadCollection() {
    const data = JSON.stringify({
      version: 1,
      collection: "pitch-black-me05",
      updatedAt: new Date().toISOString(),
      counts
    }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "collection.json";
    link.click();
    URL.revokeObjectURL(url);
    dirty = false;
    toast("collection.json downloaded. Upload it to the GitHub data folder.");
  }

  function loadCollectionFile(file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || data.collection !== "pitch-black-me05" || typeof data.counts !== "object") throw new Error("Invalid collection");
        counts = data.counts;
        updatedAt = data.updatedAt || null;
        dirty = false;
        render();
        toast("Collection file loaded.");
      } catch {
        toast("This is not a valid Pitch Black collection.json file.");
      }
    });
    reader.readAsText(file);
  }

  async function loadData() {
    const [cardsResponse, collectionResponse] = await Promise.all([
      fetch("data/cards.json"),
      fetch("data/collection.json", { cache: "no-store" })
    ]);
    if (!cardsResponse.ok) throw new Error("Unable to load card data");
    cards = await cardsResponse.json();
    slots = buildSlots();
    if (collectionResponse.ok) {
      const collection = await collectionResponse.json();
      if (collection && collection.collection === "pitch-black-me05" && typeof collection.counts === "object") {
        counts = collection.counts;
        updatedAt = collection.updatedAt || null;
      }
    }
  }

  async function start() {
    try {
      await loadData();
    } catch (error) {
      $("#card-grid").innerHTML = `<p class="empty-state">The collection could not be loaded. Please refresh the page.</p>`;
      console.error(error);
      return;
    }

    $("#hero-image").src = imageUrl("120");
    $("#hero-image").addEventListener("error", (event) => { event.currentTarget.src = fallbackImage("120", "Mega Darkrai ex"); }, { once: true });

    makeFilterGroup("#section-filters", [["all", "All"], ["base", "Base"], ["reverse", "Reverse"], ["secret", "Secret"]], "section");
    makeFilterGroup("#status-filters", [["all", "Any"], ["owned", "Owned"], ["missing", "Missing"]], "status");
    $("#search-input").addEventListener("input", (event) => {
      filter.query = event.target.value.trim().toLowerCase();
      render();
    });
    $("#clear-filters").addEventListener("click", clearFilters);
    $("#empty-clear").addEventListener("click", clearFilters);

    const syncStatus = $("#sync-status");
    if (syncStatus) {
      const time = updatedAt ? new Date(updatedAt).toLocaleString() : "not yet";
      syncStatus.textContent = IS_EDITOR
        ? `Editor draft · Published file updated ${time}`
        : `Public view · Updated ${time}`;
    }

    if (IS_EDITOR) {
      $("#edit-button").addEventListener("click", () => { editing = true; render(); });
      $("#done-button").addEventListener("click", () => { editing = false; render(); window.scrollTo({ top: $("#toolbar").offsetTop, behavior: "smooth" }); });
      $("#mark-visible").addEventListener("click", () => {
        slots.filter(matches).forEach((slot) => { if (quantity(slot.key) === 0) counts[slot.key] = 1; });
        dirty = true;
        render();
        toast("All shown cards marked as owned.");
      });
      $("#download-button").addEventListener("click", downloadCollection);
      $("#load-button").addEventListener("click", () => $("#load-file").click());
      $("#load-file").addEventListener("change", (event) => {
        const [file] = event.target.files;
        if (file) loadCollectionFile(file);
        event.target.value = "";
      });
    }
    render();
  }

  start();
})();
