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
        try { resolve(JSON.parse(b)); } catch(e) { reject(e); }
      });
    });
    req.write(postData);
    req.end();
  });
}

async function run() {
  const res = await queryNeon("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log('Tables:', res);
}
run();
