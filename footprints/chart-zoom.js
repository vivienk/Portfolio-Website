(() => {
  const charts = [
    { key: "tUVyL9FCbCZaCGqsDm02kLwbxMA", full: "/assets/075e2a68bfe7eda0-tUVyL9FCbCZaCGqsDm02kLwbxMA.png", label: "Tour experience flowchart" },
    { key: "aL6vE1WqXVxwsks7YlTDciar07E", full: "/assets/5a64ab92e0ee1a34-aL6vE1WqXVxwsks7YlTDciar07E.png", label: "Creator experience flowchart" }
  ];
  const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5m0-5 7 7m6-7h5v5m0-5-7 7M3 16v5h5m-5 0 7-7m11 2v5h-5m5 0-7-7"/></svg>';
  const minimizeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3v6H3m0 0 7-7m5 19v-6h6m0 0-7 7M3 15h6v6m0 0-7-7m19-5h-6V3m0 0 7 7"/></svg>';
  const dialog = document.createElement("dialog");
  dialog.className = "footprints-flow-dialog";
  dialog.setAttribute("aria-label", "Enlarged flowchart");
  dialog.innerHTML = `<button type="button" class="footprints-flow-dialog-close" aria-label="Minimize flowchart" title="Minimize flowchart">${minimizeIcon}</button><div class="footprints-flow-dialog-viewport" role="region" aria-label="Zoomed flowchart; drag or scroll horizontally to explore" tabindex="0"><img alt="" draggable="false"></div>`;
  document.body.append(dialog);
  const viewport = dialog.querySelector(".footprints-flow-dialog-viewport");
  const enlarged = dialog.querySelector("img");
  const close = dialog.querySelector("button");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const easing = "cubic-bezier(0.23, 1, 0.32, 1)";
  let dialogAnimation = null;
  let closing = false;

  function minimize() {
    if (!dialog.open || closing) return;
    closing = true;
    dialog.dataset.closing = "";
    const current = getComputedStyle(dialog);
    const from = { opacity: current.opacity, transform: current.transform };
    dialogAnimation?.cancel();
    dialogAnimation = dialog.animate(
      [from, { opacity: 0, transform: reducedMotion.matches ? "none" : "scale(0.96)" }],
      { duration: reducedMotion.matches ? 160 : 250, easing, fill: "forwards" }
    );
    dialogAnimation.finished.then(() => dialog.close()).catch(() => {});
  }
  close.addEventListener("click", minimize);
  dialog.addEventListener("click", event => { if (event.target === dialog) minimize(); });
  dialog.addEventListener("cancel", event => { event.preventDefault(); minimize(); });
  dialog.addEventListener("close", () => {
    dialogAnimation?.cancel();
    dialogAnimation = null;
    closing = false;
    delete dialog.dataset.closing;
    enlarged.removeAttribute("src");
  });

  function sizeZoomedChart() {
    if (!dialog.open) return;
    const padding = 32;
    const aspectRatio = 2035 / 662;
    const dialogWidth = Math.min(window.innerWidth - 24, 1280, (window.innerHeight - 56) * aspectRatio / 1.5 + padding);
    dialog.style.width = `${dialogWidth}px`;
    enlarged.style.width = `${(dialogWidth - padding) * 1.5}px`;
  }
  window.addEventListener("resize", sizeZoomedChart);

  let drag = null;
  viewport.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch") return;
    drag = { id: event.pointerId, x: event.clientX, scrollLeft: viewport.scrollLeft };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.id) return;
    viewport.scrollLeft = drag.scrollLeft - (event.clientX - drag.x);
  });
  const endDrag = event => { if (drag?.id === event.pointerId) drag = null; };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("dragstart", event => event.preventDefault());

  function open(chart) {
    enlarged.src = chart.full;
    enlarged.alt = chart.label;
    dialog.setAttribute("aria-label", chart.label);
    if (!dialog.open) dialog.showModal();
    sizeZoomedChart();
    viewport.scrollLeft = 0;
    dialogAnimation?.cancel();
    dialogAnimation = dialog.animate(
      [
        { opacity: 0, transform: reducedMotion.matches ? "none" : "scale(0.96)" },
        { opacity: 1, transform: "none" }
      ],
      { duration: reducedMotion.matches ? 160 : 250, easing }
    );
  }

  function attach() {
    document.querySelectorAll('img[srcset*="tUVyL9FCbCZaCGqsDm02kLwbxMA"], img[srcset*="aL6vE1WqXVxwsks7YlTDciar07E"]').forEach(img => {
      const chart = charts.find(item => img.srcset.includes(item.key));
      const wrapper = img.closest('[data-framer-background-image-wrapper]');
      if (!chart || !wrapper || wrapper.querySelector(".footprints-flow-zoom-button")) return;
      img.alt = chart.label;
      img.classList.add("footprints-flow-zoom-target");
      img.addEventListener("click", () => open(chart));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "footprints-flow-zoom-button";
      button.setAttribute("aria-label", `Enlarge ${chart.label}`);
      button.title = `Enlarge ${chart.label}`;
      button.innerHTML = icon;
      button.addEventListener("click", event => { event.stopPropagation(); open(chart); });
      wrapper.append(button);
    });
  }

  attach();
  const observer = new MutationObserver(attach);
  observer.observe(document.body, { childList: true, subtree: true });
})();
