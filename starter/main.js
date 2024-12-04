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

// Setup Category Filters (Buttons and Dropdown)
function setupCategoryFilters(data) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const filterDropdown = document.getElementById("filterDropdown");

  // Event listener for buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-category");
      filterProducts(category, data);
    });
  });

  // Event listener for dropdown
  filterDropdown.addEventListener("change", (e) => {
    const category = e.target.value;
    filterProducts(category, data);
  });

  // Filter products function
  function filterProducts(category, data) {
    const filteredData =
      category === "all"
        ? data
        : data.filter((item) => item.Categories === category);

    createDynamicCards(filteredData); // Re-render cards based on the selected category
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("searchBar");
  const suggestions = document.getElementById("suggestions");
  const categories = [
    "Audio",
    "Home Appliances",
    "Kitchen Tech",
    "Smart Glasses",
    "Beauty",
    "Smart Devices"    
  ];

  let currentIndex = -1; // Track the currently highlighted suggestion

  // Handle input in the search bar
  searchBar.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    suggestions.innerHTML = ""; // Clear previous suggestions
    currentIndex = -1; // Reset the highlighted index

    if (query) {
      const filteredCategories = categories.filter((category) =>
        category.toLowerCase().includes(query)
      );

      if (filteredCategories.length > 0) {
        suggestions.style.display = "block";
        filteredCategories.forEach((category, index) => {
          const suggestionItem = document.createElement("li");
          suggestionItem.textContent = category;
          suggestionItem.setAttribute("role", "option"); // Add ARIA role
          suggestionItem.setAttribute("tabindex", "-1"); // Make items focusable
          suggestionItem.classList.add("suggestion-item");
          suggestionItem.addEventListener("click", () => {
            selectSuggestion(category);
          });
          suggestions.appendChild(suggestionItem);
        });
      } else {
        suggestions.style.display = "none";
      }
    } else {
      suggestions.style.display = "none";
    }
  });

  // Handle keyboard navigation
  searchBar.addEventListener("keydown", (e) => {
    const suggestionItems = document.querySelectorAll(".suggestion-item");

    if (e.key === "ArrowDown") {
      e.preventDefault(); // Prevent cursor movement
      if (suggestionItems.length > 0) {
        currentIndex = (currentIndex + 1) % suggestionItems.length;
        updateHighlight(suggestionItems);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); // Prevent cursor movement
      if (suggestionItems.length > 0) {
        currentIndex =
          (currentIndex - 1 + suggestionItems.length) % suggestionItems.length;
        updateHighlight(suggestionItems);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentIndex >= 0 && suggestionItems[currentIndex]) {
        const category = suggestionItems[currentIndex].textContent;
        selectSuggestion(category);
      }
    } else if (e.key === "Escape") {
      suggestions.style.display = "none"; // Close suggestions on Escape
    }
  });

  // Select a suggestion
  function selectSuggestion(category) {
    searchBar.value = category; // Update the search bar with the selected category
    suggestions.style.display = "none"; // Hide suggestions
    filterProducts(category); // Trigger category filter
  }

  // Update highlighted suggestion
  function updateHighlight(items) {
    items.forEach((item, index) => {
      if (index === currentIndex) {
        item.classList.add("highlight");
        item.scrollIntoView({ block: "nearest" }); // Ensure highlighted item is visible
      } else {
        item.classList.remove("highlight");
      }
    });
  }

  // Filter products (reuses existing functionality)
  function filterProducts(category) {
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((button) => {
      if (
        button.getAttribute("data-category").toLowerCase() ===
        category.toLowerCase()
      ) {
        button.click(); // Simulate button click for filtering
      }
    });
  }
});



// Create cards dynamically
function createDynamicCards(data) {
  const container = document.getElementById("card-container");
  if (!container) {
    console.error("Card container not found!");
    return;
  }

  console.log("Clearing card container...");
  container.innerHTML = "";

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

    createQuickViewModal(item, index);
  });
}

