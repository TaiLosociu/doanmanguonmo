const https = require('https');

function sql(query) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query });
    const req = https.request({
      hostname: 'ep-silent-heart-b5tbjmh7.c-7.us-east-2.aws.neon.tech',
      port: 443,
      path: '/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': 'postgresql://neondb_owner:npg_Y76lDyzLaGkZ@ep-silent-heart-b5tbjmh7-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testFlow() {
  console.log('1. Đăng bài cáp kèo thật vào Neon DB...');
  const insertRes = await sql(`
    INSERT INTO matchmaking_posts (user_name, team_name, phone, play_date, play_time, pitch_name, pitch_id, format, bet_type, level, note, status)
    VALUES ('Lê Duy Tài', 'FC Sân Nhà Ban Mê', '0896890399', '2026-11-26', '19:00 - 20:30', 'Sân bóng đá C1 (1B Y Ngông)', 6, 'SAN_5', 'Tiền sân 5-5', 'Phong trào', 'Anh em đá vui vẻ, không chặt chém', 'OPEN')
    RETURNING *;
  `);
  const post = insertRes.rows[0];
  console.log('✓ Đã tạo bài đăng ID:', post.id, '| Đội:', post.team_name, '| Sân:', post.pitch_name);

  console.log('2. Người dùng khác vào ấn Bắt đối / Cáp kèo...');
  const acceptRes = await sql(`
    UPDATE matchmaking_posts
    SET status = 'ACCEPTED', challenger_name = 'FC Tây Nguyên Chiến', challenger_phone = '0988776655'
    WHERE id = ${post.id}
    RETURNING *;
  `);
  const accepted = acceptRes.rows[0];
  console.log('✓ Đã cáp lại kèo thành công! Trạng thái:', accepted.status, '| Đối thủ bắt kèo:', accepted.challenger_name, '(', accepted.challenger_phone, ')');

  console.log('3. Kiểm tra bài đăng sau khi được cáp kèo trên Neon:');
  const checkRes = await sql(`SELECT id, team_name, challenger_name, challenger_phone, status FROM matchmaking_posts WHERE id = ${post.id}`);
  console.log(checkRes.rows[0]);
}

testFlow();
