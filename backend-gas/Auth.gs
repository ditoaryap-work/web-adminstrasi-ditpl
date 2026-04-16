// ==========================================
// AUTH: Login Handler
// ==========================================

/**
 * SHA-256 Helper menggunakan Utilities.computeDigest bawaan Google Apps Script.
 * Menghasilkan string HEX 64 karakter.
 */
function sha256Hash(plainText) {
  var rawBytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    plainText,
    Utilities.Charset.UTF_8
  );
  return rawBytes.map(function(b) {
    var hex = (b < 0 ? b + 256 : b).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Deteksi apakah nilai sudah berupa SHA-256 hash (tepat 64 karakter hex).
 */
function isAlreadyHashed(str) {
  return /^[0-9a-f]{64}$/.test(str);
}

function handleLogin(username, password) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA_ADMIN");
  if (!sheet) return createResponse(false, "Tab DATA_ADMIN tidak ditemukan di Spreadsheet!");

  let data = sheet.getDataRange().getValues();
  // Header: [0] username | [1] password | [2] nama_admin | [3] tim_poksi | [4] profile_image_url | [5] last_login | [6] role
  
  let inputHash = sha256Hash(String(password).trim());

  for (let i = 1; i < data.length; i++) {
    let sheetUser = String(data[i][0]).trim();
    let sheetPass = String(data[i][1]).trim();

    let isMatch = false;

    if (isAlreadyHashed(sheetPass)) {
      // Password sudah hash → bandingkan hash langsung
      isMatch = (sheetPass === inputHash);
    } else {
      // Password masih plain-text (legacy) → bandingkan dulu secara plain
      isMatch = (sheetPass === String(password).trim());
      if (isMatch) {
        // Backward Migration: Auto-ganti ke hash setelah login berhasil pertama kali
        sheet.getRange(i + 1, 2).setValue(inputHash);
        Logger.log("[AUTH] Password untuk user '" + sheetUser + "' telah dimigrasi ke SHA-256 hash.");
      }
    }

    if (sheetUser === String(username).trim() && isMatch) {
      // Update last_login (Kolom F = index 5 dalam data, kolom 6 di Sheets)
      let now = new Date();
      let formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      sheet.getRange(i + 1, 6).setValue(formattedDate);

      return createResponse(true, "Login Berhasil", {
        username: sheetUser,
        nama_admin: data[i][2],
        tim_poksi: data[i][3],
        profile_image_url: data[i][4],
        last_login: formattedDate,
        role: data[i][6] || 'Admin' // Kolom G index 6 (0-indexed)
      });
    }
  }

  return createResponse(false, "Username atau Kata Sandi salah!");
}
