// ==========================================
// AUTH: Login Handler
// ==========================================

function handleLogin(username, password) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA_ADMIN");
  if (!sheet) return createResponse(false, "Tab DATA_ADMIN tidak ditemukan di Spreadsheet!");

  let data = sheet.getDataRange().getValues();
  // Header: [0] username | [1] password | [2] nama_admin | [3] tim_poksi | [4] profile_image_url | [5] last_login
  
  for (let i = 1; i < data.length; i++) {
    let sheetUser = String(data[i][0]).trim();
    let sheetPass = String(data[i][1]).trim();
    
    if (sheetUser === String(username).trim() && sheetPass === String(password).trim()) {
      // Update last_login in Column F (index 6, but 0-indexed in JS it's 5)
      let now = new Date();
      let formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      sheet.getRange(i + 1, 6).setValue(formattedDate);
      
      return createResponse(true, "Login Berhasil", {
        username: sheetUser,
        nama_admin: data[i][2],
        tim_poksi: data[i][3],
        profile_image_url: data[i][4],
        last_login: formattedDate
      });
    }
  }
  return createResponse(false, "Username atau Kata Sandi salah!");
}
