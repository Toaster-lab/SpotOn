import { metrics, validDate, type Entry } from "./entries";
export type Mapping = Record<string, number>;
export const importFields = [{ id: "date", label: "Date (required)", unit: "" }, ...metrics, { id: "notes", label: "Notes", unit: "" }];

// Strict CSV parsing: escaped quotes, multiline cells, CRLF and UTF-8 BOM.
export function parseCsv(source: string, delimiter: string): string[][] {
    const text = source.replace(/^\uFEFF/, "");
    const rows: string[][] = [];
    let row: string[] = [], cell = "", quoted = false, closed = false;
    function finishRow() {
        row.push(cell);
        if (row.some(value => value.trim() !== "")) rows.push(row);
        if (rows.length > 10001) throw new Error("Use a CSV with at most 10,000 entries.");
        row = []; cell = ""; closed = false;
    }
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quoted) {
            if (char === '"') {
                if (text[i + 1] === '"') { cell += '"'; i++; }
                else { quoted = false; closed = true; }
            } else cell += char;
        } else if (char === delimiter) {
            row.push(cell); cell = ""; closed = false;
        } else if (char === "\n" || char === "\r") {
            if (char === "\r" && text[i + 1] === "\n") i++;
            finishRow();
        } else if (char === '"' && cell === "" && !closed) quoted = true;
        else {
            if (closed || char === '"') throw new Error("Invalid CSV quoting. Check quoted cells in your file.");
            cell += char;
        }
    }
    if (quoted) throw new Error("A quoted cell is not closed. Check your CSV file.");
    finishRow();
    if (!rows.length) throw new Error("This file is empty.");
    if (rows.some(row => row.length !== rows[0].length)) throw new Error("Some rows have a different number of columns. Check your CSV separator and file.");
    return rows;
}
export function guessMapping(headers: string[]): Mapping {
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
    return Object.fromEntries(importFields.map(field => [field.id, headers.findIndex(header => normalize(header) === normalize(field.id) || normalize(header) === normalize(field.label))]));
}
export function prepareImport(rows: string[][], mapping: Mapping, hasHeader: boolean): { entries: Omit<Entry, "id">[]; errors: string[] } {
    const errors: string[] = [];
    const result: Omit<Entry, "id">[] = [];
    const mapped = importFields.map(field => mapping[field.id] ?? -1).filter(index => index >= 0);
    if ((mapping.date ?? -1) < 0) return { entries: [], errors: ["Choose the CSV column that contains the date."] };
    if (new Set(mapped).size !== mapped.length) return { entries: [], errors: ["Choose a different CSV column for each entry field."] };
    const data = hasHeader ? rows.slice(1) : rows;
    if (data.length > 10000) return { entries: [], errors: ["Use a CSV with at most 10,000 entries."] };
    if (!data.length) return { entries: [], errors: ["No entry rows were found."] };
    data.forEach((row, index) => {
        const get = (id: string) => (row[mapping[id]] ?? "").trim();
        const date = get("date"), notes = get("notes");
        const readings: Record<string, number> = {};
        const issues: string[] = [];
        if (!validDate(date)) issues.push("date must be YYYY-MM-DD");
        for (const metric of metrics) {
            const value = get(metric.id);
            if (!value) continue;
            if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) || !Number.isFinite(Number(value))) issues.push(`${metric.label} must be a number of zero or more (use a decimal point)`);
            else readings[metric.id] = Number(value);
        }
        if (!Object.keys(readings).length && !notes) issues.push("add a reading or note");
        if (issues.length) errors.push(`Row ${index + (hasHeader ? 2 : 1)}: ${issues.join("; ")}.`);
        else result.push({ date, readings, notes });
    });
    return { entries: result, errors };
}
