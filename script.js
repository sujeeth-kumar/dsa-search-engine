const form = document.getElementById("search-form");
const input = document.getElementById("query-input");
const resultsDiv = document.getElementById("results");
const spinner = document.getElementById("spinner");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = input.value.trim();
  if (!query) return;

  // Clear the search bar right after grabbing the value
  input.value = "";

  resultsDiv.innerHTML = "";
  spinner.classList.remove("hidden");

  try {
    const res = await fetch("/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const { results } = await res.json();

    spinner.classList.add("hidden");

    if (results.length === 0) {
      resultsDiv.innerHTML = `<p class="no-results">No matches found for "${query}".</p>`;
      return;
    }

    resultsDiv.innerHTML = results
      .map((r, i) => {
        return `
            <div class="card${i === 0 ? " featured" : ""}">
                <div class="card-header">
                    <img src="assets/logos/${r.platform.toLowerCase()}.png"
                        alt="${r.platform} logo"
                        class="platform-logo"/>
                    <a href="${r.url}" target="_blank" class="card-title">
                    [${r.platform}] ${r.title}
                    </a>
                </div>
            </div>
        `;
      })
      .join("");
  } catch (err) {
    spinner.classList.add("hidden");
    console.error(err);
    resultsDiv.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
  }
});

// --- Dark Mode Toggle Logic ---
// --- Dark Mode Default Toggle Logic ---
const themeToggle = document.getElementById("theme-toggle");

// Check for saved preference, default to dark mode if empty
const currentTheme = localStorage.getItem("theme") || "dark";

if (currentTheme === "light") {
  document.documentElement.setAttribute("data-theme", "light");
  themeToggle.textContent = "🌙"; // Show moon if they switched to light mode
} else {
  themeToggle.textContent = "☀️"; // Show sun by default for dark mode
}

themeToggle.addEventListener("click", () => {
  let theme = "dark";
  // If we are currently in dark mode (no light attribute), switch to light
  if (document.documentElement.getAttribute("data-theme") !== "light") {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggle.textContent = "🌙";
    theme = "light";
  } else {
    // Otherwise, strip the light attribute to revert back to default dark
    document.documentElement.removeAttribute("data-theme");
    themeToggle.textContent = "☀️";
  }
  localStorage.setItem("theme", theme);
});