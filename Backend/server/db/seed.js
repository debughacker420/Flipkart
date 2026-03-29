require('dotenv').config();
const { pool } = require('./connection');

const DEFAULT_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

// ── CATEGORIES ──────────────────────────────────────────────
const CATEGORIES = [
  { title: 'Mobiles',          slug: 'mobiles',          image: 'https://loremflickr.com/400/400/smartphone' },
  { title: 'Electronics',      slug: 'electronics',      image: 'https://loremflickr.com/400/400/electronics' },
  { title: 'Fashion',          slug: 'fashion',          image: 'https://loremflickr.com/400/400/fashion,clothing' },
  { title: 'Home & Kitchen',   slug: 'home-kitchen',     image: 'https://loremflickr.com/400/400/kitchen,appliances' },
  { title: 'Books',            slug: 'books',            image: 'https://loremflickr.com/400/400/books,library' },
  { title: 'Sports & Fitness', slug: 'sports-fitness',   image: 'https://loremflickr.com/400/400/sports,fitness' },
];

// ── PRODUCTS ─────────────────────────────────────────────────
// Each product: { title, desc, price, mrp, brand, slug(category), rating, reviews, stock, sku, featured, images[3 seeds], specs[5] }
const PRODUCTS = [
  // ─── MOBILES (8) ────────────────────────────────────────
  {
    title: 'Samsung Galaxy A55 5G (128 GB, 8 GB RAM) – Iceblue',
    desc:  'Stunning 6.6" Super AMOLED 120Hz display, 50MP triple camera, 5000mAh battery with 25W fast charging.',
    price: 34999, mrp: 42999, brand: 'Samsung', slug: 'mobiles', rating: 4.4, reviews: 18200, stock: 45, sku: 'SAM-A55-5G-128',  featured: true,
    images: [
      'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-1.jpg',
      'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-2.jpg',
      'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-3.jpg',
    ],
    specs: [['Display','6.6" Super AMOLED 120Hz'],['Processor','Exynos 1480 Octa-core'],['Camera','50MP + 12MP + 5MP'],['Battery','5000 mAh, 25W'],['Storage','8GB RAM, 128GB']],
  },
  {
    title: 'Realme 12 Pro+ 5G (256 GB, 12 GB RAM) – Navigator Beige',
    desc:  'First 50MP periscope telephoto zoom camera in segment, Snapdragon 7s Gen 2, 67W SUPERVOOC charging.',
    price: 30999, mrp: 37999, brand: 'Realme', slug: 'mobiles', rating: 4.3, reviews: 9800, stock: 30, sku: 'RLME-12PP-256', featured: true,
    images: [
      'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-pro-plus-1.jpg',
      'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-pro-plus-2.jpg',
      'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-pro-plus-3.jpg',
    ],
    specs: [['Display','6.7" AMOLED 120Hz'],['Processor','Snapdragon 7s Gen 2'],['Camera','50MP Periscope + 8MP + 50MP'],['Battery','5000 mAh, 67W'],['Storage','12GB RAM, 256GB']],
  },
  {
    title: 'Redmi Note 13 Pro+ 5G (256 GB, 12 GB RAM) – Midnight Black',
    desc:  '200MP flagship-grade camera, 120W HyperCharge fills full battery in 19 minutes, curved AMOLED display.',
    price: 29999, mrp: 38999, brand: 'Redmi', slug: 'mobiles', rating: 4.5, reviews: 22400, stock: 60, sku: 'RDMI-N13PP-256', featured: true,
    images: [
      'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-1.jpg',
      'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-2.jpg',
      'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-3.jpg',
    ],
    specs: [['Display','6.67" AMOLED 120Hz Curved'],['Processor','Dimensity 7200 Ultra'],['Camera','200MP + 8MP + 2MP'],['Battery','5000 mAh, 120W'],['Storage','12GB RAM, 256GB']],
  },
  {
    title: 'iQOO Neo 9 Pro 5G (256 GB) – Fighter Blue',
    desc:  'Snapdragon 8 Gen 2 processor, 144Hz AMOLED, 50MP IMX920 Sony camera sensor, 120W flash charging.',
    price: 32999, mrp: 39999, brand: 'iQOO', slug: 'mobiles', rating: 4.4, reviews: 7600, stock: 25, sku: 'IQOO-N9P-256', featured: false,
    images: [
      'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-neo-9-pro-1.jpg',
      'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-neo-9-pro-2.jpg',
      'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-neo-9-pro-3.jpg',
    ],
    specs: [['Display','6.78" AMOLED 144Hz'],['Processor','Snapdragon 8 Gen 2'],['Camera','50MP Sony IMX920 + 8MP'],['Battery','5160 mAh, 120W'],['Storage','12GB RAM, 256GB']],
  },
  {
    title: 'POCO X6 Pro 5G (256 GB, 12 GB RAM) – Grey',
    desc:  'Dimensity 8300-Ultra chipset, 64MP OIS camera, 67W turbo charging, 6.67" Flow AMOLED CrystalRes display.',
    price: 22999, mrp: 29999, brand: 'POCO', slug: 'mobiles', rating: 4.3, reviews: 11000, stock: 50, sku: 'POCO-X6P-256', featured: false,
    images: [
      'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-1.jpg',
      'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-2.jpg',
      'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-3.jpg',
    ],
    specs: [['Display','6.67" AMOLED 144Hz'],['Processor','Dimensity 8300-Ultra'],['Camera','64MP OIS + 8MP + 2MP'],['Battery','5000 mAh, 67W'],['Storage','12GB RAM, 256GB']],
  },
  {
    title: 'OnePlus Nord CE 4 5G (128 GB) – Celadon Marble',
    desc:  'Snapdragon 7 Gen 3, 50MP Sony LYT-600 camera, 100W SUPERVOOC in 28 minutes, 6.7" FHD+ AMOLED 120Hz.',
    price: 24999, mrp: 29999, brand: 'OnePlus', slug: 'mobiles', rating: 4.2, reviews: 6300, stock: 40, sku: 'OP-NORCE4-128', featured: false,
    images: [
      'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-nord-ce4-1.jpg',
      'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-nord-ce4-2.jpg',
      'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-nord-ce4-3.jpg',
    ],
    specs: [['Display','6.7" AMOLED 120Hz'],['Processor','Snapdragon 7 Gen 3'],['Camera','50MP Sony LYT-600 + 8MP'],['Battery','5500 mAh, 100W'],['Storage','8GB RAM, 128GB']],
  },
  {
    title: 'Vivo V30e 5G (128 GB) – Vintage Red',
    desc:  '50MP AF front camera, Aura Light Portrait, IR night vision, 6.74" FHD+ AMOLED 64 Megapixel rear.',
    price: 21999, mrp: 26999, brand: 'Vivo', slug: 'mobiles', rating: 4.0, reviews: 4900, stock: 35, sku: 'VIVO-V30E-128', featured: false,
    images: [
      'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30e-1.jpg',
      'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30e-2.jpg',
      'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30e-3.jpg',
    ],
    specs: [['Display','6.74" AMOLED 120Hz'],['Processor','Snapdragon 695 5G'],['Camera','64MP + 8MP | 50MP Front'],['Battery','5000 mAh, 44W'],['Storage','8GB RAM, 128GB']],
  },
  {
    title: 'Motorola Edge 50 Fusion 5G (256 GB) – Hot Pink',
    desc:  'pOLED 144Hz display, 50MP Sony LYTIA-700C camera, IP68 rating, Snapdragon 7s Gen 2, 68W TurboPower.',
    price: 23999, mrp: 29999, brand: 'Motorola', slug: 'mobiles', rating: 4.1, reviews: 5400, stock: 0, sku: 'MOTO-E50F-256', featured: false,
    images: [
      'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-edge-50-fusion-1.jpg',
      'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-edge-50-fusion-2.jpg',
      'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-edge-50-fusion-3.jpg',
    ],
    specs: [['Display','6.7" pOLED 144Hz'],['Processor','Snapdragon 7s Gen 2'],['Camera','50MP Sony LYTIA-700C + 13MP'],['Battery','5000 mAh, 68W'],['Rating','IP68 Water Resistant']],
  },

  // ─── ELECTRONICS (8) ───────────────────────────────────
  {
    title: 'Sony Bravia 43" 4K Ultra HD Smart Google TV',
    desc:  "TRILUMINOS Pro display, X-Reality PRO engine, Dolby Audio, Google TV platform with 700,000+ movies.",
    price: 44990, mrp: 64990, brand: 'Sony', slug: 'electronics', rating: 4.5, reviews: 12800, stock: 18, sku: 'SONY-TV43-4K', featured: true,
    images: [
      'https://m.media-amazon.com/images/I/71MT4HFxmkL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81BXFlzS7DL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71zqr0BZELLL._SL1500_.jpg',
    ],
    specs: [['Screen Size','43" (108 cm)'],['Resolution','4K Ultra HD 3840×2160'],['Display','TRILUMINOS PRO, X-Reality'],['Audio','Dolby Atmos, 20W'],['Connectivity','Wi-Fi, 3×HDMI, 2×USB']],
  },
  {
    title: 'LG 190 L 3 Star Direct-Cool Single Door Refrigerator',
    desc:  'Fastest ice making (in 98 min), 5-in-1 convertible freezer, Smart Diagnosis, Stabilizer Free Operation.',
    price: 15990, mrp: 22990, brand: 'LG', slug: 'electronics', rating: 4.3, reviews: 9200, stock: 22, sku: 'LG-FRIDGE-190L', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/51WElYLiBQL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61v1sZjfMSL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61PKm3oE5bL._SL1500_.jpg',
    ],
    specs: [['Capacity','190 L'],['Energy Rating','3 Star BEE'],['Compressor','Smart Inverter'],['Voltage Range','100–310 V Stabilizer Free'],['Warranty','1 Year + 10 Year Compressor']],
  },
  {
    title: 'boAt Rockerz 550 Bluetooth On-Ear Headphones – Black',
    desc:  'Plush padded earcups, 20H playback, 40mm dynamic drivers, built-in mic, foldable design for travel.',
    price: 1299, mrp: 3990, brand: 'boAt', slug: 'electronics', rating: 4.1, reviews: 43000, stock: 200, sku: 'BOAT-R550-BLK', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61QDsFnpfFL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71JTqVZCTRL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61iaQBhsaQL._SL1500_.jpg',
    ],
    specs: [['Driver','40mm Dynamic'],['Playback','20 Hours'],['Connectivity','Bluetooth 5.0'],['Mic','Yes, Built-in'],['Weight','218 g']],
  },
  {
    title: 'Mi Smart Air Purifier 4 with Filter for Home (True HEPA)',
    desc:  'Captures 99.97% particles ≥0.3μm, CADR 400 m³/h, Mi Home / Alexa compatible, 31dB quiet mode.',
    price: 12499, mrp: 17999, brand: 'Xiaomi', slug: 'electronics', rating: 4.2, reviews: 7800, stock: 30, sku: 'MI-AP4-HEPA', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/41mJXNBOJNL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/51Nfj1YQEKL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61giqhPfMxL._SL1500_.jpg',
    ],
    specs: [['CADR','400 m³/h'],['Coverage','60 m²'],['Filter','True HEPA + Activated Carbon'],['Noise','31–64 dB'],['Smart','Mi Home, Alexa, Google']],
  },
  {
    title: 'Philips LED Desk Lamp with USB Charging Port – White',
    desc:  '5 brightness levels, 5 colour temperatures, USB-A charging port, memory function, flicker-free light.',
    price: 2499, mrp: 3999, brand: 'Philips', slug: 'electronics', rating: 4.0, reviews: 3400, stock: 80, sku: 'PHIL-LAMP-USB', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61oJCRRvpzL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71gIq0ZQGYL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61HlJXdFqtL._SL1500_.jpg',
    ],
    specs: [['Wattage','9W LED'],['Brightness Levels','5'],['Colour Temp','2700–6500K'],['USB Port','5V/1A Charging'],['Power','Touch Control']],
  },
  {
    title: 'HP 15s Core i5 13th Gen Laptop – 8GB RAM, 512GB SSD',
    desc:  'Intel Core i5-1335U, 15.6" FHD IPS Anti-glare, Intel Iris Xe Graphics, Windows 11 Home, backlit keyboard.',
    price: 57990, mrp: 74990, brand: 'HP', slug: 'electronics', rating: 4.4, reviews: 15600, stock: 12, sku: 'HP-15S-I513-512', featured: true,
    images: [
      'https://m.media-amazon.com/images/I/71pBbFHECGL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71vEuHGpTML._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61bLZJa3BeL._SL1500_.jpg',
    ],
    specs: [['Processor','Intel Core i5-1335U 13th Gen'],['RAM','8 GB DDR4'],['Storage','512 GB PCIe NVMe SSD'],['Display','15.6" FHD IPS 250 nits'],['OS','Windows 11 Home']],
  },
  {
    title: 'Canon EOS 1500D 24.1 MP DSLR Camera with EF-S 18-55mm Lens',
    desc:  '24.1 MP APS-C CMOS sensor, DIGIC 4+ processor, 9-point AF, Full HD 1080/30p video, Wi-Fi & NFC.',
    price: 36990, mrp: 49990, brand: 'Canon', slug: 'electronics', rating: 4.5, reviews: 8900, stock: 15, sku: 'CANON-1500D-1855', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/91nwLgHPJgL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81j8bT7YQHL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71hIXQzIhNL._SL1500_.jpg',
    ],
    specs: [['Sensor','24.1 MP APS-C CMOS'],['Processor','DIGIC 4+'],['Focus','9-point AF'],['Video','Full HD 1080/30p'],['Connectivity','Wi-Fi, NFC']],
  },
  {
    title: 'Zebronics Zeb-Sound Feast 900 2.1 Bluetooth Speaker',
    desc:  '75W RMS output, 6.5" woofer, RGB lighting, USB/SD/AUX/FM, remote control, Bluetooth 5.0.',
    price: 4999, mrp: 8999, brand: 'Zebronics', slug: 'electronics', rating: 3.9, reviews: 5600, stock: 0, sku: 'ZEB-SF900', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61bv-SFlorL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71vEsGmg-4L._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61-KeOtLe6L._SL1500_.jpg',
    ],
    specs: [['Output','75W RMS (50W+12.5W+12.5W)'],['Woofer','6.5 inch'],['Connectivity','BT 5.0, USB, SD, AUX, FM'],['Lighting','RGB LED'],['Remote','Yes']],
  },

  // ─── FASHION (8) ────────────────────────────────────────
  {
    title: 'Jockey Men\'s Regular Fit Cotton T-Shirt – Pack of 2',
    desc:  '100% combed cotton, rib knit collar, taped neck and shoulders, preshrunk for shape retention.',
    price:  799, mrp: 1398, brand: 'Jockey', slug: 'fashion', rating: 4.3, reviews: 62000, stock: 500, sku: 'JOCK-TEE-2PK', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71BqBJTAvuL._UL1500_.jpg',
      'https://m.media-amazon.com/images/I/71tG9TSKGZL._UL1500_.jpg',
      'https://m.media-amazon.com/images/I/81cWnpJu1rL._UL1500_.jpg',
    ],
    specs: [['Material','100% Combed Cotton'],['Fit','Regular Fit'],['Neck','Round Neck Rib Collar'],['Pack of','2'],['Wash Care','Machine Wash Cold']],
  },
  {
    title: 'W Women\'s A-Line Floral Kurta – Multicolour',
    desc:  'Viscose crepe fabric, printed floral pattern, 3/4 sleeves, side slits, kurta length just below knee.',
    price: 1199, mrp: 2199, brand: 'W', slug: 'fashion', rating: 4.2, reviews: 18900, stock: 150, sku: 'W-KURTA-AFL-M', featured: false,
    images: [
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/23496066/2023/8/23/kurta1.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/23496066/2023/8/23/kurta2.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/23496066/2023/8/23/kurta3.jpg',
    ],
    specs: [['Material','Viscose Crepe'],['Fit','Regular'],['Pattern','Floral Print'],['Sleeve','3/4 Sleeve'],['Occasion','Casual, Work']],
  },
  {
    title: 'HRX by Hrithik Roshan Men\'s Active Shorts – Black',
    desc:  'Quick-dry fabric, elasticated waistband with inner drawstring, deep pockets, 4-way stretch.',
    price:  599, mrp: 1499, brand: 'HRX', slug: 'fashion', rating: 4.1, reviews: 22400, stock: 300, sku: 'HRX-SHORTS-BLK', featured: false,
    images: [
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/hrx-shorts-1.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/hrx-shorts-2.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/hrx-shorts-3.jpg',
    ],
    specs: [['Material','Polyester Quick-Dry'],['Fit','Regular'],['Closure','Elasticated Drawstring'],['Pockets','2 Deep Side'],['Stretch','4-Way']],
  },
  {
    title: 'Biba Women\'s Straight Salwar Kameez Set – Teal',
    desc:  'Cotton printed kurta with straight cut palazzo set, dupatta included, block print design.',
    price: 2499, mrp: 4299, brand: 'Biba', slug: 'fashion', rating: 4.3, reviews: 9800, stock: 80, sku: 'BIBA-SKS-TEAL', featured: false,
    images: [
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/biba-set-1.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/biba-set-2.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/biba-set-3.jpg',
    ],
    specs: [['Material','Pure Cotton'],['Set Contains','Kurta + Palazzo + Dupatta'],['Print','Block Print'],['Fit','Straight'],['Occasion','Casual, Festive']],
  },
  {
    title: 'Allen Solly Men\'s Slim Fit Chinos – Beige',
    desc:  'Stretch cotton twill, flat front, slim leg tapered fit, 4-pocket styling, wrinkle resistant finish.',
    price: 1799, mrp: 3499, brand: 'Allen Solly', slug: 'fashion', rating: 4.0, reviews: 11200, stock: 120, sku: 'AS-CHINO-SLIM-BEI', featured: false,
    images: [
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/allensolly-chino-1.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/allensolly-chino-2.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/allensolly-chino-3.jpg',
    ],
    specs: [['Material','98% Cotton 2% Elastane'],['Fit','Slim Fit'],['Rise','Mid Rise'],['Closure','Button & Zip'],['Occasion','Casual, Smart Casual']],
  },
  {
    title: 'Fabindia Women\'s Hand Block Print Cotton Kurti – Ivory',
    desc:  'Hand block printed with natural dyes, pure cotton voile, V-neck, 3/4 sleeves, straight hem.',
    price: 1499, mrp: 2295, brand: 'Fabindia', slug: 'fashion', rating: 4.4, reviews: 7600, stock: 90, sku: 'FABI-KURTI-IVORY', featured: false,
    images: [
      'https://www.fabindia.com/pub/media/catalog/product/cache/kurti-ivory-1.jpg',
      'https://www.fabindia.com/pub/media/catalog/product/cache/kurti-ivory-2.jpg',
      'https://www.fabindia.com/pub/media/catalog/product/cache/kurti-ivory-3.jpg',
    ],
    specs: [['Material','Pure Cotton Voile'],['Print','Hand Block Print'],['Dye','Natural Dyes'],['Neck','V-Neck'],['Hem','Straight']],
  },
  {
    title: 'Peter England Men\'s Formal Shirt – Solid Light Blue',
    desc:  'Cotton-rich poplin, semi-spread collar, curved hem, full placket, machine washable formal wear.',
    price: 1299, mrp: 2299, brand: 'Peter England', slug: 'fashion', rating: 4.1, reviews: 14300, stock: 200, sku: 'PE-SHIRT-LBLU', featured: false,
    images: [
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/pe-shirt-1.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/pe-shirt-2.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/pe-shirt-3.jpg',
    ],
    specs: [['Material','60% Cotton 40% Polyester'],['Fit','Regular Fit'],['Collar','Semi-Spread'],['Hem','Curved'],['Occasion','Formal, Office']],
  },
  {
    title: 'Globus Women\'s Fit & Flare Mini Dress – Red Checks',
    desc:  'Woven poly blend, V-neck, puff sleeves, smocked back for fit, invisible side zip closure.',
    price:  999, mrp: 2499, brand: 'Globus', slug: 'fashion', rating: 3.9, reviews: 5400, stock: 0, sku: 'GLOB-DRESS-RDCHK', featured: false,
    images: [
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/globus-dress-1.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/globus-dress-2.jpg',
      'https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/globus-dress-3.jpg',
    ],
    specs: [['Material','Polyester Woven'],['Fit','Fit & Flare'],['Neck','V-Neck'],['Sleeve','Puff Sleeve'],['Closure','Side Zip']],
  },

  // ─── HOME & KITCHEN (8) ─────────────────────────────────
  {
    title: 'Prestige Induction Cooktop 2000W – PIC 20.0+ Black',
    desc:  'Touch control, 7 preset menus, auto shut-off, voltage surge protection, Indian-style kadai base support.',
    price: 2299, mrp: 3795, brand: 'Prestige', slug: 'home-kitchen', rating: 4.3, reviews: 28000, stock: 75, sku: 'PRES-PIC20-BLK', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61O5GkGR2FL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71rqMOHFHHL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61Q3eZ-h8YL._SL1500_.jpg',
    ],
    specs: [['Wattage','2000W'],['Controls','Touch Panel'],['Preset Menus','7'],['Timer','Yes, Auto Shut-off'],['Warranty','1 Year']],
  },
  {
    title: 'Hawkins Contura 5 Litre Pressure Cooker – Black',
    desc:  'Lid-outside design (no lid storage problem), New improved gasket release system, thick base, ISI marked.',
    price: 2199, mrp: 3200, brand: 'Hawkins', slug: 'home-kitchen', rating: 4.6, reviews: 19200, stock: 60, sku: 'HAWK-CB50-5L', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61qoOBiZd3L._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71pMFmL5JkL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61r0L8PYDKL._SL1500_.jpg',
    ],
    specs: [['Capacity','5 Litres'],['Material','Hard Anodised Aluminium'],['Design','Lid Outside'],['Base','3.5mm Thick'],['Certification','ISI Marked']],
  },
  {
    title: 'Borosil Glass Water Bottle 1 Litre – Transparent',
    desc:  'Borosilicate glass, BPA-free, leak-proof stainless steel lid, temperature safe -20°C to 400°C.',
    price:  699, mrp: 1299, brand: 'Borosil', slug: 'home-kitchen', rating: 4.4, reviews: 31000, stock: 200, sku: 'BOR-BOTTLE-1L', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61e5oJhcUNL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71GD0JVFT6L._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61Vm-lPXtbL._SL1500_.jpg',
    ],
    specs: [['Capacity','1000 ml'],['Material','Borosilicate Glass'],['BPA Free','Yes'],['Temp Range','-20°C to 400°C'],['Lid','Stainless Steel Leak-Proof']],
  },
  {
    title: 'Milton Thermosteel Flip Lid Flask 500ml – Black',
    desc:  'Double wall vacuum insulated, keeps hot 24h / cold 24h, food-grade stainless steel inner & outer.',
    price:  649, mrp: 1295, brand: 'Milton', slug: 'home-kitchen', rating: 4.3, reviews: 42000, stock: 300, sku: 'MILT-TS-500-BLK', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61JOVsOQTIL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71Bd8GnnBFL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61D2WzPkNYL._SL1500_.jpg',
    ],
    specs: [['Capacity','500 ml'],['Insulation','Double Wall Vacuum'],['Hot / Cold','24 Hours'],['Material','18/8 Food Grade SS'],['Lid','Flip Lid with Lock']],
  },
  {
    title: 'Pigeon by Stovekraft Non-Stick Dosa Tawa 30cm',
    desc:  'Hard anodised body, PTFE non-stick coating (PFOA-free), induction & gas compatible, cool touch handle.',
    price:  599, mrp: 1199, brand: 'Pigeon', slug: 'home-kitchen', rating: 4.1, reviews: 15600, stock: 150, sku: 'PIGEON-TAWA-30', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61qMDWHZSQL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71UhVaxBWQL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61aRMsn5-sL._SL1500_.jpg',
    ],
    specs: [['Diameter','30 cm'],['Material','Hard Anodised'],['Coating','PTFE Non-Stick (PFOA-Free)'],['Compatible','Induction + Gas'],['Handle','Cool Touch Bakelite']],
  },
  {
    title: 'Solimo Bamboo Fibre Cutting Board – Large',
    desc:  'Eco-friendly bamboo composite, juice grooves on both sides, non-slip rubber feet, dishwasher safe.',
    price:  499, mrp:  899, brand: 'Solimo', slug: 'home-kitchen', rating: 4.2, reviews: 11200, stock: 120, sku: 'SOLIMO-CBRD-LG', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71bv2AXVSBL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81lnj-v0MGL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71oVEaWxTEL._SL1500_.jpg',
    ],
    specs: [['Material','Bamboo Composite'],['Size','38 × 25 × 1.5 cm'],['Groove','Both Sides'],['Feet','Non-Slip Rubber'],['Care','Dishwasher Safe']],
  },
  {
    title: 'Cello Octa 8-Piece Food Storage Container Set',
    desc:  'BPA-free polypropylene, air-tight lid, microwave safe, freezer safe, all 8 sizes for pantry organisation.',
    price:  799, mrp: 1499, brand: 'Cello', slug: 'home-kitchen', rating: 4.0, reviews: 8900, stock: 100, sku: 'CELLO-OCTA-8PK', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71bhOKKY6jL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81y0DxGJJFL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71KT+vxiJ5L._SL1500_.jpg',
    ],
    specs: [['Pack of','8 Containers'],['Material','BPA-Free Polypropylene'],['Lid','Air-Tight Snap Lock'],['Microwave','Safe'],['Freezer','Safe']],
  },
  {
    title: 'Preethi Blue Leaf Diamond Mixer Grinder 750W – 4 Jars',
    desc:  '750W copper motor, 4 jars (1.5L liquidising + 1L + 0.4L dry + 0.4L chutney), 5-year motor warranty.',
    price: 4299, mrp: 6995, brand: 'Preethi', slug: 'home-kitchen', rating: 4.5, reviews: 24000, stock: 40, sku: 'PREETHI-BLD-750', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61b6OeP1z5L._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71v3BH4BHEL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61c6vBEMWML._SL1500_.jpg',
    ],
    specs: [['Power','750 Watt Copper Motor'],['Jars','4 (1.5L, 1L, 0.4L, 0.4L)'],['Speed','3 Speed + Pulse'],['Warranty','2 Year + 5 Year Motor'],['Body','ABS Food Grade Plastic']],
  },

  // ─── BOOKS (8) ──────────────────────────────────────────
  {
    title: 'The Psychology of Money – Morgan Housel (Paperback)',
    desc:  '19 short stories exploring the strange ways people think about money and 18 timeless lessons about wealth.',
    price:  299, mrp:  499, brand: 'Jaico Publishing', slug: 'books', rating: 4.7, reviews: 38000, stock: 500, sku: 'BOOK-PSYCHMONEY', featured: true,
    images: [
      'https://m.media-amazon.com/images/I/71g2NeASIiL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81Dky+tD+pL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71ExTiyapeL._SL1500_.jpg',
    ],
    specs: [['Author','Morgan Housel'],['Publisher','Jaico Publishing House'],['Pages','256'],['Language','English'],['Edition','2023 Indian Edition']],
  },
  {
    title: 'Ikigai: The Japanese Secret to a Long and Happy Life (Paperback)',
    desc:  'Finding your reason for being — the Japanese concept that gives your life purpose and leads to satisfaction.',
    price:  199, mrp:  350, brand: 'Penguin', slug: 'books', rating: 4.5, reviews: 52000, stock: 800, sku: 'BOOK-IKIGAI', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71l4S7zRFLL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81VRaFCsBUL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81oHitaeLlL._SL1500_.jpg',
    ],
    specs: [['Author','Héctor García, Francesc Miralles'],['Publisher','Penguin Books'],['Pages','194'],['Language','English'],['Binding','Paperback']],
  },
  {
    title: 'Atomic Habits – James Clear (Paperback)',
    desc:  'No.1 New York Times bestseller. Tiny changes, remarkable results. A framework for improving every day.',
    price:  399, mrp:  799, brand: 'Penguin Random House', slug: 'books', rating: 4.6, reviews: 67000, stock: 1000, sku: 'BOOK-ATOMICHA', featured: true,
    images: [
      'https://m.media-amazon.com/images/I/81wgcld4wxL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/91bYsX41DVL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81ANaVZk5LL._SL1500_.jpg',
    ],
    specs: [['Author','James Clear'],['Publisher','Penguin Random House'],['Pages','320'],['Language','English'],['Edition','Paperback']],
  },
  {
    title: 'Wings of Fire: An Autobiography – A.P.J. Abdul Kalam',
    desc:  'The inspirational life story of Dr APJ Abdul Kalam — scientist, visionary and former President of India.',
    price:  199, mrp:  295, brand: 'Universities Press', slug: 'books', rating: 4.8, reviews: 89000, stock: 2000, sku: 'BOOK-WINGSFIRE', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/81oXbMUlCEL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71oAZaqdIaL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/91nHFhEEIAL._SL1500_.jpg',
    ],
    specs: [['Author','A.P.J. Abdul Kalam, Arun Tiwari'],['Publisher','Universities Press'],['Pages','196'],['Language','English'],['Category','Autobiography']],
  },
  {
    title: 'Rich Dad Poor Dad – Robert T. Kiyosaki (Paperback)',
    desc:  'What the rich teach their kids about money that the poor and middle class do not. Global personal finance classic.',
    price:  299, mrp:  495, brand: 'Manjul Publishing', slug: 'books', rating: 4.5, reviews: 71000, stock: 1500, sku: 'BOOK-RICHDAD', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/81BE7eeKzAL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/91nwLgHPJgL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71EEptlDxML._SL1500_.jpg',
    ],
    specs: [['Author','Robert T. Kiyosaki'],['Publisher','Manjul Publishing House'],['Pages','336'],['Language','English'],['Edition','Updated 25th Anniversary']],
  },
  {
    title: 'The Alchemist – Paulo Coelho (English Paperback)',
    desc:  'A magical story about following your dreams — the world\'s most-read novel, translated into 89 languages.',
    price:  199, mrp:  399, brand: 'HarperCollins', slug: 'books', rating: 4.6, reviews: 94000, stock: 2000, sku: 'BOOK-ALCHEMIST', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71aFt4+OTOL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81mRSAEJFLL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71zytzwUETL._SL1500_.jpg',
    ],
    specs: [['Author','Paulo Coelho'],['Publisher','HarperCollins India'],['Pages','208'],['Language','English'],['Translator','Alan R. Clarke']],
  },
  {
    title: 'Zero to One – Peter Thiel with Blake Masters',
    desc:  'Notes on startups, or how to build the future. Essential reading for any entrepreneur building something new.',
    price:  349, mrp:  599, brand: 'Crown Currency', slug: 'books', rating: 4.4, reviews: 19000, stock: 600, sku: 'BOOK-ZERO2ONE', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71RNqQRtN6L._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81TQnTLBnHL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71IhFRBNYoL._SL1500_.jpg',
    ],
    specs: [['Author','Peter Thiel & Blake Masters'],['Publisher','Crown Currency'],['Pages','224'],['Language','English'],['Category','Business & Startups']],
  },
  {
    title: 'Sapiens: A Brief History of Humankind – Yuval Noah Harari',
    desc:  'Bold, wide-ranging and provocative — how Homo sapiens came to dominate Earth and what that means for our future.',
    price:  499, mrp:  799, brand: 'Vintage Books', slug: 'books', rating: 4.5, reviews: 41000, stock: 800, sku: 'BOOK-SAPIENS', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/713jIoMO3UL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81PvqAjWEkL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71gWVuGdGLL._SL1500_.jpg',
    ],
    specs: [['Author','Yuval Noah Harari'],['Publisher','Vintage Books'],['Pages','464'],['Language','English'],['Category','History & Anthropology']],
  },

  // ─── SPORTS & FITNESS (8) ───────────────────────────────
  {
    title: 'Nivia Storm Football – Size 5, Yellow/Black',
    desc:  'Machine-stitched PVC football, 32-panel design, nylon-wound latex bladder, suitable for all surfaces.',
    price:  499, mrp:  899, brand: 'Nivia', slug: 'sports-fitness', rating: 4.1, reviews: 14000, stock: 200, sku: 'NIVIA-STORM-5', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61FS9XCYZKL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71j4xZ81lBL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61xEQwFhH-L._SL1500_.jpg',
    ],
    specs: [['Size','5 (Standard)'],['Material','PVC'],['Panels','32 Machine-Stitched'],['Bladder','Latex Nylon-Wound'],['Surface','All Surfaces']],
  },
  {
    title: 'Cosco Badminton Racket Set – 2 Rackets + Shuttlecocks + Cover',
    desc:  'Aluminium alloy frame, 22 lbs string tension, full-length cover, 6 nylon shuttlecocks, great starter set.',
    price:  799, mrp: 1499, brand: 'Cosco', slug: 'sports-fitness', rating: 4.0, reviews: 9800, stock: 150, sku: 'COSCO-BR-SET', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71oFJE05eLL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81mMG3H9bML._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71c5qx8PNML._SL1500_.jpg',
    ],
    specs: [['Racket Material','Aluminium Alloy'],['String Tension','22 lbs Pre-Strung'],['Includes','2 Rackets + 6 Shuttlecocks + Cover'],['Grip Size','G4'],['Suitable For','Beginners']],
  },
  {
    title: 'Boldfit Pro Yoga Mat 6mm – Navy Blue with Carrying Strap',
    desc:  'TPE eco-friendly material, anti-slip texture both sides, 183×61cm, 6mm thick, includes carry strap.',
    price:  799, mrp: 1999, brand: 'Boldfit', slug: 'sports-fitness', rating: 4.3, reviews: 21000, stock: 300, sku: 'BOLD-YM-6MM-NVY', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61xz5ReWHjL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71H27UuCaML._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61bASF6i7XL._SL1500_.jpg',
    ],
    specs: [['Material','TPE (Eco-Friendly)'],['Thickness','6 mm'],['Dimensions','183 × 61 cm'],['Surface','Anti-Slip Both Sides'],['Includes','Carry Strap']],
  },
  {
    title: 'Strauss Resistance Bands Set – 5 Levels with Carry Bag',
    desc:  'Natural latex, progressive resistance (5–40 lbs), suitable for full body workouts, physical therapy, stretching.',
    price:  499, mrp: 1299, brand: 'Strauss', slug: 'sports-fitness', rating: 4.2, reviews: 17500, stock: 250, sku: 'STRAUS-RB-5PK', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71bv9StWqLL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81aBXFVDSmL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61qx01YaEZL._SL1500_.jpg',
    ],
    specs: [['Material','100% Natural Latex'],['Levels','5 (5,10,15,25,40 lbs)'],['Includes','5 Bands + Carry Bag'],['Use','Gym, Yoga, Physiotherapy'],['Warranty','6 Months']],
  },
  {
    title: 'Decathlon Aptonia Protein Shaker 700ml – Blue',
    desc:  'BPA-free Tritan plastic, leak-proof flip cap, mixing ball included, graduated markings up to 700ml.',
    price:  299, mrp:  499, brand: 'Decathlon', slug: 'sports-fitness', rating: 4.4, reviews: 28000, stock: 400, sku: 'DEC-SHAKER-700', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61qBnWFbFHL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71nOT7TSNKL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/612VGn+JqdL._SL1500_.jpg',
    ],
    specs: [['Capacity','700 ml'],['Material','BPA-Free Tritan'],['Lid','Flip Cap Leak-Proof'],['Mix Ball','Stainless Steel'],['Markings','Graduated (100ml steps)']],
  },
  {
    title: 'Skullcandy Push Active True Wireless Sport Earbuds',
    desc:  'Ear-hook stability, 35H total battery, IP55 sweat & dust rating, Tile finding tech, personal sound.',
    price: 3999, mrp: 7999, brand: 'Skullcandy', slug: 'sports-fitness', rating: 4.1, reviews: 6700, stock: 80, sku: 'SKULL-PUSH-ACT', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61qwQMHxoGL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71wvmC4OQJL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61kYTsGvgnL._SL1500_.jpg',
    ],
    specs: [['Battery','35 Hours Total (9H buds + 26H case)'],['Water Rating','IP55'],['Fit','Ear-Hook Sport'],['Find','Tile Technology'],['Colour','True Black']],
  },
  {
    title: 'Lifelong LLM258 Multifunction Home Gym (ROM Machine)',
    desc:  'Multi-station home gym, lat pulldown, pectoral fly, leg extension, ab crunch, 85-kg weight stack.',
    price: 24999, mrp: 44999, brand: 'Lifelong', slug: 'sports-fitness', rating: 4.0, reviews: 3200, stock: 8, sku: 'LIFELONG-LLM258', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/71A7TW8mzgL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/81rqIGKwTHL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61cxA6JGPOL._SL1500_.jpg',
    ],
    specs: [['Weight Stack','85 kg'],['Stations','Lat Pull, Pec Fly, Leg Ext, Ab Crunch'],['Frame','Heavy Duty Steel'],['Upholstery','PVC Padded'],['Warranty','1 Year']],
  },
  {
    title: 'Mikasa Sports MVA200 Volleyball – FIVB Approved',
    desc:  'Official FIVB ball, 8-panel dimple-surface design, butyl inner tube, PU leather outer, perfect for competition.',
    price: 1999, mrp: 3499, brand: 'Mikasa', slug: 'sports-fitness', rating: 4.5, reviews: 4100, stock: 0, sku: 'MIKASA-MVA200', featured: false,
    images: [
      'https://m.media-amazon.com/images/I/61sBUOgQVAL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/71JBn0m7FtL._SL1500_.jpg',
      'https://m.media-amazon.com/images/I/61wh07SMTKL._SL1500_.jpg',
    ],
    specs: [['Approval','FIVB Official'],['Panels','8 Dimple Surface'],['Outer','PU Leather'],['Bladder','Butyl Inner Tube'],['Size','5 (Standard)']],
  },
];

