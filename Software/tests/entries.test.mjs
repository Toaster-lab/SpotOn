import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import * as jsPdfModule from 'jspdf';
import * as autoTableModule from 'jspdf-autotable';
import vm from 'node:vm';
import ts from 'typescript';
import * as stores from 'svelte/store';

function compile(path, dependencies = {}, globals = {}) {
    const module = { exports: {} };
    const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 },
    }).outputText;
    vm.runInNewContext(source, { module, exports: module.exports, require: id => {
        assert.ok(id in dependencies, `Unexpected import ${id}`);
        return dependencies[id];
    }, ...globals });
    return module.exports;
}
const graphData = compile('../src/lib/Dashboard/Chart/graphData.ts');
function setup(initial = '[]') {
    let stored = initial;
    const storage = {
        getItem: () => stored,
        setItem: (_key, value) => { stored = value; },
    };
    const api = compile('../src/lib/Entries/entries.ts', {
        'svelte/store': stores, '../Dashboard/Chart/graphData': graphData,
    }, { localStorage: storage });
    return { api, storage };
}
const entry = (changes = {}) => ({ id: 'one', date: '2026-11-15', readings: { 't-cells': 0 }, notes: '', ...changes });

test('validates dates, optional readings, zero, and notes-only entries', () => {
    const { api } = setup();
    assert.equal(api.validateEntry(entry()), true);
    assert.equal(api.validateEntry(entry({ readings: {}, notes: 'Feeling tired' })), true);
    for (const bad of [entry({ date: '2026-02-30' }), entry({ readings: {} }), entry({ readings: { 't-cells': -1 } }), entry({ readings: { 't-cells': Infinity } }), entry({ readings: { unknown: 2 } })]) {
        assert.equal(api.validateEntry(bad), false);
    }
});
test('persists readings and notes and restores them after reload', () => {
    const { api } = setup();
    api.loadEntries();
    api.saveEntry(entry({ notes: 'After exercise' }));
    api.entries.set([]);
    api.loadEntries();
    assert.equal(stores.get(api.entries)[0].notes, 'After exercise');
    assert.equal(stores.get(api.entries)[0].readings['t-cells'], 0);
});
test('failed writes leave the store unchanged; corrupt storage is rejected', () => {
    const { api, storage } = setup();
    storage.setItem = () => { throw new Error('Storage full'); };
    assert.throws(() => api.saveEntry(entry()));
    assert.equal(stores.get(api.entries).length, 0);
    storage.getItem = () => '{broken';
    assert.throws(() => api.loadEntries());
    storage.getItem = () => JSON.stringify([entry({ date: 'bad' })]);
    assert.throws(() => api.loadEntries());
});
test('graphs sort dates and preserve missing readings as gaps', () => {
    const { api } = setup();
    const graphs = api.entryGraphs([entry(), entry({ id: 'two', date: '2026-11-14', readings: { 'b-cells': 240 } })]);
    assert.equal(graphs.length, 5);
    assert.equal(graphs[0].points[0].label, '2026-11-14');
    assert.equal(graphs[0].points[0].value, null);
    assert.equal(graphs[0].points[1].value, 0);
    assert.equal(graphs[1].points[0].value, 240);
});

const table = compile('../src/lib/Entries/entryTable.ts', { './entries': setup().api });
test('table searches all fields and sorts numbers with blanks last without mutating entries', () => {
    const rows = [
        entry({ id: 'a', date: '2026-11-15', readings: { 't-cells': 100 }, notes: 'After exercise' }),
        entry({ id: 'b', date: '2026-11-14', readings: { 't-cells': 37 } }),
        entry({ id: 'c', date: '2026-11-13', readings: {}, notes: 'Rest day' }),
        entry({ id: 'd', date: '2026-11-12', readings: { 't-cells': 0 }, notes: 'Baseline' }),
    ];
    const ids = result => Array.from(result, row => row.id).join(',');
    assert.equal(ids(table.filterAndSortEntries(rows, '', 't-cells', true)), 'd,b,a,c');
    assert.equal(ids(table.filterAndSortEntries(rows, '', 't-cells', false)), 'a,b,d,c');
    assert.equal(ids(table.filterAndSortEntries(rows, '', 'date', true)), 'd,c,b,a');
    assert.equal(ids(table.filterAndSortEntries(rows, '', 'date', false)), 'a,b,c,d');
    assert.equal(ids(table.filterAndSortEntries(rows, ' EXERCISE 2026-11 ', 'notes', true)), 'a');
    assert.equal(ids(table.filterAndSortEntries(rows, 't-cells 37', 'date', true)), 'b');
    assert.equal(table.filterAndSortEntries(rows, 'unknown', 'date', true).length, 0);
    assert.equal(ids(table.filterAndSortEntries(rows, '', 'notes', true)), 'a,d,c,b');
    assert.equal(ids(table.filterAndSortEntries(rows, '', 'notes', false)), 'c,d,a,b');
    assert.equal(ids(rows), 'a,b,c,d');
});

