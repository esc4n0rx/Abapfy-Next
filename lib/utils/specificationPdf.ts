// lib/utils/specificationPdf.ts
import { ProjectSpecificationContext, SpecificationPreferences } from '@/types/specifications';
import { SpecificationProcessor } from '@/lib/utils/specificationProcessor';

interface SpecificationPdfMetadata {
  provider?: string;
  model?: string;
  tokensUsed?: number;
  generatedAt?: string;
}

interface SpecificationPdfOptions {
  title: string;
  projectType?: string;
  summary?: string;
  specification: string;
  context?: ProjectSpecificationContext;
  preferences?: SpecificationPreferences;
  metadata?: SpecificationPdfMetadata;
}

type Section = {
  title: string;
  paragraphs: string[];
};

const PAGE_WIDTH = 595.28; // A4 in points
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const TEXT_SIZE = 11;
const HEADING_SIZE = 14;
const TITLE_SIZE = 20;
const LINE_HEIGHT = 16;

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(paragraph: string, maxChars = 92): string[] {
  const bulletMatch = paragraph.match(/^[-•]\s+(.*)$/);
  const hasBullet = Boolean(bulletMatch);
  const baseText = bulletMatch ? bulletMatch[1] : paragraph;
  const words = baseText.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else if (candidate.length > maxChars) {
      lines.push(candidate);
      current = '';
    } else {
      current = candidate;
    }
  });

  if (current) {
    lines.push(current);
  }

  if (lines.length === 0) {
    lines.push(baseText);
  }

  if (hasBullet) {
    return lines.map((line, index) => (index === 0 ? `• ${line}` : `  ${line}`));
  }

  return lines;
}

function parseSpecification(specification: string): Section[] {
  const lines = specification.split(/\r?\n/);
  const sections: Section[] = [];
  let currentSection: Section = { title: '', paragraphs: [] };
  let currentParagraph = '';

  const isHeading = (value: string) => {
    if (/^#+\s+/.test(value)) return true;
    if (/^\d+(?:\.\d+)*\s+/.test(value)) return true;
    if (/^[A-ZÁÉÍÓÚÃÕÇ0-9][A-ZÁÉÍÓÚÃÕÇ0-9\s\-_/()]+:?$/.test(value)) return true;
    return false;
  };

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      currentSection.paragraphs.push(
        SpecificationProcessor.stripInlineFormatting(currentParagraph.trim())
      );
      currentParagraph = '';
    }
  };

  const flushSection = () => {
    flushParagraph();
    if (currentSection.title || currentSection.paragraphs.length > 0) {
      sections.push(currentSection);
    }
    currentSection = { title: '', paragraphs: [] };
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (isHeading(line)) {
      flushSection();
      const normalized = SpecificationProcessor.stripInlineFormatting(
        line
          .replace(/^#+\s*/, '')
          .replace(/^\d+(?:\.\d+)*\s*/, '')
          .replace(/:$/, '')
          .trim()
      );
      currentSection.title = normalized || SpecificationProcessor.stripInlineFormatting(line);
      continue;
    }

    currentParagraph = currentParagraph
      ? `${currentParagraph} ${line}`
      : line;
  }

  flushSection();

  if (sections.length === 0) {
    return [{ title: 'Detalhamento', paragraphs: [specification.trim()] }];
  }

  return sections;
}

