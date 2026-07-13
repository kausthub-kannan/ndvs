/**
 * NDVS — custom page enhancements
 *
 * 1. Initialises the Tamil ↔ Transliteration toggle widget on pasuram pages.
 * 2. Injects a "Join Community" Discord button into the nav tabs bar.
 *
 * Works with MkDocs Material instant navigation by subscribing to document$.
 */

/* ── Script toggle ────────────────────────────────────────────────────────── */

function initScriptToggles() {
  document.querySelectorAll(".ndvs-script-toggle").forEach(function (widget) {
    // Skip widgets already wired up
    if (widget.dataset.ndvsInit) return;
    widget.dataset.ndvsInit = "1";

    var tabs   = widget.querySelectorAll(".ndvs-script-tab");
    var panels = widget.querySelectorAll(".ndvs-script-panel");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.dataset.target;

        // Update tab active state
        tabs.forEach(function (t) {
          t.classList.toggle("ndvs-script-tab--active", t === tab);
        });

        // Show / hide panels
        panels.forEach(function (panel) {
          panel.classList.toggle("ndvs-hidden", panel.dataset.panel !== target);
        });
      });
    });
  });
}

/* ── Discord button ───────────────────────────────────────────────────────── */

/**
 * Injects a Discord "Join Community" button into the MkDocs Material tabs bar.
 * The button is appended to .md-tabs__inner so it sits at the far right via
 * margin-left: auto in CSS.  Runs once per DOM; safe to call on navigation.
 */
function initDiscordButton() {
  var tabsInner = document.querySelector(".md-tabs__inner");
  if (!tabsInner) return;                              // tabs bar not present
  if (tabsInner.querySelector(".ndvs-discord-btn")) return; // already injected

  var btn = document.createElement("a");
  btn.href    = "https://discord.gg/KZETg9bgu";
  btn.target  = "_blank";
  btn.rel     = "noopener noreferrer";
  btn.className = "ndvs-discord-btn";
  btn.setAttribute("aria-label", "Join the NDVS Community on Discord");

  // Discord SVG icon (official mark, simplified path)
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" '
          + 'fill="currentColor" aria-hidden="true">'
          + '<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 '
          + '0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 '
          + '0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 '
          + '19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 '
          + '18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 '
          + '0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 '
          + '13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 '
          + '0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 '
          + '0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 '
          + '12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 '
          + '1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 '
          + '0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>'
          + '</svg>';

  btn.innerHTML = svg + '<span>Join Community</span>';
  tabsInner.appendChild(btn);
}

/* ── Bootstrap ────────────────────────────────────────────────────────────── */

function init() {
  initScriptToggles();
  initDiscordButton();
}

// Initial load
document.addEventListener("DOMContentLoaded", init);

// MkDocs Material instant navigation re-renders page content via RxJS.
// document$ is the observable exposed by the theme — subscribe to re-init.
if (typeof document$ !== "undefined") {
  document$.subscribe(init);
}
