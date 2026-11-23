const https = require('https');
const NEON_CONN = 'postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

function q(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech',
      port: 443,
      path: '/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': NEON_CONN,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        try { resolve(JSON.parse(b)); } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    console.log("1. Adding SAN_11 to FieldType enum...");
    const r1 = await q(`ALTER TYPE "FieldType" ADD VALUE IF NOT EXISTS 'SAN_11'`);
    console.log("r1:", r1);

    console.log("2. Checking FieldType enum values...");
    const r2 = await q(`SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'FieldType'`);
    console.log("FieldType enums:", r2.rows);

    console.log("3. Creating indexes if not exist...");
    await q(`CREATE INDEX IF NOT EXISTS idx_bookings_lookup ON bookings (field_id, start_at, end_at)`);
    await q(`CREATE INDEX IF NOT EXISTS idx_bookings_code ON bookings (booking_code)`);
    await q(`CREATE INDEX IF NOT EXISTS idx_clubs_elo ON football_clubs (elo DESC)`);
    await q(`CREATE INDEX IF NOT EXISTS idx_match_posts ON matchmaking_posts (status, play_date)`);
    await q(`CREATE INDEX IF NOT EXISTS idx_club_members ON club_members (club_id)`);
    console.log("Indexes ready!");

  } catch(e) {
    console.error("Migration error:", e);
  }
}

run();
