export interface GraphData {
    id: string;
    label: string;
    unit: string;
    points: { label: string; value: number | null }[];
}

// Demonstration readings; replace these with collected data via the graphs prop.
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
export const sampleGraphs: GraphData[] = [
    { id: "t-cells", label: "T-Cells", unit: "cells/µL", values: [1420, 1380, 1450, 1400, 1360, 1390, 1430, 1410] },
    { id: "b-cells", label: "B-Cells", unit: "cells/µL", values: [240, 235, 248, 242, 230, 238, 245, 241] },
    { id: "red-blood-cells", label: "Red blood cells", unit: "×10⁶/µL", values: [4.5, 4.48, 4.52, 4.49, 4.46, 4.44, 4.47, 4.45] },
    { id: "white-blood-cells", label: "White blood cells", unit: "cells/µL", values: [6200, 6400, 6350, 6600, 6800, 6700, 6500, 6450] },
    { id: "thrombocytes", label: "Thrombocytes", unit: "×10³/µL", values: [250, 248, 255, 252, 245, 249, 253, 251] },
].map(({ values, ...graph }) => ({
    ...graph,
    points: times.map((label, index) => ({ label, value: values[index] })),
}));
