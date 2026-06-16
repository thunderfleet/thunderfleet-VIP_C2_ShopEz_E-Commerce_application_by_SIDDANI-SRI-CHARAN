const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Product = mongoose.model("Product", new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number },
  old_price: { type: Number },
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
}));

const womenProducts = [
  "Elegant Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
  "Floral Print V-Neck Ruffle Detail Wrap Top",
  "Solid Color A-Line Maxi Dress with Pockets",
  "Casual V-Neck Button Down Cardigan Sweater",
  "High Waist Skinny Denim Jeans",
  "Boho Style Embroidered Peasant Blouse",
  "Sleeveless Pleated Chiffon Midi Dress",
  "Women's Classic Trench Coat",
  "Athletic Yoga Leggings with Pockets",
  "Cozy Oversized Knit Turtleneck Sweater"
];

const menProducts = [
  "Men's Casual Short Sleeve Button-Down Shirt",
  "Classic Fit Straight Leg Denim Jeans",
  "Athletic Performance Quick Dry T-Shirt",
  "Men's Lightweight Water-Resistant Jacket",
  "Slim Fit Stretch Chino Pants",
  "Premium Cotton Crewneck Sweater",
  "Men's Classic Two-Button Suit Jacket",
  "Vintage Wash Denim Trucker Jacket",
  "Comfortable Fleece Jogger Sweatpants",
  "Men's Plaid Flannel Long Sleeve Shirt"
];

const kidProducts = [
  "Boys' Striped Long Sleeve T-Shirt",
  "Girls' Floral Print Ruffle Dress",
  "Kids' Comfortable Denim Overalls",
  "Toddler Boys' Graphic Print Tee",
  "Girls' Sparkly Tulle Party Skirt",
  "Kids' Cozy Hooded Sweatshirt",
  "Boys' Active Performance Shorts",
  "Girls' Printed Cotton Leggings",
  "Kids' Winter Puffer Jacket",
  "Toddler Girls' Two-Piece Play Set"
];

const seedProducts = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ShopEzDB");
    console.log("Connected to MongoDB");

    // Copy images
    const sourceDir = path.join(__dirname, "..", "client", "src", "Components", "Assets");
    const targetDir = path.join(__dirname, "upload", "images");

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const productsToInsert = [];
    let currentId = 1;

    // Seed Women
    for (let i = 1; i <= 10; i++) {
      const imgName = `product_${i}.png`;
      fs.copyFileSync(path.join(sourceDir, imgName), path.join(targetDir, imgName));
      productsToInsert.push({
        id: currentId++,
        name: womenProducts[i - 1],
        description: "A premium quality piece perfect for your everyday wardrobe. Made with comfortable materials and a stylish design.",
        image: `/images/${imgName}`,
        category: "women",
        new_price: Math.floor(Math.random() * 50) + 50,
        old_price: Math.floor(Math.random() * 50) + 100,
      });
    }

    // Seed Men (Images 13 to 22)
    for (let i = 13; i <= 22; i++) {
      const imgName = `product_${i}.png`;
      fs.copyFileSync(path.join(sourceDir, imgName), path.join(targetDir, imgName));
      productsToInsert.push({
        id: currentId++,
        name: menProducts[i - 13],
        description: "A premium quality piece perfect for your everyday wardrobe. Made with comfortable materials and a stylish design.",
        image: `/images/${imgName}`,
        category: "men",
        new_price: Math.floor(Math.random() * 50) + 50,
        old_price: Math.floor(Math.random() * 50) + 100,
      });
    }

    // Seed Kids (Images 25 to 34)
    for (let i = 25; i <= 34; i++) {
      const imgName = `product_${i}.png`;
      fs.copyFileSync(path.join(sourceDir, imgName), path.join(targetDir, imgName));
      productsToInsert.push({
        id: currentId++,
        name: kidProducts[i - 25],
        description: "A premium quality piece perfect for your everyday wardrobe. Made with comfortable materials and a stylish design.",
        image: `/images/${imgName}`,
        category: "kid",
        new_price: Math.floor(Math.random() * 30) + 20,
        old_price: Math.floor(Math.random() * 30) + 60,
      });
    }

    // Clear existing
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert
    await Product.insertMany(productsToInsert);
    console.log(`Inserted ${productsToInsert.length} products successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedProducts();
