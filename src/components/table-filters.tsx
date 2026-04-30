import React from "react";
import type { FilterCriteria } from "../App";
import { DatePickerWithRange } from "./date-range";
import { RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Field, FieldLabel } from "./ui/field";
import { type DateRange } from "react-day-picker";

interface TableFiltersProps {
    filters: FilterCriteria;
    onFilterChange: (filters: Partial<FilterCriteria>) => void;
    onClear: () => void;
    aocOptions: string[];
}

export function TableFilters({ filters, onFilterChange, onClear, aocOptions }: TableFiltersProps) {
    const days = [
        { label: "Mon", value: 1 },
        { label: "Tue", value: 2 },
        { label: "Wed", value: 3 },
        { label: "Thu", value: 4 },
        { label: "Fri", value: 5 },
        { label: "Sat", value: 6 },
        { label: "Sun", value: 7 },
    ];

    const formatDate = (date: Date | undefined) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (range: DateRange | undefined) => {
        // console.log(formatDate(range?.from))
        // console.log(formatDate(range?.to))
        onFilterChange({
            dateRange: {
                from: formatDate(range?.from),
                to: formatDate(range?.to),
            }
        });
    };

    const toggleDay = (day: number) => {
        const nextDays = filters.days.includes(day)
            ? filters.days.filter((d) => d !== day)
            : [...filters.days, day];
        onFilterChange({ days: nextDays });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-6 mb-6">
            <DatePickerWithRange
                value={{
                    from: filters.dateRange.from ? new Date(filters.dateRange.from) : undefined,
                    to: filters.dateRange.to ? new Date(filters.dateRange.to) : undefined
                }}
                onChange={handleDateChange}
            />

            <Field className="w-fit">
                <FieldLabel>Days of Operation</FieldLabel>
                <div className="flex gap-1.5 h-10 items-center">
                    {days.map((d) => (
                        <button
                            key={d.value}
                            onClick={() => toggleDay(d.value)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:cursor-pointer ${filters.days.includes(d.value)
                                ? "bg-primary text-white shadow-sm"
                                : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100"
                                }`}
                        >
                            {d.label[0]}
                        </button>
                    ))}
                </div>
            </Field>

            <Field className="w-40">
                <FieldLabel htmlFor="filter-status">Status</FieldLabel>
                <select
                    id="filter-status"
                    value={filters.status}
                    onChange={(e) => onFilterChange({ status: e.target.value as any })}
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary hover:border-slate-300 transition-colors cursor-pointer"
                >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </Field>

            <Field className="w-32">
                <FieldLabel htmlFor="filter-aoc">AOC</FieldLabel>
                <select
                    id="filter-aoc"
                    value={filters.aoc}
                    onChange={(e) => onFilterChange({ aoc: e.target.value })}
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary hover:border-slate-300 transition-colors cursor-pointer"
                >
                    <option value="all">All AOCs</option>
                    {aocOptions.map((aoc) => (
                        <option key={aoc} value={aoc}>
                            {aoc}
                        </option>
                    ))}
                </select>
            </Field>

            <Field className="w-40">
                <FieldLabel htmlFor="filter-body">Body Type</FieldLabel>
                <select
                    id="filter-body"
                    value={filters.bodyType}
                    onChange={(e) => onFilterChange({ bodyType: e.target.value as any })}
                    className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary hover:border-slate-300 transition-colors cursor-pointer"
                >
                    <option value="all">All Body Types</option>
                    <option value="narrow_body">Narrow Body</option>
                    <option value="wide_body">Wide Body</option>
                </select>
            </Field>

            <div className="flex gap-2 ml-auto">
                <Button
                    variant="ghost"
                    onClick={onClear}
                    className="h-10 px-4 text-slate-500 hover:text-slate-700 hover:bg-slate-50 gap-2 font-medium hover:cursor-pointer"
                >
                    <RotateCcw className="w-4 h-4" />
                    Clear All
                </Button>
            </div>
        </div>
    );
}
