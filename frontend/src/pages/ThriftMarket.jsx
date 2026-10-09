import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Search,
  Filter,
  Palette,
  Heart,
  Tag,
  CheckCircle,
  Eye,
  PlusCircle,
  Phone,
  Mail,
  Shirt,
  DollarSign,
  Upload,
  Camera,
  Check,
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  Award,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import ConfirmModal from "../components/ConfirmModal";

// Curated Fallback Items to ensure the store never shows a blank screen
const FALLBACK_THRIFT_ITEMS = [
  {
    _id: "fb_burberry_01",
    name: "Burberry Vintage Nova Check Harrington Jacket – Archive Beige",
    category: "Outerwear",
    color: "Archive Beige / Check",
    brand: "Burberry",
    size: "L",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
    description: "Iconic vintage Burberry Harrington jacket featuring the classic Nova Check cotton lining, horn button throat latch, and storm flap back.",
    sellerName: "Kloset Luxury Vault",
    sellerHandle: "kloset_vault",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "vault@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 4999,
    originalPrice: 42000,
    condition: "Like New",
    tags: ["luxury", "vintage", "old money", "streetwear"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_ralph_02",
    name: "Ralph Lauren Purple Label Cable-Knit Wool-Cashmere Sweater – Hunter Green",
    category: "Tops",
    color: "Hunter Green",
    brand: "Ralph Lauren",
    size: "M",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
    description: "Ultra-luxurious Italian-spun cable knit sweater from Ralph Lauren. Incredibly soft hand feel, ribbed hem and cuffs.",
    sellerName: "Kloset Luxury Vault",
    sellerHandle: "kloset_vault",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "vault@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 3299,
    originalPrice: 28500,
    condition: "Like New",
    tags: ["old money", "luxury", "casual", "vintage"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_gucci_03",
    name: "Gucci Web Stripe Collar Monogram Pique Polo – Ivory Cream",
    category: "Tops",
    color: "Ivory Cream",
    brand: "Gucci",
    size: "L",
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80",
    description: "Made in Italy Gucci stretch-cotton pique polo shirt with signature Web knit collar and mother-of-pearl buttons.",
    sellerName: "Kloset Luxury Vault",
    sellerHandle: "kloset_vault",
    sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "vault@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 4199,
    originalPrice: 36000,
    condition: "Like New",
    tags: ["luxury", "party", "streetwear", "casual"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_carhartt_04",
    name: "Carhartt WIP Detroit Blanket-Lined Canvas Work Jacket – Tobacco Brown",
    category: "Outerwear",
    color: "Tobacco Brown",
    brand: "Carhartt",
    size: "XL",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    description: "Heavyweight 12oz organic Dearborn canvas jacket with blanket lining and corduroy collar.",
    sellerName: "Kloset Curated",
    sellerHandle: "kloset_drop",
    sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "drops@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 2899,
    originalPrice: 18500,
    condition: "Vintage Thrifted",
    tags: ["streetwear", "vintage", "casual"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_stussy_05",
    name: "Stüssy 8-Ball Mohair Blend Knit Cardigan – Bone White / Black",
    category: "Tops",
    color: "Bone White",
    brand: "Stüssy",
    size: "M",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
    description: "Sold-out Stüssy brushed mohair-wool cardigan with jacquard 8-Ball back graphic.",
    sellerName: "Kloset Curated",
    sellerHandle: "kloset_drop",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "drops@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 2599,
    originalPrice: 17999,
    condition: "Like New",
    tags: ["streetwear", "y2k", "casual", "party"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_stone_06",
    name: "Stone Island Garment-Dyed Crinkle Reps NY Down Puffer – Slate Grey",
    category: "Outerwear",
    color: "Slate Grey",
    brand: "Stone Island",
    size: "L",
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
    description: "Iconic Stone Island down puffer jacket crafted from ultra-dense crinkle reps nylon.",
    sellerName: "Kloset Luxury Vault",
    sellerHandle: "kloset_vault",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "vault@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 6999,
    originalPrice: 62000,
    condition: "Brand New with Tags",
    tags: ["luxury", "streetwear", "outerwear", "athleisure"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_puma_07",
    name: 'Pre-Loved Puma "Since 1948" Graphic Performance T-Shirt – Black',
    category: "Tops",
    color: "Black",
    brand: "Puma",
    size: "L",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    description: 'Authentic pre-loved Puma performance graphic tee. Features "Since 1948" chest graphic.',
    sellerName: "Kloset Curated",
    sellerHandle: "kloset_drop",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "drops@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 599,
    originalPrice: 1999,
    condition: "Gently Used",
    tags: ["casual", "streetwear", "vintage", "sports"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_underarmour_08",
    name: 'Under Armour "The Tech Tee" Performance T-Shirt – Heather Grey',
    category: "Tops",
    color: "Heather Grey",
    brand: "Under Armour",
    size: "XL",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
    description: "Under Armour loose fit UA Tech performance t-shirt in heather grey.",
    sellerName: "Kloset Curated",
    sellerHandle: "kloset_drop",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "drops@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 699,
    originalPrice: 1999,
    condition: "Like New",
    tags: ["casual", "activewear", "streetwear"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_arc_09",
    name: "Arc'teryx Beta LT GORE-TEX Mountain Shell Jacket – Black Sapphire",
    category: "Outerwear",
    color: "Black Sapphire",
    brand: "Arc'teryx",
    size: "L",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80",
    description: "GORE-TEX 3L lightweight technical mountain shell jacket.",
    sellerName: "Kloset Curated",
    sellerHandle: "kloset_drop",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "drops@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 4499,
    originalPrice: 39500,
    condition: "Brand New with Tags",
    tags: ["streetwear", "athleisure", "outerwear", "minimalist"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "fb_levi_10",
    name: "Levi's Vintage Clothing 1954 501 Selvedge Raw Denim Jeans – Rigid Indigo",
    category: "Bottoms",
    color: "Rigid Indigo",
    brand: "Levi's",
    size: "32",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
    description: "Exact archival reproduction of 1954 501 jeans made with Cone Mills White Oak pink selvedge raw denim.",
    sellerName: "Kloset Curated",
    sellerHandle: "kloset_drop",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    sellerPhone: "+91 98765 43210",
    sellerEmail: "drops@kloset.in",
    isPublic: true,
    isForSale: true,
    price: 2699,
    originalPrice: 19500,
    condition: "Like New",
    tags: ["vintage", "casual", "streetwear", "old money"],
    status: "Available",
    createdAt: new Date().toISOString(),
  },
];

export default function ThriftMarket() {
  const {
    cart,
    addToCart,
    currentUser,
    showToast,
    openAuthModal,
    openChatWithItem,
  } = useApp();

  // Active Main View: 'buy' | 'sell' | 'my-listings'
  const [activeView, setActiveView] = useState("buy");

  // Market Items State - Pre-seed with fallback items so store is never 0 on load
  const [items, setItems] = useState(FALLBACK_THRIFT_ITEMS);
  const [loading, setLoading] = useState(false);
  // Auto-remove any product whose thumbnail fails to load
  const [failedImageIds, setFailedImageIds] = useState(() => new Set());
  // Custom Delete Listing Confirm Modal State
  const [listingToDelete, setListingToDelete] = useState(null);
  const [isDeletingListing, setIsDeletingListing] = useState(false);

  // Multi-Attribute Filter Suite (Vibe, Brands, Price Range, Condition, etc.)
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [vibeFilter, setVibeFilter] = useState("All");
  const [pricePreset, setPricePreset] = useState("all"); // 'all' | 'under_1000' | '1000_2500' | '2500_5000' | 'above_5000'
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(70000);
  const [onlyCustomized, setOnlyCustomized] = useState(false);
  const [discountFilter, setDiscountFilter] = useState(0); // min % savings
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'price_low' | 'price_high' | 'discount'
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const vibeOptions = [
    "All",
    "Streetwear",
    "Luxury / Old Money",
    "Vintage",
    "Casual",
    "Y2K",
    "Athleisure",
    "Minimalist",
    "Party / Glam",
    "College",
  ];

  const availableBrands = React.useMemo(() => {
    const brandSet = new Set();
    [
      "Burberry",
      "Ralph Lauren",
      "Gucci",
      "Prada",
      "Balenciaga",
      "Stone Island",
      "Carhartt",
      "Stüssy",
      "Arc'teryx",
      "Supreme",
      "Nike",
      "Adidas",
      "Levi's",
      "Tommy Hilfiger",
      "Puma",
      "Under Armour",
      "Zara",
    ].forEach((b) => brandSet.add(b));

    items.forEach((item) => {
      if (item.brand && item.brand.trim()) {
        brandSet.add(item.brand.trim());
      }
    });

    const list = Array.from(brandSet).sort((a, b) => a.localeCompare(b));
    return ["All", ...list];
  }, [items]);

  const activeFiltersCount =
    (categoryFilter !== "All" ? 1 : 0) +
    (conditionFilter !== "All" ? 1 : 0) +
    (brandFilter !== "All" ? 1 : 0) +
    (vibeFilter !== "All" ? 1 : 0) +
    (pricePreset !== "all" || maxPrice < 60000 || minPrice > 0 ? 1 : 0) +
    (onlyCustomized ? 1 : 0) +
    (discountFilter > 0 ? 1 : 0);

  const handleResetAllFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setConditionFilter("All");
    setBrandFilter("All");
    setVibeFilter("All");
    setPricePreset("all");
    setMinPrice(0);
    setMaxPrice(70000);
    setOnlyCustomized(false);
    setDiscountFilter(0);
    setSortBy("newest");
  };

  // Quick view modal
  const [quickViewItem, setQuickViewItem] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 220);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // SELL FORM STATE
  const [sellPhoto, setSellPhoto] = useState(null);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellForm, setSellForm] = useState({
    name: "",
    category: "Tops",
    color: "",
    brand: "",
    size: "M",
    description: "",
    condition: "Gently Used",
    price: 599,
    originalPrice: 1499,
    isCustomized: false,
    sellerPhone: currentUser?.phone || "",
    sellerEmail: currentUser?.email || "",
    tags: ["vintage", "casual"],
  });

  // Demo clothing photos for fast one-click testing
  const sampleGarments = [
    {
      title: "Vintage 90s Bomber Jacket",
      category: "Outerwear",
      color: "Olive Green",
      brand: "Alpha Thrift",
      size: "L",
      condition: "Vintage Thrifted",
      price: 45,
      originalPrice: 120,
      url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Distressed Levi's 501 Jeans",
      category: "Bottoms",
      color: "Light Washed Denim",
      brand: "Levi's",
      size: "32",
      condition: "Gently Used",
      price: 38,
      originalPrice: 85,
      url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Collegiate Heavyweight Hoodie",
      category: "Tops",
      color: "Heather Grey",
      brand: "Champion",
      size: "M",
      condition: "Like New",
      price: 28,
      originalPrice: 60,
      url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Retro High-Top Sneakers",
      category: "Shoes",
      color: "White & Crimson",
      brand: "Nike Vintage",
      size: "US 10",
      condition: "Gently Used",
      price: 52,
      originalPrice: 110,
      url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    },
  ];

  // Fetch all thrift clothes for sale
  const fetchMarketItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/clothes?isForSale=true");
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else {
        setItems(FALLBACK_THRIFT_ITEMS);
      }
    } catch (err) {
      console.warn("Using fallback curated thrift items due to connection delay:", err);
      // Fallback items are already preset
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketItems();

    // Auto-poll to sync with backend database if connection was delayed or server restarted
    const interval = setInterval(() => {
      fetch("http://localhost:5001/api/clothes?isForSale=true")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data);
            clearInterval(interval);
          }
        })
        .catch(() => {});
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Update seller contact when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSellForm((prev) => ({
        ...prev,
        sellerPhone: prev.sellerPhone || currentUser.phone || "",
        sellerEmail: prev.sellerEmail || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  // Photo upload handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSellPhoto(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePickSample = (sample) => {
    setSellPhoto(sample.url);
    setSellForm((prev) => ({
      ...prev,
      name: sample.title,
      category: sample.category,
      color: sample.color,
      brand: sample.brand,
      size: sample.size,
      condition: sample.condition,
      price: sample.price,
      originalPrice: sample.originalPrice,
    }));
    showToast(`Loaded "${sample.title}" sample!`);
  };

  // Submit Sell Form
  const handleSellSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !currentUser.id) {
      openAuthModal("register");
      showToast("Please register or sign in before listing clothes for sale", "info");
      return;
    }

    if (!sellForm.name.trim()) {
      showToast("Please provide a name/title for your garment", "error");
      return;
    }

    setSellLoading(true);
    try {
      const payload = {
        name: sellForm.name.trim(),
        category: sellForm.category,
        color: sellForm.color.trim() || "Multi",
        brand: sellForm.brand.trim() || "Thrifted",
        size: sellForm.size.trim() || "Standard",
        condition: sellForm.condition,
        price: Number(sellForm.price) || 20,
        originalPrice: Number(sellForm.originalPrice) || Number(sellForm.price) * 1.5,
        isCustomized: sellForm.isCustomized,
        description: sellForm.description.trim() || "Pre-loved second-hand piece in great shape.",
        image:
          sellPhoto ||
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
        enhancedImage: sellPhoto,
        isForSale: true,
        isPublic: true,
        status: "Available",
        userId: currentUser.id,
        sellerName: currentUser.name,
        sellerHandle: currentUser.handle,
        sellerAvatar: currentUser.avatar,
        sellerPhone: sellForm.sellerPhone || currentUser.phone || "",
        sellerEmail: sellForm.sellerEmail || currentUser.email || "",
        tags: sellForm.tags,
      };

      const response = await fetch("http://localhost:5001/api/clothes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`🎉 "${sellForm.name}" is now live on the Thrift Store!`);
        // Reset form
        setSellForm({
          name: "",
          category: "Tops",
          color: "",
          brand: "",
          size: "M",
          description: "",
          condition: "Gently Used",
          price: 30,
          originalPrice: 65,
          isCustomized: false,
          sellerPhone: currentUser.phone || "",
          sellerEmail: currentUser.email || "",
          tags: ["vintage", "casual"],
        });
        setSellPhoto(null);
        // Refresh items and switch to buy view to see the new item
        await fetchMarketItems();
        setActiveView("buy");
      } else {
        alert(data.message || "Failed to list item for sale");
      }
    } catch (err) {
      console.error("Sell listing error:", err);
      alert("Could not connect to the backend server.");
    } finally {
      setSellLoading(false);
    }
  };

  // Delete an item from seller's listings using custom ConfirmModal
  const handleRequestDeleteListing = (item) => {
    setListingToDelete(item);
  };

  const handleConfirmDeleteListing = async () => {
    if (!listingToDelete) return;
    setIsDeletingListing(true);
    try {
      const res = await fetch(`http://localhost:5001/api/clothes/${listingToDelete._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it._id !== listingToDelete._id));
        showToast(`"${listingToDelete.name}" removed from thrift store.`);
        setListingToDelete(null);
      } else {
        showToast("Failed to remove listing", "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Network error removing listing", "error");
    } finally {
      setIsDeletingListing(false);
    }
  };

  // Mark item as sold
  const handleMarkSold = async (item) => {
    try {
      const newStatus = item.status === "Sold" ? "Available" : "Sold";
      const res = await fetch(`http://localhost:5001/api/clothes/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((it) => (it._id === item._id ? { ...it, status: newStatus } : it))
        );
        showToast(
          newStatus === "Sold" ? "Marked as SOLD! 🎉" : "Item re-opened as Available!"
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const categories = ["All", "Tops", "Bottoms", "Outerwear", "Dresses", "Shoes", "Accessories"];
  const conditions = [
    "All",
    "Gently Used",
    "Like New",
    "Brand New with Tags",
    "Vintage Thrifted",
    "Customized / Upcycled",
  ];

  // User's own listings
  const myListings = items.filter((item) => item.userId === currentUser?.id);

  // Filtered Items for Buying with Brand, Vibe, Price Range, and Condition
  const filteredItems = items
    .filter((item) => {
      // Exclude products without thumbnail or whose image failed to load
      const hasThumb = Boolean(
        (item.enhancedImage && item.enhancedImage.trim()) ||
        (item.image && item.image.trim())
      );
      if (!hasThumb || failedImageIds.has(item._id)) {
        return false;
      }

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.sellerHandle?.toLowerCase().includes(q) ||
        item.color?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchesCondition =
        conditionFilter === "All" || item.condition === conditionFilter;

      const matchesCustom = !onlyCustomized || item.isCustomized;

      // Brand Filter
      const matchesBrand =
        brandFilter === "All" ||
        item.brand?.toLowerCase() === brandFilter.toLowerCase() ||
        item.brand?.toLowerCase().includes(brandFilter.toLowerCase());

      // Vibe / Aesthetic Filter
      const matchesVibe =
        vibeFilter === "All" ||
        item.tags?.some((t) => {
          const tLower = t.toLowerCase();
          if (vibeFilter === "Luxury / Old Money") {
            return tLower.includes("luxury") || tLower.includes("old money");
          }
          if (vibeFilter === "Party / Glam") {
            return tLower.includes("party") || tLower.includes("glam");
          }
          return tLower.includes(vibeFilter.toLowerCase());
        });

      // Price preset & custom min/max
      let matchesPrice = item.price >= minPrice && item.price <= maxPrice;
      if (pricePreset === "under_1000") matchesPrice = matchesPrice && item.price < 1000;
      else if (pricePreset === "1000_2500") matchesPrice = matchesPrice && item.price >= 1000 && item.price <= 2500;
      else if (pricePreset === "2500_5000") matchesPrice = matchesPrice && item.price > 2500 && item.price <= 5000;
      else if (pricePreset === "above_5000") matchesPrice = matchesPrice && item.price > 5000;

      // Savings / Discount
      const origPrice =
        item.originalPrice && item.originalPrice > item.price
          ? item.originalPrice
          : Math.round(item.price * 2.2);
      const savings = Math.round(((origPrice - item.price) / origPrice) * 100);
      const matchesDiscount = discountFilter === 0 || savings >= discountFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCondition &&
        matchesCustom &&
        matchesBrand &&
        matchesVibe &&
        matchesPrice &&
        matchesDiscount
      );
    })
    .sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "discount") {
        const origA =
          a.originalPrice && a.originalPrice > a.price
            ? a.originalPrice
            : Math.round(a.price * 2.2);
        const savingsA = Math.round(((origA - a.price) / origA) * 100);
        const origB =
          b.originalPrice && b.originalPrice > b.price
            ? b.originalPrice
            : Math.round(b.price * 2.2);
        const savingsB = Math.round(((origB - b.price) / origB) * 100);
        return savingsB - savingsA;
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  // Fullscreen Navigation & Product Scrolling State
  const currentProductIndex = quickViewItem
    ? filteredItems.findIndex((it) => it._id === quickViewItem._id)
    : -1;

  const handlePrevProduct = (e) => {
    if (e) e.stopPropagation();
    if (filteredItems.length <= 1) return;
    const prevIdx =
      currentProductIndex <= 0 ? filteredItems.length - 1 : currentProductIndex - 1;
    setQuickViewItem(filteredItems[prevIdx]);
  };

  const handleNextProduct = (e) => {
    if (e) e.stopPropagation();
    if (filteredItems.length <= 1) return;
    const nextIdx =
      currentProductIndex >= filteredItems.length - 1 ? 0 : currentProductIndex + 1;
    setQuickViewItem(filteredItems[nextIdx]);
  };

  // Keyboard navigation & lock background body scroll when full-screen is active
  const thumbnailStripRef = useRef(null);

  useEffect(() => {
    if (!quickViewItem) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setQuickViewItem(null);
      if (e.key === "ArrowLeft") handlePrevProduct();
      if (e.key === "ArrowRight") handleNextProduct();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [quickViewItem, currentProductIndex, filteredItems]);

  // Auto-scroll the active thumbnail into view in the bottom carousel
  useEffect(() => {
    if (quickViewItem && thumbnailStripRef.current) {
      const activeEl = thumbnailStripRef.current.querySelector(".thumb-card-active");
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [quickViewItem]);

  // Lock body scroll and handle Escape key for right-side filter drawer
  useEffect(() => {
    if (!showFilterDrawer) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowFilterDrawer(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [showFilterDrawer]);

  return (
    <div className="thrift-store-page">
      {/* Top Main Navigation Bar: BUY vs SELL */}
      <div className="thrift-mode-banner">
        <div className="thrift-mode-inner">
          <div className="thrift-mode-title-block">
            <span className="mode-pill-tag">
              <Sparkles size={13} /> Circular Thrift Fashion
            </span>
            <h1>Community Thrift Store</h1>
            <p>Buy curated pre-loved clothes or sell your second-hand wardrobe with direct contacts.</p>
          </div>

          <div className="thrift-view-switcher">
            <button
              onClick={() => setActiveView("buy")}
              className={`thrift-switch-btn ${activeView === "buy" ? "active" : ""}`}
            >
              <ShoppingBag size={18} />
              <span>Buy Clothes ({items.length})</span>
            </button>

            <button
              onClick={() => setActiveView("sell")}
              className={`thrift-switch-btn ${activeView === "sell" ? "active sell-active" : ""}`}
            >
              <PlusCircle size={18} />
              <span>Sell Clothes</span>
            </button>

            <button
              onClick={() => setActiveView("my-listings")}
              className={`thrift-switch-btn ${activeView === "my-listings" ? "active" : ""}`}
            >
              <Tag size={18} />
              <span>My Listings ({myListings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: BUY SECOND-HAND CLOTHES
          ========================================================================= */}
      {activeView === "buy" && (
        <div className="buy-section-container">
          {/* Latest Drop Hero Header (matches reference design) */}
          <div className="latest-drop-header">
            <h1 className="latest-drop-title">Latest Drop</h1>
            <p className="latest-drop-subtitle">
              With thousands of satisfied customers and growing popularity, Kloset has become a trusted name among thrift and streetwear enthusiasts in India
            </p>
          </div>

          {/* Controls & Filters Bar */}
          <div className="market-controls-wrapper">
            {/* Search Bar + Filters Toggle Button */}
            <div className="search-and-filter-row">
              <div className="search-bar-wrap">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search designer & streetwear thrift (Burberry, Stüssy, Ralph Lauren, Carhartt...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="clear-search-btn">
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilterDrawer(!showFilterDrawer)}
                className={`market-filter-btn ${showFilterDrawer || activeFiltersCount > 0 ? "filter-btn-active" : ""}`}
                title="Filter by Vibe, Brand, Price Range, Condition"
              >
                <SlidersHorizontal size={17} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="filter-count-badge">{activeFiltersCount}</span>
                )}
                <ChevronDown size={15} className={`filter-chevron ${showFilterDrawer ? "rotated" : ""}`} />
              </button>
            </div>

            {/* Categories Row */}
            <div className="categories-pill-row">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`cat-pill ${categoryFilter === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right-Aligned E-Commerce Filter Drawer */}
            {showFilterDrawer && (
              <div
                className="filter-drawer-overlay"
                onClick={() => setShowFilterDrawer(false)}
              >
                <aside
                  className="right-filter-drawer"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Filter collection"
                >
                  <div className="drawer-header-bar">
                    <div className="drawer-title-stack">
                      <div className="drawer-title-row">
                        <SlidersHorizontal size={18} />
                        <h3>Filters</h3>
                        {activeFiltersCount > 0 && (
                          <span className="drawer-badge">{activeFiltersCount} active</span>
                        )}
                      </div>
                      <span className="drawer-results-count">
                        Showing {filteredItems.length} matching pieces
                      </span>
                    </div>

                    <div className="drawer-top-actions">
                      {activeFiltersCount > 0 && (
                        <button
                          type="button"
                          onClick={handleResetAllFilters}
                          className="drawer-reset-btn"
                          title="Reset all filters"
                        >
                          <RotateCcw size={13} />
                          <span>Reset</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowFilterDrawer(false)}
                        className="drawer-close-btn"
                        title="Close filters"
                        aria-label="Close filters"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="drawer-scroll-body">
                    {/* 1. Vibe & Aesthetic */}
                    <div className="filter-section-card">
                    <div className="filter-section-header">
                      <Sparkles size={15} className="f-icon-accent" />
                      <h4>Vibe & Aesthetic</h4>
                    </div>
                    <div className="filter-chips-cluster">
                      {vibeOptions.map((vb) => (
                        <button
                          key={vb}
                          type="button"
                          onClick={() => setVibeFilter(vb)}
                          className={`filter-chip-pill ${vibeFilter === vb ? "active" : ""}`}
                        >
                          {vb === "All" ? "All Vibes" : `#${vb}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Designer & Archival Brands */}
                  <div className="filter-section-card">
                    <div className="filter-section-header">
                      <Award size={15} className="f-icon-accent" />
                      <h4>Designer & Streetwear Brands</h4>
                    </div>
                    <div className="filter-chips-cluster brand-chips-cluster">
                      {availableBrands.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBrandFilter(b)}
                          className={`filter-chip-pill ${brandFilter === b ? "active brand-active" : ""}`}
                        >
                          {b === "All" ? "All Brands" : b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Price Range (₹ INR) */}
                  <div className="filter-section-card">
                    <div className="filter-section-header">
                      <DollarSign size={15} className="f-icon-accent" />
                      <h4>Price Range (₹ INR)</h4>
                    </div>
                    <div className="filter-chips-cluster">
                      <button
                        type="button"
                        onClick={() => {
                          setPricePreset("all");
                          setMinPrice(0);
                          setMaxPrice(70000);
                        }}
                        className={`filter-chip-pill ${pricePreset === "all" && maxPrice >= 60000 ? "active" : ""}`}
                      >
                        All Prices
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPricePreset("under_1000");
                          setMinPrice(0);
                          setMaxPrice(1000);
                        }}
                        className={`filter-chip-pill ${pricePreset === "under_1000" ? "active" : ""}`}
                      >
                        Under ₹1,000
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPricePreset("1000_2500");
                          setMinPrice(1000);
                          setMaxPrice(2500);
                        }}
                        className={`filter-chip-pill ${pricePreset === "1000_2500" ? "active" : ""}`}
                      >
                        ₹1,000 – ₹2,500
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPricePreset("2500_5000");
                          setMinPrice(2500);
                          setMaxPrice(5000);
                        }}
                        className={`filter-chip-pill ${pricePreset === "2500_5000" ? "active" : ""}`}
                      >
                        ₹2,500 – ₹5,000
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPricePreset("above_5000");
                          setMinPrice(5000);
                          setMaxPrice(70000);
                        }}
                        className={`filter-chip-pill ${pricePreset === "above_5000" ? "active" : ""}`}
                      >
                        ₹5,000+ (Luxury Archive)
                      </button>
                    </div>

                    <div className="drawer-price-range-slider">
                      <div className="price-inputs-row">
                        <span>Max Price Limit: <strong>₹{maxPrice.toLocaleString()}</strong></span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="70000"
                        step="250"
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(Number(e.target.value));
                          setPricePreset("custom");
                        }}
                      />
                    </div>
                  </div>

                  {/* 4. Condition & Minimum Discount */}
                  <div className="filter-section-card">
                    <div className="filter-section-header">
                      <Tag size={15} className="f-icon-accent" />
                      <h4>Condition & Minimum Discount</h4>
                    </div>
                    <div className="filter-chips-cluster">
                      {conditions.map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setConditionFilter(cond)}
                          className={`filter-chip-pill ${conditionFilter === cond ? "active" : ""}`}
                        >
                          {cond}
                        </button>
                      ))}
                    </div>

                    <div className="discount-pills-row">
                      <span className="sub-label">Min Discount:</span>
                      <button
                        type="button"
                        onClick={() => setDiscountFilter(0)}
                        className={`tag-pill ${discountFilter === 0 ? "active" : ""}`}
                      >
                        Any
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountFilter(60)}
                        className={`tag-pill ${discountFilter === 60 ? "active" : ""}`}
                      >
                        60%+ off
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountFilter(75)}
                        className={`tag-pill ${discountFilter === 75 ? "active" : ""}`}
                      >
                        75%+ off
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountFilter(85)}
                        className={`tag-pill ${discountFilter === 85 ? "active" : ""}`}
                      >
                        85%+ off (Vault)
                      </button>
                    </div>
                  </div>

                  {/* 5. Sort By */}
                  <div className="filter-section-card">
                    <div className="filter-section-header">
                      <RotateCcw size={15} className="f-icon-accent" />
                      <h4>Sort Collection</h4>
                    </div>
                    <div className="filter-chips-cluster">
                      <button
                        type="button"
                        onClick={() => setSortBy("newest")}
                        className={`filter-chip-pill ${sortBy === "newest" ? "active" : ""}`}
                      >
                        Latest Drops
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy("price_low")}
                        className={`filter-chip-pill ${sortBy === "price_low" ? "active" : ""}`}
                      >
                        Price: Low to High
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy("price_high")}
                        className={`filter-chip-pill ${sortBy === "price_high" ? "active" : ""}`}
                      >
                        Price: High to Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortBy("discount")}
                        className={`filter-chip-pill ${sortBy === "discount" ? "active" : ""}`}
                      >
                        Biggest % Savings
                      </button>
                    </div>
                  </div>
                </div>

                <div className="drawer-footer-actions">
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="button button-secondary drawer-clear-btn"
                  >
                    Reset All Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterDrawer(false)}
                    className="button button-primary drawer-apply-btn"
                  >
                    Show {filteredItems.length} Products
                  </button>
                </div>
              </aside>
            </div>
          )}

            {/* Active Filters Summary Bar */}
            {activeFiltersCount > 0 && (
              <div className="active-filters-summary-bar">
                <span className="active-summary-label">Active Filters:</span>

                {categoryFilter !== "All" && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("All")}
                    className="active-tag-chip"
                  >
                    Category: {categoryFilter} ✕
                  </button>
                )}

                {vibeFilter !== "All" && (
                  <button
                    type="button"
                    onClick={() => setVibeFilter("All")}
                    className="active-tag-chip"
                  >
                    Vibe: #{vibeFilter} ✕
                  </button>
                )}

                {brandFilter !== "All" && (
                  <button
                    type="button"
                    onClick={() => setBrandFilter("All")}
                    className="active-tag-chip brand-tag"
                  >
                    Brand: {brandFilter} ✕
                  </button>
                )}

                {pricePreset !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setPricePreset("all");
                      setMinPrice(0);
                      setMaxPrice(70000);
                    }}
                    className="active-tag-chip"
                  >
                    Price: {pricePreset.replace("_", " ").toUpperCase()} ✕
                  </button>
                )}

                {conditionFilter !== "All" && (
                  <button
                    type="button"
                    onClick={() => setConditionFilter("All")}
                    className="active-tag-chip"
                  >
                    Condition: {conditionFilter} ✕
                  </button>
                )}

                {discountFilter > 0 && (
                  <button
                    type="button"
                    onClick={() => setDiscountFilter(0)}
                    className="active-tag-chip"
                  >
                    Savings: {discountFilter}%+ off ✕
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="clear-all-inline-btn"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Product Grid */}
          {loading && items.length === 0 ? (
            <div className="loading-spinner-box">
              <div className="spinner"></div>
              <p>Fetching second-hand pieces from thrift closets...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <h3>{items.length === 0 ? "Connecting to Kloset Store..." : "No branded clothes matched your filters"}</h3>
              <p>
                {items.length === 0
                  ? "Connecting with the database. Please ensure the backend is running."
                  : `Currently ${items.length} designer pieces are loaded in the store. Try resetting filters or search terms to see them!`}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "14px", flexWrap: "wrap" }}>
                <button
                  onClick={handleResetAllFilters}
                  className="button button-secondary"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={fetchMarketItems}
                  className="button button-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <RefreshCw size={15} /> Refresh Store ({items.length} items)
                </button>
              </div>
            </div>
          ) : (
            <div className="mythrift-products-grid">
              {filteredItems.map((item) => {
                const isSold = item.status === "Sold";
                const inCartItem = cart?.find((c) => c._id === item._id);
                const cartQty = inCartItem ? inCartItem.quantity || 1 : 0;
                const origPrice =
                  item.originalPrice && item.originalPrice > item.price
                    ? item.originalPrice
                    : Math.round(item.price * 2.2);
                const savings = Math.round(
                  ((origPrice - item.price) / origPrice) * 100
                );

                return (
                  <div key={item._id} className="mythrift-product-card">
                    {/* Portrait Image Container */}
                    <div
                      className="mythrift-image-wrap"
                      onClick={() => setQuickViewItem(item)}
                      role="button"
                      tabIndex={0}
                      title={`Click to view full details for "${item.name}"`}
                    >
                      <img
                        src={
                          item.enhancedImage ||
                          item.image ||
                          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600"
                        }
                        alt={item.name}
                        className="mythrift-card-img"
                        loading="lazy"
                        onError={() => {
                          setFailedImageIds((prev) => {
                            const updated = new Set(prev);
                            updated.add(item._id);
                            return updated;
                          });
                        }}
                      />

                      {/* Top-Left Red Discount Badge */}
                      {savings > 0 && (
                        <span className="mythrift-discount-badge">
                          -{savings}%
                        </span>
                      )}

                      {/* Top-Right Action Buttons: Quick View & Chat */}
                      <div className="mythrift-card-corner-actions">
                        <button
                          type="button"
                          className="mythrift-quickview-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewItem(item);
                          }}
                          title="Quick View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="mythrift-chat-card-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChatWithItem(item);
                          }}
                          title={`Chat with seller @${item.sellerHandle || "seller"}`}
                        >
                          <MessageCircle size={15} />
                        </button>
                      </div>

                      {/* Bottom-Center Floating Split 'Add to cart' Pill Button */}
                      {!isSold ? (
                        <div
                          className="mythrift-add-cart-pill"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                            showToast(`Added "${item.name}" to cart! 🛍️`);
                          }}
                          role="button"
                          tabIndex={0}
                          title="Add to cart"
                        >
                          <span className="cart-pill-icon-box">
                            {cartQty > 0 ? (
                              <Check size={14} color="#ffffff" />
                            ) : (
                              <ShoppingBag size={14} color="#ffffff" />
                            )}
                          </span>
                          <span className="cart-pill-label">
                            {cartQty > 0 ? `In cart (${cartQty})` : "Add to cart"}
                          </span>
                        </div>
                      ) : (
                        <div className="mythrift-sold-pill">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* Centered Product Details Below Image */}
                    <div className="mythrift-card-info">
                      <h3
                        className="mythrift-card-title"
                        onClick={() => setQuickViewItem(item)}
                        title={item.name}
                      >
                        {item.name}
                      </h3>

                      <div className="mythrift-card-price-row">
                        <span className="mythrift-sale-price">
                          ₹{Number(item.price).toLocaleString("en-IN")}.00
                        </span>
                        {origPrice > item.price && (
                          <span className="mythrift-original-price">
                            ₹{Number(origPrice).toLocaleString("en-IN")}.00
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SELL SECOND-HAND CLOTHES
          ========================================================================= */}
      {activeView === "sell" && (
        <div className="sell-section-container">
          {/* Prompt if user is not registered / logged in */}
          {!currentUser || !currentUser.id ? (
            <div className="sell-auth-gate-card">
              <div className="gate-icon-wrap">
                <Shirt size={48} />
              </div>
              <h2>Register to Sell Second-Hand Clothes</h2>
              <p>
                To maintain trust and safety on Kloset Thrift Store, sellers must register their name
                using a valid Gmail address or phone number.
              </p>
              <div className="gate-cta-buttons">
                <button
                  onClick={() => openAuthModal("register")}
                  className="button button-accent gate-btn"
                >
                  <Mail size={18} />
                  <span>Register with Gmail or Phone</span>
                </button>
                <button
                  onClick={() => openAuthModal("login")}
                  className="button button-secondary gate-btn"
                >
                  <span>Already have an account? Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="sell-form-wrapper">
              {/* Seller Intro Banner */}
              <div className="seller-status-header">
                <div className="seller-avatar-block">
                  <img src={currentUser.avatar} alt={currentUser.name} />
                  <div>
                    <div className="seller-id-row">
                      <h3>{currentUser.name}</h3>
                      <span className="seller-handle-badge">@{currentUser.handle}</span>
                      <span className="seller-verified-pill">
                        <CheckCircle size={12} /> Registered Seller
                      </span>
                    </div>
                    <p className="seller-contact-hint">
                      {currentUser.registrationMethod === "phone"
                        ? `Registered via Phone: ${currentUser.phone || "Yes"}`
                        : `Registered via Gmail: ${currentUser.email || "Yes"}`}
                      {" • "}Your listings will be displayed in the live thrift store.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView("my-listings")}
                  className="button button-secondary view-my-items-btn"
                >
                  <Tag size={15} />
                  <span>My Active Listings ({myListings.length})</span>
                </button>
              </div>

              <form onSubmit={handleSellSubmit} className="thrift-sell-form">
                {/* 1. Garment Photo Upload */}
                <div className="form-card-block">
                  <div className="block-header">
                    <span className="step-number">1</span>
                    <div>
                      <h4>Upload Garment Photo</h4>
                      <p>Clear front photo of the clothes you want to sell.</p>
                    </div>
                  </div>

                  {/* Fast Samples */}
                  <div className="fast-samples-bar">
                    <span className="samples-title">Or test with demo garment:</span>
                    <div className="sample-chips-wrap">
                      {sampleGarments.map((sg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePickSample(sg)}
                          className="sample-item-chip"
                        >
                          {sg.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="photo-upload-grid">
                    <div className="photo-preview-box">
                      {sellPhoto ? (
                        <div className="preview-image-wrap">
                          <img src={sellPhoto} alt="Garment preview" className="preview-img" />
                          <button
                            type="button"
                            onClick={() => setSellPhoto(null)}
                            className="remove-photo-btn"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="photo-placeholder-box">
                          <Shirt size={48} className="placeholder-icon" />
                          <p>No photo selected yet</p>
                          <span>Upload a photo or choose a demo piece above</span>
                        </div>
                      )}
                    </div>

                    <div className="photo-actions-box">
                      <label className="upload-cta-button primary">
                        <Upload size={18} />
                        <span>Choose Photo from Gallery</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          hidden
                        />
                      </label>

                      <label className="upload-cta-button secondary">
                        <Camera size={18} />
                        <span>Take Live Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          hidden
                        />
                      </label>
                      <p className="photo-tip">
                        💡 Tip: Hang your garment against a neutral wall or flat surface for the best buyer appeal!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Garment Details */}
                <div className="form-card-block">
                  <div className="block-header">
                    <span className="step-number">2</span>
                    <div>
                      <h4>Garment Title & Specification</h4>
                      <p>Accurate sizing and categorization helps buyers find your piece faster.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Garment Title / Item Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. 90s Vintage Oversized Fleece Crewneck"
                      value={sellForm.name}
                      onChange={(e) => setSellForm({ ...sellForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={sellForm.category}
                        onChange={(e) => setSellForm({ ...sellForm, category: e.target.value })}
                      >
                        <option value="Tops">Tops</option>
                        <option value="Bottoms">Bottoms</option>
                        <option value="Outerwear">Outerwear / Jackets</option>
                        <option value="Dresses">Dresses</option>
                        <option value="Shoes">Shoes</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    <div className="form-group brand-select-group">
                      <label>Brand / Designer Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Burberry, Ralph Lauren, Stüssy, Carhartt, Nike..."
                        value={sellForm.brand}
                        onChange={(e) => setSellForm({ ...sellForm, brand: e.target.value })}
                      />
                      <div className="sell-brand-chips-row">
                        {["Burberry", "Ralph Lauren", "Gucci", "Carhartt", "Stüssy", "Stone Island", "Prada", "Nike", "Adidas", "Levi's"].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSellForm({ ...sellForm, brand: b })}
                            className={`mini-brand-chip ${sellForm.brand === b ? "active" : ""}`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Size</label>
                      <input
                        type="text"
                        placeholder="e.g. S, M, L, XL, 32"
                        value={sellForm.size}
                        onChange={(e) => setSellForm({ ...sellForm, size: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Dominant Color</label>
                      <input
                        type="text"
                        placeholder="e.g. Olive Green, Washed Navy, Black"
                        value={sellForm.color}
                        onChange={(e) => setSellForm({ ...sellForm, color: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Second-Hand Condition *</label>
                      <select
                        value={sellForm.condition}
                        onChange={(e) => setSellForm({ ...sellForm, condition: e.target.value })}
                      >
                        <option value="Brand New with Tags">Brand New with Tags (Never worn)</option>
                        <option value="Like New">Like New (Worn once or twice)</option>
                        <option value="Gently Used">Gently Used (Good shape, minimal wear)</option>
                        <option value="Vintage Thrifted">Vintage Thrifted (Authentic retro aged piece)</option>
                        <option value="Customized / Upcycled">Customized / Upcycled (Handmade reworked)</option>
                      </select>
                    </div>
                  </div>

                  <label className="checkbox-rework-label">
                    <input
                      type="checkbox"
                      checked={sellForm.isCustomized}
                      onChange={(e) =>
                        setSellForm({ ...sellForm, isCustomized: e.target.checked })
                      }
                    />
                    <Palette size={16} />
                    <span>This piece is a Customized or Upcycled rework</span>
                  </label>
                </div>

                {/* 3. Pricing & Seller Contact */}
                <div className="form-card-block">
                  <div className="block-header">
                    <span className="step-number">3</span>
                    <div>
                      <h4>Pricing & Seller Contact Information</h4>
                      <p>Set a fair thrift price and confirm how buyers can reach you.</p>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Selling Price (Rs.) *</label>
                      <div className="price-input-wrapper">
                        <span className="currency-prefix">Rs.</span>
                        <input
                          type="number"
                          min="1"
                          value={sellForm.price}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, price: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Original Retail Price (Rs.) - optional</label>
                      <div className="price-input-wrapper">
                        <span className="currency-prefix">Rs.</span>
                        <input
                          type="number"
                          min="0"
                          value={sellForm.originalPrice}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, originalPrice: Number(e.target.value) })
                          }
                        />
                      </div>
                      <span className="field-hint">
                        Shows buyers how much they save by shopping thrift!
                      </span>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Seller Phone Number (WhatsApp / Calls)</label>
                      <div className="contact-input-wrapper">
                        <Phone size={16} className="contact-icon" />
                        <input
                          type="text"
                          placeholder="e.g. +91 98765 43210"
                          value={sellForm.sellerPhone}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, sellerPhone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Seller Gmail / Email</label>
                      <div className="contact-input-wrapper">
                        <Mail size={16} className="contact-icon" />
                        <input
                          type="email"
                          placeholder="e.g. yourname@gmail.com"
                          value={sellForm.sellerEmail}
                          onChange={(e) =>
                            setSellForm({ ...sellForm, sellerEmail: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Garment Description & Condition Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Mention fabric feel, fit, any flaws, or why you're passing it on..."
                      value={sellForm.description}
                      onChange={(e) =>
                        setSellForm({ ...sellForm, description: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="form-submit-row">
                  <button
                    type="submit"
                    disabled={sellLoading}
                    className="button button-accent big-publish-btn"
                  >
                    {sellLoading ? (
                      "Publishing to Thrift Store..."
                    ) : (
                      <>
                        <Tag size={18} />
                        <span>List on Thrift Store for Rs. {sellForm.price}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: MY ACTIVE THRIFT LISTINGS
          ========================================================================= */}
      {activeView === "my-listings" && (
        <div className="my-listings-container">
          <div className="listings-header-bar">
            <div>
              <h2>My Active Thrift Listings</h2>
              <p>Manage second-hand clothes you have put up for sale.</p>
            </div>
            <button
              onClick={() => setActiveView("sell")}
              className="button button-primary"
            >
              <PlusCircle size={16} />
              <span>List Another Piece</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="empty-state">
              <Tag size={48} />
              <h3>You don't have any active thrift listings yet</h3>
              <p>Click "Sell Clothes" to put your first second-hand piece on the market!</p>
              <button
                onClick={() => setActiveView("sell")}
                className="button button-accent"
                style={{ marginTop: "14px" }}
              >
                Sell Second-Hand Clothes
              </button>
            </div>
          ) : (
            <div className="my-listings-grid">
              {myListings.map((item) => {
                const isSold = item.status === "Sold";

                return (
                  <div key={item._id} className="my-listing-card">
                    <img
                      src={item.enhancedImage || item.image}
                      alt={item.name}
                      className="listing-thumb"
                    />

                    <div className="listing-info">
                      <div className="listing-status-row">
                        <span className={`status-pill ${isSold ? "sold" : "available"}`}>
                          {item.status || "Available"}
                        </span>
                        <span className="listing-cond">{item.condition}</span>
                      </div>

                      <h4 className="listing-title">{item.name}</h4>
                      <p className="listing-meta">
                        {item.category} • Size {item.size || "M"} • {item.color}
                      </p>

                      <div className="listing-price-row">
                        <span className="listing-price">Rs. {item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="listing-orig-price">Rs. {item.originalPrice}</span>
                        )}
                      </div>

                      <div className="listing-actions-row">
                        <button
                          onClick={() => handleMarkSold(item)}
                          className={`button ${isSold ? "button-secondary" : "button-primary"} action-sm`}
                        >
                          {isSold ? "Mark as Available" : "Mark as Sold"}
                        </button>

                        <button
                          onClick={() => handleRequestDeleteListing(item)}
                          className="button button-secondary delete-sm"
                          title="Delete listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          FULL-SCREEN PRODUCT DETAILS VIEW WITH SCROLLABLE PRODUCT CAROUSEL
          ========================================================================= */}
      {quickViewItem && (
        <div className="fullscreen-product-overlay">
          {/* Top Sticky Header */}
          <div className="fullscreen-topbar">
            <div className="topbar-left-cluster">
              <button
                type="button"
                onClick={() => setQuickViewItem(null)}
                className="topbar-back-btn"
                title="Back to Store (Esc)"
              >
                <ArrowLeft size={18} />
                <span>Back to Store</span>
              </button>

              <div className="topbar-breadcrumbs">
                <span className="crumb-category">{quickViewItem.category}</span>
                <span className="crumb-sep">/</span>
                <span className="crumb-condition">{quickViewItem.condition}</span>
              </div>
            </div>

            <div className="topbar-center-cluster">
              {currentProductIndex !== -1 && (
                <div className="product-counter-pill">
                  <span>Product {currentProductIndex + 1} of {filteredItems.length}</span>
                </div>
              )}
              <span className="topbar-keyboard-hint">
                Use <strong>←</strong> / <strong>→</strong> to scroll • <strong>Esc</strong> to close
              </span>
            </div>

            <div className="topbar-right-cluster">
              <button
                type="button"
                onClick={() => setQuickViewItem(null)}
                className="fullscreen-close-btn"
                title="Close (Esc)"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Main Fullscreen Stage */}
          <div className="fullscreen-stage">
            {/* Floating Previous Product Arrow */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={handlePrevProduct}
                className="fullscreen-floating-arrow arrow-prev"
                title="Previous Product (Left Arrow)"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Floating Next Product Arrow */}
            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={handleNextProduct}
                className="fullscreen-floating-arrow arrow-next"
                title="Next Product (Right Arrow)"
              >
                <ChevronRight size={32} />
              </button>
            )}

            {/* Fullscreen Showcase Grid */}
            <div className="fullscreen-showcase-grid">
              {/* Left Column: Full-Height Hero Image Showcase */}
              <div className="fullscreen-image-showcase">
                <div className="showcase-img-container">
                  <img
                    src={
                      quickViewItem.enhancedImage ||
                      quickViewItem.image ||
                      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900"
                    }
                    alt={quickViewItem.name}
                    className="showcase-large-img"
                  />

                  {/* Badges Overlay */}
                  <div className="showcase-badges-floating">
                    <span className="condition-chip-badge">{quickViewItem.condition}</span>
                    {quickViewItem.isCustomized && (
                      <span className="custom-rework-badge">
                        <Palette size={13} /> 1-of-1 Upcycled Art
                      </span>
                    )}
                    {quickViewItem.status === "Sold" && (
                      <span className="sold-badge">SOLD OUT</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Complete Product Details */}
              <div className="fullscreen-details-pane">
                {/* Seller Profile Header */}
                <div className="fullscreen-seller-card">
                  <img
                    src={
                      quickViewItem.sellerAvatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    }
                    alt={quickViewItem.sellerName}
                    className="seller-avatar-medium"
                  />
                  <div>
                    <div className="seller-name-row">
                      <strong>@{quickViewItem.sellerHandle || "seller"}</strong>
                      <span className="verified-badge">
                        <ShieldCheck size={14} /> Verified Seller
                      </span>
                    </div>
                    <p>{quickViewItem.sellerName || "Thrift Member"} • Direct Community Seller</p>
                  </div>
                </div>

                <h1 className="fullscreen-product-title">{quickViewItem.name}</h1>

                {/* Price Row */}
                <div className="fullscreen-price-banner">
                  <div className="price-stack">
                    <span className="fullscreen-current-price">
                      ₹{Number(quickViewItem.price).toLocaleString("en-IN")}.00
                    </span>
                    {quickViewItem.originalPrice > quickViewItem.price && (
                      <span className="fullscreen-original-price">
                        Original ₹{Number(quickViewItem.originalPrice).toLocaleString("en-IN")}.00
                      </span>
                    )}
                  </div>
                  {quickViewItem.originalPrice > quickViewItem.price && (
                    <span className="fullscreen-discount-chip">
                      Save{" "}
                      {Math.round(
                        ((quickViewItem.originalPrice - quickViewItem.price) /
                          quickViewItem.originalPrice) *
                          100
                      )}
                      %
                    </span>
                  )}
                </div>

                {/* Specs Grid */}
                <div className="fullscreen-specs-grid">
                  <div className="spec-card">
                    <span className="spec-lbl">Category</span>
                    <strong>{quickViewItem.category}</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-lbl">Size</span>
                    <strong>{quickViewItem.size || "Standard"}</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-lbl">Color</span>
                    <strong>{quickViewItem.color || "Multi-tone"}</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-lbl">Brand</span>
                    <strong>{quickViewItem.brand || "Vintage Thrift"}</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-lbl">Condition</span>
                    <strong>{quickViewItem.condition}</strong>
                  </div>
                  <div className="spec-card">
                    <span className="spec-lbl">Availability</span>
                    <strong style={{ color: quickViewItem.status === "Sold" ? "#b91c1c" : "#16a34a" }}>
                      {quickViewItem.status === "Sold" ? "Sold Out" : "In Stock"}
                    </strong>
                  </div>
                </div>

                {/* Description Box */}
                <div className="fullscreen-desc-box">
                  <h4>Garment Details & Texture</h4>
                  <p>
                    {quickViewItem.description ||
                      "Carefully inspected pre-loved second-hand wardrobe piece. Authentic drape and fabric textures preserved."}
                  </p>
                </div>

                {/* Occasion / Style Tags */}
                {Array.isArray(quickViewItem.tags) && quickViewItem.tags.length > 0 && (
                  <div className="fullscreen-tags-row">
                    <span className="tags-label">Occasion & Vibe:</span>
                    {quickViewItem.tags.map((t, idx) => (
                      <span key={idx} className="fullscreen-tag-chip">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Direct Seller Contact */}
                {(quickViewItem.sellerPhone || quickViewItem.sellerEmail) && (
                  <div className="seller-direct-contact-card">
                    <h5>Direct Seller Inquiries:</h5>
                    <div className="contact-methods-row">
                      <button
                        type="button"
                        onClick={() => openChatWithItem(quickViewItem)}
                        className="seller-chat-pill"
                      >
                        <MessageCircle size={14} />
                        <span>Chat & Negotiate</span>
                      </button>
                      {quickViewItem.sellerPhone && (
                        <a
                          href={`tel:${quickViewItem.sellerPhone}`}
                          className="seller-call-pill"
                        >
                          <Phone size={14} />
                          <span>Call / WhatsApp: {quickViewItem.sellerPhone}</span>
                        </a>
                      )}
                      {quickViewItem.sellerEmail && (
                        <a
                          href={`mailto:${quickViewItem.sellerEmail}`}
                          className="seller-mail-pill"
                        >
                          <Mail size={14} />
                          <span>Email: {quickViewItem.sellerEmail}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Add to Bag & Chat Action Bar */}
                <div className="fullscreen-action-bar">
                  {quickViewItem.status !== "Sold" ? (
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(quickViewItem);
                        showToast(`Added "${quickViewItem.name}" to cart! 🛍️`);
                      }}
                      className="button button-primary fullscreen-add-bag-btn"
                    >
                      <ShoppingBag size={20} />
                      <span>Add to Bag • ₹{Number(quickViewItem.price).toLocaleString("en-IN")}.00</span>
                    </button>
                  ) : (
                    <button disabled className="button button-secondary disabled-btn fullscreen-add-bag-btn">
                      This Piece Has Been Sold
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openChatWithItem(quickViewItem)}
                    className="fullscreen-chat-btn"
                    title="Direct inquiry & negotiation chat with seller"
                  >
                    <MessageCircle size={19} />
                    <span>Chat with Seller</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Shelf: Scrollable Product Strip */}
          <div className="fullscreen-bottom-strip">
            <div className="bottom-strip-header">
              <div className="strip-title-group">
                <span className="strip-kicker">Scroll & Explore Collection</span>
                <span className="strip-count">
                  ({filteredItems.length} products available • click or scroll to switch)
                </span>
              </div>
              <div className="strip-controls">
                <button
                  type="button"
                  onClick={handlePrevProduct}
                  className="strip-nav-arrow"
                  title="Previous Product (←)"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextProduct}
                  className="strip-nav-arrow"
                  title="Next Product (→)"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="fullscreen-carousel-scroll" ref={thumbnailStripRef}>
              {filteredItems.map((prod) => {
                const isActive = prod._id === quickViewItem._id;
                return (
                  <div
                    key={prod._id}
                    onClick={() => setQuickViewItem(prod)}
                    className={`fullscreen-thumb-card ${isActive ? "thumb-card-active" : ""}`}
                    title={`View ${prod.name}`}
                  >
                    <div className="thumb-img-wrap">
                      <img
                        src={
                          prod.enhancedImage ||
                          prod.image ||
                          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200"
                        }
                        alt={prod.name}
                        className="thumb-img"
                      />
                      {isActive && (
                        <span className="thumb-active-pill">Viewing</span>
                      )}
                      {prod.status === "Sold" && (
                        <span className="thumb-sold-pill">Sold</span>
                      )}
                    </div>
                    <div className="thumb-info">
                      <strong className="thumb-name">{prod.name}</strong>
                      <span className="thumb-price">Rs. {prod.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Floating Scroll to Top Button (matches reference design) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mythrift-scroll-to-top"
          title="Back to Top"
        >
          <ChevronUp size={22} />
        </button>
      )}

      {/* Custom Delete Listing Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(listingToDelete)}
        onClose={() => setListingToDelete(null)}
        onConfirm={handleConfirmDeleteListing}
        item={listingToDelete}
        title="Remove Listing from Store?"
        message="Are you sure you want to take this item off the thrift market? Other shoppers won't be able to buy it."
        confirmText="Yes, Remove Listing"
        cancelText="Keep Listing Active"
        loading={isDeletingListing}
      />
    </div>
  );
}
