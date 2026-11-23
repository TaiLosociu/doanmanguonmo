const https = require('https');
const NEON_CONN = 'postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

function queryNeon(sql) {
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
        try { 
          const parsed = JSON.parse(b);
          if (parsed.message && !parsed.rows) return reject(new Error(parsed.message));
          resolve(parsed); 
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function inspect() {
  try {
    const enumRes = await queryNeon(`
      SELECT t.typname, e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      ORDER BY t.typname, e.enumsortorder
    `);
    const enums = {};
    for (const r of enumRes.rows) {
      if (!enums[r.typname]) enums[r.typname] = [];
      enums[r.typname].push(r.enumlabel);
    }
    console.log('--- ENUMS ---');
    console.log(JSON.stringify(enums, null, 2));

    const colsRes = await queryNeon(`
      SELECT table_name, column_name, data_type, udt_name, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    const tables = {};
    for (const r of colsRes.rows) {
      if (!tables[r.table_name]) tables[r.table_name] = [];
      tables[r.table_name].push(`${r.column_name} (${r.udt_name})`);
    }
    console.log('--- TABLES & COLUMNS ---');
    console.log(JSON.stringify(tables, null, 2));

    const counts = {};
    for (const t of Object.keys(tables)) {
      const c = await queryNeon(`SELECT count(*) as count FROM "${t}"`);
      counts[t] = parseInt(c.rows[0].count, 10);
    }
    console.log('--- ROW COUNTS ---');
    console.log(JSON.stringify(counts, null, 2));

  } catch (err) {
    console.error('Error inspecting:', err);
  }
}

inspect();
