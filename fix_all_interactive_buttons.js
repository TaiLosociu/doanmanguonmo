const fs = require('fs');
const path = require('path');

console.log("==> Making ALL buttons fully interactive & non-blocking...");

// 1. UPDATE public_html/leduytai/doan/js/app.js
const appJsPath = path.join(__dirname, 'public_html/leduytai/doan/js/app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// Fix openCreateMatchModal to never block with alert
appJs = appJs.replace(
  /function openCreateMatchModal\(\) \{[\s\S]*?document\.getElementById\("createMatchModal"\)\.style\.display = "flex";/,
  `function openCreateMatchModal() {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  document.getElementById("createMatchModal").style.display = "flex";`
);

// Fix openAcceptMatchModal to never block with alert
appJs = appJs.replace(
  /function openAcceptMatchModal\(postId\) \{[\s\S]*?activeMatchIdToAccept = postId;/,
  `function openAcceptMatchModal(postId) {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  activeMatchIdToAccept = postId;`
);

// Fix submitMatchPost to auto-create authUser if not logged in yet
appJs = appJs.replace(
  /async function submitMatchPost\(e\) \{[\s\S]*?const authUser = JSON\.parse\(localStorage\.getItem\("football_auth_user"\) \|\| "null"\);[\s\S]*?if \(!authUser\) \{[\s\S]*?return;\s*\}/,
  `async function submitMatchPost(e) {
  e.preventDefault();
  let authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const teamName = document.getElementById("cmTeamName").value.trim();
  const captainName = document.getElementById("cmCaptainName").value.trim() || (authUser ? authUser.fullName : "Đội trưởng");
  const phone = document.getElementById("cmPhone").value.trim();
  if (!teamName || !phone || phone.length < 9) {
    alert("⚠️ Vui lòng nhập Tên đội và Số điện thoại / Zalo (tối thiểu 9 số) để đội bạn liên hệ bắt đối!");
    return;
  }
  if (!authUser) {
    authUser = {
      id: Date.now(),
      fullName: captainName,
      phone: phone,
      role: "CUSTOMER",
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("football_auth_user", JSON.stringify(authUser));
    if (typeof renderUserAuthArea === 'function') renderUserAuthArea();
  }`
);

// Fix confirmAcceptMatch to auto-create authUser if not logged in
appJs = appJs.replace(
  /async function confirmAcceptMatch\(e\) \{[\s\S]*?const authUser = JSON\.parse\(localStorage\.getItem\("football_auth_user"\) \|\| "null"\);/,
  `async function confirmAcceptMatch(e) {
  e.preventDefault();
  let authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const myTeam = document.getElementById("amMyTeamName").value.trim();
  const myPhone = document.getElementById("amMyPhone").value.trim();

  if (!myTeam || !myPhone || myPhone.length < 9) {
    alert("⚠️ Tên đội nhận kèo và Số điện thoại (tối thiểu 9 số) là bắt buộc!");
    return;
  }

  if (!authUser) {
    authUser = {
      id: Date.now(),
      fullName: myTeam,
      phone: myPhone,
      role: "CUSTOMER",
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("football_auth_user", JSON.stringify(authUser));
    if (typeof renderUserAuthArea === 'function') renderUserAuthArea();
  }`
);

// Fix openCreateClubModal to never block with alert
appJs = appJs.replace(
  /function openCreateClubModal\(\) \{[\s\S]*?document\.getElementById\("createClubModal"\)\.style\.display = "flex";/,
  `function openCreateClubModal() {
  const authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  document.getElementById("createClubModal").style.display = "flex";`
);

// Fix submitCreateClub to auto-create authUser if not logged in
appJs = appJs.replace(
  /function submitCreateClub\(e\) \{[\s\S]*?const authUser = JSON\.parse\(localStorage\.getItem\("football_auth_user"\) \|\| "null"\);[\s\S]*?if \(!authUser\) return;/,
  `async function submitCreateClub(e) {
  e.preventDefault();
  let authUser = JSON.parse(localStorage.getItem("football_auth_user") || "null");
  const clubName = document.getElementById("ccClubName").value.trim();
  const captainName = document.getElementById("ccCaptainName").value.trim() || (authUser ? authUser.fullName : "Đội trưởng");
  const phone = document.getElementById("ccPhone").value.trim();
  if (!clubName || !phone || phone.length < 9) {
    alert("⚠️ Tên FC và Số điện thoại Đội trưởng là bắt buộc (tối thiểu 9 số)!");
    return;
  }
  if (!authUser) {
    authUser = {
      id: Date.now(),
      fullName: captainName,
      phone: phone,
      role: "CUSTOMER",
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("football_auth_user", JSON.stringify(authUser));
    if (typeof renderUserAuthArea === 'function') renderUserAuthArea();
  }`
);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log("✓ app.js non-blocking modal handlers updated!");

// 2. UPDATE web/app/page.tsx
const pagePath = path.join(__dirname, 'web/app/page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');

// Fix button onClick in page.tsx
page = page.replace(
  /onClick=\{\(\) => \{ if \(!currentUser\) \{ alert\("⚠️ Đăng nhập tài khoản để đăng tin tìm đối!"\); return; \} setCreateMatchOpen\(true\); \}\}/g,
  'onClick={() => setCreateMatchOpen(true)}'
);

page = page.replace(
  /onClick=\{\(\) => \{ if \(!currentUser\) \{ alert\("⚠️ Bạn cần đăng nhập để tạo câu lạc bộ!"\); return; \} setCreateClubOpen\(true\); \}\}/g,
  'onClick={() => setCreateClubOpen(true)}'
);

// Fix handleCreateMatchSubmit in page.tsx to auto-login guest user if not logged in
page = page.replace(
  /async function handleCreateMatchSubmit\(e: FormEvent\) \{[\s\S]*?if \(!currentUser\) \{ alert\("⚠️ Bạn cần đăng nhập để đăng tin tìm đối \/ cáp kèo!"\); return; \}[\s\S]*?if \(!cmTeam \|\| !cmCaptain \|\| !cmPhone \|\| cmPhone\.length < 9\) \{ alert\("⚠️ Tên đội, đội trưởng và SĐT \(tối thiểu 9 số\) là bắt buộc!"\); return; \}/,
  `async function handleCreateMatchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cmTeam || !cmPhone || cmPhone.length < 9) {
      alert("⚠️ Tên đội và Số điện thoại (tối thiểu 9 số) là bắt buộc!");
      return;
    }
    const effectiveCaptain = cmCaptain || (currentUser ? currentUser.fullName : "Đội trưởng");
    let activeUser = currentUser;
    if (!activeUser) {
      activeUser = {
        id: Date.now(),
        fullName: effectiveCaptain,
        phone: cmPhone,
        role: "CUSTOMER",
        createdAt: new Date().toISOString()
      };
      setCurrentUser(activeUser);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("football_auth_user", JSON.stringify(activeUser));
      }
    }`
);

// Replace currentUser.id in handleCreateMatchSubmit query
page = page.replace(
  /VALUES \(\$\{currentUser\.id \|\| 'NULL'\}, '\$\{safeCaptain\}'/g,
  "VALUES (${activeUser ? activeUser.id : 'NULL'}, '${safeCaptain}'"
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("✓ web/app/page.tsx non-blocking modal handlers updated!");
