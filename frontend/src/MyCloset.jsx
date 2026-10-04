import { useEffect, useState } from "react";

function MyCloset() {
  const [clothes, setClothes] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [colorFilter, setColorFilter] = useState("");

  const fetchClothes = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/clothes");
      const data = await response.json();

      setClothes(data);
    } catch (error) {
      console.error("Error fetching clothes:", error);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

 const filteredClothes = clothes.filter((item) => {
  const matchesSearch = item.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesCategory =
    categoryFilter === "All" || item.category === categoryFilter;

  const matchesColor = item.color
    .toLowerCase()
    .includes(colorFilter.toLowerCase());

  return matchesSearch && matchesCategory && matchesColor;
});

  // DELETE
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this clothing item?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/clothes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setClothes((currentClothes) =>
          currentClothes.filter((item) => item._id !== id)
        );

        alert("Clothing item deleted successfully!");
      } else {
        alert("Failed to delete clothing item.");
      }
    } catch (error) {
      console.error("Error deleting clothing item:", error);
      alert("Could not connect to the backend.");
    }
  };

  // UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5001/api/clothes/${editingItem._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingItem),
        }
      );

      const updatedItem = await response.json();

      if (response.ok) {
        setClothes((currentClothes) =>
          currentClothes.map((item) =>
            item._id === updatedItem._id ? updatedItem : item
          )
        );

        setEditingItem(null);

        alert("Clothing item updated successfully!");
      } else {
        alert(updatedItem.message || "Failed to update clothing item.");
      }
    } catch (error) {
      console.error("Error updating clothing item:", error);
      alert("Could not connect to the backend.");
    }
  };

  return (
   <div>
  <h2 className="page-title">My Closet</h2>
  <p className="item-count">
  {filteredClothes.length}{" "}
  {filteredClothes.length === 1 ? "item" : "items"} in your wardrobe
</p>

  <div className="filters">
    <input
  type="text"
  placeholder="Search clothing..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    padding: "10px",
    width: "300px",
    marginBottom: "20px",
  }}
/>
<select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
  style={{
    padding: "10px",
    marginLeft: "10px",
    marginBottom: "20px",
  }}
>
  <option value="All">All Categories</option>
  <option value="Tops">Tops</option>
  <option value="Bottoms">Bottoms</option>
  <option value="Dresses">Dresses</option>
  <option value="Outerwear">Outerwear</option>
  <option value="Shoes">Shoes</option>
  <option value="Accessories">Accessories</option>
</select>
<input
  type="text"
  placeholder="Filter by color..."
  value={colorFilter}
  onChange={(e) => setColorFilter(e.target.value)}
  style={{
    padding: "10px",
    marginLeft: "10px",
    marginBottom: "20px",
    width: "180px",
  }}
/>
  </div>

      {/* EDIT FORM */}
      {editingItem && (
        <div className="form-container">
          <h2 className="page-title">Edit Clothing</h2>

          <form onSubmit={handleUpdate}>
            <input
              type="text"
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  name: e.target.value,
                })
              }
              placeholder="Clothing name"
              required
            />

            <br />
            <br />

            <select
              value={editingItem.category}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  category: e.target.value,
                })
              }
            >
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Dresses">Dresses</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
            </select>

            <br />
            <br />

            <input
              type="text"
              value={editingItem.color}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  color: e.target.value,
                })
              }
              placeholder="Color"
              required
            />

            <br />
            <br />

            <input
              type="text"
              value={editingItem.brand}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  brand: e.target.value,
                })
              }
              placeholder="Brand"
            />

            <br />
            <br />

            <input
              type="text"
              value={editingItem.size}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  size: e.target.value,
                })
              }
              placeholder="Size"
            />

            <br />
            <br />

            <input
              type="text"
              value={editingItem.image}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  image: e.target.value,
                })
              }
              placeholder="Image URL"
            />

            <br />
            <br />

            <textarea
              value={editingItem.description}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  description: e.target.value,
                })
              }
              placeholder="Description"
            />

            <br />
            <br />

            <button type="submit" className="button button-primary">
  Save Changes
</button>

            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="button button-secondary"
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* CLOTHING CARDS */}
      {clothes.length === 0 ? (
        <div className="empty-state">
  <h3>No clothing found</h3>
  <p>
    Try changing your search or filters, or add a new item to your closet.
  </p>
</div>
      ) : (
       <div className="clothing-grid">
          {filteredClothes.map((item) => (
            <div
  key={item._id}
  className="clothing-card"
>
              {item.image ? (
                <img
  src={item.image}
  alt={item.name}
  className="clothing-image"
/>
              ) : (
                <div
                  style={{
                    height: "250px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f2f2f2",
                    borderRadius: "8px",
                  }}
                >
                  No Image
                </div>
              )}
              <div className="clothing-info">
                <h3>{item.name}</h3>

              <p>
                <strong>Category:</strong> {item.category}
              </p>

              <p>
                <strong>Color:</strong> {item.color}
              </p>

              {item.brand && (
                <p>
                  <strong>Brand:</strong> {item.brand}
                </p>
              )}

              {item.size && (
                <p>
                  <strong>Size:</strong> {item.size}
                </p>
              )}

              {item.description && <p>{item.description}</p>}

              <button
  onClick={() => setEditingItem(item)}
  className="button button-secondary"
>
                Edit
              </button>

              <button
  onClick={() => handleDelete(item._id)}
  className="button button-danger"
>
                Delete
              </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCloset;