/**
 * Tiện ích in/xuất PDF và Word chuẩn định dạng tiếng Việt
 */

export function printTableToPdf(title: string, subtitle: string, headers: string[], rows: (string | number)[][]) {
  const win = window.open('', '_blank');
  if (!win) return;

  const headerHtml = headers.map(h => `<th>${h}</th>`).join('');
  const rowsHtml = rows.map(r => `
    <tr>
      ${r.map((cell, idx) => {
        const isNum = typeof cell === 'number' || (typeof cell === 'string' && /^[0-9.,\sđ%+-]+$/.test(cell.trim()));
        return `<td class="${idx === 0 ? 'center' : isNum ? 'right' : 'left'}">${cell}</td>`;
      }).join('')}
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    @page { size: landscape; margin: 12mm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; color: #111; margin: 0; padding: 20px; }
    .header-box { text-align: center; margin-bottom: 20px; }
    .national-title { font-size: 10pt; font-weight: bold; margin-bottom: 2px; }
    .national-sub { font-size: 10pt; text-decoration: underline; margin-bottom: 12px; }
    .main-title { font-size: 15pt; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; }
    .sub-title { font-size: 10pt; font-style: italic; color: #444; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
    th, td { border: 1px solid #444; padding: 5px 6px; }
    th { background: #f0f3f8; font-weight: bold; text-align: center; }
    .left { text-align: left; }
    .center { text-align: center; }
    .right { text-align: right; }
    .footer { display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid; text-align: center; font-size: 10.5pt; }
    @media print {
      body { padding: 0; }
      th { background-color: #eee !important; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
    <div class="national-sub">Độc lập - Tự do - Hạnh phúc</div>
    <div class="main-title">${title}</div>
    <div class="sub-title">${subtitle} • Ngày in: ${new Date().toLocaleDateString('vi-VN')}</div>
  </div>

  <table>
    <thead>
      <tr>${headerHtml}</tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <b>NGƯỜI LẬP BIỂU</b><br/>
      <i>(Ký, ghi rõ họ tên)</i>
    </div>
    <div>
      <b>KẾ TOÁN TRƯỞNG / HR LEADER</b><br/>
      <i>(Ký, ghi rõ họ tên)</i>
    </div>
    <div>
      <b>GIÁM ĐỐC ĐIỀU HÀNH</b><br/>
      <i>(Ký tên, đóng dấu)</i>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}
