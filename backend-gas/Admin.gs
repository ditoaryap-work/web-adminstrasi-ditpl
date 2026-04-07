// ==========================================
// ADMIN: CRUD Data Admin (tab DATA_ADMIN)
// ==========================================

function getAdmins() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA_ADMIN");
  if (!sheet) return createResponse(false, "Tab DATA_ADMIN tidak ditemukan!");
  
  let data = sheet.getDataRange().getValues();
  let result = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    result.push({
      username: String(data[i][0]).trim(),
      password: String(data[i][1]).trim(),
      nama_admin: data[i][2],
      tim_poksi: data[i][3],
      profile_image_url: data[i][4] || ""
    });
  }
  
  return createResponse(true, "Data Admin berhasil ditarik", result);
}

function saveAdmin(adminData) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA_ADMIN");
  if (!sheet) return createResponse(false, "Tab DATA_ADMIN tidak ditemukan!");
  
  let data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  let username = String(adminData.username).trim();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === username) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (adminData.profile_base64) {
    try {
      let base64str = adminData.profile_base64;
      if (base64str.indexOf(',') > -1) {
        base64str = base64str.split(',')[1];
      }
      let decoded = Utilities.base64Decode(base64str);
      let blob = Utilities.newBlob(decoded, adminData.profile_mimeType || "image/png", adminData.profile_filename || ("profile_" + username));
      let file = DriveApp.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      adminData.profile_image_url = "https://drive.google.com/uc?export=view&id=" + file.getId();
    } catch(e) {
      // If error occurs, fallback to old url or empty
    }
  }

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 2).setValue(adminData.password);
    sheet.getRange(rowIndex, 3).setValue(adminData.nama_admin);
    sheet.getRange(rowIndex, 4).setValue(adminData.tim_poksi);
    sheet.getRange(rowIndex, 5).setValue(adminData.profile_image_url || "");
    return createResponse(true, "Data Admin berhasil diperbarui");
  } else {
    sheet.appendRow([
      username,
      adminData.password,
      adminData.nama_admin,
      adminData.tim_poksi,
      adminData.profile_image_url || ""
    ]);
    return createResponse(true, "Admin baru berhasil ditambahkan");
  }
}

function deleteAdmin(username) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA_ADMIN");
  if (!sheet) return createResponse(false, "Tab DATA_ADMIN tidak ditemukan!");
  
  let data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  let targetUser = String(username).trim();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === targetUser) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > -1) {
    sheet.deleteRow(rowIndex);
    return createResponse(true, "Data Admin berhasil dihapus");
  } else {
    return createResponse(false, "Username tidak ditemukan di database");
  }
}
