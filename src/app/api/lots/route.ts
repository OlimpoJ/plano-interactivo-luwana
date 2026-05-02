import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
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
    const sheetName = info.data.sheets?.[0]?.properties?.title || 'Hoja 1';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z200`, 
    });

    const rows = response.data.values;
    if (!rows || rows.length < 4) {
      return NextResponse.json({ success: false, error: 'No data found' });
    }

    // Parse the rows into objects
    const lots = rows.slice(3).filter(row => row[0] && row[0].trim() !== '').map(row => {
      // row[0] is like " A-01" or "A-15" or "122".
      // We want to extract just the number string to match our SVG IDs (e.g. "1", "15", "122").
      let rawId = row[0].trim();
      const match = rawId.match(/\d+/);
      const parsedId = match ? parseInt(match[0], 10).toString() : rawId;

      return {
        id: parsedId, // Use the parsed ID for SVG matching (e.g. "1", "2")
        rawId: rawId, // Original ID (e.g. "A-01") for display
        area: row[1] || '',
        location: row[2] || '',
        statusRaw: row[3] || '',
        status: (row[3] || '').trim().toUpperCase() === 'VENDIDO' ? 'sold' 
              : (row[3] || '').trim().toUpperCase() === 'RESERVADO' ? 'reserved' 
              : 'available',
        pricePerM2: row[4] || '',
        separation: row[5] || '',
        totalPrice: row[6] || '',
        downPayment: row[7] || '',
        financing: row[8] || '',
        finalPayment: row[9] || ''
      };
    });

    return NextResponse.json({
      success: true,
      lots,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
