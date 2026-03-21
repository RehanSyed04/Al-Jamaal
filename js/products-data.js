/**
 * ALJAMAAL OFFICIAL — Product Catalog
 *
 * HOW TO EDIT PRODUCTS:
 *   name        — product name shown on site
 *   category    — "Men", "Women", "Kids", or "Home"
 *   price       — price in Rands (number only, no R symbol) — UPDATE with real prices
 *   image       — path to image file once you have photos, e.g. "images/burnoose.jpg"
 *   badge       — small label on the card: "New", "Sale", "Limited", or "" for none
 *   description — short product description shown on card
 */

const products = [

  // ── MEN ────────────────────────────────────────────────
  {
    id: 1,
    name: "Original Burnoose",
    category: "Men",
    price: 0,
    image: "images/OBurnooseM.png",
    images: ["images/OBurnooseM.png", "images/OBurnooseS1.png", "images/OBurnooseS2.jpg", "images/OBurnooseS3.jpg", "images/OBurnooseS4.png", "images/OBurnooseS5.jpg"],
    badge: "",
    description: "The classic Al-Jamaal burnoose — timeless, comfortable, and crafted to last."
  },
  {
    id: 2,
    name: "Lightweight Burnoose",
    category: "Men",
    price: 0,
    image: "images/LBurnooseM.jpg",
    images: ["images/LBurnooseM.jpg", "images/LBurnooseS1.jpg", "images/LBurnooseS2.png", "images/LBurnooseS3.png", "images/LBurnooseS4.png"],
    badge: "",
    description: "A lighter take on our signature burnoose, perfect for warmer days."
  },
  {
    id: 3,
    name: "Al-Jamaal ¾ Shorts",
    category: "Men",
    price: 0,
    image: "images/3:4ShortsM.jpg",
    images: ["images/3:4ShortsM.jpg", "images/3:4ShortsS1.jpg", "images/3:4ShortsS2.png", "images/3:4ShortsS3.png", "images/3:4ShortsS4.jpg", "images/3:4ShortsS5.jpg", "images/3:4ShortsS6.jpg"],
    badge: "",
    description: "Available in 9 colours. Relaxed fit ¾ shorts built for everyday comfort."
  },
  {
    id: 4,
    name: "Winter Jacket",
    category: "Men",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Stay warm without sacrificing style. A must-have for the colder months."
  },

  // ── WOMEN ──────────────────────────────────────────────
  {
    id: 5,
    name: "Al-Jamaal Burqa",
    category: "Women",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Modest and elegant — our burqa is crafted for everyday grace and ease."
  },
  {
    id: 6,
    name: "Khareef Ladies Long Jacket",
    category: "Women",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "A flowing long jacket that combines modesty with refined style."
  },
  {
    id: 7,
    name: "Farasha Daily Wear Khimaar",
    category: "Women",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Soft, breathable, and effortlessly stylish for everyday wear."
  },
  {
    id: 8,
    name: "Aaroosa Bridal Khimaar",
    category: "Women",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "Special",
    description: "Beautifully designed for the bride — elegant, modest, and unforgettable."
  },
  {
    id: 9,
    name: "Pardas & Hijabs",
    category: "Women",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "Limited",
    description: "Bedoon ESSM collection — limited stock available. Contact us to order."
  },

  // ── KIDS ───────────────────────────────────────────────
  {
    id: 10,
    name: "Toddler Burnoose",
    category: "Kids",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "A mini version of our signature burnoose, made just for little ones."
  },
  {
    id: 11,
    name: "Kids Shorts (Ages 1–2)",
    category: "Kids",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Lightweight and comfortable shorts designed for toddlers aged 1 to 2."
  },
  {
    id: 12,
    name: "Mora Sherpa Baby Blanket",
    category: "Kids",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Soft and warm sherpa blanket — a cosy gift for any new arrival."
  },

  // ── HOME ───────────────────────────────────────────────
  {
    id: 13,
    name: "Tablecloth",
    category: "Home",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "Limited",
    description: "Elegant tablecloths to complete your home setting. Limited stock available."
  },
  {
    id: 14,
    name: "Al-Jamaal Apron",
    category: "Home",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "A practical and stylish apron, perfect for the kitchen."
  },
  {
    id: 15,
    name: "Muslim Blocks",
    category: "Home",
    price: 0,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Beautiful decorative blocks — a meaningful addition to any home."
  }

];
