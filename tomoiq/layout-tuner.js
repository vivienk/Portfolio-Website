(() => {
  const query = new URLSearchParams(window.location.search);
  if (query.get("layout-editor") !== "1") return;

  const storageKey = "vivien-tomoiq-layout-tuner-v2";
  const breakpoint = window.matchMedia("(max-width: 700px)");
  const targets = [
    ["hero-title", "TomoIQ title", "#tomo-role-title"],
    ["hero-summary", "TomoIQ summary", ".caseSummary"],
    ["process-nav", "Process navigation", ".roleDisciplines"],
    ["research-title", "Research title", "#research-title"],
    ["research-evidence", "Research evidence cards", ".researchSourceGrid"],
    ["strategy-title", "Strategy title", "#strategy-title"],
    ["positioning-banner", "Positioning direction", ".positioningBanner"],
    ["decision-title", "Product decision", "#decision-title"],
    ["system-title", "How TomoIQ works", "#how-title"],
    ["system-architecture", "System architecture", ".systemArchitecture"],
    ["journey-title", "Experience architecture title", "#journey-title"],
    ["journey-controls", "Journey controls", ".journeyControls"],
    ["prototype-title", "Prototype title", "#prototype-title"],
    ["prototype-video", "Prototype video", ".prototypeVideo"],
    ["phone-gallery", "Phone gallery", ".phoneGallery"],
    ["process-title", "Building the system title", "#process-title"],
    ["dialogue-trace", "Dialogue decision trace", ".dialogueTrace"],
    ["evaluation-title", "Evaluation strategy title", "#evaluation-title"],
    ["evaluation-loop", "Regression loop", ".evaluationLoop"],
    ["impact-title", "Impact title", "#impact-title"],
    ["impact-grid", "Impact cards", ".evidenceGrid"],
  ].map(([key, label, selector]) => ({ key, label, selector, node: document.querySelector(selector) })).filter(({ node }) => node);

  const blankState = () => ({ desktop: {}, mobile: {} });
  const loadState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      return { desktop: saved?.desktop || {}, mobile: saved?.mobile || {} };
    } catch { return blankState(); }
  };
  let offsets = loadState();
  let selectedKey = targets[0]?.key;
  let drag = null;
  const getMode = () => breakpoint.matches ? "mobile" : "desktop";
  const getOffset = (key) => ({ x: 0, y: 0, ...(offsets[getMode()][key] || {}) });
  const save = () => localStorage.setItem(storageKey, JSON.stringify(offsets));

  const style = document.createElement("style");
  style.id = "layout-tuner-offsets";
  document.head.append(style);
  document.documentElement.classList.add("layout-editor-active");

  const editor = document.createElement("aside");
  editor.className = "layoutTuner";
  editor.setAttribute("aria-label", "TomoIQ layout editor");
  editor.innerHTML = `<div class="layoutTunerHeader"><div><p class="layoutTunerEyebrow">Private layout editor</p><h2>Position tuner</h2></div><button class="layoutTunerClose" type="button" data-layout-close>Close</button></div><p class="layoutTunerStatus" data-layout-status></p><label>Element<select data-layout-select aria-label="Editable element"></select></label><div class="layoutAxisGrid"><label>X position<input data-layout-x type="number" step="1" inputmode="numeric" aria-label="X position in pixels"></label><label>Y position<input data-layout-y type="number" step="1" inputmode="numeric" aria-label="Y position in pixels"></label></div><div class="layoutNudges" aria-label="Position nudges"><button type="button" data-layout-nudge="x:-8">X −8</button><button type="button" data-layout-nudge="x:8">X +8</button><button type="button" data-layout-nudge="y:-8">Y −8</button><button type="button" data-layout-nudge="y:8">Y +8</button></div><div class="layoutTunerActions"><button type="button" data-layout-reset>Reset selected</button><button type="button" data-layout-reset-all>Reset all</button><button type="button" data-layout-copy>Copy CSS</button></div><p class="layoutTunerHint">Click an outlined area to select it. Drag on desktop, or use the X / Y fields. Values are saved only in this browser.</p>`;
  document.body.append(editor);

  const select = editor.querySelector("[data-layout-select]");
  const inputX = editor.querySelector("[data-layout-x]");
  const inputY = editor.querySelector("[data-layout-y]");
  const status = editor.querySelector("[data-layout-status]");
  targets.forEach(({ key, label }) => {
    const option = document.createElement("option");
    option.value = key; option.textContent = label; select.append(option);
  });

  const cssFor = (mode, key, offset) => {
    const target = targets.find((item) => item.key === key);
    if (!target || (!offset.x && !offset.y)) return "";
    return `.layout-editor-active .tomoIqPage ${target.selector}{transform:translate(${offset.x}px,${offset.y}px)}`;
  };
  const renderOffsets = () => {
    const desktop = Object.entries(offsets.desktop).map(([key, offset]) => cssFor("desktop", key, offset)).filter(Boolean).join("");
    const mobile = Object.entries(offsets.mobile).map(([key, offset]) => cssFor("mobile", key, offset)).filter(Boolean).join("");
    style.textContent = `${desktop ? `@media(min-width:701px){${desktop}}` : ""}${mobile ? `@media(max-width:700px){${mobile}}` : ""}`;
  };
  const updateInputs = () => {
    const offset = getOffset(selectedKey);
    inputX.value = String(offset.x); inputY.value = String(offset.y);
    select.value = selectedKey;
    status.textContent = `Editing ${getMode()} values for ${targets.find((item) => item.key === selectedKey)?.label || "this element"}.`;
    targets.forEach(({ key, node }) => node.classList.toggle("isLayoutSelected", key === selectedKey));
  };
  const selectTarget = (key) => { selectedKey = key; updateInputs(); };
  const setOffset = (partial) => {
    if (!selectedKey) return;
    const current = getOffset(selectedKey);
    offsets[getMode()][selectedKey] = { ...current, ...partial };
    save(); renderOffsets(); updateInputs();
  };
  const exportCss = () => {
    const makeRules = (mode) => Object.entries(offsets[mode]).map(([key, offset]) => {
      const target = targets.find((item) => item.key === key);
      if (!target || (!offset.x && !offset.y)) return "";
      return `.tomoIqPage ${target.selector}{transform:translate(${offset.x}px,${offset.y}px)}`;
    }).filter(Boolean).join("\n");
    const desktop = makeRules("desktop"); const mobile = makeRules("mobile");
    return `/* TomoIQ layout adjustments */\n${desktop || "/* No desktop adjustments */"}${mobile ? `\n\n@media (max-width: 700px) {\n${mobile.split("\n").map((rule) => `  ${rule}`).join("\n")}\n}` : ""}`;
  };

  select.addEventListener("change", () => selectTarget(select.value));
  [[inputX, "x"], [inputY, "y"]].forEach(([input, axis]) => input.addEventListener("input", () => {
    if (input.value === "") return;
    const value = Number(input.value);
    if (Number.isFinite(value)) setOffset({ [axis]: value });
  }));
  editor.querySelectorAll("[data-layout-nudge]").forEach((button) => button.addEventListener("click", () => {
    const [axis, amount] = button.dataset.layoutNudge.split(":");
    const current = getOffset(selectedKey);
    setOffset({ [axis]: current[axis] + Number(amount) });
  }));
  editor.querySelector("[data-layout-reset]").addEventListener("click", () => {
    delete offsets[getMode()][selectedKey]; save(); renderOffsets(); updateInputs();
  });
  editor.querySelector("[data-layout-reset-all]").addEventListener("click", () => {
    offsets = blankState(); save(); renderOffsets(); updateInputs();
  });
  editor.querySelector("[data-layout-copy]").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(exportCss()); status.textContent = "CSS copied. Send it to me when you want the adjustments made permanent."; }
    catch { status.textContent = "Copy was unavailable. Your adjustments are still saved in this browser."; }
  });
  editor.querySelector("[data-layout-close]").addEventListener("click", () => {
    style.remove(); editor.remove(); document.documentElement.classList.remove("layout-editor-active");
    const url = new URL(window.location.href); url.searchParams.delete("layout-editor"); history.replaceState({}, "", url);
  });

  targets.forEach(({ key, node }) => {
    node.dataset.layoutKey = key;
    node.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); selectTarget(key); });
    node.addEventListener("pointerdown", (event) => {
      selectTarget(key);
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag = { key, x: event.clientX, y: event.clientY };
      node.setPointerCapture(event.pointerId);
    });
    node.addEventListener("pointermove", (event) => {
      if (!drag || drag.key !== key) return;
      const x = Math.round(event.clientX - drag.x); const y = Math.round(event.clientY - drag.y);
      if (!x && !y) return;
      const current = getOffset(key); setOffset({ x: current.x + x, y: current.y + y });
      drag = { ...drag, x: event.clientX, y: event.clientY };
    });
    const endDrag = () => { drag = null; };
    node.addEventListener("pointerup", endDrag); node.addEventListener("pointercancel", endDrag);
  });
  breakpoint.addEventListener("change", updateInputs);
  renderOffsets(); updateInputs();
})();
