// Parse Query Parameters
const urlParams = new URLSearchParams(window.location.search);

// Extract product data from URL parameters
const productTitle = urlParams.get("title") || "N/A";
const productBrand = urlParams.get("brand") || "N/A";
const productDescription = urlParams.get("description") || "N/A";
const colors = urlParams.get("colors")?.split(",").map(color => color.trim()) || [];
const sizes = urlParams.get("sizes")?.split(",").map(size => size.trim()) || [];
const images = urlParams.get("images")?.split(",").map(image => image.trim()) || [];

// Debugging: Log images
console.log("Images:", images);

// Create content dynamically
const productPageContent = document.createElement("div");
productPageContent.className = "product-page-container";
productPageContent.innerHTML = `
  <!-- Left Section: Image Slideshow and Product Details -->
  <div class="product-left">
    <div class="product-images">
      <div id="imageSlideshow" class="slideshow">
        ${images
          .map(
            (image, index) => `
              <img class="slide ${index === 0 ? "active" : ""}" src="${image}" alt="Image ${index + 1}" onerror="this.src='fallback-image.png';" />
            `
          )
          .join("")}
        <button class="prev" onclick="changeSlide(-1)">&#10094;</button>
        <button class="next" onclick="changeSlide(1)">&#10095;</button>
      </div>
    </div>
    <div class="product-text-details">
      <p><strong>Product Name:</strong> ${productTitle}</p>
      <p><strong>Brand:</strong> ${productBrand}</p>
      <p><strong>Description:</strong> ${productDescription}</p>
      ${colors.length > 0 ? `<p><strong>Colors:</strong> ${colors.join(", ")}</p>` : ""}
      ${sizes.length > 0 ? `<p><strong>Sizes:</strong> ${sizes.join(", ")}</p>` : ""}
    </div>
  </div>

  <!-- Right Section: Embedded Form -->
  <div class="product-form">
    <div class="form-embed-container" id="dynamicFormContainer"></div>
  </div>
`;

// Append dynamically created content to the existing body
document.body.appendChild(productPageContent);

// Embed 123Forms Dynamically
function embedDynamicForm() {
  const formContainer = document.getElementById("dynamicFormContainer");

  if (!formContainer) {
    console.error("Form container not found!");
    return;
  }

  // Create a script element for 123Forms
  const formScript = document.createElement("script");
  formScript.type = "text/javascript";
  formScript.defer = true;
  formScript.src = "https://form.123formbuilder.com/embed/6773482.js";

  // Add dynamic variables for 123Forms
  formScript.setAttribute(
    "data-custom-vars",
    `115911333=${encodeURIComponent(productTitle)}`
  );

  // Add default width and role attributes
  formScript.setAttribute("data-default-width", "800px");
  formScript.setAttribute("data-role", "form");

  // Append the script to the form container
  formContainer.appendChild(formScript);
}

// Embed the form after the page loads
embedDynamicForm();

// Append dynamically created content to the existing body
document.body.appendChild(productPageContent);

// Slideshow Functionality
let currentSlideIndex = 0;

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  if (!slides.length) return;

  slides.forEach((slide, idx) => {
    slide.style.display = idx === index ? "block" : "none";
  });
}

function changeSlide(step) {
  const slides = document.querySelectorAll(".slide");
  if (!slides.length) return;

  currentSlideIndex = (currentSlideIndex + step + slides.length) % slides.length;
  showSlide(currentSlideIndex);
}

// Initialize the slideshow
showSlide(currentSlideIndex);
