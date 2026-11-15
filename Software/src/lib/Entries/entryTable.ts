import { metrics, type Entry } from "./entries";

export const entryColumns = [
    { id: "date", label: "Date", unit: "" },
    ...metrics,
    { id: "notes", label: "Notes", unit: "" },
];
export function cellValue(entry: Entry, column: string): string | number | undefined {
    if (column === "date") return entry.date;
    if (column === "notes") return entry.notes || undefined;
    return entry.readings[column];
}
export function filterAndSortEntries(entries: Entry[], query: string, column: string, ascending: boolean): Entry[] {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return entries.filter(entry => {
        const text = [entry.date, entry.notes, ...metrics.flatMap(metric => {
            const value = entry.readings[metric.id];
            return value === undefined ? [] : [metric.label, metric.unit, String(value)];
        })].join(" ").toLocaleLowerCase();
        return terms.every(term => text.includes(term));
    }).sort((a, b) => {
        const left = cellValue(a, column);
        const right = cellValue(b, column);
        // Keep blanks last in either direction; zero is a recorded value.
        if (left === undefined) return right === undefined ? 0 : 1;
        if (right === undefined) return -1;
        const order = typeof left === "number" && typeof right === "number"
            ? left - right : String(left).localeCompare(String(right));
        return ascending ? order : -order;
    });
}
