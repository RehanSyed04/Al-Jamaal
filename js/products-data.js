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
    price: 1100,
    image: "images/OBurnooseM.png",
    images: ["images/OBurnooseM.png", "images/OBurnooseS1.png", "images/OBurnooseS2.jpg", "images/OBurnooseS3.jpg", "images/OBurnooseS4.png", "images/OBurnooseS5.jpg"],
    badge: "",
    description: "Rooted in quality and born from a love of modest fashion, the Al-Jamaal Original Fleece Burnoose is our most-loved design. Thick and cosy with a clean full-length cut, front zip, and generous pockets, it's built to handle South Africa's coldest winters in style. Offered in a carefully curated palette  Beige, Camel, Grey, Charcoal, Navy, Black, and more."
  },
  {
    id: 2,
    name: "Lightweight Burnoose",
    category: "Men",
    price: 950,
    image: "images/LBurnooseM.jpg",
    images: ["images/LBurnooseM.jpg", "images/LBurnooseS1.jpg", "images/LBurnooseS2.png", "images/LBurnooseS3.png", "images/LBurnooseS4.png"],
    badge: "",
    description: "The Al-Jamaal Khareef Collection. A wind and water resistant lightweight burnoose with a smooth, structured finish, full-length zip, drawstring hood, and deep pockets. Each side pocket features a built-in interior zipper, giving you direct access to the pockets of whatever you're wearing underneath, no need to take your hands out. Available in a wide range of colours for the whole family."
  },
  {
    id: 3,
    name: "Al-Jamaal ¾ Shorts",
    category: "Men",
    price: 380,
    image: "images/3:4ShortsM.jpg",
    images: ["images/3:4ShortsM.jpg", "images/3:4 shorts video.mp4", "images/3:4ShortsS1.jpg", "images/3:4ShortsS2.png", "images/3:4ShortsS3.png", "images/3:4ShortsS4.jpg", "images/3:4ShortsS5.jpg", "images/3:4ShortsS6.jpg"],
    badge: "",
    description: "The Al-Jamaal ¾ Over-the-Knee Shorts are built for every occasion. Crafted from a cooling, quick-dry fabric with an elasticated waistband, drawstring, and zipped pockets, they're as practical as they are comfortable. Over-the-knee for modest coverage, relaxed enough for daily wear, and durable enough for swimming, sport, travel, and everything in between. Available in 9 colours including Teal, Navy, Charcoal, Royal Blue, and more. Locally manufactured in South Africa."
  },
  {
    id: 4,
    name: "Winter Jacket",
    category: "Men",
    price: 1350,
    image: "images/WJacketM.png",
    images: ["images/WJacketM.png", "images/WJacketS1.png", "images/WJacketS2.png", "images/WJacketS3.png"],
    badge: "",
    description: "Don't freeze in the cold. The Al-Jamaal Fleece Jacket combines the warmth of our bestselling burnoose in a shorter, more versatile silhouette. Featuring a striking two-tone colour block design, thick fleece fabric, drawstring hood, full front zip, and zipped pockets, it's a winter essential that's as stylish as it is functional. Available in selected colours and sizes."
  },

  // ── WOMEN ──────────────────────────────────────────────
  {
    id: 6,
    name: "Khareef Ladies Long Jacket",
    category: "Women",
    price: 1200,
    image: "images/KLLJ.jpg",
    images: ["images/KLLJ.jpg"],
    badge: "",
    description: "The Khareef Ladies Long Jacket by Al-Jamaal. A sleek, long-line outer layer crafted from smooth, wind and water resistant fabric. Modest in coverage, refined in style, and tailored to move with you. Featuring a hooded design and side pockets, it's the versatile winter essential every wardrobe needs."
  },
  {
    id: 5,
    name: "Al-Jamaal Burqa",
    category: "Women",
    price: 850,
    image: "images/BurqaM.png",
    images: ["images/BurqaM.png", "images/BurqaS1.png", "images/BurqaS2.jpg", "images/BurqaS3.png", "images/BurqaS4.png", "images/BurqaS5.png", "images/BurqaS6.png", "images/BurqaS7.png", "images/BurqaS8.png"],
    badge: "",
    description: "The Al-Jamaal Burqa is designed for the woman who values modesty without compromising on style. Made from the finest non-see-through fabric with a flowy, comfortable fit, it's as elegant as it is practical. Available in an extensive range of shades from soft pastels to rich bold tones. Custom full-length options with or without sleeves available on request."
  },
  {
    id: 7,
    name: "Farasha Daily Wear Khimaar",
    category: "Women",
    price: 450,
    image: "images/FKhimaarM.jpg",
    images: ["images/FKhimaarM.jpg", "images/FKhimaarS1.png", "images/FKhimaarS2.png", "images/FKhimaarS3.png"],
    badge: "",
    description: "The Al-Jamaal Farasha Dailywear Khimaar is a luxurious mid-length cover-up that embodies grace and modesty. Crafted from a lightweight, flowing fabric, it drapes elegantly over the shoulders with a fully covered front and a slightly longer flowing back. The open front is secured with a discreet press stud, and the elasticated headband ensures a secure, comfortable fit. Designed with nursing in mind, it is both practical and refined. Compatible with a niqab. Locally manufactured in South Africa."
  },
  {
    id: 8,
    name: "Aaroosa Bridal Khimaar",
    category: "Women",
    price: 1800,
    image: "images/ABKhimaar.jpg",
    images: ["images/ABKhimaar.jpg"],
    badge: "Special",
    description: "The Al-Jamaal Aaroosa Bridal Khimaar is an elegant cover-up designed for the bride who values grace and modesty on her most special day. Featuring a flowing cape silhouette, it drapes beautifully over your wedding ensemble, adding refined coverage without taking away from your look. The closed top ensures full concealment while the front slit allows for effortless movement and fluid elegance. Ethereal in appearance and meaningful in purpose, it also makes a truly cherished bridal gift."
  },
  // ── KIDS ───────────────────────────────────────────────
  {
    id: 11,
    name: "Kids Shorts",
    category: "Kids",
    price: 220,
    image: "images/KShortsM.jpg",
    images: ["images/KShortsM.jpg", "images/KShortsS1.jpg", "images/KShortsS2.jpg", "images/KShortsS3.jpg", "images/KShortsS4.jpg"],
    badge: "",
    description: "Introducing the Al-Jamaal Mini Me collection. Over-the-knee shorts designed specifically for the little ones. Built from a cool cotton fabric, they keep kids comfortable, covered, and ready for anything. Whether it's a day at the beach, the park, or just playing outside, these shorts are made to move. Available in a range of fun colours including Navy, Blue, Sage, Green, Camel, Black, White, and more."
  },
  {
    id: 10,
    name: "Toddler Burnoose",
    category: "Kids",
    price: 650,
    image: "images/KBurnooseM.png",
    images: ["images/KBurnooseM.png", "images/KBurnooseS1.png", "images/KBurnooseS2.png", "images/KBurnooseS3.jpg", "images/KBurnooseS4.png", "images/KBurnooseS5.png", "images/KBurnooseS6.png"],
    badge: "",
    description: "Bundle your little ones up in the quality they deserve. The Al-Jamaal Kids Burnoose is crafted from the same premium fleece as our bestselling adult range, tailored to fit from infants all the way up. One zip and they're warm. Available in a wide range of colours including Pink, Blue, Charcoal, Red, Beige, and more."
  },
  {
    id: 12,
    name: "Mora Sherpa Baby Blanket",
    category: "Kids",
    price: 320,
    image: "images/MsbbM.png",
    images: ["images/MsbbM.png", "images/MsbbS1.png", "images/MsbbS2.png", "images/MsbbS3.png", "images/MsbbS4.jpg", "images/MsbbS5.jpg"],
    badge: "",
    description: "Wrap your baby in the warmth they deserve. The Mora Sherpa Baby Blanket is crafted from a super soft, high-quality sherpa fabric with a beautiful 3D embossed print finish. Its high air circulation keeps your little one warm without the weight of heavy blankets perfect for the crib, the stroller, or cuddles at home. Available in a range of colours and comes beautifully packaged, making it an ideal gift for any new parent."
  },

  // ── HOME ───────────────────────────────────────────────
  {
    id: 13,
    name: "Tablecloth",
    category: "Home",
    price: 780,
    image: "images/TableM.png",
    images: ["images/TableM.png", "images/TableS1.png", "images/TableS2.png", "images/TableS3.png", "images/TableS4.png", "images/TableS5.png", "images/TableS6.png", "images/TableS7.png", "images/TableS8.png", "images/TableS9.png", "images/TableS10.png", "images/TableS11.png"],
    badge: "Sold Out",
    description: "Dine in style with the Al-Jamaal Tablecloth Collection. Each piece is made from thick, high-quality fabric from richly textured velvets and stunning layered lace to vibrant florals and contemporary prints. Whether you're setting a table for Eid, a family gathering, or a Friday brunch, there's a print and size to suit every occasion. Available in multiple sizes and a wide variety of prints. Makes a stunning gift."
  },
  {
    id: 15,
    name: "Muslim Blocks",
    category: "Home",
    price: 900,
    image: "images/placeholder.jpg",
    badge: "",
    description: "Beautiful decorative blocks — a meaningful addition to any home."
  }

];
