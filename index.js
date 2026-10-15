// Home page behaviour: Project Overview toggle and media loading states.
// (Header/footer behaviour lives in global/site-chrome.js.)

document.addEventListener("DOMContentLoaded", () => {
  // Project Overview: first four cases; "Show more" reveals the rest. One-way:
  // once clicked the button goes away and there is no "Show less".
  const caseList = document.getElementById("case-list");
  const caseToggle = document.querySelector(".case-toggle");
  const VISIBLE_CASES = 4;

  if (caseList && caseToggle && caseList.children.length > VISIBLE_CASES) {
    caseList.setAttribute("data-collapsed", "");
    caseToggle.hidden = false;

    caseToggle.addEventListener("click", () => {
      caseList.removeAttribute("data-collapsed");
      caseToggle.setAttribute("aria-expanded", "true");
      caseToggle.hidden = true;
      // The button is gone; hand focus to the first newly revealed project.
      caseList.children[VISIBLE_CASES].querySelector("a, button")?.focus({ preventScroll: true });
    }, { once: true });
  }

  // Media frames: shimmer while loading, fallback text if the image fails.
  document.querySelectorAll(".media-frame").forEach((frame) => {
    const img = frame.querySelector("img");
    if (!img) return;
    const done = () => frame.classList.add(img.naturalWidth ? "is-loaded" : "is-error");
    if (img.complete) done();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", () => frame.classList.add("is-error"), { once: true });
    }
  });
});
