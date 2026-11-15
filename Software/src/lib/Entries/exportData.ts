import { metrics, type Entry } from "./entries";

export const exportColumns = [{ id: "date", label: "Date", unit: "" }, ...metrics, { id: "notes", label: "Notes", unit: "" }];
export function sortedExportEntries(selected: readonly Entry[]): Entry[] {
    return [...selected].sort((a, b) => a.date.localeCompare(b.date));
}
export function exportValue(entry: Entry, id: string): string {
    if (id === "date") return entry.date;
    if (id === "notes") return entry.notes;
    return entry.readings[id] === undefined ? "" : String(entry.readings[id]);
}
export function selectedExportColumns(fieldIds: readonly string[] = exportColumns.map(column => column.id)) {
    const columns = exportColumns.filter(column => fieldIds.includes(column.id));
    if (!columns.length) throw new Error("Choose at least one field");
    return columns;
}
export function entriesCsv(selected: readonly Entry[], fieldIds?: readonly string[]): string {
    const columns = selectedExportColumns(fieldIds);
    if (!selected.length) throw new Error("No entries to export");
    const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = sortedExportEntries(selected).map(entry => columns.map(column => {
        let value = exportValue(entry, column.id);
        // Prevent spreadsheet applications from evaluating free-text notes as formulas.
        if (column.id === "notes" && /^[\s]*[=+@\-\t\r]/.test(value)) value = `'${value}`;
        return quote(value);
    }).join(","));
    return "\uFEFF" + [columns.map(column => quote(column.label)).join(","), ...rows].join("\r\n") + "\r\n";
}
export function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    try { anchor.click(); }
    finally {
        anchor.remove();
        // Give the browser time to begin reading the download before revoking it.
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
}
