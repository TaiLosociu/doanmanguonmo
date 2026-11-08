const https = require("https");
const NEON_CONN = "postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require";
const NEON_HOST = "ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech";

function run(sql) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: NEON_HOST,
      path: "/sql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": NEON_CONN,
        "Content-Length": Buffer.byteLength(postData),
      }
    }, res => {
      let b = "";
      res.on("data", c => b += c);
      res.on("end", () => {
        resolve(JSON.parse(b));
      });
    });
    req.write(postData);
    req.end();
  });
}

(async () => {
  const res = await run("SELECT id, name, ward, address, phone FROM fields ORDER BY id ASC");
  console.log(JSON.stringify(res.rows, null, 2));
})();

