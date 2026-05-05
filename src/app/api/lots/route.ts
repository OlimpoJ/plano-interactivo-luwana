import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '').replace(/^"|"$/g, ''),
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = (process.env.GOOGLE_SHEET_ID || '').replace(/^"|"$/g, '') || '1e_dxwIK6cjfLmMQqzzlt56-NomUDLX8NZe2WaLnOmto';

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

    const headers = rows[2] || [];
    
    // Find indices based on expected column headers
    const getColIdx = (names: string[]) => {
      return headers.findIndex(h => {
        if (!h) return false;
        const normalized = h.toString().trim().toUpperCase();
        return names.some(name => normalized.includes(name));
      });
    };

    const idxId = getColIdx(['Nº LOTE', 'LOTE']);
    const idxArea = getColIdx(['AREA M2', 'AREA']);
    const idxLocation = getColIdx(['UBICACIÓN', 'UBICACION']);
    const idxStatus = getColIdx(['ESTADO']);
    const idxPriceM2 = getColIdx(['VALOR M2']);
    const idxSeparation = getColIdx(['SEPARACIÓN', 'SEPARACION']);
    const idxTotalPrice = getColIdx(['VALOR LOTE', 'VALOR TOTAL']);
    const idxDownPayment = getColIdx(['CUOTA INICIAL']);
    const idxFinancing = getColIdx(['FINANCIACIÓN', 'FINANCIACION']);
    const idxFinalPayment = getColIdx(['CUOTA FINAL', 'SALDO FINAL']);

    // Parse the rows into objects
    const lots = rows.slice(3).filter(row => {
      const idCol = idxId !== -1 ? idxId : 0;
      return row[idCol] && row[idCol].trim() !== '';
    }).map(row => {
      const idCol = idxId !== -1 ? idxId : 0;
      let rawId = row[idCol].trim();
      const match = rawId.match(/\d+/);
      const parsedId = match ? parseInt(match[0], 10).toString() : rawId;

      const rawStatus = row[idxStatus !== -1 ? idxStatus : 3] || '';
      const upperStatus = rawStatus.trim().toUpperCase();
      
      let status = 'available';
      if (upperStatus.includes('VENDIDO')) status = 'sold';
      else if (upperStatus.includes('RESERVADO') || upperStatus.includes('SEPARADO')) status = 'reserved';
      else if (upperStatus.includes('BLOQUEADO')) status = 'blocked';

      return {
        id: parsedId, // Use the parsed ID for SVG matching (e.g. "1", "2")
        rawId: rawId, // Original ID (e.g. "A-01") for display
        area: row[idxArea !== -1 ? idxArea : 1] || '',
        location: row[idxLocation !== -1 ? idxLocation : 2] || '',
        statusRaw: rawStatus,
        status: status,
        pricePerM2: row[idxPriceM2 !== -1 ? idxPriceM2 : 4] || '',
        separation: row[idxSeparation !== -1 ? idxSeparation : 5] || '',
        totalPrice: row[idxTotalPrice !== -1 ? idxTotalPrice : 6] || '',
        downPayment: row[idxDownPayment !== -1 ? idxDownPayment : 7] || '',
        financing: row[idxFinancing !== -1 ? idxFinancing : 8] || '',
        finalPayment: row[idxFinalPayment !== -1 ? idxFinalPayment : 9] || ''
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
