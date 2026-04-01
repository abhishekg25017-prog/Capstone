const container = document.getElementById("container");
const searchInput = document.getElementById("search");
const loader = document.getElementById("loader");

let charactersData = [];

async function fetchCharacters() {
  showLoader(true);

  try {
    const res = await fetch("https://anapioficeandfire.com/api/characters?pageSize=50");
    const data = await res.json();

    charactersData = data;
    displayCharacters(data);

  } catch (error) {
    container.innerHTML = "<p>Something went wrong</p>";
  }

  showLoader(false);
}

function displayCharacters(data) {
  container.innerHTML = "";

  data.map(char => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${char.name || "Unknown"}</h3>
      <p><strong>Gender:</strong> ${char.gender}</p>
      <p><strong>Culture:</strong> ${char.culture || "N/A"}</p>
      <p><strong>Born:</strong> ${char.born || "N/A"}</p>
    `;

    container.appendChild(div);
  });
}


function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

fetchCharacters();