function createQuickViewModal(item, index) {
  const modalContainer = document.getElementById("modal-container");

  if (!modalContainer) {
    console.error("Modal container not found!");
    return;
  }

  // Create Modal Structure
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = `quickViewModal-${index}`;
  modal.tabIndex = -1;
  modal.setAttribute("aria-labelledby", `quickViewModalLabel-${index}`);
  modal.setAttribute("aria-hidden", "true");

  const modalDialog = document.createElement("div");
  modalDialog.className = "modal-dialog custom-modal"; // Add custom class

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  // Modal Header
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";

  const modalTitle = document.createElement("h5");
  modalTitle.className = "modal-title";
  modalTitle.id = `quickViewModalLabel-${index}`;
  modalTitle.textContent = item.Title;

  const modalCloseButton = document.createElement("button");
  modalCloseButton.type = "button";
  modalCloseButton.className = "btn-close";
  modalCloseButton.setAttribute("data-bs-dismiss", "modal");
  modalCloseButton.setAttribute("aria-label", "Close");

  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(modalCloseButton);

  // Modal Body
  const modalBody = document.createElement("div");
  modalBody.className = "modal-body d-flex flex-column flex-md-row";

  // Modal Image Slider
  const modalImageSlider = document.createElement("div");
  modalImageSlider.className = "modal-image-slider w-100 w-md-50 position-relative";

  const images = item.Images?.split(",").map((url) => url.trim()) || [];
  images.forEach((imageURL, imgIndex) => {
    const img = document.createElement("img");
    img.src = imageURL;
    img.alt = `${item.Title} - Image ${imgIndex + 1}`;
    img.className = `slider-image ${imgIndex === 0 ? "active" : ""}`;
    img.style.width = "100%"; // Fill the width of the container
    img.style.height = "100%"; // Fill the height of the container
    img.style.objectFit = "cover"; // Maintain aspect ratio
    modalImageSlider.appendChild(img);
  });

  // Add navigation buttons to the modal slider
  const prevArrow = document.createElement("button");
  prevArrow.className = "prev-arrow";
  prevArrow.innerHTML = "&#10094;";
  prevArrow.onclick = () => showPreviousImage(prevArrow);
  modalImageSlider.appendChild(prevArrow);

  const nextArrow = document.createElement("button");
  nextArrow.className = "next-arrow";
  nextArrow.innerHTML = "&#10095;";
  nextArrow.onclick = () => showNextImage(nextArrow);
  modalImageSlider.appendChild(nextArrow);

  // Modal Product Details
  const productDetails = document.createElement("div");
  productDetails.className = "product-details ms-md-3 mt-3 mt-md-0";

  const brand = document.createElement("h5");
  brand.innerHTML = `Brand: <span>${item.Brand || "No Brand Available"}</span>`;
  productDetails.appendChild(brand);

  const description = document.createElement("h6");
  description.textContent = "Description:";
  productDetails.appendChild(description);

  const descriptionText = document.createElement("p");
  descriptionText.textContent = item.Description;
  productDetails.appendChild(descriptionText);

  const colors = document.createElement("h6");
  colors.textContent = "Available Colors:";
  productDetails.appendChild(colors);

  const colorsText = document.createElement("p");
  colorsText.textContent = item.Colors;
  productDetails.appendChild(colorsText);

  const confirmButton = document.createElement("a");
  confirmButton.className = "btn btn-primary mt-3";
  confirmButton.textContent = "Confirm this gift";
  let sizesParam = item.Sizes ? `&sizes=${encodeURIComponent(item.Sizes)}` : "";
  confirmButton.href = `form.html?title=${encodeURIComponent(item.Title)}&brand=${encodeURIComponent(item.Brand)}&description=${encodeURIComponent(item.Description)}&colors=${encodeURIComponent(item.Colors)}${sizesParam}&images=${encodeURIComponent(item.Images)}`;
  productDetails.appendChild(confirmButton);

  // Combine modal elements
  modalBody.appendChild(modalImageSlider);
  modalBody.appendChild(productDetails);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalDialog.appendChild(modalContent);
  modal.appendChild(modalDialog);

  modalContainer.appendChild(modal);
}




// Slider Navigation Functions
function showPreviousImage(button) {
  const slider = button.closest(".modal-image-slider") || button.closest(".image-slider");
  const images = slider.querySelectorAll(".slider-image");
  const currentIndex = Array.from(images).findIndex(img => img.classList.contains("active"));

  // Ensure the current active image is found
  if (currentIndex === -1) return;

  images[currentIndex].classList.remove("active");
  const newIndex = (currentIndex - 1 + images.length) % images.length; // Wrap around to the last image
  images[newIndex].classList.add("active");
}

function showNextImage(button) {
  const slider = button.closest(".modal-image-slider") || button.closest(".image-slider");
  const images = slider.querySelectorAll(".slider-image");
  const currentIndex = Array.from(images).findIndex(img => img.classList.contains("active"));

  // Ensure the current active image is found
  if (currentIndex === -1) return;

  images[currentIndex].classList.remove("active");
  const newIndex = (currentIndex + 1) % images.length; // Wrap around to the first image
  images[newIndex].classList.add("active");
}


// Fetch data on load
fetchData();