function formatDate(value?: string): string {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateSpecificationPdf(options: SpecificationPdfOptions): Uint8Array {
  const { title, projectType, summary, specification, metadata } = options;
  const normalizedSpecification = SpecificationProcessor.prepareForPdf(specification);
  const sections = parseSpecification(normalizedSpecification);

  const pages: string[][] = [];
  let currentPage: string[] = [];
  let currentY = PAGE_HEIGHT - MARGIN;

  const commitPage = () => {
    if (currentPage.length === 0) {
      currentPage.push('BT /F1 12 Tf 1 0 0 1 50 780 Tm ( ) Tj ET');
    }
    pages.push(currentPage);
  };

  const newPage = () => {
    if (currentPage.length) {
      commitPage();
    }
    currentPage = [];
    currentY = PAGE_HEIGHT - MARGIN;
  };

  const addLine = (text: string, {
    size = TEXT_SIZE,
    bold = false,
    indent = 0,
    lineHeight = LINE_HEIGHT,
  }: { size?: number; bold?: boolean; indent?: number; lineHeight?: number } = {}) => {
    if (currentY < MARGIN + lineHeight) {
      newPage();
    }
    const font = bold ? 'F2' : 'F1';
    const x = MARGIN + indent;
    currentPage.push(
      `BT /${font} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${currentY.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET`
    );
    currentY -= lineHeight;
  };

  const addParagraph = (text: string, indent = 0) => {
    const lines = wrapText(text);
    lines.forEach((line, index) => {
      addLine(line, {
        indent: indent + (index === 0 ? 0 : 12),
        lineHeight: LINE_HEIGHT,
      });
    });
    currentY -= 4;
  };

  newPage();

  addLine(title.toUpperCase(), { size: TITLE_SIZE, bold: true, lineHeight: 26 });
  if (projectType) {
    addLine(projectType, { size: 12, bold: false, lineHeight: 18 });
  }
  addLine(`Gerado em: ${formatDate(metadata?.generatedAt)}`, { size: 10, lineHeight: 14 });
  if (metadata?.provider) {
    addLine(
      `Provider: ${metadata.provider}${metadata.model ? ` | Modelo: ${metadata.model}` : ''}${
        metadata.tokensUsed ? ` | Tokens: ${metadata.tokensUsed}` : ''
      }`,
      { size: 10, lineHeight: 14 }
    );
  }
  currentY -= 12;

  const sanitizedSummary = SpecificationProcessor.stripInlineFormatting(summary || '');

  if (sanitizedSummary) {
    addLine('Resumo Executivo', { size: HEADING_SIZE, bold: true, lineHeight: 20 });
    addParagraph(sanitizedSummary);
  }

  sections.forEach((section) => {
    currentY -= 6;
    if (currentY < MARGIN + 80) {
      newPage();
    }
    addLine(section.title, { size: HEADING_SIZE, bold: true, lineHeight: 20 });
    section.paragraphs.forEach((paragraph) => {
      addParagraph(paragraph);
    });
  });

  if (currentPage.length) {
    commitPage();
  }

  const catalogId = 1;
  const pagesId = 2;
  let nextId = 3;
  const pageObjects: { pageId: number; contentId: number; stream: Buffer }[] = [];

  pages.forEach((pageLines) => {
    const pageId = nextId++;
    const contentId = nextId++;
    const contentString = `${pageLines.join('\n')}\n`;
    const stream = Buffer.from(contentString, 'latin1');
    pageObjects.push({ pageId, contentId, stream });
  });

  const fontRegularId = nextId++;
  const fontBoldId = nextId++;
  const totalObjects = nextId;

  const buffers: Buffer[] = [];
  const offsets: number[] = [];
  let length = 0;

  const append = (buffer: Buffer) => {
    buffers.push(buffer);
    length += buffer.length;
  };

  const beginObject = (id: number) => {
    offsets[id] = length;
    append(Buffer.from(`${id} 0 obj\n`, 'latin1'));
  };

  const endObject = () => {
    append(Buffer.from('endobj\n', 'latin1'));
  };

  append(Buffer.from('%PDF-1.4\n', 'latin1'));

  // Catalog
  beginObject(catalogId);
  append(Buffer.from(`<< /Type /Catalog /Pages ${pagesId} 0 R >>\n`, 'latin1'));
  endObject();

  // Pages
  beginObject(pagesId);
  const kids = pageObjects.map(({ pageId }) => `${pageId} 0 R`).join(' ');
  append(Buffer.from(`<< /Type /Pages /Count ${pageObjects.length} /Kids [${kids}] >>\n`, 'latin1'));
  endObject();

  // Page & content objects
  pageObjects.forEach(({ pageId, contentId, stream }) => {
    beginObject(pageId);
    append(
      Buffer.from(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH.toFixed(2)} ${PAGE_HEIGHT.toFixed(2)}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> >>\n`,
        'latin1'
      )
    );
    endObject();

    beginObject(contentId);
    append(Buffer.from(`<< /Length ${stream.length} >>\nstream\n`, 'latin1'));
    append(stream);
    if (!stream.toString('latin1').endsWith('\n')) {
      append(Buffer.from('\n', 'latin1'));
    }
    append(Buffer.from('endstream\n', 'latin1'));
    endObject();
  });

  // Fonts
  beginObject(fontRegularId);
  append(Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n', 'latin1'));
  endObject();

  beginObject(fontBoldId);
  append(Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\n', 'latin1'));
  endObject();

  const xrefOffset = length;
  append(Buffer.from(`xref\n0 ${totalObjects}\n`, 'latin1'));
  append(Buffer.from('0000000000 65535 f \n', 'latin1'));
  for (let i = 1; i < totalObjects; i += 1) {
    const offset = offsets[i] || 0;
    append(Buffer.from(`${offset.toString().padStart(10, '0')} 00000 n \n`, 'latin1'));
  }

  append(Buffer.from(`trailer\n<< /Size ${totalObjects} /Root ${catalogId} 0 R >>\n`, 'latin1'));
  append(Buffer.from(`startxref\n${xrefOffset}\n%%EOF`, 'latin1'));

  return Uint8Array.from(Buffer.concat(buffers));
}
