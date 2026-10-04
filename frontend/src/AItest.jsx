import { useState } from "react";
import { detectClothing } from "./clothingAI";

function AItest() {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);
    setResults([]);
    setLoading(true);

    console.log("Starting AI analysis...");

    try {
      const detectedItems = await detectClothing(imageUrl);

      console.log("========== AI RESULT ==========");
      console.log(detectedItems);
      console.log("================================");

      setResults(detectedItems);
    } catch (error) {
      console.error("AI ERROR:", error);
      alert("AI could not analyze the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Clothing AI Test</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
      />

      {image && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={image}
            alt="Uploaded clothing"
            style={{
              maxWidth: "400px",
              maxHeight: "500px",
              objectFit: "contain",
              borderRadius: "12px",
            }}
          />
        </div>
      )}

      {loading && (
        <div style={{ marginTop: "20px" }}>
          <h3>🤖 AI is analyzing your photo...</h3>
          <p>
            The first analysis can take some time while the model loads.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Detected items</h2>

          {results.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "10px",
                marginBottom: "8px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>{item.label}</strong>

              {item.score !== undefined && (
                <span>
                  {" "}
                  — {(item.score * 100).toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && image && results.length === 0 && (
        <p style={{ marginTop: "20px" }}>
          No clothing items detected.
        </p>
      )}
    </div>
  );
}

export default AItest;