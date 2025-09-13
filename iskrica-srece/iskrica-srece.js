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