const csv = compile('../src/lib/Entries/csvImport.ts', { './entries': setup().api });
test('CSV handles BOM, CRLF, quoted commas, escaped quotes and multiline notes', () => {
    const rows = csv.parseCsv('\uFEFFNotes,Date,T-Cells\r\n"Feeling, ""okay""\nresting",2026-11-15,0\r\n', ',');
    assert.equal(rows.length, 2);
    assert.equal(rows[1][0], 'Feeling, "okay"\nresting');
    const mapping = csv.guessMapping(rows[0]);
    const result = csv.prepareImport(rows, mapping, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.entries[0].readings['t-cells'], 0);
    assert.equal(result.entries[0].notes, rows[1][0]);
});
test('CSV supports manual reordered columns, semicolons, tabs and files without headers', () => {
    for (const separator of [';', '\t']) {
        const rows = csv.parseCsv(['Rest day', '37', '2026-11-15', ''].join(separator), separator);
        const result = csv.prepareImport(rows, { date: 2, notes: 0, 'b-cells': 1, 't-cells': 3 }, false);
        assert.equal(result.errors.length, 0);
        assert.equal(result.entries[0].readings['b-cells'], 37);
        assert.equal(result.entries[0].readings['t-cells'], undefined);
    }
});
test('CSV rejects malformed quotes, uneven rows, invalid values and duplicate mappings', () => {
    for (const text of ['a,b\n1', '"open', '"a"oops,b', 'a"b,c']) assert.throws(() => csv.parseCsv(text, ','));
    const rows = csv.parseCsv('Date,T-Cells,Notes\n2026-02-30,-1,rest\n2026-11-15,NaN,rest\n2026-11-15,,', ',');
    const result = csv.prepareImport(rows, { date: 0, 't-cells': 1, notes: 2 }, true);
    assert.equal(result.errors.length, 3);
    assert.ok(result.errors[0].startsWith('Row 2:'));
    assert.equal(csv.prepareImport(rows, {}, true).errors.length, 1);
    assert.equal(csv.prepareImport(rows, { date: 0, notes: 0 }, true).errors.length, 1);
});
test('batch import persists once, updates all entries together and is atomic on failure', () => {
    const { api, storage } = setup();
    let writes = 0;
    const original = storage.setItem;
    storage.setItem = (...args) => { writes++; original(...args); };
    api.saveEntries([entry(), entry({ id: 'two', notes: 'Imported' })]);
    assert.equal(writes, 1);
    assert.equal(stores.get(api.entries).length, 2);
    storage.setItem = () => { throw new Error('Storage full'); };
    assert.throws(() => api.saveEntries([entry({ id: 'three' })]));
    assert.equal(stores.get(api.entries).length, 2);
    assert.throws(() => api.saveEntries([entry(), entry({ date: '' })]));
    assert.equal(stores.get(api.entries).length, 2);
});

test('deletion removes only selected entries, persists after reload, and preserves data on storage failure', () => {
    const { api, storage } = setup();
    api.saveEntries([entry(), entry({ id: 'two' }), entry({ id: 'three' })]);
    api.deleteEntries(['one', 'three']);
    assert.equal(stores.get(api.entries).length, 1);
    assert.equal(stores.get(api.entries)[0].id, 'two');
    api.entries.set([]);
    api.loadEntries();
    assert.equal(stores.get(api.entries)[0].id, 'two');
    storage.setItem = () => { throw new Error('Storage unavailable'); };
    assert.throws(() => api.deleteEntries(['two']));
    assert.equal(stores.get(api.entries)[0].id, 'two');
});

