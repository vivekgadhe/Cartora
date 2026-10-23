const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const products = [
  {
    name: 'Smart Watch',
    description: 'A stylish black smartwatch featuring a fitness display, activity tracking, heart rate monitoring, and a comfortable silicone strap.',
    price: 2499,
    category: 'Electronics',
    stock: 20,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605092/smartwatch.png',
    ratings: 4.5,
    numReviews: 12
  },
  {
    name: 'Bluetooth Speaker',
    description: 'A portable black Bluetooth speaker featuring a fabric exterior, wireless connectivity, convenient controls, and powerful sound.',
    price: 1799,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605172/bluetoothspeaker.png',
    ratings: 4.4,
    numReviews: 10
  },
  {
    name: 'Running Shoes',
    description: 'Black running shoes featuring breathable knit material, comfortable cushioning, secure laces, and durable soles.',
    price: 2199,
    category: 'Fashion',
    stock: 18,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605242/runningshoes.png',
    ratings: 4.6,
    numReviews: 15
  },
  {
    name: 'Casual Backpack',
    description: 'A charcoal-gray backpack featuring multiple zippered compartments, padded shoulder straps, and a spacious design for college, work, and travel.',
    price: 1299,
    category: 'Accessories',
    stock: 22,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605256/casualbackpack.png',
    ratings: 4.3,
    numReviews: 8
  },
  {
    name: 'Wireless Headphones',
    description: 'Premium black over-ear wireless headphones featuring cushioned ear cups, immersive sound, a comfortable headband, and a stylish design for everyday listening.',
    price: 1499,
    category: 'Electronics',
    stock: 25,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605739/wirelessheadphones.png',
    ratings: 4.7,
    numReviews: 15
  },
  {
    name: 'Cotton T-Shirt',
    description: 'A comfortable white crew-neck cotton T-shirt featuring short sleeves and a versatile design for everyday casual wear.',
    price: 599,
    category: 'Fashion',
    stock: 30,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605269/whitetshirt.png',
    ratings: 4.2,
    numReviews: 9
  },
  {
    name: 'Desk Lamp',
    description: 'A modern adjustable LED desk lamp featuring warm illumination, a stable base, and a flexible arm for studying and office work.',
    price: 999,
    category: 'Home',
    stock: 20,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605280/desklamp.png',
    ratings: 4.4,
    numReviews: 7
  },
  {
    name: 'Travel Mug',
    description: 'An olive-green insulated travel mug featuring a stainless-steel rim, secure black lid, and convenient design for commuting and travel.',
    price: 699,
    category: 'Home',
    stock: 25,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605290/travelmug.png',
    ratings: 4.3,
    numReviews: 6
  },
  {
    name: 'Laptop',
    description: 'A sleek silver laptop featuring a large display, comfortable keyboard, spacious touchpad, and a modern design for study and work.',
    price: 54999,
    category: 'Electronics',
    stock: 8,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605299/Laptop.png',
    ratings: 4.7,
    numReviews: 18
  },
  {
    name: 'iPhone 18 Pro Max',
    description: 'A concept smartphone listing featuring a champagne-colored finish, a large display, a multi-camera design, and a modern charging setup.',
    price: 149999,
    category: 'Electronics',
    stock: 5,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605332/smartphone.png',
    ratings: 4.8,
    numReviews: 20
  },
  {
    name: "Men's Blue Jeans",
    description: 'Fashionable medium-blue jeans featuring classic five-pocket styling, contrast stitching, subtle fading, and a versatile casual design.',
    price: 1499,
    category: 'Fashion',
    stock: 20,
    imageUrl: 'https://res.cloudinary.com/d0kd8xqe/image/upload/v1792605365/mensbluejeans.png',
    ratings: 4.4,
    numReviews: 10
  }
];

const importData = async () => {
  try {
    await connectDB();

    // Validate every image URL before inserting products.
    const invalidProducts = products.filter((product) => {
      try {
        const url = new URL(product.imageUrl);

        return (
          url.protocol !== 'https:' ||
          url.hostname !== 'res.cloudinary.com' ||
          product.imageUrl.startsWith('PASTE_')
        );
      } catch {
        return true;
      }
    });

    if (invalidProducts.length > 0) {
      throw new Error(
        'Add valid Cloudinary URLs for: ' +
        invalidProducts.map((product) => product.name).join(', ')
      );
    }

    // Find products that already exist.
    const existingProducts = await Product.find({
      name: { $in: products.map((product) => product.name) }
    }).select('name');

    const existingNames = new Set(
      existingProducts.map((product) => product.name)
    );

    // Insert only products that are not already present.
    const newProducts = products.filter(
      (product) => !existingNames.has(product.name)
    );

    if (newProducts.length === 0) {
      console.log('All products already exist. Nothing to insert.');
      return;
    }

    const insertedProducts = await Product.insertMany(newProducts);

    console.log(
      `Successfully added ${insertedProducts.length} products to Cartora!`
    );
  } catch (error) {
    console.error('Product import failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

importData();