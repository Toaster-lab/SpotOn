export interface RecentActivityItem {
    id: string;
    type: "chat" | "upload" | "export" | "entry";
    title: string;
    lastOpened: string;
    description: string;
    content: string;
}

// Sample activity until saved chats, files, and entries are connected.
export const sampleActivity: RecentActivityItem[] = [
    {
        id: "chat-risk", type: "chat", title: "Understanding today's risk", lastOpened: "5 min ago",
        description: "Chat · Sample conversation",
        content: "You: What changed in the latest readings?\n\nAssistant: Compare the latest readings with the previous period to explore changes in the risk report.",
    },
    {
        id: "upload-readings", type: "upload", title: "Sensor readings.csv", lastOpened: "20 min ago",
        description: "Data upload · Sample file",
        content: "Uploaded readings for temperature, humidity, and air pressure.\n\nColumns: time, temperature, humidity, pressure\nReadings: 48\nStatus: Uploaded",
    },
    {
        id: "entry-observation", type: "entry", title: "Afternoon observation", lastOpened: "1 hour ago",
        description: "Entry · Sample observation",
        content: "Temperature increased during the afternoon. Review the latest sensor readings alongside the risk report.\n\nStatus: Added",
    },
    {
        id: "export-summary", type: "export", title: "Weekly summary.csv", lastOpened: "Yesterday",
        description: "Data export · Sample export",
        content: "Weekly summary of collected sensor readings.\n\nFormat: CSV\nIncludes: Temperature, humidity, and air pressure\nStatus: Exported",
    },
];
