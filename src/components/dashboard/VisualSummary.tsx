import { useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    Cell,
} from "recharts";

interface ChartEntry {
    name: string;
    quantidade: number;
    fill: string;
}

interface VisualSummaryProps {
    data: ChartEntry[];
    initialDate?: string;
    onDateChange?: (date: string) => void;
}

export function VisualSummary({
    data,
    initialDate,
    onDateChange,
}: VisualSummaryProps) {
    const [filterDate, setFilterDate] = useState(initialDate || "");

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterDate(e.target.value);
        onDateChange?.(e.target.value);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Resumo Visual</h2>
                <input
                    type="date"
                    className="border rounded px-2 py-1 text-sm"
                    value={filterDate}
                    onChange={handleDateChange}
                />
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantidade" isAnimationActive={false}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
