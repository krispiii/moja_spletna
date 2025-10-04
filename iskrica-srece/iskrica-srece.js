function toggleAccordion(element) {
  const content = element.querySelector('.collaboration-steps-content');
  const arrow = element.querySelector('.keyboard-arrow-down');

  if (content.style.maxHeight) {
    content.style.maxHeight = null;
    arrow.classList.remove('rotate');
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
    arrow.classList.add('rotate');
  }
}

function toggleDropdown() {
  const dropdown = document.getElementById("projectsDropdownContent");
  dropdown.classList.toggle("show");
}


// Optional: Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('#projectsDropdownButton')) {
    const dropdown = document.getElementById("projectsDropdownContent");
    if (dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  }
}

function toggleMenu() {
    const links = document.getElementById("headerLinksMobile");
    links.classList.toggle("show");
}


// filepath: c:\Users\stepa\Documents\MOJ_spletna_stran\iskrica-srece\iskrica-srece.js
// ...existing code...

function toggleAccordion(el) {
  // Close others (optional). Remove this block if multiple open allowed.
  document.querySelectorAll('.drop-category-more.open').forEach(other => {
    if (other !== el) {
      other.classList.remove('open');
      other.setAttribute('aria-expanded', 'false');
    }
  });

  const isOpen = el.classList.toggle('open');
  el.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// If markup was loaded dynamically, you can also auto-bind (only needed if no inline onclick):
// document.querySelectorAll('.drop-category-more').forEach(item => {
//   item.addEventListener('click', () => toggleAccordion(item));
// });