// ── ADDRESSES ────────────────────────────────────────────────
const ADDRESSES = [
  {
    name: 'Rahul Sharma', mobile: '9876543210', pincode: '560001',
    address1: 'No. 14, 3rd Cross, Residency Road', address2: 'Near Brigade Road',
    city: 'Bangalore', state: 'Karnataka', country: 'India', type: 'HOME', is_default: true,
  },
  {
    name: 'Rahul Sharma', mobile: '9876543210', pincode: '560034',
    address1: 'Unit 402, Prestige Towers', address2: 'Koramangala 5th Block',
    city: 'Bangalore', state: 'Karnataka', country: 'India', type: 'WORK', is_default: false,
  },
];

// ── MAIN SEED FUNCTION ───────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    console.log('🔌 Connecting to database...');
    await client.query('BEGIN');

    // ── TRUNCATE in reverse-dependency order ──────────────
    console.log('🗑️  Truncating all tables...');
    await client.query(`
      TRUNCATE order_items, orders, cart_items,
               product_specifications, product_images,
               addresses, products, categories, users
      RESTART IDENTITY CASCADE
    `);
    console.log('   ✔ All tables cleared');

    // ── USERS ─────────────────────────────────────────────
    console.log('\n👤 Seeding users...');
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        DEFAULT_USER_ID,
        'Rahul Sharma',
        'rahul.sharma@example.com',
        '$2b$10$examplehashnotusedforauthbutplaceholderonly',   // bcrypt placeholder
        'customer',
        '9876543210',
      ]
    );
    console.log('   ✔ 1 user inserted (id:', DEFAULT_USER_ID, ')');

    // ── CATEGORIES ────────────────────────────────────────
    console.log('\n📂 Seeding categories...');
    const categoryIdMap = {};
    for (const cat of CATEGORIES) {
      const { rows } = await client.query(
        `INSERT INTO categories (title, slug, image)
         VALUES ($1, $2, $3) RETURNING id`,
        [cat.title, cat.slug, cat.image]
      );
      categoryIdMap[cat.slug] = rows[0].id;
    }
    console.log(`   ✔ ${CATEGORIES.length} categories inserted`);

    // ── PRODUCTS + IMAGES + SPECS ─────────────────────────
    console.log('\n📦 Seeding products...');
    let imgTotal  = 0;
    let specTotal = 0;

    for (const p of PRODUCTS) {
      const catId = categoryIdMap[p.slug] || null;
      const { rows: [prod] } = await client.query(
        `INSERT INTO products
           (title, description, price, mrp, brand, category_id,
            rating, reviews_count, stock, sku, is_featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [p.title, p.desc, p.price, p.mrp, p.brand, catId,
         p.rating, p.reviews, p.stock, p.sku, p.featured]
      );
      const prodId = prod.id;

      // 3 images — use real product-specific URLs stored in p.images
      for (let i = 0; i < p.images.length; i++) {
        await client.query(
          `INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
           VALUES ($1,$2,$3,$4,$5)`,
          [prodId, p.images[i], `${p.title} – view ${i + 1}`, i === 0, i]
        );
        imgTotal++;
      }

      // 5 specs
      for (let i = 0; i < p.specs.length; i++) {
        const [label, value] = p.specs[i];
        await client.query(
          `INSERT INTO product_specifications
             (product_id, section, label, value, sort_order)
           VALUES ($1,'General',$2,$3,$4)`,
          [prodId, label, value, i]
        );
        specTotal++;
      }
    }

    console.log(`   ✔ ${PRODUCTS.length} products inserted`);
    console.log(`   ✔ ${imgTotal} product images inserted`);
    console.log(`   ✔ ${specTotal} product specifications inserted`);

    // ── ADDRESSES ─────────────────────────────────────────
    console.log('\n📍 Seeding addresses...');
    for (const addr of ADDRESSES) {
      await client.query(
        `INSERT INTO addresses
           (user_id, name, mobile, pincode, address1, address2,
            city, state, country, type, is_default)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [DEFAULT_USER_ID, addr.name, addr.mobile, addr.pincode,
         addr.address1, addr.address2, addr.city, addr.state,
         addr.country, addr.type, addr.is_default]
      );
    }
    console.log(`   ✔ ${ADDRESSES.length} addresses inserted for default user`);

    await client.query('COMMIT');

    console.log('\n──────────────────────────────────────────');
    console.log('✅ Seeding complete!');
    console.log('──────────────────────────────────────────');
    console.log(`   Users        : 1`);
    console.log(`   Categories   : ${CATEGORIES.length}`);
    console.log(`   Products     : ${PRODUCTS.length}`);
    console.log(`   Images       : ${imgTotal}`);
    console.log(`   Specifications: ${specTotal}`);
    console.log(`   Addresses    : ${ADDRESSES.length}`);
    console.log('──────────────────────────────────────────\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed — transaction rolled back');
    console.error('   Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
