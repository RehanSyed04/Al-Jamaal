/**
 * ALJAMAAL OFFICIAL — Product Catalog
 *
 * HOW TO ADD/EDIT PRODUCTS:
 * Each product has these fields:
 *   id       — unique number, don't repeat
 *   name     — product name
 *   category — "Men", "Women", "Kids", or "Accessories"
 *   price    — price in South African Rand (number only, no R symbol)
 *   image    — path to the image file, e.g. "images/shirt1.jpg"
 *   badge    — optional label like "New" or "Sale" (use "" to leave blank)
 *   description — short product description
 */

const products = [
  {
    id: 1,
    name: "Classic Linen Shirt",
    category: "Men",
    price: 499,
    image: "images/placeholder.jpg",
    badge: "New",
    description: "Lightweight linen shirt, perfect for warm South African days."
  },
  {
    id: 2,
    name: "Embroidered Kaftan",
    category: "Women",
    price: 799,
    image: "images/placeholder.jpg",
    badge: "New",
    description: "Elegant kaftan with hand-stitched embroidery detail."
  },
  {
    id: 3,
    name: "Heritage Thobe",
    category: "Men",
    price: 999,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Premium quality thobe with traditional craftsmanship."
  },
  {
    id: 4,
    name: "Floral Abaya",
    category: "Women",
    price: 1199,
    image: "images/placeholder.jpg",
    badge: "Best Seller",
    description: "Flowing abaya with subtle floral print, modest and stylish."
  },
  {
    id: 5,
    name: "Kids Kurta Set",
    category: "Kids",
    price: 349,
    image: "images/placeholder.jpg",
    badge: "New",
    description: "Comfortable kurta and pants set for little ones."
  },
  {
    id: 6,
    name: "Silk Headscarf",
    category: "Accessories",
    price: 249,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Soft silk headscarf in a variety of colours."
  },
  {
    id: 7,
    name: "Linen Trousers",
    category: "Men",
    price: 399,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Relaxed fit linen trousers — breathable and comfortable."
  },
  {
    id: 8,
    name: "Girls Dress",
    category: "Kids",
    price: 299,
    image: "images/placeholder.jpg",
    badge: "Sale",
    description: "Colourful summer dress for girls, ages 3–12."
  }
];
