import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function getSheetStructure() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = '1e_dxwIK6cjfLmMQqzzlt56-NomUDLX8NZe2WaLnOmto';

    // Get spreadsheet info to find the first sheet name
    const info = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = info.data.sheets[0].properties.title;
    console.log('Found sheet:', sheetName);

    // Get the first 5 rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z5`,
    });

    console.log('Data:', JSON.stringify(response.data.values, null, 2));
  } catch (error) {
    console.error('Error fetching sheet:', error.message);
  }
}

getSheetStructure();
