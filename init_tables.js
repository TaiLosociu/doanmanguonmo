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

async function run() {
  console.log('1. Creating football_clubs...');
  await queryNeon(`
    CREATE TABLE IF NOT EXISTS football_clubs (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL UNIQUE,
      captain_name VARCHAR(150) NOT NULL,
      captain_phone VARCHAR(20) NOT NULL,
      user_id INT,
      elo INT DEFAULT 1200,
      tier VARCHAR(50) DEFAULT 'Đồng',
      matches_played INT DEFAULT 0,
      wins INT DEFAULT 0,
      draws INT DEFAULT 0,
      losses INT DEFAULT 0,
      members_count INT DEFAULT 1,
      max_members INT DEFAULT 15,
      logo_url TEXT,
      home_pitch VARCHAR(150),
      bio TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('2. Creating club_members...');
  await queryNeon(`
    CREATE TABLE IF NOT EXISTS club_members (
      id SERIAL PRIMARY KEY,
      club_id INT REFERENCES football_clubs(id) ON DELETE CASCADE,
      user_id INT,
      member_name VARCHAR(150) NOT NULL,
      phone VARCHAR(20),
      position VARCHAR(50) DEFAULT 'Tiền vệ (MF)',
      number INT DEFAULT 10,
      role VARCHAR(20) DEFAULT 'MEMBER',
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('3. Creating matchmaking_posts...');
  await queryNeon(`
    CREATE TABLE IF NOT EXISTS matchmaking_posts (
      id SERIAL PRIMARY KEY,
      user_id INT,
      user_name VARCHAR(150),
      team_name VARCHAR(150) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      play_date VARCHAR(20) NOT NULL,
      play_time VARCHAR(50) NOT NULL,
      pitch_name VARCHAR(150) NOT NULL,
      pitch_id INT,
      format VARCHAR(20) DEFAULT 'SAN_5',
      bet_type VARCHAR(100) DEFAULT 'Giao lưu vui vẻ (Chia 5-5)',
      level VARCHAR(50) DEFAULT 'Trung bình - Khá',
      note TEXT,
      status VARCHAR(20) DEFAULT 'OPEN',
      challenger_id INT,
      challenger_name VARCHAR(150),
      challenger_phone VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('4. Creating match_results...');
  await queryNeon(`
    CREATE TABLE IF NOT EXISTS match_results (
      id SERIAL PRIMARY KEY,
      post_id INT,
      team_a_id INT REFERENCES football_clubs(id) ON DELETE CASCADE,
      team_a_name VARCHAR(150),
      score_a INT NOT NULL,
      team_b_id INT REFERENCES football_clubs(id) ON DELETE CASCADE,
      team_b_name VARCHAR(150),
      score_b INT NOT NULL,
      elo_change_a INT DEFAULT 0,
      elo_change_b INT DEFAULT 0,
      match_date VARCHAR(20),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const existingClubs = await queryNeon("SELECT COUNT(*) FROM football_clubs");
  if (existingClubs && existingClubs.rows && Number(existingClubs.rows[0].count) === 0) {
    console.log('Seeding initial clubs...');
    await queryNeon(`
      INSERT INTO football_clubs (name, captain_name, captain_phone, elo, tier, matches_played, wins, draws, losses, members_count, home_pitch, bio)
      VALUES 
      ('FC Ban Mê Star', 'Lê Duy Tài', '0896890399', 1580, 'Kim Cương', 18, 14, 2, 2, 14, 'SVĐ Buôn Ma Thuột', 'Đội bóng giao lưu năng động, kỷ luật cao.'),
      ('FC Cà Phê Trung Nguyên', 'Nguyễn Văn Đạt', '0912345678', 1450, 'Bạch Kim', 15, 10, 3, 2, 12, 'Sân Vận Động ĐTL', 'Lối chơi tiki-taka ban bật nhanh.'),
      ('FC Voi Chiến Đắk Lắk', 'Trần Hữu Thắng', '0987654321', 1390, 'Vàng', 12, 8, 2, 2, 15, 'Sân bóng đá C1', 'Đội hình thể lực sung mãn, tranh chấp nhiệt huyết.'),
      ('FC Tây Nguyên Legend', 'Phạm Minh Quân', '0905123456', 1320, 'Vàng', 10, 6, 2, 2, 11, 'SVĐ Trường ĐH Tây Nguyên', 'Đội sinh viên & cựu sinh viên Tây Nguyên.'),
      ('FC Ea Kao Lions', 'Hoàng Tuấn Vũ', '0888999111', 1240, 'Bạc', 8, 4, 2, 2, 10, 'Sân bóng Tân Thái Long', 'Đam mê bóng đá sân cỏ mini và tình bằng hữu.'),
      ('FC Thanh Niên Tân Lợi', 'Đặng Quốc Bảo', '0977665544', 1180, 'Đồng', 5, 2, 1, 2, 9, 'Sân bóng Lập Nguyễn', 'Giao lưu học hỏi cọ xát cuối tuần.')
    `);
  }

  const existingPosts = await queryNeon("SELECT COUNT(*) FROM matchmaking_posts");
  if (existingPosts && existingPosts.rows && Number(existingPosts.rows[0].count) === 0) {
    console.log('Seeding initial matchmaking posts...');
    await queryNeon(`
      INSERT INTO matchmaking_posts (team_name, phone, play_date, play_time, pitch_name, format, bet_type, level, note, status)
      VALUES
      ('FC Ban Mê Star', '0896890399', '2026-11-24', '19:00 - 20:30', 'SVĐ Buôn Ma Thuột (Sân 11)', 'SAN_11', 'Giao lưu vui vẻ (Chia 5-5)', 'Khá - Đá giải', 'Cần tìm đối tác cọ xát chuẩn bị giải VĐQG, trọng tài chuyên nghiệp.', 'OPEN'),
      ('FC Cà Phê Trung Nguyên', '0912345678', '2026-11-24', '18:00 - 19:30', 'Sân Vận Động ĐTL (300 Hà Huy Tập)', 'SAN_7', 'Thua trả tiền sân + nước', 'Trung bình', 'Tìm đội giao lưu vui vẻ, không chặt chém, có hỗ trợ áo bib.', 'OPEN'),
      ('FC Voi Chiến Đắk Lắk', '0987654321', '2026-11-25', '19:30 - 21:00', 'Sân bóng đá C1 (1B Y Ngông)', 'SAN_5', 'Chia 5-5 tiền sân', 'Vui là chính', 'Kèo tối thứ 4, anh em văn phòng rèn luyện sức khỏe.', 'OPEN')
    `);
  }

  console.log('ALL TABLES CREATED & SEEDED SUCCESSFULLY!');
}

run().catch(console.error);
