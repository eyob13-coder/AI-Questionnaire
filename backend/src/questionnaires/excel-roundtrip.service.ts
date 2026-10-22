import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export interface ExtractedQuestionMeta {
  questionText: string;
  sheetName: string;
  rowNumber: number;
  colNumber: number;
  cellReference: string;
  answerColNumber: number;
  answerCellReference: string;
  notesColNumber?: number;
  notesCellReference?: string;
}

export interface QuestionnaireSpreadsheetMeta {
  fileName: string;
  fileType: string;
  selectedSheet: string;
  sheetNames: string[];
  questionColNumber: number;
  answerColNumber: number;
  notesColNumber?: number;
  headerRowNumber: number;
  questions: Record<number, ExtractedQuestionMeta>; // Keyed by rowIndex (0-based)
}

export interface QuestionWithCitations {
  rowIndex: number;
  questionText: string;
  answerText?: string | null;
  status?: string;
  citations?: Array<{
    sourceDocument: string;
    pageNumber?: number | null;
    excerpt?: string | null;
  }>;
}

@Injectable()
export class ExcelRoundtripService {
  private readonly logger = new Logger(ExcelRoundtripService.name);
  private readonly storageDir: string;

  constructor() {
    this.storageDir = path.resolve(process.cwd(), 'storage', 'questionnaires');
    if (!fs.existsSync(this.storageDir)) {
      try {
        fs.mkdirSync(this.storageDir, { recursive: true });
      } catch (err) {
        this.logger.warn(`Could not create storage directory: ${err}`);
      }
    }
  }

  private getStoragePath(questionnaireId: string, ext = '.xlsx'): string {
    return path.join(this.storageDir, `${questionnaireId}_original${ext}`);
  }

  private getMetaPath(questionnaireId: string): string {
    return path.join(this.storageDir, `${questionnaireId}_meta.json`);
  }

