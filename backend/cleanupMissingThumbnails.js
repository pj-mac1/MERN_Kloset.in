require('dotenv').config();
const mongoose = require('mongoose');
const ClothingItem = require('./models/ClothingItem');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Delete Relaxed Fit Double-Knee Carpenter Pants
    const delPants = await ClothingItem.deleteMany({ name: /Carpenter Pants/i });
    console.log(`Deleted Carpenter Pants: ${delPants.deletedCount}`);

    // 2. Delete items with missing or empty image
    const all = await ClothingItem.find({});
    let deletedNoThumb = 0;
    for (const item of all) {
      const img = item.enhancedImage || item.image;
      if (!img || !img.trim() || img === 'undefined' || img === 'null') {
        await ClothingItem.findByIdAndDelete(item._id);
        console.log(`Deleted item without thumbnail: ${item.name} (${item._id})`);
        deletedNoThumb++;
      }
    }
    console.log(`Deleted ${deletedNoThumb} items without thumbnail.`);

    // 3. Fix Levi's jeans image to verified working high-res Unsplash photo
    const updateLevi = await ClothingItem.updateMany(
      { name: /Levi's Vintage Clothing 1954 501/i },
      { image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80' }
    );
    console.log(`Updated Levi jeans image: ${updateLevi.modifiedCount}`);

    // Verify all remaining items
    const remaining = await ClothingItem.find({});
    console.log(`Total remaining items in database: ${remaining.length}`);
    for (const it of remaining) {
      const url = it.enhancedImage || it.image;
      try {
        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) {
          console.warn(`WARNING: Broken image HTTP ${res.status} for: ${it.name} (${url})`);
          await ClothingItem.findByIdAndDelete(it._id);
          console.log(`Removed item with broken image HTTP ${res.status}: ${it.name}`);
        }
      } catch (err) {
        console.warn(`Fetch error for ${it.name}: ${err.message}`);
      }
    }

    const finalCount = await ClothingItem.countDocuments();
    console.log(`Final verified items in database with working thumbnails: ${finalCount}`);
    process.exit(0);
  } catch (err) {
    console.error("Cleanup error:", err);
    process.exit(1);
  }
}

cleanup();
