import { writable } from "svelte/store";
import { sampleGraphs, type GraphData } from "../Dashboard/Chart/graphData";

export const metrics = sampleGraphs.map(({ id, label, unit }) => ({ id, label, unit }));
export interface Entry { id: string; date: string; readings: Record<string, number>; notes: string }
const storageKey = "spoton.entries.v1";
export const entries = writable<Entry[]>([]);

export function validDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
    const parsed = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function validateEntry(value: unknown): value is Entry {
    if (!value || typeof value !== "object") return false;
    const entry = value as Entry;
    return typeof entry.id === "string" && typeof entry.date === "string" && validDate(entry.date)
        && typeof entry.notes === "string" && !!entry.readings && typeof entry.readings === "object" && !Array.isArray(entry.readings)
        && Object.entries(entry.readings).every(([id, amount]) => metrics.some(metric => metric.id === id) && typeof amount === "number" && Number.isFinite(amount) && amount >= 0)
        && (Object.keys(entry.readings).length > 0 || entry.notes.trim().length > 0);
}
export function loadEntries() {
    const stored = localStorage.getItem(storageKey);
    const parsed: unknown = stored === null ? [] : JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(validateEntry)) throw new Error("Invalid stored entries");
    entries.set(parsed);
}
export function saveEntry(entry: Entry) {
    saveEntries([entry]);
}
export function saveEntries(batch: Entry[]) {
    if (!batch.length || !batch.every(validateEntry)) throw new Error("Invalid entries");
    entries.update(current => {
        const next = [...current, ...batch];
        // Persist first: a failed write must not appear as a successful save.
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
    });
}
export function entryGraphs(saved: Entry[]): GraphData[] {
    const sorted = [...saved].sort((a, b) => a.date.localeCompare(b.date));
    return metrics.map(metric => ({ ...metric, points: sorted.map(entry => ({ label: entry.date, value: entry.readings[metric.id] ?? null })) }));
}

export function deleteEntries(ids: string[]) {
    const selected = new Set(ids);
    entries.update(current => {
        const next = current.filter(entry => !selected.has(entry.id));
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
    });
}

export function editEntryField(entry: Entry, field: string, value: string): Entry {
    const next = { ...entry, readings: { ...entry.readings } };
    if (field === "date") {
        if (!validDate(value)) throw new Error("Choose a valid date. Date is required.");
        next.date = value;
    } else if (field === "notes") next.notes = value.trim();
    else {
        if (!metrics.some(metric => metric.id === field)) throw new Error("Unknown blood cell field.");
        const trimmed = value.trim();
        if (!trimmed) delete next.readings[field];
        else {
            if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed) || !Number.isFinite(Number(trimmed))) {
                throw new Error("Enter a number of zero or more, or leave blank.");
            }
            next.readings[field] = Number(trimmed);
        }
    }
    if (!validateEntry(next)) throw new Error("Keep at least one reading or a note in this entry.");
    return next;
}
export function updateEntry(updated: Entry) {
    if (!validateEntry(updated)) throw new Error("Invalid entry");
    entries.update(current => {
        if (!current.some(entry => entry.id === updated.id)) throw new Error("Entry no longer exists");
        const next = current.map(entry => entry.id === updated.id ? updated : entry);
        localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
    });
}
