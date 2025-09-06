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



// Minimal Tic Tac Toe: show "Win" if X or O wins, "Try again" if draw
// Draw a line (highlight) over the winning cells

document.addEventListener("DOMContentLoaded", () => {
  const board = document.querySelectorAll(".xo-cell");
  let xTurn = true;
  let gameActive = true;

  // Store the winning combination indices
  let lastWinCombo = null;

  function checkWin(current) {
    const winCombos = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (const combo of winCombos) {
      if (combo.every(idx => board[idx].textContent === current)) {
        lastWinCombo = combo;
        return true;
      }
    }
    lastWinCombo = null;
    return false;
  }

  function checkDraw() {
    return [...board].every(cell => cell.textContent);
  }

  function highlightWin() {
    if (lastWinCombo) {
      lastWinCombo.forEach(idx => {
        board[idx].style.background =  "var(--brand-400-primary)"; // Highlight color for win
      });
    }
  }

  function resetBoard() {
    setTimeout(() => {
      board.forEach(cell => {
        cell.textContent = "";
        cell.style.background = "#fff";
        cell.classList.remove("xo-x", "xo-o");
      });
      xTurn = true;
      gameActive = true;
      lastWinCombo = null;
    }, 1000);
  }

  function handleClick(e) {
    if (!gameActive || e.target.textContent) return;
    e.target.textContent = xTurn ? "X" : "O";
    e.target.classList.remove("xo-x", "xo-o");
    e.target.classList.add(xTurn ? "xo-x" : "xo-o");
    if (checkWin(xTurn ? "X" : "O")) {
      highlightWin();
      showMessage("Win");
      gameActive = false;
      resetBoard();
    } else if (checkDraw()) {
      showMessage("Try again");
      gameActive = false;
      resetBoard();
    } else {
      xTurn = !xTurn;
    }
  }

  function showMessage(msg) {
    let msgDiv = document.getElementById("xo-message");
    if (!msgDiv) {
      msgDiv = document.createElement("div");
      msgDiv.id = "xo-message";
      document.body.appendChild(msgDiv);
      msgDiv.style.position = "fixed";
      msgDiv.style.top = "50%";
      msgDiv.style.left = "50%";
      msgDiv.style.transform = "translate(-50%, -50%)";
      msgDiv.style.background = "#222";
      msgDiv.style.color = "#fff";
      msgDiv.style.padding = "1rem 2rem";
      msgDiv.style.borderRadius = "8px";
      msgDiv.style.fontSize = "1.5rem";
      msgDiv.style.zIndex = "9999";
      msgDiv.style.boxShadow = "0 2px 16px rgba(0,0,0,0.2)";
    }
    msgDiv.textContent = msg;
    msgDiv.style.display = "block";
    setTimeout(() => {
      msgDiv.style.display = "none";
    }, 900);
  }

  board.forEach(cell => cell.addEventListener("click", handleClick));
});

// ...existing code...
document.addEventListener("DOMContentLoaded", () => {
  // Existing Tic Tac Toe setup stays (do not remove)
  // (Your existing DOMContentLoaded block is already here)

  // AFTER your current logic finishes, trigger animations next frame:
  requestAnimationFrame(() => {
    document.body.classList.add('anim-start');
  });
});


