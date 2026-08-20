export type CsvRecord = Readonly<Record<string, string>>;

function parseCsvRows(source: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (quoted) {
      if (character === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  row.push(field.replace(/\r$/, ""));
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

export function parseCsv(source: string): CsvRecord[] {
  const rows = parseCsvRows(source.replace(/^\uFEFF/, ""));
  const header = rows.shift();
  if (!header?.length) throw new Error("CSV must contain a header row");
  if (new Set(header).size !== header.length) throw new Error("CSV header names must be unique");

  return rows.map((values, rowIndex) => {
    if (values.length !== header.length) {
      throw new Error(`CSV row ${rowIndex + 2} has ${values.length} fields; expected ${header.length}`);
    }
    return Object.freeze(Object.fromEntries(header.map((name, index) => [name, values[index]])));
  });
}
