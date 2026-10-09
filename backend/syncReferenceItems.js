require('dotenv').config();
const mongoose = require('mongoose');
const ClothingItem = require('./models/ClothingItem');

async function syncReferenceItems() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for syncing reference items...");

    // Update existing items with small USD-like prices to standard INR prices
    const existing = await ClothingItem.find({ price: { $lt: 200 } });
    for (const item of existing) {
      if (item.price < 200) {
        // scale to authentic Indian thrift prices e.g. 35 -> 499, 65 -> 899, etc.
        item.price = Math.round((item.price * 15) / 50) * 50 - 1; // e.g., 499, 599, 799, 899
        if (item.price < 399) item.price = 399;
        item.originalPrice = Math.round((item.price * 2.5) / 100) * 100 - 1; // e.g., 1299, 1999
        await item.save();
      }
    }
    console.log(`Updated ${existing.length} existing items to INR pricing.`);

    // Check if the reference items already exist
    const refItems = [
      {
        name: 'Pre-Loved Puma "Since 1948" Graphic Performance T-Shirt – Black',
        category: 'Tops',
        color: 'Black',
        brand: 'Puma',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        description: 'Authentic pre-loved Puma performance graphic tee. Features "Since 1948" chest graphic, breathable dry-cell polyester blend, and relaxed streetwear fit.',
        userId: 'u_mythrift',
        sellerName: 'Kloset Curated',
        sellerHandle: 'kloset_drop',
        sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        sellerPhone: '+91 98765 43210',
        sellerEmail: 'drops@kloset.in',
        isPublic: true,
        isForSale: true,
        price: 599,
        originalPrice: 1999,
        condition: 'Gently Used',
        tags: ['casual', 'streetwear', 'vintage', 'sports'],
        status: 'Available',
        createdAt: new Date(Date.now() + 50000)
      },
      {
        name: 'Under Armour "The Tech Tee" Performance T-Shirt – Heather Grey',
        category: 'Tops',
        color: 'Heather Grey',
        brand: 'Under Armour',
        size: 'XL',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        description: 'Under Armour loose fit UA Tech performance t-shirt in heather grey. Ultra-soft fabric with anti-odor tech, quick-drying athletic drape.',
        userId: 'u_mythrift',
        sellerName: 'Kloset Curated',
        sellerHandle: 'kloset_drop',
        sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        sellerPhone: '+91 98765 43210',
        sellerEmail: 'drops@kloset.in',
        isPublic: true,
        isForSale: true,
        price: 699,
        originalPrice: 1999,
        condition: 'Like New',
        tags: ['casual', 'activewear', 'streetwear'],
        status: 'Available',
        createdAt: new Date(Date.now() + 40000)
      },
      {
        name: 'Pre-Loved Puma Tonal Graphic Performance T-Shirt – Navy Blue | Size M',
        category: 'Tops',
        color: 'Navy Blue',
        brand: 'Puma',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
        description: 'Dark navy blue Puma tonal sports t-shirt with subtle chest cat logo. Clean crew neckline and athletic cut.',
        userId: 'u_mythrift',
        sellerName: 'Kloset Curated',
        sellerHandle: 'kloset_drop',
        sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        sellerPhone: '+91 98765 43210',
        sellerEmail: 'drops@kloset.in',
        isPublic: true,
        isForSale: true,
        price: 599,
        originalPrice: 1299,
        condition: 'Gently Used',
        tags: ['casual', 'streetwear', 'minimalist'],
        status: 'Available',
        createdAt: new Date(Date.now() + 30000)
      },
      {
        name: 'Adidas Climalite Big Logo Performance T-Shirt – Royal Blue / Size L',
        category: 'Tops',
        color: 'Royal Blue',
        brand: 'Adidas',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        description: 'Classic Royal Blue Adidas 3-Stripes performance tee with center chest adidas badge of sport. 100% genuine vintage climalite mesh.',
        userId: 'u_mythrift',
        sellerName: 'Kloset Curated',
        sellerHandle: 'kloset_drop',
        sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        sellerPhone: '+91 98765 43210',
        sellerEmail: 'drops@kloset.in',
        isPublic: true,
        isForSale: true,
        price: 799,
        originalPrice: 1999,
        condition: 'Vintage Thrifted',
        tags: ['casual', 'vintage', 'streetwear', 'college'],
        status: 'Available',
        createdAt: new Date(Date.now() + 20000)
      },
      {
        name: 'Nike Pro Combat Hypercool Dri-FIT Fitted T-Shirt – Black / Grey | Size M',
        category: 'Tops',
        color: 'Black / Grey',
        brand: 'Nike',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        description: 'High-performance Nike Pro Combat zonal hypercool compression tee. Ergonomic flatlock seams and sweat-wicking back honeycomb panel.',
        userId: 'u_mythrift',
        sellerName: 'Kloset Curated',
        sellerHandle: 'kloset_drop',
        sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        sellerPhone: '+91 98765 43210',
        sellerEmail: 'drops@kloset.in',
        isPublic: true,
        isForSale: true,
        price: 1299,
        originalPrice: 2999,
        condition: 'Like New',
        tags: ['streetwear', 'activewear', 'casual'],
        status: 'Available',
        createdAt: new Date(Date.now() + 10000)
      }
    ];

    for (const ref of refItems) {
      const exists = await ClothingItem.findOne({ name: ref.name });
      if (!exists) {
        await ClothingItem.create(ref);
        console.log(`Created reference item: ${ref.name}`);
      } else {
        exists.price = ref.price;
        exists.originalPrice = ref.originalPrice;
        exists.createdAt = ref.createdAt;
        await exists.save();
        console.log(`Updated reference item: ${ref.name}`);
      }
    }

    console.log("Sync complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error syncing items:", err);
    process.exit(1);
  }
}

syncReferenceItems();
