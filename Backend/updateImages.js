/**
 * Run: node updateImages.js
 * Fixes broken product images by replacing with reliable Unsplash URLs.
 * Broken sources: Myntra CDN (fashion), Amazon CDN (sometimes blocked externally)
 */
require('dotenv').config();
const { pool } = require('./server/db/connection');

const UPDATES = [
  // ── MOBILES ──────────────────────────────────────────────────
  { sku: 'SAM-A55-5G-128', images: [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80',
  ]},
  { sku: 'RLME-12PP-256', images: [
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80',
  ]},
  { sku: 'RDMI-N13PP-256', images: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
  ]},
  { sku: 'IQOO-N9P-256', images: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80',
  ]},
  { sku: 'POCO-X6P-256', images: [
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80',
  ]},
  { sku: 'OP-NORCE4-128', images: [
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=400&q=80',
    'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=400&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80',
  ]},
  { sku: 'VIVO-V30E-128', images: [
    'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=400&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&q=80',
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&q=80',
  ]},
  { sku: 'MOTO-E50F-256', images: [
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&q=80',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  ]},

  // ── ELECTRONICS ──────────────────────────────────────────────
  { sku: 'SONY-TV43-4K', images: [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80',
    'https://images.unsplash.com/photo-1593640408182-31c228b29b4b?w=400&q=80',
    'https://images.unsplash.com/photo-1615787421591-e8ffcbbb5b68?w=400&q=80',
  ]},
  { sku: 'LG-FRIDGE-190L', images: [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&q=80',
    'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  ]},
  { sku: 'BOAT-R550-BLK', images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
  ]},
  { sku: 'MI-AP4-HEPA', images: [
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  ]},
  { sku: 'PHIL-LAMP-USB', images: [
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80',
    'https://images.unsplash.com/photo-1513506003901-1e6a35d46d9d?w=400&q=80',
    'https://images.unsplash.com/photo-1493552832879-9a3e1de8eb1f?w=400&q=80',
  ]},
  { sku: 'HP-15S-I513-512', images: [
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
  ]},
  { sku: 'CANON-1500D-1855', images: [
    'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764b5f?w=400&q=80',
  ]},
  { sku: 'ZEB-SF900', images: [
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  ]},

  // ── FASHION (Myntra CDN is blocked - full replacement) ────────
  { sku: 'JOCK-TEE-2PK', images: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80',
    'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=400&q=80',
  ]},
  { sku: 'W-KURTA-AFL-M', images: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4685?w=400&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
  ]},
  { sku: 'HRX-SHORTS-BLK', images: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80',
  ]},
  { sku: 'BIBA-SKS-TEAL', images: [
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80',
    'https://images.unsplash.com/photo-1559628129-67cf63b72248?w=400&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4685?w=400&q=80',
  ]},
  { sku: 'AS-CHINO-SLIM-BEI', images: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
  ]},
  { sku: 'FABI-KURTI-IVORY', images: [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4685?w=400&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80',
  ]},
  { sku: 'PE-SHIRT-LBLU', images: [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80',
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400&q=80',
  ]},
  { sku: 'GLOB-DRESS-RDCHK', images: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
  ]},

  // ── HOME & KITCHEN ────────────────────────────────────────────
  { sku: 'PRES-PIC20-BLK', images: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80',
  ]},
  { sku: 'HAWK-CB50-5L', images: [
    'https://images.unsplash.com/photo-1585325701165-f4a1ac40a8ab?w=400&q=80',
    'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=400&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  ]},
  { sku: 'BOR-BOTTLE-1L', images: [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&q=80',
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
    'https://images.unsplash.com/photo-1536939001986-a90c406e83c1?w=400&q=80',
  ]},
  { sku: 'MILT-TS-500-BLK', images: [
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&q=80',
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
  ]},
  { sku: 'PIGEON-TAWA-30', images: [
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80',
  ]},
  { sku: 'SOLIMO-CBRD-LG', images: [
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80',
    'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&q=80',
  ]},
  { sku: 'CELLO-OCTA-8PK', images: [
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&q=80',
    'https://images.unsplash.com/photo-1601924582970-9e3fc1f7e6f3?w=400&q=80',
    'https://images.unsplash.com/photo-1490818715486-7f47c543cef4?w=400&q=80',
  ]},
  { sku: 'PREETHI-BLD-750', images: [
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&q=80',
    'https://images.unsplash.com/photo-1593759608142-e976b02ca4a3?w=400&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  ]},

  // ── SPORTS & FITNESS ──────────────────────────────────────────
  { sku: 'NIVIA-STORM-5', images: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
    'https://images.unsplash.com/photo-1551958425-3dbf9ee8c1ad?w=400&q=80',
    'https://images.unsplash.com/photo-1614632537190-23e4b26f7431?w=400&q=80',
  ]},
  { sku: 'COSCO-BR-SET', images: [
    'https://images.unsplash.com/photo-1521537634081-0855e7a5d82b?w=400&q=80',
    'https://images.unsplash.com/photo-1579952363873-27d3f66d7e8e?w=400&q=80',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=80',
  ]},
  { sku: 'BOLD-YM-6MM-NVY', images: [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
    'https://images.unsplash.com/photo-1587049352846-b0dc0e7a285e?w=400&q=80',
  ]},
  { sku: 'STRAUS-RB-5PK', images: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    'https://images.unsplash.com/photo-1534438327580-6a41c3cdd7d7?w=400&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
  ]},
  { sku: 'DEC-SHAKER-700', images: [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&q=80',
    'https://images.unsplash.com/photo-1593095948071-474c5cc2c44a?w=400&q=80',
  ]},
  { sku: 'SKULL-PUSH-ACT', images: [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80',
    'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
  ]},
  { sku: 'LIFELONG-LLM258', images: [
    'https://images.unsplash.com/photo-1534438327580-6a41c3cdd7d7?w=400&q=80',
    'https://images.unsplash.com/photo-1540497077877-a9f4571e92f5?w=400&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
  ]},
  { sku: 'MIKASA-MVA200', images: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80',
    'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=400&q=80',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80',
  ]},
];

async function updateImages() {
  const client = await pool.connect();
  let updated = 0;
  let failed = 0;

  try {
    console.log('🔄 Starting image updates...\n');

    for (const item of UPDATES) {
      try {
        // Get product id by SKU
        const { rows } = await client.query(
          'SELECT id, title FROM products WHERE sku = $1',
          [item.sku]
        );

        if (!rows.length) {
          console.log(`⚠️  SKU not found: ${item.sku}`);
          failed++;
          continue;
        }

        const { id, title } = rows[0];

        // Update each image by sort_order
        for (let i = 0; i < item.images.length; i++) {
          await client.query(
            'UPDATE product_images SET url = $1 WHERE product_id = $2 AND sort_order = $3',
            [item.images[i], id, i]
          );
        }

        console.log(`✅ ${item.sku} — ${title}`);
        updated++;
      } catch (err) {
        console.log(`❌ ${item.sku} — ${err.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Done! Updated: ${updated} | Failed: ${failed}`);
  } finally {
    client.release();
    await pool.end();
  }
}

updateImages().catch(console.error);
