export interface GraphData {
    id: string;
    label: string;
    unit: string;
    points: { label: string; value: number | null }[];
}

// Demonstration readings; replace these with collected data via the graphs prop.
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
export const sampleGraphs: GraphData[] = [
    { id: "temperature", label: "Temperature", unit: "°C", values: [18.2, 18.8, 20.1, 21.4, 22.3, 23.1, 22.6, 21.8] },
    { id: "humidity", label: "Humidity", unit: "%", values: [68, 65, 61, 57, 52, 48, 51, 55] },
    { id: "pressure", label: "Air pressure", unit: "hPa", values: [1014, 1013.8, 1013.2, 1012.6, 1012.1, 1012.5, 1013, 1013.4] },
].map(({ values, ...graph }) => ({
    ...graph,
    points: times.map((label, index) => ({ label, value: values[index] })),
}));