const exportsApi = compile('../src/lib/Entries/exportData.ts', { './entries': setup().api });
test('CSV export round-trips dates, zero, blank readings, quoted multiline notes and chosen entries', () => {
    const selected = [entry({ id: 'later', notes: 'Feeling "well", after exercise\nResting' }), entry({ id: 'earlier', date: '2026-11-14', readings: {}, notes: 'Notes only' })];
    const text = exportsApi.entriesCsv(selected);
    const rows = csv.parseCsv(text, ',');
    const imported = csv.prepareImport(rows, csv.guessMapping(rows[0]), true);
    assert.equal(imported.errors.length, 0);
    assert.equal(imported.entries.length, 2);
    assert.equal(imported.entries[0].date, '2026-11-14');
    assert.equal(imported.entries[0].readings['t-cells'], undefined);
    assert.equal(imported.entries[1].readings['t-cells'], 0);
    assert.equal(imported.entries[1].notes, selected[0].notes);
    assert.equal(selected[0].id, 'later');
    assert.throws(() => exportsApi.entriesCsv([]));
    const safe = csv.parseCsv(exportsApi.entriesCsv([entry({ notes: '=1+1' })]), ',');
    assert.equal(safe[1][6], "'=1+1");
});
const pdfApi = compile('../src/lib/Entries/pdfExport.ts', {
    jspdf: jsPdfModule, 'jspdf-autotable': autoTableModule, './exportData': exportsApi,
});
test('PDF exports a paginated report with long notes and embedded font', () => {
    const font = readFileSync(new URL('../src/assets/fonts/DejaVuSans.ttf', import.meta.url)).toString('base64');
    const selected = Array.from({ length: 45 }, (_, i) => entry({
        id: String(i), readings: { 't-cells': 1420, 'b-cells': 240, 'red-blood-cells': 4.5, 'white-blood-cells': 6200, thrombocytes: 250 },
        notes: i === 0 ? 'Sample export: feeling well, after exercise. Café.\nFollow-up note.' : `Entry ${i + 1}: ` + 'Routine reading; notes wrap within the table. '.repeat(3),
    }));
    const result = Buffer.from(pdfApi.createEntriesPdf(selected, font));
    assert.equal(result.subarray(0, 5).toString(), '%PDF-');
    assert.ok(result.length > 10000);
    assert.throws(() => pdfApi.createEntriesPdf([], font));
    if (process.env.PDF_EXPORT_QA) writeFileSync(process.env.PDF_EXPORT_QA, result);
});

test('field selection exports only requested CSV and PDF columns and rejects an empty selection', () => {
    const selected = [entry({ notes: 'A note that should not be exported' })];
    const rows = csv.parseCsv(exportsApi.entriesCsv(selected, ['date', 't-cells']), ',');
    assert.equal(Array.from(rows[0]).join(','), 'Date,T-Cells');
    assert.equal(Array.from(rows[1]).join(','), '2026-11-15,0');
    assert.throws(() => exportsApi.entriesCsv(selected, []));
    const font = readFileSync(new URL('../src/assets/fonts/DejaVuSans.ttf', import.meta.url)).toString('base64');
    assert.throws(() => pdfApi.createEntriesPdf(selected, font, []));
    const pdf = Buffer.from(pdfApi.createEntriesPdf(selected, font, ['date', 't-cells']));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    if (process.env.PDF_EXPORT_QA) writeFileSync(process.env.PDF_EXPORT_QA.replace('.pdf', '-fields.pdf'), pdf);
});

