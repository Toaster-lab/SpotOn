import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { Entry } from "./entries";
import { selectedExportColumns, exportValue, sortedExportEntries } from "./exportData";

export function createEntriesPdf(selected: readonly Entry[], fontBase64: string, fieldIds?: readonly string[]): ArrayBuffer {
    if (!selected.length) throw new Error("No entries to export");
    const columns = selectedExportColumns(fieldIds);
    const doc = new jsPDF({ orientation: "landscape", format: "a4", compress: true, putOnlyUsedFonts: true });
    doc.addFileToVFS("DejaVuSans.ttf", fontBase64);
    doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(16);
    doc.text("SpotOn - Blood cell entries", 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(`${selected.length} ${selected.length === 1 ? "entry" : "entries"} | Blank cells mean no value recorded.`, 14, 25);
    autoTable(doc, {
        startY: 32,
        margin: { top: 14, right: 14, bottom: 16, left: 14 },
        head: [columns.map(column => column.unit ? `${column.label}\n${column.unit}` : column.label)],
        body: sortedExportEntries(selected).map(entry => columns.map(column => exportValue(entry, column.id))),
        theme: "striped",
        styles: { font: "DejaVu", fontStyle: "normal", fontSize: 8, cellPadding: 3, overflow: "linebreak", valign: "top" },
        headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: "normal" },
        alternateRowStyles: { fillColor: [245, 247, 249] },
        columnStyles: Object.fromEntries(columns.map((column, index) => [index, {
            cellWidth: (doc.internal.pageSize.getWidth() - 28) * (column.id === "notes" ? 2.5 : 1) / columns.reduce((sum, item) => sum + (item.id === "notes" ? 2.5 : 1), 0),
        }])),
        showHead: "everyPage",
        rowPageBreak: "avoid",
    });
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
        doc.setPage(page);
        doc.setFont("DejaVu", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${page} of ${pages}`, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 7, { align: "right" });
    }
    return doc.output("arraybuffer");
}
