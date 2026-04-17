import { drive } from "../src/services/drive.service";
import dotenv from "dotenv";
dotenv.config();

async function listTemplates() {
  const folderId = "1C2P94wRJrXlaTbegQnLlW9saJWLAU3S_";
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)"
    });
    console.log("TEMPLATE_LIST_START");
    console.log(JSON.stringify(res.data.files, null, 2));
    console.log("TEMPLATE_LIST_END");
  } catch (e) {
    console.error(e);
  }
}

listTemplates();
