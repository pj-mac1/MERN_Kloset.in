require('dotenv').config();
const mongoose = require('mongoose');
const ClothingItem = require('./models/ClothingItem');

const LUXURY_BRAND_ITEMS = [
  {
    name: 'Burberry Vintage Nova Check Harrington Jacket – Archive Beige',
    category: 'Outerwear',
    color: 'Archive Beige / Check',
    brand: 'Burberry',
    size: 'L',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    description: 'Iconic vintage Burberry Harrington jacket featuring the classic Nova Check cotton lining, horn button throat latch, and storm flap back. Pure British luxury outerwear in pristine pre-loved condition.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Luxury Vault',
    sellerHandle: 'kloset_vault',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'vault@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 4999,
    originalPrice: 42000,
    condition: 'Like New',
    tags: ['luxury', 'vintage', 'old money', 'streetwear'],
    status: 'Available',
    createdAt: new Date(Date.now() + 120000)
  },
  {
    name: 'Ralph Lauren Purple Label Cable-Knit Wool-Cashmere Sweater – Hunter Green',
    category: 'Tops',
    color: 'Hunter Green',
    brand: 'Ralph Lauren',
    size: 'M',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
    description: 'Ultra-luxurious Italian-spun cable knit sweater from Ralph Lauren. Incredibly soft hand feel, ribbed hem and cuffs, quintessential old-money aesthetic.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Luxury Vault',
    sellerHandle: 'kloset_vault',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'vault@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 3299,
    originalPrice: 28500,
    condition: 'Like New',
    tags: ['old money', 'luxury', 'casual', 'vintage'],
    status: 'Available',
    createdAt: new Date(Date.now() + 110000)
  },
  {
    name: 'Gucci Web Stripe Collar Monogram Pique Polo – Ivory Cream',
    category: 'Tops',
    color: 'Ivory Cream',
    brand: 'Gucci',
    size: 'L',
    image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80',
    description: 'Made in Italy Gucci stretch-cotton pique polo shirt with red and green signature Web knit collar and mother-of-pearl buttons. Verified authentic piece.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Luxury Vault',
    sellerHandle: 'kloset_vault',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'vault@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 4199,
    originalPrice: 36000,
    condition: 'Like New',
    tags: ['luxury', 'party', 'streetwear', 'casual'],
    status: 'Available',
    createdAt: new Date(Date.now() + 100000)
  },
  {
    name: 'Carhartt WIP Detroit Blanket-Lined Canvas Work Jacket – Tobacco Brown',
    category: 'Outerwear',
    color: 'Tobacco Brown',
    brand: 'Carhartt',
    size: 'XL',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    description: 'Heavyweight 12oz organic Dearborn canvas jacket with blanket lining and corduroy collar. Highly sought-after archival patina and indestructible brass zipper.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Curated',
    sellerHandle: 'kloset_drop',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'drops@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 2899,
    originalPrice: 18500,
    condition: 'Vintage Thrifted',
    tags: ['streetwear', 'vintage', 'casual'],
    status: 'Available',
    createdAt: new Date(Date.now() + 90000)
  },
  {
    name: 'Stüssy 8-Ball Mohair Blend Knit Cardigan – Bone White / Black',
    category: 'Tops',
    color: 'Bone White',
    brand: 'Stüssy',
    size: 'M',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
    description: 'Sold-out Stüssy brushed mohair-wool cardigan with jacquard 8-Ball back graphic and genuine horn buttons. Relaxed streetwear drape and cozy warmth.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Curated',
    sellerHandle: 'kloset_drop',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'drops@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 2599,
    originalPrice: 17999,
    condition: 'Like New',
    tags: ['streetwear', 'y2k', 'casual', 'party'],
    status: 'Available',
    createdAt: new Date(Date.now() + 85000)
  },
  {
    name: 'Stone Island Garment-Dyed Crinkle Reps NY Down Puffer – Slate Grey',
    category: 'Outerwear',
    color: 'Slate Grey',
    brand: 'Stone Island',
    size: 'L',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
    description: 'Iconic Stone Island down puffer jacket crafted from ultra-dense crinkle reps nylon with resin coating. Features the original black compass badge on the left sleeve.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Luxury Vault',
    sellerHandle: 'kloset_vault',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'vault@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 6999,
    originalPrice: 62000,
    condition: 'Brand New with Tags',
    tags: ['luxury', 'streetwear', 'outerwear', 'athleisure'],
    status: 'Available',
    createdAt: new Date(Date.now() + 80000)
  },
  {
    name: 'Prada Sport Linea Rossa Technical Nylon Overshirt – Matte Black',
    category: 'Outerwear',
    color: 'Matte Black',
    brand: 'Prada',
    size: 'M',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
    description: 'Y2K archival Prada Linea Rossa technical overshirt featuring the signature red latex tab at the cuff, waterproof zippers, and crisp architectural silhouette.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Luxury Vault',
    sellerHandle: 'kloset_vault',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'vault@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 5899,
    originalPrice: 58000,
    condition: 'Like New',
    tags: ['luxury', 'minimalist', 'streetwear', 'y2k'],
    status: 'Available',
    createdAt: new Date(Date.now() + 75000)
  },
  {
    name: 'Balenciaga Paris Heavyweight Boxy Distressed Hoodie – Faded Charcoal',
    category: 'Tops',
    color: 'Faded Charcoal',
    brand: 'Balenciaga',
    size: 'OS (Oversized)',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    description: 'Heavyweight 1000gsm French terry hoodie with vintage wash, subtle distressed collar and cuffs, and faded Balenciaga logo across the chest. Extreme oversized fit.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Luxury Vault',
    sellerHandle: 'kloset_vault',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'vault@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 5999,
    originalPrice: 68000,
    condition: 'Gently Used',
    tags: ['luxury', 'streetwear', 'casual'],
    status: 'Available',
    createdAt: new Date(Date.now() + 70000)
  },
  {
    name: "Arc'teryx Beta LT GORE-TEX Mountain Shell Jacket – Black Sapphire",
    category: 'Outerwear',
    color: 'Black Sapphire',
    brand: "Arc'teryx",
    size: 'L',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80',
    description: 'GORE-TEX 3L lightweight technical mountain shell jacket. Waterproof, windproof, helmet-compatible StormHood, and WaterTight pit zips. Peak gorpcore fashion.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Curated',
    sellerHandle: 'kloset_drop',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'drops@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 4499,
    originalPrice: 39500,
    condition: 'Brand New with Tags',
    tags: ['streetwear', 'athleisure', 'outerwear', 'minimalist'],
    status: 'Available',
    createdAt: new Date(Date.now() + 65000)
  },
  {
    name: "Levi's Vintage Clothing 1954 501 Selvedge Raw Denim Jeans – Rigid Indigo",
    category: 'Bottoms',
    color: 'Rigid Indigo',
    brand: "Levi's",
    size: '32',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    description: 'Exact archival reproduction of 1954 501 jeans made with Cone Mills White Oak pink selvedge raw denim. Hidden rivets, Big "E" red tab, and classic tapered leg.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Curated',
    sellerHandle: 'kloset_drop',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'drops@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 2699,
    originalPrice: 19500,
    condition: 'Like New',
    tags: ['vintage', 'casual', 'streetwear', 'old money'],
    status: 'Available',
    createdAt: new Date(Date.now() + 60000)
  },
  {
    name: 'Supreme Box Logo Heavyweight Cross-Grain Crewneck – Ash Grey',
    category: 'Tops',
    color: 'Ash Grey',
    brand: 'Supreme',
    size: 'M',
    image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
    description: 'Authentic Supreme New York red box logo embroidered on heavyweight cross-grain Canadian fleece. Dense rib side panels and archival street provenance.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Curated',
    sellerHandle: 'kloset_drop',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'drops@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 3899,
    originalPrice: 28000,
    condition: 'Like New',
    tags: ['streetwear', 'casual', 'college'],
    status: 'Available',
    createdAt: new Date(Date.now() + 55000)
  },
  {
    name: 'Nike x Travis Scott Cactus Jack Utility Pocket Cargo Pants – Desert Sand',
    category: 'Bottoms',
    color: 'Desert Sand',
    brand: 'Nike',
    size: '34',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    description: 'Collaboration utility cargo trousers with multiple multi-tier velcro pouches, Cactus Jack embroidery, and reinforced knee articulators.',
    userId: 'u_luxury_vault',
    sellerName: 'Kloset Curated',
    sellerHandle: 'kloset_drop',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    sellerPhone: '+91 98765 43210',
    sellerEmail: 'drops@kloset.in',
    isPublic: true,
    isForSale: true,
    price: 3499,
    originalPrice: 24000,
    condition: 'Gently Used',
    tags: ['streetwear', 'y2k', 'casual', 'party'],
    status: 'Available',
    createdAt: new Date(Date.now() + 52000)
  }
];

async function seedLuxury() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for luxury brand seeding...");

    for (const item of LUXURY_BRAND_ITEMS) {
      const existing = await ClothingItem.findOne({ name: item.name });
      if (!existing) {
        await ClothingItem.create(item);
        console.log(`Created luxury item: ${item.brand} - ${item.name} (MRP: ₹${item.originalPrice} -> Thrift: ₹${item.price})`);
      } else {
        existing.price = item.price;
        existing.originalPrice = item.originalPrice;
        existing.brand = item.brand;
        existing.tags = item.tags;
        existing.createdAt = item.createdAt;
        await existing.save();
        console.log(`Updated luxury item: ${item.brand} - ${item.name}`);
      }
    }

    console.log("Luxury brand items seeding completed!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding luxury items:", err);
    process.exit(1);
  }
}

seedLuxury();
