const container = document.getElementById("container");
const searchInput = document.getElementById("search");
const loader = document.getElementById("loader");
const filter = document.getElementById("filter");
const sort = document.getElementById("sort");
const darkToggle = document.getElementById("darkToggle");
const resultsInfo = document.getElementById("resultsInfo");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let charactersData = [];
const houseCache = new Map();
let currentPage = 1;
const itemsPerPage = 8;

async function fetchCharacters() {
  showLoader(true);

  try {
    const res = await fetch("https://anapioficeandfire.com/api/characters?pageSize=50");
    const data = await res.json();
    const enrichedData = await Promise.all(
      data.map(async (char) => ({
        ...char,
        houseNames: await getHouseNames(char.allegiances || []),
      }))
    );

    charactersData = enrichedData;
    populateHouseFilter(enrichedData);
    applyAll();
  } catch (error) {
    container.innerHTML = "<p>Error loading data</p>";
  }

  showLoader(false);
}

async function getHouseNames(allegiances) {
  if (!allegiances.length) {
    return [];
  }

  const houses = await Promise.all(
    allegiances.map(async (url) => {
      if (houseCache.has(url)) {
        return houseCache.get(url);
      }

      try {
        const res = await fetch(url);
        const data = await res.json();
        const houseName = data.name || "Unknown House";
        houseCache.set(url, houseName);
        return houseName;
      } catch (error) {
        return "";
      }
    })
  );

  return houses.filter(Boolean);
}

function populateHouseFilter(data) {
  const houseNames = [...new Set(data.flatMap((char) => char.houseNames))].sort((a, b) =>
    a.localeCompare(b)
  );

  filter.innerHTML = '<option value="">Filter by House</option>';

  houseNames.forEach((houseName) => {
    const option = document.createElement("option");
    option.value = houseName;
    option.textContent = houseName;
    filter.appendChild(option);
  });
}

function displayCharacters(data) {
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p>No results found 😢</p>";
    return;
  }

  data.forEach((char) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${char.name || "Unknown"}</h3>
      <p><strong>House:</strong> ${char.houseNames.join(", ") || "N/A"}</p>
      <p><strong>Culture:</strong> ${char.culture || "N/A"}</p>
      <p><strong>Born:</strong> ${char.born || "N/A"}</p>
    `;

    container.appendChild(div);
  });
}

function paginateData(data) {
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = data.slice(startIndex, startIndex + itemsPerPage);

  updatePagination(totalPages, data.length);
  return paginatedItems;
}

function updatePagination(totalPages, totalItems) {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  resultsInfo.textContent = `${totalItems} character${totalItems === 1 ? "" : "s"} found`;
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages;
}

function applyAll() {
  let data = [...charactersData];

  const searchValue = searchInput.value.toLowerCase();
  data = data.filter(char =>
    (char.name || "").toLowerCase().includes(searchValue)
  );

  if (filter.value) {
    data = data.filter((char) => char.houseNames.includes(filter.value));
  }

  if (sort.value === "name-az") {
    data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (sort.value === "name-za") {
    data.sort((b, a) => (a.name || "").localeCompare(b.name || ""));
  } else if (sort.value === "culture-az") {
    data.sort((a, b) => (a.culture || "").localeCompare(b.culture || ""));
  } else if (sort.value === "culture-za") {
    data.sort((b, a) => (a.culture || "").localeCompare(b.culture || ""));
  }

  const paginatedData = paginateData(data);
  displayCharacters(paginatedData);
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  applyAll();
});

filter.addEventListener("change", () => {
  currentPage = 1;
  applyAll();
});

sort.addEventListener("change", () => {
  currentPage = 1;
  applyAll();
});

prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    applyAll();
  }
});

nextPageButton.addEventListener("click", () => {
  currentPage += 1;
  applyAll();
});

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

fetchCharacters();
