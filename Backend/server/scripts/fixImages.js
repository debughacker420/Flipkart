require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Reliable image URLs from Unsplash / public CDNs
const IMAGE_MAP = {
  // ── MOBILES ──
  'iQOO Neo 9 Pro 5G': [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80&fit=crop',
  ],
  'OnePlus Nord CE 4 5G': [
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?w=400&q=80&fit=crop',
  ],
  'Motorola Edge 50 Fusion': [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1580910051074-3eb694886f4b?w=400&q=80&fit=crop',
  ],
  'POCO X6 Pro 5G': [
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80&fit=crop',
  ],
  'Realme 12 Pro+': [
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&q=80&fit=crop',
  ],
  'Redmi Note 13 Pro+': [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80&fit=crop',
  ],
  'Samsung Galaxy A55 5G': [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400&q=80&fit=crop',
  ],
  'Vivo V30e 5G': [
    'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&q=80&fit=crop',
  ],

  // ── ELECTRONICS ──
  'boAt Rockerz 550': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80&fit=crop',
  ],
  'Zebronics Zeb-Sound Feast': [
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80&fit=crop',
  ],
  'Skullcandy Push Active': [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80&fit=crop',
  ],
  'Canon EOS 1500D': [
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=400&q=80&fit=crop',
  ],
  'HP 15s Core i5': [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80&fit=crop',
  ],
  'Sony Bravia 43': [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=400&q=80&fit=crop',
  ],
  'LG 190 L': [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1536353284924-9220c464e262?w=400&q=80&fit=crop',
  ],
  'Mi Smart Air Purifier': [
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1626436819821-d23ae8b01b88?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80&fit=crop',
  ],
  'Philips LED Desk Lamp': [
    'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1534531173927-aeb928d54385?w=400&q=80&fit=crop',
  ],

  // ── FASHION ──
  'Allen Solly Men': [
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80&fit=crop',
  ],
  'Biba Women': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80&fit=crop',
  ],
  'Fabindia Women': [
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80&fit=crop',
  ],
  'Globus Women': [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80&fit=crop',
  ],
  'HRX by Hrithik': [
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1519235106439-aa59aa91bebc?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80&fit=crop',
  ],
  'Jockey Men': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80&fit=crop',
  ],
  'Peter England Men': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&q=80&fit=crop',
  ],
  'W Women': [
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80&fit=crop',
  ],

  // ── HOME & KITCHEN ──
  'Borosil Glass Water Bottle': [
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&q=80&fit=crop',
  ],
  'Cello Octa': [
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&q=80&fit=crop',
  ],
  'Hawkins Contura': [
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1584990347449-39f05a728a7c?w=400&q=80&fit=crop',
  ],
  'Milton Thermosteel': [
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&q=80&fit=crop',
  ],
  'Pigeon by Stovekraft': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1584990347449-39f05a728a7c?w=400&q=80&fit=crop',
  ],
  'Preethi Blue Leaf': [
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1584990347449-39f05a728a7c?w=400&q=80&fit=crop',
  ],
  'Prestige Induction Cooktop': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&q=80&fit=crop',
  ],
  'Solimo Bamboo': [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1584990347449-39f05a728a7c?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80&fit=crop',
  ],

  // ── SPORTS & FITNESS ──
  'Boldfit Pro Yoga Mat': [
    'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80&fit=crop',
  ],
  'Cosco Badminton Racket': [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1613918431703-aa50889e3be0?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80&fit=crop',
  ],
  'Decathlon Aptonia Protein Shaker': [
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400&q=80&fit=crop',
  ],
  'Lifelong LLM258': [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80&fit=crop',
  ],
  'Mikasa Sports MVA200': [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1553005746-9245ba190489?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1592656094267-764a45160876?w=400&q=80&fit=crop',
  ],
  'Nivia Storm Football': [
    'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=400&q=80&fit=crop',
  ],
  'Strauss Resistance Bands': [
    'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop',
  ],

  // ── BOOKS (Open Library is reliable, but add Unsplash fallbacks) ──
  'Atomic Habits': [
    'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80&fit=crop',
  ],
  'Ikigai': [
    'https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80&fit=crop',
  ],
  'Rich Dad Poor Dad': [
    'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80&fit=crop',
  ],
  'Sapiens': [
    'https://covers.openlibrary.org/b/isbn/9780099590088-L.jpg',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80&fit=crop',
  ],
  'The Alchemist': [
    'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80&fit=crop',
  ],
  'The Psychology of Money': [
    'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80&fit=crop',
  ],
  'Wings of Fire': [
    'https://covers.openlibrary.org/b/isbn/9788173711466-L.jpg',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80&fit=crop',
  ],
  'Zero to One': [
    'https://covers.openlibrary.org/b/isbn/9780804139021-L.jpg',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80&fit=crop',
  ],
};

async function fixImages() {
  const client = await pool.connect();
  try {
    // Get all products
    const { rows: products } = await client.query(
      'SELECT id, title FROM products ORDER BY title'
    );

    let updated = 0;

    for (const product of products) {
      // Find matching key in IMAGE_MAP (partial match on title)
      const matchKey = Object.keys(IMAGE_MAP).find((key) =>
        product.title.includes(key)
      );

      if (!matchKey) {
        console.log(`⏭  No match for: ${product.title}`);
        continue;
      }

      const newUrls = IMAGE_MAP[matchKey];

      // Delete existing images for this product
      await client.query('DELETE FROM product_images WHERE product_id = $1', [
        product.id,
      ]);

      // Insert new images
      for (let i = 0; i < newUrls.length; i++) {
        await client.query(
          `INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [product.id, newUrls[i], product.title, i === 0, i]
        );
      }

      console.log(`✅ Updated: ${product.title} (${newUrls.length} images)`);
      updated++;
    }

    console.log(`\n🎉 Done! Updated ${updated}/${products.length} products.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    pool.end();
  }
}

fixImages();
