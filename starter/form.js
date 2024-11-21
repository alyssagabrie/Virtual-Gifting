// Parse Query Parameters
const urlParams = new URLSearchParams(window.location.search);

// Populate Form Fields
document.getElementById("productTitle").value = urlParams.get("title") || "N/A";
document.getElementById("productBrand").value = urlParams.get("brand") || "N/A";
document.getElementById("productDescription").value = urlParams.get("description") || "N/A";

// Parse colors and their corresponding images from the Images field
const colorImages = {};
const colors = urlParams.get("colors")?.split(",").map(color => color.trim()) || [];
const images = urlParams.get("images") || ""; // Example: "Black:image1.jpg,Brown:image2.jpg"

// Map colors to their images
if (images) {
  images.split(",").forEach(pair => {
    const [color, imageURL] = pair.split(":").map(value => value.trim());
    if (color && imageURL) {
      colorImages[color] = imageURL; // Add to the colorImages mapping
    }
  });
}

// Populate Colors Dropdown
const colorsDropdown = document.getElementById("productColors");
colors.forEach(color => {
  const option = document.createElement("option");
  option.value = color;
  option.textContent = color;
  colorsDropdown.appendChild(option);
});

// Populate Sizes Dropdown
const sizesDropdown = document.getElementById("productSizes");
const sizes = urlParams.get("sizes")?.split(",").map(size => size.trim()) || [];
sizes.forEach(size => {
  const option = document.createElement("option");
  option.value = size;
  option.textContent = size;
  sizesDropdown.appendChild(option);
});

// Image Preview Logic
const productImage = document.getElementById("productImage");
// Set default image for the first color
if (colors.length > 0) {
  productImage.src = colorImages[colors[0]] || "fallback-image.png";
}

// Update image on color selection
colorsDropdown.addEventListener("change", () => {
  const selectedColor = colorsDropdown.value;
  productImage.src = colorImages[selectedColor] || "fallback-image.png"; // Update image based on selected color
});
