// API Endpoint
const apiURL = "https://sheetdb.io/api/v1/y8aivky6q6alc";

// Fetch Data
async function fetchData() {
  console.log("Fetching data...");
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    console.log("Fetched Data (Raw):", data);

    // Filter out invalid entries
    const filteredData = data.filter(item =>
      item.Images?.trim() &&
      item.Title?.trim() &&
      item.Brand?.trim()
    );

    console.log("Filtered Data:", filteredData);

    // Deduplicate data
    const uniqueData = Array.from(new Set(filteredData.map(item => JSON.stringify(item))))
      .map(item => JSON.parse(item));
    console.log("Deduplicated Data:", uniqueData);

    // Initial rendering
    createDynamicCards(uniqueData);

    // Enable category filtering
    setupCategoryFilters(uniqueData);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Setup Category Filters
function setupCategoryFilters(data) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const filterDropdown = document.getElementById("filterDropdown");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-category");
      filterProducts(category, data);
    });
  });

  filterDropdown.addEventListener("change", (e) => {
    const category = e.target.value;
    filterProducts(category, data);
  });

  function filterProducts(category, data) {
    const filteredData =
      category === "all"
        ? data
        : data.filter((item) => item.Categories.toLowerCase() === category.toLowerCase());

    createDynamicCards(filteredData); // Re-render cards based on the selected category
  }
}

// Create Cards Dynamically
function createDynamicCards(data) {
  const container = document.getElementById("card-container");
  const modalContainer = document.getElementById("modal-container");

  // Clear previous cards and modals
  container.innerHTML = "";
  modalContainer.innerHTML = "";

  data.forEach((item) => {
    const uniqueID = encodeURIComponent(item.Title || "unknown").replace(/\s/g, "_");

    // Create Card
    const card = document.createElement("div");
    card.className = "card col-md-4";

    // Add Image
    const imageSlider = document.createElement("div");
    imageSlider.className = "image-slider";

    const images = item.Images?.split(",").map((url) => url.trim()) || [];
    images.forEach((imageURL, imgIndex) => {
      const img = document.createElement("img");
      img.src = imageURL;
      img.alt = `${item.Title} - Image ${imgIndex + 1}`;
      img.className = `slider-image ${imgIndex === 0 ? "active" : ""}`;
      img.onerror = () => {
        img.src = "fallback-image.png"; // Replace with fallback image
      };
      imageSlider.appendChild(img);
    });

    // Card Body
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const cardBrand = document.createElement("small");
    cardBrand.className = "card-brand text-muted d-block";
    cardBrand.textContent = item.Brand || "No Brand Available";
    cardBody.appendChild(cardBrand);

    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = item.Title || "No Title Available";
    cardBody.appendChild(cardTitle);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    // Add the Select button
    const selectButton = document.createElement("a");
    selectButton.className = "btn btn-primary";
    selectButton.textContent = "Select this Gift";
    selectButton.href = `form.html?title=${encodeURIComponent(item.Title)}`;
    buttonContainer.appendChild(selectButton);

    // Add the Quick View button
    const quickViewButton = document.createElement("button");
    quickViewButton.className = "btn btn-secondary";
    quickViewButton.textContent = "Quick View";
    quickViewButton.setAttribute("data-bs-toggle", "modal");
    quickViewButton.setAttribute("data-bs-target", `#quickViewModal-${uniqueID}`);
    buttonContainer.appendChild(quickViewButton);

    cardBody.appendChild(buttonContainer);
    card.appendChild(imageSlider);
    card.appendChild(cardBody);
    container.appendChild(card);

    // Create the modal
    createQuickViewModal(item, uniqueID);
  });
}

// Create Quick View Modal
function createQuickViewModal(item, uniqueID) {
  const modalContainer = document.getElementById("modal-container");

  const images = item.Images?.split(",").map((url) => url.trim()) || [];
  const colors = item.Colors?.split(",").map((color) => color.trim()) || [];

  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = `quickViewModal-${uniqueID}`;
  modal.tabIndex = -1;

  modal.innerHTML = `
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${item.Title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body d-flex gap-3">
          <!-- Thumbnail Gallery Section (Left) -->
          <div class="slider-thumbnails d-flex flex-column gap-2">
            ${images.map((url, idx) => `
              <img 
                src="${url}" 
                class="thumbnail-image ${idx === 0 ? "active-thumbnail" : ""}" 
                style="width: 80px; height: 80px; object-fit: cover; cursor: pointer;"
                onclick="updateMainImage('${uniqueID}', ${idx})">
            `).join("")}
          </div>

          <!-- Main Image Section -->
          <div class="modal-image-slider" style="flex: 1;">
            ${images.map((url, idx) => `
              <img 
                src="${url}" 
                class="slider-image ${idx === 0 ? "active" : ""}" 
                style="width: 100%; display: ${idx === 0 ? "block" : "none"};">
            `).join("")}
          </div>

          <!-- Details Section -->
          <div class="modal-details" style="flex: 1;">
            <h6>Brand:</h6>
            <p>${item.Brand}</p>
            <h6>Description:</h6>
            <p>${item.Description || "No description available."}</p>
            ${colors.length > 0 ? `
            <h6>Available Colors:</h6>
            <div class="color-selection d-flex gap-2">
              ${colors.map((color, idx) => `
                <div class="thumbnail-color-wrapper" onclick="updateMainImage('${uniqueID}', ${idx})">
                  <img 
                    src="${images[idx]}" 
                    class="thumbnail-image"
                    style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; border: 2px solid ${
                      idx === 0 ? "#007BFF" : "transparent"
                    }; cursor: pointer;">
                  <p style="text-align: center; font-size: 12px; margin: 0;">${color}</p>
                </div>
              `).join("")}
            </div>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;

  modalContainer.appendChild(modal);
}

// Update Main Image
function updateMainImage(uniqueID, imageIndex) {
  const modal = document.getElementById(`quickViewModal-${uniqueID}`);
  if (!modal) return;

  // Update the main image
  const images = modal.querySelectorAll(".slider-image");
  images.forEach((img, idx) => {
    img.style.display = idx === imageIndex ? "block" : "none";
    img.classList.toggle("active", idx === imageIndex);
  });

  // Update gallery thumbnails (left side)
  const galleryThumbnails = modal.querySelectorAll(".slider-thumbnails .thumbnail-image");
  galleryThumbnails.forEach((thumb, idx) => {
    thumb.classList.toggle("active-thumbnail", idx === imageIndex);
    thumb.style.border = idx === imageIndex ? "2px solid #007BFF" : "none";
  });

  // Update color thumbnails (right side)
  const colorThumbnails = modal.querySelectorAll(".color-selection .thumbnail-color-wrapper");
  colorThumbnails.forEach((wrapper, idx) => {
    const thumbnail = wrapper.querySelector(".thumbnail-image");
    thumbnail.style.border = idx === imageIndex ? "2px solid #007BFF" : "none";
    wrapper.classList.toggle("active-color", idx === imageIndex); // Optional for additional styling
  });
}

// Smooth scroll function
function scrollToSection(selector) {
  const targetElement = document.querySelector(selector);
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth", // Enables smooth scrolling
      block: "start"      // Scrolls to the top of the target element
    });
  } else {
    console.error(`Element not found for selector: ${selector}`);
  }
}


// Fetch Data on Page Load
fetchData();
