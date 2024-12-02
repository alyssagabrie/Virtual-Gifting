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

    createDynamicCards(uniqueData);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
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

// Add Brand element
const cardBrand = document.createElement("small");
cardBrand.className = "card-brand text-muted d-block"; // Styling classes
cardBrand.textContent = item.Brand || "No Brand Available";
cardBody.appendChild(cardBrand);

// Title remains below Brand
const cardTitle = document.createElement("h5");
cardTitle.className = "card-title";
cardTitle.textContent = item.Title || "No Title Available";
cardBody.appendChild(cardTitle);


    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";


        // "Select this Gift" Button
        const selectButton = document.createElement("a");
        selectButton.className = "btn btn-primary";
        selectButton.textContent = "Select this Gift";
        selectButton.href = `form.html?title=${encodeURIComponent(item.Title)}&brand=${encodeURIComponent(item.Brand)}&description=${encodeURIComponent(item.Description)}&colors=${encodeURIComponent(item.Colors)}&sizes=${encodeURIComponent(item.Sizes)}&images=${encodeURIComponent(item.Images)}`;

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

// Create modals dynamically
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
  
  const images = item.Images?.split(",").map(url => url.trim()) || [];
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

 // Add "Confirm this gift" button right after description and colors
 const confirmButton = document.createElement("a");
 confirmButton.className = "btn btn-primary mt-3"; // Add button styles
 confirmButton.textContent = "Confirm this gift";
 confirmButton.href = `form.html?title=${encodeURIComponent(item.Title)}&brand=${encodeURIComponent(item.Brand)}`;
 productDetails.appendChild(confirmButton); // Append to productDetails
  // const sizes = document.createElement("h6");
  // sizes.textContent = "Available Sizes:";
  // productDetails.appendChild(sizes);

  // const sizesText = document.createElement("p");
  // sizesText.textContent = item.Sizes;
  // productDetails.appendChild(sizesText);

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
  const currentIndex = Array.from(images).findIndex(img =>
    img.classList.contains("active")
  );

  images[currentIndex].classList.remove("active");
  const newIndex = (currentIndex - 1 + images.length) % images.length;
  images[newIndex].classList.add("active");
}

function showNextImage(button) {
  const slider = button.closest(".modal-image-slider") || button.closest(".image-slider");
  const images = slider.querySelectorAll(".slider-image");
  const currentIndex = Array.from(images).findIndex(img =>
    img.classList.contains("active")
  );

  images[currentIndex].classList.remove("active");
  const newIndex = (currentIndex + 1) % images.length;
  images[newIndex].classList.add("active");
}

// Fetch data on load
fetchData();