test('cell editing validates dates and numbers, permits blank optional fields, and preserves the original', () => {
    const { api } = setup();
    const original = entry({ readings: { 't-cells': 1420 }, notes: 'Original note' });
    const changed = api.editEntryField(original, 't-cells', '0');
    assert.equal(changed.readings['t-cells'], 0);
    assert.equal(original.readings['t-cells'], 1420);
    assert.equal(api.editEntryField(original, 'red-blood-cells', '4.55').readings['red-blood-cells'], 4.55);
    assert.equal(api.editEntryField(original, 'date', '2026-11-14').date, '2026-11-14');
    assert.equal(api.editEntryField(original, 'notes', ' Updated note ').notes, 'Updated note');
    assert.equal(api.editEntryField(original, 't-cells', '').readings['t-cells'], undefined);
    assert.equal(api.editEntryField(original, 'notes', '').notes, '');
    for (const bad of ['', '2026-02-30']) assert.throws(() => api.editEntryField(original, 'date', bad));
    for (const bad of ['-1', 'NaN', 'Infinity', '1,4', '1e999']) assert.throws(() => api.editEntryField(original, 't-cells', bad));
    assert.throws(() => api.editEntryField(original, 'unknown', '1'));
    assert.throws(() => api.editEntryField(entry(), 't-cells', ''));
    assert.throws(() => api.editEntryField(entry({ readings: {}, notes: 'Only note' }), 'notes', ''));
});
test('edited cells persist, update graph data, and preserve saved data on write failure', () => {
    const { api, storage } = setup();
    api.saveEntries([entry(), entry({ id: 'other' })]);
    api.updateEntry(api.editEntryField(stores.get(api.entries)[0], 't-cells', '1500'));
    assert.equal(api.entryGraphs(stores.get(api.entries))[0].points[0].value, 1500);
    api.entries.set([]);
    api.loadEntries();
    assert.equal(stores.get(api.entries)[0].readings['t-cells'], 1500);
    assert.equal(stores.get(api.entries)[1].readings['t-cells'], 0);
    assert.throws(() => api.updateEntry(entry({ id: 'missing' })));
    storage.setItem = () => { throw new Error('Storage full'); };
    assert.throws(() => api.updateEntry(api.editEntryField(stores.get(api.entries)[0], 'notes', 'Unsaved')));
    assert.equal(stores.get(api.entries)[0].notes, '');
});

test('first use seeds persisted sample entries without replacing existing or intentionally cleared entries', () => {
    const { api } = setup(null);
    api.loadEntries();
    const samples = stores.get(api.entries);
    assert.equal(samples.length, 8);
    assert.ok(samples.every(entry => entry.isSample && api.validateEntry(entry)));
    assert.equal(api.entryGraphs(samples)[0].points[0].value, samples[0].readings['t-cells']);
    api.entries.set([]);
    api.loadEntries();
    assert.equal(stores.get(api.entries).length, 8);
    api.deleteEntries(samples.map(entry => entry.id));
    api.loadEntries();
    assert.equal(stores.get(api.entries).length, 0);
    assert.equal(api.entryGraphs(stores.get(api.entries))[0].points.length, 0);
    const existing = setup(JSON.stringify([entry()]));
    existing.api.loadEntries();
    assert.equal(stores.get(existing.api.entries).length, 1);
    assert.equal(stores.get(existing.api.entries)[0].id, 'one');
});
test('uploaded entries drive graphs without mixing samples, including after reload and edits', () => {
    const { api } = setup(null);
    api.loadEntries();
    const uploaded = csv.prepareImport(csv.parseCsv('Date,T-Cells,B-Cells,Notes\n2026-11-14,1500,250,Uploaded\n2026-11-15,1520,,Partial', ','), { date: 0, 't-cells': 1, 'b-cells': 2, notes: 3 }, true);
    assert.equal(uploaded.errors.length, 0);
    api.saveEntries(uploaded.entries.map((entry, index) => ({ ...entry, id: `upload-${index}` })));
    api.entries.set([]);
    api.loadEntries();
    const graphs = api.entryGraphs(stores.get(api.entries));
    assert.equal(graphs[0].points.length, 2);
    assert.equal(graphs[0].points[0].value, 1500);
    assert.equal(graphs[0].points[1].value, 1520);
    assert.equal(graphs[1].points[1].value, null);
    assert.equal(graphs[2].points.every(point => point.value === null), true);
    const edited = api.editEntryField(stores.get(api.entries)[0], 't-cells', '1300');
    assert.equal(edited.isSample, false);
});
test('notes-only saved entries do not cause sample graphs to reappear', () => {
    const { api } = setup(null);
    api.loadEntries();
    api.saveEntry(entry({ readings: {}, notes: 'No readings today' }));
    const graphs = api.entryGraphs(stores.get(api.entries));
    assert.equal(graphs[0].points.length, 1);
    assert.ok(graphs.every(graph => graph.points.every(point => point.value === null)));
});
