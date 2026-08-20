import * as XLSX from 'xlsx';

export type ParsedAgentRow = { agentId: string; name: string; email: string; phone: string };

const HEADER_ALIASES: Record<string, keyof ParsedAgentRow> = {
  'sales agent id': 'agentId',
  'agent id': 'agentId',
  id: 'agentId',
  name: 'name',
  email: 'email',
  phone: 'phone',
  'phone number': 'phone',
};

const REQUIRED: (keyof ParsedAgentRow)[] = ['agentId', 'name', 'email', 'phone'];

/**
 * Shared by both input paths below: given a grid of cells (rows of columns)
 * with a header row on top, figures out which column is which and builds
 * `ParsedAgentRow`s. Per-field validity (a phone that isn't Nigerian, a blank
 * name) is `agentImportSchema`'s job, not this function's — this only has to
 * get the columns right.
 */
function rowsFromGrid(grid: string[][]): { rows: ParsedAgentRow[]; error?: string } {
  const lines = grid.filter((row) => row.some((cell) => cell.trim().length > 0));
  if (lines.length === 0) return { rows: [], error: 'The file has no rows in it.' };

  const columns = lines[0].map((cell) => HEADER_ALIASES[cell.trim().toLowerCase()]);
  if (!REQUIRED.every((key) => columns.includes(key))) {
    return {
      rows: [],
      error: 'The first row must be a header with Sales Agent ID, Name, Email and Phone columns.',
    };
  }

  if (lines.length === 1) {
    return { rows: [], error: 'The pasted text has no agent rows in it.' };
  }

  const rows = lines.slice(1).map((cells) => {
    const row: Partial<ParsedAgentRow> = {};
    columns.forEach((key, i) => {
      if (key) row[key] = (cells[i] ?? '').trim();
    });
    return { agentId: row.agentId ?? '', name: row.name ?? '', email: row.email ?? '', phone: row.phone ?? '' };
  });

  return { rows };
}

/**
 * Copying a range out of Sheets or Excel puts a tab between cells; a plain
 * CSV export uses a comma. Both are accepted so the exported sheet pastes in
 * as-is, whichever tool produced it.
 */
function splitLine(line: string): string[] {
  const delimiter = line.includes('\t') ? '\t' : ',';
  return line.split(delimiter).map((cell) => cell.trim());
}

export function parseAgentRoster(raw: string): { rows: ParsedAgentRow[]; error?: string } {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return { rows: [], error: 'Paste the roster first.' };

  return rowsFromGrid(lines.map(splitLine));
}

/**
 * A cell SheetJS handed back as a raw value — a string if the column was
 * formatted as text, a number if Excel treated it as one (which most exports
 * do for a column that's all digits, phone numbers included).
 */
function cellText(value: unknown): string {
  // A plain decimal string: unlike SheetJS's own `raw: false` formatter, this
  // never drops into scientific notation. A 13-digit phone number stored as a
  // number renders as "2348123456789", not "2.34812E+12" — see the note below.
  if (typeof value === 'number') return Number.isInteger(value) ? value.toFixed(0) : String(value);
  return String(value ?? '').trim();
}

/**
 * The actual file exported from the main app — a real .xlsx workbook, not a
 * paste.
 *
 * `raw: true` reads each cell's underlying value rather than asking SheetJS
 * to format it as display text. That distinction matters specifically for
 * phone numbers: a column typed as "General" renders any integer past 11
 * digits in scientific notation ("2.34812E+12"), which strips to garbage and
 * fails every phone in the sheet. The raw number has no such limit — Nigerian
 * phone numbers, at 10–13 digits, are nowhere near where floating-point
 * precision would actually become a problem (that's ~15-16 digits).
 */
export function parseAgentRosterWorkbook(buffer: ArrayBuffer): { rows: ParsedAgentRow[]; error?: string } {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'array' });
  } catch {
    return { rows: [], error: 'That file could not be read as a spreadsheet.' };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], error: 'The spreadsheet has no sheets in it.' };

  const grid = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    raw: true,
    defval: '',
  });

  return rowsFromGrid(grid.map((row) => row.map(cellText)));
}
