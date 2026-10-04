import { useState } from "react";

function AddClothing() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Tops",
    color: "",
    brand: "",
    size: "",
    image: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    // Create preview
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/clothes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Clothing item added successfully!");

        setFormData({
          name: "",
          category: "Tops",
          color: "",
          brand: "",
          size: "",
          image: "",
          description: "",
        });

        setSelectedImage(null);
        setSelectedFile(null);
      } else {
        alert(data.message || "Failed to add clothing item");
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to the backend");
    }
  };

  return (
    <div>
      <h1 className="page-title">Add Clothing</h1>

      <div className="form-container">
        <form onSubmit={handleSubmit}>

          {/* Clothing Name */}
          <div className="form-group">
            <label>Clothing Name</label>

            <input
              type="text"
              name="name"
              placeholder="e.g. White T-Shirt"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Dresses">Dresses</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Color */}
          <div className="form-group">
            <label>Color</label>

            <input
              type="text"
              name="color"
              placeholder="e.g. Black"
              value={formData.color}
              onChange={handleChange}
              required
            />
          </div>

          {/* Brand */}
          <div className="form-group">
            <label>Brand</label>

            <input
              type="text"
              name="brand"
              placeholder="e.g. Nike"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>

          {/* Size */}
          <div className="form-group">
            <label>Size</label>

            <input
              type="text"
              name="size"
              placeholder="e.g. M"
              value={formData.size}
              onChange={handleChange}
            />
          </div>

          {/* IMAGE */}
          <div className="form-group">
            <label>Clothing Image</label>

            <div className="image-buttons">

              {/* Gallery */}
              <label className="image-upload-button">
                🖼️ Choose from Gallery

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>

              {/* Camera */}
              <label className="image-upload-button">
                📷 Take Photo

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  hidden
                />
              </label>

            </div>
          </div>

          {/* IMAGE PREVIEW */}
          {selectedImage && (
            <div className="image-preview-container">

              <img
                src={selectedImage}
                alt="Selected clothing"
                className="image-preview"
              />

              <p>
                {selectedFile?.name}
              </p>

            </div>
          )}

          {/* Image URL */}
          <div className="form-group">
            <label>Image URL</label>

            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={formData.image}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Add a short description..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="button button-primary"
          >
            Add to Closet
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddClothing;