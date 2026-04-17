import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1-ymmybpidvx2b4KGoWVXtOJvEdPiSI4vCG0TRCQaLCw';

async function testAccess() {
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    console.log('✅ Access Granted!');
    console.log('Sheet Names:', response.data.sheets?.map(s => s.properties?.title));
  } catch (error: any) {
    console.error('❌ Access Denied:', error.response?.data?.error || error.message);
  }
}

testAccess();
