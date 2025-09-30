export class SpecificationProcessor {
  static cleanResponse(rawResponse?: string): string {
    if (!rawResponse) {
      return '';
    }

    let cleaned = rawResponse
      .replace(/\uFEFF/g, '')
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```(?:markdown)?/gi, '```')
      .replace(/```/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '  ')
      .replace(/\u00A0/g, ' ');

    cleaned = cleaned.replace(/\n##\s*Testing[\s\S]*$/i, '');
    cleaned = cleaned.replace(/\n##\s*Tests?[\s\S]*$/i, '');

    const lines = cleaned.split('\n');
    const normalized: string[] = [];
    let lastWasHeading = false;

    const ensureBlankLine = () => {
      if (normalized.length > 0 && normalized[normalized.length - 1] !== '') {
        normalized.push('');
      }
    };

    lines.forEach((rawLine) => {
      const trimmedLine = rawLine.replace(/\s+$/g, '');
      const compact = trimmedLine.trim();

      if (!compact) {
        ensureBlankLine();
        lastWasHeading = false;
        return;
      }

      if (/^(-{3,}|_{3,}|\*{3,})$/.test(compact)) {
        ensureBlankLine();
        lastWasHeading = false;
        return;
      }

      if (/^#+\s+/.test(compact)) {
        const headingLevel = (compact.match(/^#+/) || [''])[0];
        const headingText = compact
          .replace(/^#+\s*/, '')
          .replace(/\s+/g, ' ')
          .replace(/\s*[:：]$/, '')
          .trim();

        ensureBlankLine();
        normalized.push(`${headingLevel} ${headingText}`.trim());
        ensureBlankLine();
        lastWasHeading = true;
        return;
      }

      if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\s\-_/()]*:?$/.test(compact)) {
        const headingText = compact.replace(/\s*[:：]$/, '');
        ensureBlankLine();
        normalized.push(`## ${headingText}`.trim());
        ensureBlankLine();
        lastWasHeading = true;
        return;
      }

      const bulletMatch = compact.match(/^[-*•]\s+(.*)$/);
      if (bulletMatch) {
        if (lastWasHeading) {
          ensureBlankLine();
        }
        normalized.push(`- ${bulletMatch[1].replace(/\s+/g, ' ')}`);
        lastWasHeading = false;
        return;
      }

      const orderedMatch = compact.match(/^(\d+)\.\s+(.*)$/);
      if (orderedMatch) {
        if (lastWasHeading) {
          ensureBlankLine();
        }
        normalized.push(`${orderedMatch[1]}. ${orderedMatch[2].replace(/\s+/g, ' ')}`);
        lastWasHeading = false;
        return;
      }

      if (lastWasHeading) {
        ensureBlankLine();
      }

      normalized.push(compact.replace(/\s+/g, ' '));
      lastWasHeading = false;
    });

    while (normalized.length > 0 && normalized[normalized.length - 1] === '') {
      normalized.pop();
    }

    return normalized.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  static stripInlineFormatting(content: string): string {
    if (!content) {
      return '';
    }

    return content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '$1 ($2)')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+$/gm, '')
      .trim();
  }

  static prepareForPdf(rawResponse?: string): string {
    const cleaned = this.cleanResponse(rawResponse);
    return this.stripInlineFormatting(cleaned);
  }
}
