const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envContent = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf8').replace(/\r/g, '');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
});

console.log("Email loaded:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

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

    const info = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetName = info.data.sheets[0].properties.title;
    console.log('Found sheet:', sheetName);

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
