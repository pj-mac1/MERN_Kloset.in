import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Sliders, Check, Eye, Wand2, Sun, Contrast, RotateCcw } from "lucide-react";

export default function StudioEnhancer({
  imageUrl,
  onAnalysisComplete,
  onEnhancedImageReady,
}) {
  const canvasRef = useRef(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Studio enhancement controls
  const [preset, setPreset] = useState("studio_white");
  const [brightness, setBrightness] = useState(1.06);
  const [contrast, setContrast] = useState(1.12);
  const [vibrance, setVibrance] = useState(1.08);
  const [shadowDepth, setShadowDepth] = useState(15);
  const [showOriginal, setShowOriginal] = useState(false);
  const [enhancedDataUrl, setEnhancedDataUrl] = useState(null);

  const presets = [
    { id: "studio_white", name: "Boutique Studio White", bg: "#FFFFFF", ring: "#E5E5E5" },
    { id: "warm_cream", name: "Warm Editorial Linen", bg: "#F8F4EE", ring: "#EADCC9" },
    { id: "minimal_slate", name: "Minimal Slate", bg: "#F0F2F5", ring: "#CBD5E1" },
    { id: "vintage_glow", name: "Vintage 90s Film", bg: "#FBF6E9", ring: "#D4C5A9" },
  ];

  // Run AI Auto-Detector
  const handleRunAiDetector = async () => {
    if (!imageUrl) return;
    setAnalyzing(true);
    try {
      const response = await fetch("http://localhost:5001/api/ai/analyze-clothing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });
      const data = await response.json();
      setAnalysisResult(data);
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (err) {
      console.error("AI detection error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Render Canvas with Studio Polish
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      // Set canvas dimension based on image aspect ratio
      const width = Math.min(img.naturalWidth || 800, 1000);
      const height = (width / img.naturalWidth) * img.naturalHeight;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw Selected Studio Backdrop
      const selectedPreset = presets.find((p) => p.id === preset) || presets[0];
      ctx.fillStyle = selectedPreset.bg;
      ctx.fillRect(0, 0, width, height);

      // 2. Add subtle studio ambient lighting gradient
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.75
      );
      grad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.05)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw Garment with Studio Lighting Balance (preserved fabric texture, crisp contrast)
      ctx.save();
      // Drop shadow for studio floating product look
      ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
      ctx.shadowBlur = shadowDepth;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = shadowDepth * 0.6;

      // Apply CSS-like filter parameters on canvas
      ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${vibrance})`;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();

      // Export processed image
      try {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setEnhancedDataUrl(dataUrl);
        if (onEnhancedImageReady) {
          onEnhancedImageReady(dataUrl);
        }
      } catch (e) {
        console.warn("Could not export canvas dataUrl (CORS restriction on external domain)", e);
      }
    };
  }, [imageUrl, preset, brightness, contrast, vibrance, shadowDepth]);

  const resetFilters = () => {
    setPreset("studio_white");
    setBrightness(1.06);
    setContrast(1.12);
    setVibrance(1.08);
    setShadowDepth(15);
  };

  if (!imageUrl) return null;

  return (
    <div className="studio-enhancer-container">
      <div className="studio-header">
        <div className="studio-header-title">
          <Wand2 size={20} className="wand-icon" />
          <div>
            <h4>Kloset AI Studio Enhancer</h4>
            <p>Makes second-hand clothes presentable & catalog-ready without altering the fabric.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAiDetector}
          disabled={analyzing}
          className="button button-accent ai-detect-btn"
        >
          <Sparkles size={16} />
          <span>{analyzing ? "Scanning Photo..." : "Auto-Detect Clothing & Tags"}</span>
        </button>
      </div>

      {/* AI Detection Summary Banner */}
      {analysisResult && (
        <div className="ai-result-banner">
          <div className="ai-result-header-row">
            <span className="ai-source-badge">
              ⚡ {analysisResult.model || "Google Gemini AI Vision"}
            </span>
            {analysisResult.suggestedPrice && (
              <span className="ai-price-estimate">
                Suggested Resale: <strong>${analysisResult.suggestedPrice}</strong>
              </span>
            )}
          </div>

          <div className="ai-result-row">
            <span className="ai-tag-label">Detected:</span>
            <strong>{analysisResult.name || analysisResult.category}</strong>
            <span className="ai-separator">•</span>
            <span className="ai-tag-label">Category:</span>
            <strong>{analysisResult.category}</strong>
            <span className="ai-separator">•</span>
            <span className="ai-tag-label">Color:</span>
            <strong>{analysisResult.color}</strong>
            <span className="ai-separator">•</span>
            <span className="ai-tag-label">Condition:</span>
            <strong>{analysisResult.condition}</strong>
          </div>

          {analysisResult.stylingAdvice && (
            <div className="ai-styling-advice-row">
              <span className="advice-label">Stylist Tip:</span>
              <span>"{analysisResult.stylingAdvice}"</span>
            </div>
          )}

          <div className="ai-tags-row">
            <span className="ai-tag-label">Suggested Tags:</span>
            {analysisResult.tags?.map((t, i) => (
              <span key={i} className="occasion-chip active-chip">
                #{t}
              </span>
            ))}
          </div>

          <p className="ai-tip-note">
            💡 Form fields below were auto-filled by AI! You can review or customize them anytime.
          </p>
        </div>
      )}

      {/* Visual Workspace & Canvas */}
      <div className="studio-workspace">
        <div className="canvas-wrapper">
          {/* Hidden or visible canvas */}
          <canvas
            ref={canvasRef}
            className={`studio-canvas ${showOriginal ? "hidden" : ""}`}
          />
          {showOriginal && (
            <img
              src={imageUrl}
              alt="Original clothing"
              className="studio-original-img"
            />
          )}

          {/* Before/After Toggle Floating Pill */}
          <button
            type="button"
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            className="compare-toggle-pill"
          >
            <Eye size={14} />
            <span>{showOriginal ? "Viewing Original Photo" : "Hold to View Original"}</span>
          </button>
        </div>

        {/* Studio Controls Panel */}
        <div className="studio-controls-panel">
          <div className="panel-section">
            <label className="section-label">Studio Backdrop Preset</label>
            <div className="preset-grid">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={`preset-btn ${preset === p.id ? "active" : ""}`}
                >
                  <span
                    className="preset-swatch"
                    style={{ backgroundColor: p.bg, borderColor: p.ring }}
                  />
                  <span>{p.name}</span>
                  {preset === p.id && <Check size={14} className="check-mark" />}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <div className="slider-header">
              <label>
                <Sun size={14} /> Brightness Balance
              </label>
              <span>{Math.round(brightness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.02"
              value={brightness}
              onChange={(e) => setBrightness(parseFloat(e.target.value))}
            />
          </div>

          <div className="panel-section">
            <div className="slider-header">
              <label>
                <Contrast size={14} /> Contrast Definition
              </label>
              <span>{Math.round(contrast * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.02"
              value={contrast}
              onChange={(e) => setContrast(parseFloat(e.target.value))}
            />
          </div>

          <div className="panel-section">
            <div className="slider-header">
              <label>
                <Sliders size={14} /> Fabric Vibrance
              </label>
              <span>{Math.round(vibrance * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.02"
              value={vibrance}
              onChange={(e) => setVibrance(parseFloat(e.target.value))}
            />
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="button button-secondary reset-btn"
          >
            <RotateCcw size={14} />
            <span>Reset to Optimal Studio Balance</span>
          </button>
        </div>
      </div>
    </div>
  );
}