  /**
   * Save the raw uploaded file and the detected column/sheet metadata
   * for future 100% style-preserved exports.
   */
  async saveOriginalFile(
    questionnaireId: string,
    buffer: Buffer,
    meta: QuestionnaireSpreadsheetMeta,
  ): Promise<void> {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
      const filePath = this.getStoragePath(questionnaireId);
      const metaPath = this.getMetaPath(questionnaireId);

      await fs.promises.writeFile(filePath, buffer);
      await fs.promises.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
      this.logger.log(`Saved original spreadsheet for round-trip: ${questionnaireId}`);
    } catch (err) {
      this.logger.error(`Failed to save original file for round-trip: ${err}`);
    }
  }

  /**
   * Check if a questionnaire has an original file preserved for round-trip export.
   */
  hasPreservedOriginal(questionnaireId: string): boolean {
    const filePath = this.getStoragePath(questionnaireId);
    return fs.existsSync(filePath);
  }

  /**
   * Parses an Excel buffer, detecting sheets, question columns, answer columns,
   * and cell locations so answers can be written back into the exact original cells.
   */
  async parseSpreadsheet(
    buffer: Buffer,
    originalName: string,
  ): Promise<{
    questions: ExtractedQuestionMeta[];
    meta: QuestionnaireSpreadsheetMeta;
  }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheetNames = workbook.worksheets.map((ws) => ws.name);
    if (sheetNames.length === 0) {
      throw new Error('Workbook contains no sheets.');
    }

    // Evaluate each worksheet to find the best candidate sheet
    let bestSheet = workbook.worksheets[0];
    let bestHeaderRow = -1;
    let bestQCol = -1;
    let bestACol = -1;
    let bestNCol = -1;
    let maxQuestionMatches = 0;

    for (const ws of workbook.worksheets) {
      if (!ws.rowCount || ws.rowCount === 0) continue;

      let qCol = -1;
      let aCol = -1;
      let nCol = -1;
      let headerRow = -1;

      // Scan up to the first 15 rows for header cells
      const maxRowsToScan = Math.min(ws.rowCount, 15);
      for (let rNum = 1; rNum <= maxRowsToScan; rNum++) {
        const row = ws.getRow(rNum);
        row.eachCell({ includeEmpty: false }, (cell, cNum) => {
          const raw = String(cell.value || '').trim();
          const lower = raw.toLowerCase();

          if (/^(question|prompt|inquiry|requirement|security\s*control|control\s*description|item\s*description|specification)/i.test(lower)) {
            qCol = cNum;
            headerRow = rNum;
          } else if (/^(answer|response|vendor\s*response|company\s*response|reply|explanation|implementation)/i.test(lower)) {
            aCol = cNum;
          } else if (/^(notes?|evidence|citations?|references?|comments?|documentation)/i.test(lower)) {
            nCol = cNum;
          }
        });

        if (qCol !== -1) break;
      }

      // If headers found, count question rows in this sheet
      if (qCol !== -1) {
        let questionRowsCount = 0;
        ws.eachRow((row, rNum) => {
          if (rNum > headerRow) {
            const val = String(row.getCell(qCol).value || '').trim();
            if (val.length > 5) questionRowsCount++;
          }
        });

        if (questionRowsCount > maxQuestionMatches) {
          maxQuestionMatches = questionRowsCount;
          bestSheet = ws;
          bestHeaderRow = headerRow;
          bestQCol = qCol;
          bestACol = aCol !== -1 ? aCol : qCol + 1;
          bestNCol = nCol;
        }
      }
    }

    // Fallback: If no explicit headers were detected, scan for the column with the highest density of question marks / length
    if (bestQCol === -1) {
      bestSheet = workbook.worksheets[0];
      const colScores: Record<number, number> = {};

      bestSheet.eachRow((row) => {
        row.eachCell({ includeEmpty: false }, (cell, cNum) => {
          const val = String(cell.value || '').trim();
          if (val.length > 15) {
            colScores[cNum] = (colScores[cNum] || 0) + 1;
            if (val.includes('?')) {
              colScores[cNum] = (colScores[cNum] || 0) + 2;
            }
          }
        });
      });

      let highestScore = -1;
      for (const [cNumStr, score] of Object.entries(colScores)) {
        const cNum = Number.parseInt(cNumStr, 10);
        if (score > highestScore) {
          highestScore = score;
          bestQCol = cNum;
        }
      }

      if (bestQCol === -1) bestQCol = 1;
      bestACol = bestQCol + 1;
      bestHeaderRow = 1;
    }

    // Extract questions and build exact cell mappings
    const extractedQuestions: ExtractedQuestionMeta[] = [];
    const questionsMetaMap: Record<number, ExtractedQuestionMeta> = {};
    let rowIndex = 0;

    bestSheet.eachRow((row, rNum) => {
      if (rNum <= bestHeaderRow) return;

      const qCell = row.getCell(bestQCol);
      const text = String(qCell.value || '').trim();

      // Filter out empty rows or pure numbering
      if (text.length > 5 && !/^\d+$/.test(text)) {
        const aCell = row.getCell(bestACol);
        const nCell = bestNCol !== -1 ? row.getCell(bestNCol) : undefined;

        const qMeta: ExtractedQuestionMeta = {
          questionText: text,
          sheetName: bestSheet.name,
          rowNumber: rNum,
          colNumber: bestQCol,
          cellReference: qCell.address,
          answerColNumber: bestACol,
          answerCellReference: aCell.address,
          notesColNumber: bestNCol !== -1 ? bestNCol : undefined,
          notesCellReference: nCell ? nCell.address : undefined,
        };

        extractedQuestions.push(qMeta);
        questionsMetaMap[rowIndex] = qMeta;
        rowIndex++;
      }
    });

    const meta: QuestionnaireSpreadsheetMeta = {
      fileName: originalName,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      selectedSheet: bestSheet.name,
      sheetNames,
      questionColNumber: bestQCol,
      answerColNumber: bestACol,
      notesColNumber: bestNCol !== -1 ? bestNCol : undefined,
      headerRowNumber: bestHeaderRow,
      questions: questionsMetaMap,
    };

    return { questions: extractedQuestions, meta };
  }

  /**
   * Export the questionnaire while preserving 100% of the original Excel spreadsheet's
   * styles, merged cells, fonts, row heights, and tabs. Injects answers and citations
   * into the exact target cells.
   */
  async exportPreservedExcel(
    questionnaireId: string,
    questions: QuestionWithCitations[],
  ): Promise<Buffer> {
    const filePath = this.getStoragePath(questionnaireId);
    const metaPath = this.getMetaPath(questionnaireId);

    if (!fs.existsSync(filePath) || !fs.existsSync(metaPath)) {
      this.logger.warn(
        `Original file not found for ${questionnaireId}, falling back to clean generated export`,
      );
      return this.generateCleanExport(questions);
    }

    try {
      const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
      const meta = JSON.parse(metaContent) as QuestionnaireSpreadsheetMeta;

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const targetSheet =
        workbook.getWorksheet(meta.selectedSheet) || workbook.worksheets[0];

      for (const q of questions) {
        const qMeta = meta.questions[q.rowIndex];
        if (!qMeta) continue;

        const row = targetSheet.getRow(qMeta.rowNumber);
        const aCell = row.getCell(qMeta.answerColNumber);

        // Populate the AI-generated answer
        const answerVal = q.answerText || '';
        aCell.value = answerVal;

        // Clean wrapping while preserving font & colors
        aCell.alignment = {
          ...(aCell.alignment || {}),
          wrapText: true,
          vertical: 'top',
        };

        // If a notes/evidence column was detected in the template, write citations there
        if (qMeta.notesColNumber && q.citations?.length) {
          const nCell = row.getCell(qMeta.notesColNumber);
          const citationSummary = q.citations
            .map((c) => `${c.sourceDocument}${c.pageNumber ? ` (p. ${c.pageNumber})` : ''}`)
            .join('; ');

          nCell.value = citationSummary;
          nCell.alignment = {
            ...(nCell.alignment || {}),
            wrapText: true,
            vertical: 'top',
          };
        }

        // Attach citations as an interactive cell note on the answer cell
        if (q.citations && q.citations.length > 0) {
          const noteLines = [
            'Vaultix AI Verified Citations:',
            ...q.citations.map((c) => {
              const loc = c.pageNumber ? ` (Page ${c.pageNumber})` : '';
              const excerpt = c.excerpt ? `\n"${c.excerpt.slice(0, 160)}..."` : '';
              return `• ${c.sourceDocument}${loc}${excerpt}`;
            }),
          ];
          aCell.note = noteLines.join('\n');
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (err) {
      this.logger.error(`Error during preserved export: ${err}`, err);
      return this.generateCleanExport(questions);
    }
  }

  /**
   * Fallback: Builds a professionally styled spreadsheet from scratch
   * when no original template was retained.
   */
  async generateCleanExport(questions: QuestionWithCitations[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Security Questionnaire');

    // Define styled columns
    sheet.columns = [
      { header: '#', key: 'index', width: 8 },
      { header: 'Question', key: 'question', width: 55 },
      { header: 'Vaultix AI Answer', key: 'answer', width: 75 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Verified Citations', key: 'citations', width: 45 },
    ];

    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' }, // Slate 900
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FFF97316' } }, // Brand orange underline
      };
    });

    // Populate data rows
    questions.forEach((q, idx) => {
      const citationsText = (q.citations || [])
        .map((c) => `${c.sourceDocument}${c.pageNumber ? ` (p. ${c.pageNumber})` : ''}`)
        .join('; ');

      const row = sheet.addRow({
        index: idx + 1,
        question: q.questionText,
        answer: q.answerText || '',
        status: q.status || 'DRAFT',
        citations: citationsText,
      });

      row.height = 45;
      const isEven = idx % 2 === 0;

      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'top', wrapText: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' },
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        if (colNum === 4) {
          // Status cell
          cell.alignment = { vertical: 'top', horizontal: 'center' };
          cell.font = {
            name: 'Segoe UI',
            size: 9,
            bold: true,
            color: {
              argb: q.status === 'APPROVED' ? 'FF16A34A' : 'FFF97316',
            },
          };
        }
      });

      if (q.citations && q.citations.length > 0) {
        const aCell = row.getCell(3);
        aCell.note =
          'Vaultix Citations:\n' +
          q.citations
            .map((c) => `• ${c.sourceDocument}${c.pageNumber ? ` (p. ${c.pageNumber})` : ''}`)
            .join('\n');
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
