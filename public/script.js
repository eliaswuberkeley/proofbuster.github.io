// Predefined list of conjectures
let conjectures = [];
let filteredConjectures = [];
let selectedConjecture = "";

// Load conjectures from the JSON file
fetch("problems.json")
  .then((response) => response.json())
  .then((data) => {
    conjectures = data;
    populateDropdown(conjectures, true);
  })
  .catch((error) => console.error("Error loading JSON:", error));

// Populate the dropdown with all conjectures
function populateDropdown(conjecturesToShow, deselect = false) {
  const dropdown = document.getElementById("conjectureDropdown");
  dropdown.innerHTML = ""; // Clear existing options

  if (deselect) {
    const placeholderOption = document.createElement("option");
    placeholderOption.textContent = "Choose a conjecture...";
    placeholderOption.value = ""; // Empty value for placeholder
    placeholderOption.disabled = true; // Disable selection of the placeholder
    placeholderOption.selected = true; // Set as default selected option
    dropdown.appendChild(placeholderOption);
  }
  // Populate with filtered or all conjectures
  conjecturesToShow.forEach((conjectureObj, index) => {
    const option = document.createElement("option");
    option.value = index;
    // Set the text content as: "index. conjecture text"
    option.textContent = `${index + 1}. ${conjectureObj.conjecture}`;
    dropdown.appendChild(option);
  });
}

// Apply filters and return filtered conjectures
function applyFilters() {
  const selectedDifficulties = Array.from(
    document.querySelectorAll('input[name="difficulty"]:checked'),
  ).map((input) => input.value);
  const selectedTags = Array.from(
    document.querySelectorAll('input[name="tags"]:checked'),
  ).map((input) => input.value);

  // Filter the conjectures
  filteredConjectures = conjectures.filter((conjecture) => {
    const matchesDifficulty =
      selectedDifficulties.length === 0 ||
      selectedDifficulties.includes(conjecture.difficulty);
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => conjecture.tags.includes(tag));
    return matchesDifficulty && matchesTags;
  });

  // Repopulate the dropdown with the filtered results
  populateDropdown(filteredConjectures, true);
}

document.getElementById("filterButton").addEventListener("click", function () {
  const filterDropdown = document.getElementById("filterDropdown");
  filterDropdown.style.display =
    filterDropdown.style.display === "none" ? "block" : "none";

  // Apply the filters and repopulate the dropdown
  applyFilters();
});

document.getElementById("customButton").addEventListener("click", function () {
  const filterDropdown = document.getElementById("customDropdown");
  filterDropdown.style.display =
    filterDropdown.style.display === "none" ? "block" : "none";

  // Apply the filters and repopulate the dropdown
  applyFilters();
});

// Handle dropdown selection
document
  .getElementById("conjectureDropdown")
  .addEventListener("change", function () {
    const selectedIndex = this.value;
    selectedConjecture = conjectures[selectedIndex];
    document.getElementById("output").textContent =
      `${parseInt(selectedIndex) + 1}. ${selectedConjecture.conjecture}`;
    showProofButtons();
  });

// Show the feedback and check proof buttons
function showProofButtons() {
  document.getElementById("giveFeedback").style.display = "inline";
  document.getElementById("checkProof").style.display = "inline";
}

function showProofButtons() {
  document.getElementById("giveFeedback").style.display = "inline";
  document.getElementById("checkProof").style.display = "inline";
}

// Generate a random conjecture based on filters
document
  .getElementById("generateConjecture")
  .addEventListener("click", function () {
    applyFilters(); // Ensure filters are applied
    if (filteredConjectures.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * filteredConjectures.length,
      );
      selectedConjecture = filteredConjectures[randomIndex];
      document.getElementById("output").textContent =
        `${parseInt(randomIndex) + 1}. ${selectedConjecture.conjecture}`;
      showProofButtons();
    } else {
      document.getElementById("output").textContent =
        "No conjectures match the selected filters.";
    }
  });

document
  .getElementById("giveFeedback")
  .addEventListener("click", async function () {
    document.getElementById("outputbox").textContent = "...";
    const proof = document.getElementById("textbox").value;

    // Send the conjecture and proof to the server for feedback (not full solution)
    const response = await fetch("/give-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conjecture: selectedConjecture["conjecture"],
        proof: proof,
      }),
    });
    const data = await response.json();
    document.getElementById("outputbox").innerHTML = data.feedback;
  });

// Check the proof with full AI solution
document
  .getElementById("checkProof")
  .addEventListener("click", async function () {
    document.getElementById("outputbox").textContent = "...";
    const proof = document.getElementById("textbox").value;

    // Send both the conjecture and proof to the server for AI full solution
    const response = await fetch("/check-proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conjecture: selectedConjecture, proof: proof }),
    });
    const data = await response.json();
    if (data.generatedText.trim() == "YES") {
      document.getElementById("outputbox").textContent = `✅ Correct!`;
    } else {
      document.getElementById("outputbox").textContent = `❌ Incorrect!`;
    }
  });

document
  .getElementById("generateCustom")
  .addEventListener("click", async function () {
    document.getElementById("outputbox").textContent = "...";
    const conjecture = document.getElementById("customTextbox").value;

    // Send the conjecture and proof to the server for feedback (not full solution)
    const response = await fetch("/check-custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conjecture: conjecture,
      }),
    });
    const data = await response.json();
    if (data.generatedText.trim() == "YES") {
      document.getElementById("outputbox").textContent =
        "Conjecture confirmed.";
      selectedConjecture = { conjecture: conjecture };
      document.getElementById("output").textContent =
        `Custom: ${selectedConjecture.conjecture}`;
      showProofButtons();
    } else {
      document.getElementById("outputbox").textContent =
        `Custom conjecture is either not a conjecture or is not a valid conjecture.`;
    }
  });
