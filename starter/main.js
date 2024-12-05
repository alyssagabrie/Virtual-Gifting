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
        : data.filter((item) => item.Categories === category);

    createDynamicCards(filteredData); // Re-render cards based on the selected category
  }
}

// Create Cards Dynamically
function createDynamicCards(data) {
  const container = document.getElementById("card-container");
  if (!container) {
    console.error("Card container not found!");
    return;
  }

  console.log("Clearing card container...");
  container.innerHTML = ""; // Clear previous cards

  data.forEach((item, index) => {
    console.log(`Creating card for: ${item.Title}, Index: ${index}`);
    const card = document.createElement("div");
    card.className = "card col-md-4";

    const imageSlider = document.createElement("div");
    imageSlider.className = "image-slider";

    const images = item.Images?.split(",").map(url => url.trim()) || [];
    images.forEach((imageURL, imgIndex) => {
      if (imageURL.startsWith("http")) {
        const img = document.createElement("img");
        img.src = imageURL;
        img.alt = `${item.Title} - Image ${imgIndex + 1}`;
        img.className = `slider-image ${imgIndex === 0 ? "active" : ""}`;
        img.onerror = () => {
          img.src = "fallback-image.png"; // Replace with fallback image
          console.error(`Failed to load image: ${imageURL}`);
        };
        imageSlider.appendChild(img);
      }
    });

    // Navigation Arrows
    if (images.length > 1) {
      const prevArrow = document.createElement("button");
      prevArrow.className = "prev-arrow";
      prevArrow.innerHTML = "&#10094;";
      prevArrow.onclick = () => showPreviousImage(prevArrow);
      imageSlider.appendChild(prevArrow);

      const nextArrow = document.createElement("button");
      nextArrow.className = "next-arrow";
      nextArrow.innerHTML = "&#10095;";
      nextArrow.onclick = () => showNextImage(nextArrow);
      imageSlider.appendChild(nextArrow);
    }

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

    const selectButton = document.createElement("a");
    selectButton.className = "btn btn-primary";
    selectButton.textContent = "Select this Gift";
    let sizesParam = item.Sizes ? `&sizes=${encodeURIComponent(item.Sizes)}` : "";
    selectButton.href = `form.html?title=${encodeURIComponent(item.Title)}&brand=${encodeURIComponent(item.Brand)}&description=${encodeURIComponent(item.Description)}&colors=${encodeURIComponent(item.Colors)}${sizesParam}&images=${encodeURIComponent(item.Images)}`;
    buttonContainer.appendChild(selectButton);

    const quickViewButton = document.createElement("button");
    quickViewButton.className = "btn btn-secondary";
    quickViewButton.textContent = "Quick View";
    quickViewButton.setAttribute("data-bs-toggle", "modal");
    quickViewButton.setAttribute("data-bs-target", `#quickViewModal-${index}`);
    buttonContainer.appendChild(quickViewButton);

    cardBody.appendChild(buttonContainer);
    card.appendChild(imageSlider);
    card.appendChild(cardBody);
    container.appendChild(card);

    // Ensure modal creation is separate from card rendering
    createQuickViewModal(item, index);
  });
}
function createQuickViewModal(item, index) {
  const modalContainer = document.getElementById("modal-container");

  if (!modalContainer) {
    console.error("Modal container not found!");
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = `quickViewModal-${index}`;
  modal.tabIndex = -1;

  const images = item.Images?.split(",").map((url) => url.trim()) || [];
  const colors = item.Colors?.split(",").map((color) => color.trim()) || [];

  // Build modal content
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="quickViewModalLabel-${index}">${item.Title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body d-flex gap-3" style="align-items: flex-start;">
          <!-- Thumbnail Section -->
          <div class="slider-thumbnails d-flex flex-column gap-2" style="flex: 0 0 auto; max-width: 100px;">
            ${images
              .map(
                (url, idx) => `
              <div class="thumbnail-option" style="cursor: pointer;" onclick="updateMainSliderImage(${index}, ${idx})">
                <img src="${url}" alt="${item.Title} Thumbnail ${idx + 1}" 
                class="thumbnail-image ${idx === 0 ? "active-thumbnail" : ""}" 
                style="width: 70px; height: 70px; object-fit: cover; border: 2px solid ${
                  idx === 0 ? "#007BFF" : "transparent"
                }; border-radius: 4px;">
              </div>
            `
              )
              .join("")}
          </div>
          <!-- Image Section -->
          <div class="modal-image-slider" style="flex: 1; max-width: 500px; height: 500px; overflow: hidden; position: relative;">
            ${images
              .map(
                (url, idx) => `
              <img src="${url}" alt="${item.Title} - Image ${idx + 1}" 
              class="slider-image ${idx === 0 ? "active" : ""}" 
              style="width: 100%; height: 100%; object-fit: cover; display: ${
                idx === 0 ? "block" : "none"
              };">
            `
              )
              .join("")}
            ${images.length > 1 ? `
              <button class="prev-arrow" onclick="showPreviousImage(this)" style="position: absolute; top: 50%; left: 0; transform: translateY(-50%); background: rgba(0, 0, 0, 0.5); color: white; border: none; cursor: pointer; z-index: 1;">&#10094;</button>
              <button class="next-arrow" onclick="showNextImage(this)" style="position: absolute; top: 50%; right: 0; transform: translateY(-50%); background: rgba(0, 0, 0, 0.5); color: white; border: none; cursor: pointer; z-index: 1;">&#10095;</button>
            ` : ""}
          </div>
          <!-- Details Section -->
          <div class="modal-details" style="flex: 1; max-width: 500px;">
            <h6 style="font-weight: bold;">Brand:</h6>
            <p>${item.Brand || "No Brand Available"}</p>
            <h6 style="font-weight: bold;">Description:</h6>
            <p>${item.Description || "No description available."}</p>
            ${colors.length > 0 ? `
            <h6 style="font-weight: bold;">Available Colors:</h6>
            <div class="color-selection d-flex gap-2">
              ${colors
                .map(
                  (color, idx) => `
                <div class="color-option ${idx === 0 ? "active" : ""}" style="cursor: pointer;" onclick="updateMainImage(${index}, ${idx})">
                  <img src="${images[idx]}" alt="${color}" 
                  class="color-thumbnail" 
                  style="width: 50px; height: 50px; border: 2px solid ${
                    idx === 0 ? "#007BFF" : "transparent"
                  }; border-radius: 4px;">
                  <p style="text-align: center; font-size: 12px; margin: 5px 0;">${color}</p>
                </div>
              `
                )
                .join("")}
            </div>` : ""}
          </div>
        </div>
      </div>
    </div>
  `;

  modalContainer.appendChild(modal);
}

// Update Main Image Based on Slider Thumbnail
function updateMainSliderImage(modalIndex, imageIndex) {
  const modal = document.getElementById(`quickViewModal-${modalIndex}`);
  if (!modal) return;

  // Update active slider image
  const sliderImages = modal.querySelectorAll(".slider-image");
  sliderImages.forEach((img, idx) => {
    img.style.display = idx === imageIndex ? "block" : "none";
    img.classList.toggle("active", idx === imageIndex);
  });

  // Highlight active thumbnail
  const thumbnailImages = modal.querySelectorAll(".thumbnail-image");
  thumbnailImages.forEach((thumb, idx) => {
    thumb.style.border = idx === imageIndex ? "2px solid #007BFF" : "2px solid transparent";
    thumb.classList.toggle("active-thumbnail", idx === imageIndex);
  });
}


// Update Main Image Without Removing Slider Images
function updateMainImage(modalIndex, colorIndex) {
  const modal = document.getElementById(`quickViewModal-${modalIndex}`);
  if (!modal) return;

  const sliderImages = modal.querySelectorAll(".slider-image");

  // Set the selected color's corresponding image as active
  sliderImages.forEach((img, idx) => {
    img.classList.toggle("active", idx === colorIndex);
    img.style.display = idx === colorIndex ? "block" : "none";
  });

  // Highlight the selected color
  const colorOptions = modal.querySelectorAll(".color-option");
  colorOptions.forEach((option, idx) => {
    const thumbnail = option.querySelector(".color-thumbnail");
    thumbnail.style.border = idx === colorIndex ? "2px solid #007BFF" : "2px solid transparent";
    option.classList.toggle("active", idx === colorIndex);
  });
}

// Slider Navigation
function showPreviousImage(button) {
  const slider = button.closest(".modal-image-slider");
  const images = slider.querySelectorAll(".slider-image");
  const activeIndex = Array.from(images).findIndex(img => img.classList.contains("active"));

  images[activeIndex].style.display = "none";
  const newIndex = (activeIndex - 1 + images.length) % images.length;
  images[activeIndex].classList.remove("active");
  images[newIndex].classList.add("active");
  images[newIndex].style.display = "block";
}

function showNextImage(button) {
  const slider = button.closest(".modal-image-slider");
  const images = slider.querySelectorAll(".slider-image");
  const activeIndex = Array.from(images).findIndex(img => img.classList.contains("active"));

  images[activeIndex].style.display = "none";
  const newIndex = (activeIndex + 1) % images.length;
  images[activeIndex].classList.remove("active");
  images[newIndex].classList.add("active");
  images[newIndex].style.display = "block";
}


// Update Slider Image (Color Selection)
function updateMainImage(modalIndex, colorIndex) {
  const modal = document.getElementById(`quickViewModal-${modalIndex}`);
  if (!modal) return;

  const sliderImages = modal.querySelectorAll(".slider-image");
  sliderImages.forEach((img, idx) => {
    img.style.display = idx === colorIndex ? "block" : "none";
  });

  const colorOptions = modal.querySelectorAll(".color-option");
  colorOptions.forEach((option, idx) => {
    const thumbnail = option.querySelector(".color-thumbnail");
    thumbnail.style.border = idx === colorIndex ? "2px solid #007BFF" : "2px solid transparent";
    option.classList.toggle("active", idx === colorIndex);
  });
}

// Fetch Data on Page Load
fetchData();
