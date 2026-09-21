type ResumeDoc = import('./resume-types').ResumeDocument;
type RoleItem = import('./resume-types').RoleItem;

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 54;

function pdfEscape(text: string): string {
  return text
    .replace(/•/g, '\x95')
    .replace(/–/g, '--')
    .replace(/—/g, '--')
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function avgWidth(text: string, size: number, bold?: boolean): number {
  return text.length * size * (bold ? 0.52 : 0.48);
}

function wrap(text: string, size: number, max: number, bold = false): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (avgWidth(test, size, bold) > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

type PageBuf = { commands: string[]; y: number };

function newPage(): PageBuf {
  return { commands: [], y: PAGE_H - MARGIN };
}

function ensure(pages: PageBuf[], min = MARGIN + 28): PageBuf {
  let page = pages[pages.length - 1];
  if (page.y < min) {
    page = newPage();
    pages.push(page);
  }
  return page;
}

function drawText(page: PageBuf, x: number, y: number, size: number, font: 'F1' | 'F2', text: string) {
  page.commands.push(
    `BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEscape(text)}) Tj ET`,
  );
}

function drawLine(page: PageBuf, x1: number, y: number, x2: number) {
  page.commands.push(`${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`);
}

function section(pages: PageBuf[], title: string) {
  const page = ensure(pages);
  page.y -= 16;
  drawText(page, MARGIN, page.y, 11, 'F2', title.toUpperCase());
  page.y -= 4;
  drawLine(page, MARGIN, page.y, PAGE_W - MARGIN);
  page.y -= 12;
}

function paragraph(pages: PageBuf[], text: string, size = 10) {
  const width = PAGE_W - MARGIN * 2;
  for (const line of wrap(text, size, width)) {
    const page = ensure(pages);
    drawText(page, MARGIN, page.y, size, 'F1', line);
    page.y -= size + 3;
  }
}

function roleBlock(pages: PageBuf[], role: RoleItem) {
  const page = ensure(pages);
  const left = [role.title, role.organization].filter(Boolean).join(', ');
  const dates = role.dates ?? '';
  const dateW = avgWidth(dates, 10);
  drawText(page, MARGIN, page.y, 11, 'F2', wrap(left, 11, PAGE_W - MARGIN * 2 - dateW - 10, true)[0] ?? left);
  if (dates) {
    drawText(page, PAGE_W - MARGIN - dateW, page.y, 10, 'F1', dates);
  }
  page.y -= 13;
  for (const bullet of role.bullets) {
    const lines = wrap(bullet, 10, PAGE_W - MARGIN * 2 - 16);
    for (let i = 0; i < lines.length; i += 1) {
      const p = ensure(pages);
      if (i === 0) drawText(p, MARGIN + 2, p.y, 10, 'F1', '•');
      drawText(p, MARGIN + 14, p.y, 10, 'F1', lines[i]);
      p.y -= 12.5;
    }
  }
  pages[pages.length - 1].y -= 6;
}

export function resumeFileName(doc: ResumeDoc): string {
  const base = doc.name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'Resume';
  return `${base}_Resume.pdf`;
}

export async function buildResumePdf(doc: ResumeDoc): Promise<Uint8Array> {
  const pages = [newPage()];
  const first = pages[0];
  const name = doc.name.toUpperCase();
  const nameSize = 20;
  const nameW = avgWidth(name, nameSize, true);
  drawText(first, Math.max(MARGIN, (PAGE_W - nameW) / 2), first.y, nameSize, 'F2', name);
  first.y -= 16;

  const contact = [doc.address, doc.email, doc.phone].filter(Boolean).join('  •  ');
  if (contact) {
    for (const line of wrap(contact, 9.5, PAGE_W - MARGIN * 2)) {
      const w = avgWidth(line, 9.5);
      drawText(first, (PAGE_W - w) / 2, first.y, 9.5, 'F1', line);
      first.y -= 12;
    }
  }

  if (doc.summary) {
    section(pages, 'Summary');
    paragraph(pages, doc.summary);
  }
  if (doc.education.length) {
    section(pages, 'Education');
    for (const ed of doc.education) {
      const p = ensure(pages);
      const left = [ed.school, ed.location].filter(Boolean).join(', ');
      const right = ed.graduation ?? '';
      drawText(p, MARGIN, p.y, 11, 'F2', left);
      if (right) drawText(p, PAGE_W - MARGIN - avgWidth(right, 10), p.y, 10, 'F1', right);
      p.y -= 13;
      if (ed.details) paragraph(pages, ed.details, 10);
      pages[pages.length - 1].y -= 4;
    }
  }
  if (doc.experience.length) {
    section(pages, 'Experience');
    for (const role of doc.experience) roleBlock(pages, role);
  }
  if (doc.projects.length) {
    section(pages, 'Projects');
    for (const role of doc.projects) roleBlock(pages, role);
  }
  if (doc.leadership.length) {
    section(pages, 'Leadership & Activities');
    for (const role of doc.leadership) roleBlock(pages, role);
  }
  if (doc.volunteer.length) {
    section(pages, 'Volunteer Experience');
    for (const role of doc.volunteer) roleBlock(pages, role);
  }
  if (doc.skills.length) {
    section(pages, 'Skills');
    paragraph(pages, doc.skills.join('  •  '));
  }

  return assemblePdf(pages);
}

function assemblePdf(pages: PageBuf[]): Uint8Array {
  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  const pageIds = pages.map((_, i) => 3 + i);
  const contentIds = pages.map((_, i) => 3 + pages.length + i);
  objects.push(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`,
  );
  for (let i = 0; i < pages.length; i += 1) {
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${
        3 + pages.length * 2
      } 0 R /F2 ${3 + pages.length * 2 + 1} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`,
    );
  }
  for (const page of pages) {
    const stream = page.commands.join('\n');
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  }
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>');

  let body = '%PDF-1.4\n';
  const offsets = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefAt = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF`;
  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i += 1) bytes[i] = body.charCodeAt(i) & 0xff;
  return bytes;
}

function bytesAsBlob(bytes: Uint8Array): Blob {
  const copy = Uint8Array.from(bytes);
  return new Blob([copy.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function downloadResumePdf(bytes: Uint8Array, filename: string): Promise<void> {
  const { Platform } = await import('react-native');
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = bytesAsBlob(bytes);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return;
  }

  const [{ File, Paths }, Sharing] = await Promise.all([
    import('expo-file-system'),
    import('expo-sharing'),
  ]);
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.write(bytes);
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Download Resume',
    });
    return;
  }
  throw new Error('Sharing is not available on this device.');
}
