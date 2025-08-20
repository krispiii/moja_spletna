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
