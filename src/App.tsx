import Layout from "./layouts/layout"
import { flightsData } from "./data/flights"
import type { Flight, State } from "./types/flight"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useReducer, useRef, useState } from "react"
import { Loader2, Check, X, AlertCircle, Pencil, ChevronDown, Trash, Search } from "lucide-react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Checkbox } from "./components/ui/checkbox"
import { DatePickerSimple } from "./components/date-picker"
import { Toggle } from "./components/toggle"
import { DayCircle } from "./components/day-circle"
import { TableFilters } from "./components/table-filters"
import { useMemo } from "react"
export interface FilterCriteria {
  dateRange: { from: string | null; to: string | null };
  days: number[];
  status: "Active" | "Inactive" | "all";
  aoc: string;
  bodyType: "narrow_body" | "wide_body" | "all";
  searchQuery: string;
}

const initialFilters: FilterCriteria = {
  dateRange: { from: null, to: null },
  days: [],
  status: "all",
  aoc: "all",
  bodyType: "all",
  searchQuery: "",
};

const initialState: State & { filters: FilterCriteria } = {
  data: (flightsData.flights) as Flight[],
  filteredData: (flightsData.flights) as Flight[],
  editingId: null,
  filters: initialFilters,
}

type Action =
  | { type: "SET_DATA"; payload: Flight[] }
  | { type: "DELETE_BY_ID"; payload: string }
  | { type: "DELETE_MULTIPLE"; payload: string[] }
  | { type: "TOGGLE_STATUS"; payload: string }
  | { type: "EDIT_FLIGHT", payload: string | null }
  | { type: "UPDATE_FLIGHT", payload: Flight }
  | { type: "SET_FILTER"; payload: Partial<FilterCriteria> }
  | { type: "CLEAR_FILTERS" }

function filterFlights(data: Flight[], filters: FilterCriteria): Flight[] {
  return data.filter(flight => {
    if (filters.status !== "all" && flight.status !== filters.status) return false;
    if (filters.bodyType !== "all" && flight.bodyType !== filters.bodyType) return false;
    if (filters.aoc !== "all" && flight.aoc !== filters.aoc) return false;



    if (filters.days.length > 0) {
      if (!flight.daysOfOperation.some(d => filters.days.includes(d))) return false;
    }

    if (filters.dateRange.from && filters.dateRange.to) {
      // if (!(flight.startDate <= filters.dateRange.to && flight.endDate >= filters.dateRange.from)) return false;
      if ((flight.startDate <= filters.dateRange.from && flight.endDate >= filters.dateRange.to)) {
        return true
      } else {
        return false
      }
    }
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      const matchesFlightNumber = flight.flightNumber.toLowerCase().includes(q);
      const matchesOrigin = flight.origin.toLowerCase().includes(q);
      const matchesDestination = flight.destination.toLowerCase().includes(q);
      if (!matchesFlightNumber && !matchesOrigin && !matchesDestination) return false;
    }

    return true;
  });
}

function reducer(state: State & { filters: FilterCriteria }, action: Action): State & { filters: FilterCriteria } {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        data: action.payload,
        filteredData: filterFlights(action.payload, state.filters)
      }
    case "DELETE_BY_ID": {
      const nextData = state.data.filter((flight) => flight.id !== action.payload);
      return {
        ...state,
        data: nextData,
        filteredData: filterFlights(nextData, state.filters)
      }
    }
    case "DELETE_MULTIPLE": {
      const nextData = state.data.filter((flight) => !action.payload.includes(flight.id));
      return {
        ...state,
        data: nextData,
        filteredData: filterFlights(nextData, state.filters)
      }
    }
    case "TOGGLE_STATUS": {
      const nextData = state.data.map(f =>
        f.id === action.payload
          ? { ...f, status: (f.status === "Active" ? "Inactive" : "Active") as Flight["status"] }
          : f
      );
      return {
        ...state,
        data: nextData,
        filteredData: filterFlights(nextData, state.filters)
      }
    }
    case "EDIT_FLIGHT":
      return {
        ...state,
        editingId: action.payload
      }
    case "UPDATE_FLIGHT": {
      const nextData = state.data.map(f => f.id === action.payload.id ? action.payload : f);
      return {
        ...state,
        data: nextData,
        filteredData: filterFlights(nextData, state.filters),
        editingId: null
      }
    }
    case "SET_FILTER": {
      const nextFilters = { ...state.filters, ...action.payload };
      return {
        ...state,
        filters: nextFilters,
        filteredData: filterFlights(state.data, nextFilters)
      }
    }
    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: initialFilters,
        filteredData: state.data
      }
    default:
      return state
  }
}

const columnHelper = createColumnHelper<Flight>()




function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rowSelection, setRowSelection] = useState({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
  const [tempEditData, setTempEditData] = useState<Flight | null>(null);

  const aocOptions = useMemo(() => {
    return Array.from(new Set(state.data.map(f => f.aoc))).sort();
  }, [state.data]);

  const handleFilterChange = (filters: Partial<FilterCriteria>) => {
    dispatch({ type: "SET_FILTER", payload: filters });
  };

  const handleClearFilters = () => {
    dispatch({ type: "CLEAR_FILTERS" });
  };

  const startEditing = (flight: Flight) => {
    setTempEditData({ ...flight });
    dispatch({ type: "EDIT_FLIGHT", payload: flight.id });
  };

  const cancelEditing = () => {
    setTempEditData(null);
    dispatch({ type: "EDIT_FLIGHT", payload: null });
  };

  const handleSave = async (id: string) => {
    if (!tempEditData) return;

    setSavingIds(prev => new Set(prev).add(id));
    setErrorIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });


    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {

          Math.random() > 0.1 ? resolve(true) : reject("Failed to save");
        }, 1000);
      });

      dispatch({ type: "UPDATE_FLIGHT", payload: tempEditData });
      setTempEditData(null);
    } catch (err) {
      setErrorIds(prev => new Set(prev).add(id));
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(rowSelection);
    dispatch({ type: "DELETE_MULTIPLE", payload: selectedIds });
    setRowSelection({});
  };

  const columns = [
    {
      id: 'select',
      header: ({ table }: any) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            className="border-slate-300"
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            className="border-slate-300"
          />
        </div>
      ),
    },
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => (
        <div className="flex items-center gap-2 group">
          <div className="bg-[#f8fafc] border border-slate-100 rounded px-2 py-0.5 text-[10px] font-mono text-slate-500 text-center w-fit transition-colors group-hover:bg-slate-100">
            {info.getValue()}
          </div>
          {errorIds.has(info.row.original.id) && (
            <div className="flex items-center text-red-500 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('aoc', {
      header: 'AOC',
      cell: (info) => (
        <div className="bg-[#f8fafc] border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('flightNumber', {
      header: 'FLIGHT NO.',
      cell: (info) => <span className="font-bold text-slate-800 tracking-tight">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => ({ from: row.origin, to: row.destination }), {
      id: 'route',
      header: 'ROUTE',
      cell: (info) => {
        const { from, to } = info.getValue()
        return (
          <div className="flex flex-col items-center gap-0 leading-tight py-1">
            <span className="text-[11px] font-bold text-slate-800 tracking-wider font-mono">{from}</span>
            <div className="h-4 flex items-center justify-center">
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 tracking-wider font-mono">{to}</span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'std_sta',
      header: 'STD / STA',
      cell: ({ row }) => {
        const isEditing = state.editingId === row.original.id;
        if (isEditing && tempEditData) {
          return (
            <div className="flex flex-col gap-1.5 py-1">
              <input
                type="time"
                value={tempEditData.std}
                onChange={(e) => setTempEditData({ ...tempEditData, std: e.target.value })}
                className="text-[11px] hover:cursor-pointer font-mono border border-slate-200 rounded px-1.5 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-primary h-6 "
              />
              <input
                type="time"
                value={tempEditData.sta}
                onChange={(e) => setTempEditData({ ...tempEditData, sta: e.target.value })}
                className="text-[11px] hover:cursor-pointer font-mono border border-slate-200 rounded px-1.5 py-0.5 w-20 focus:outline-none focus:ring-1 focus:ring-primary h-6"
              />
            </div>
          )
        }
        return (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-slate-800 text-sm whitespace-nowrap">{row.original.std}</span>
            <span className="font-mono text-slate-400 text-[10px] -mt-0.5">
              {row.original.sta}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor('daysOfOperation', {
      header: 'SCHEDULE',
      cell: (info) => {
        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
        const schedule = info.getValue()
        return (
          <div className="flex gap-1">
            {days.map((day, i) => (
              <DayCircle key={i} label={day} active={schedule.includes(i + 1)} />
            ))}
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'validity',
      header: 'VALIDITY',
      cell: ({ row }) => {
        const isEditing = state.editingId === row.original.id;

        if (isEditing && tempEditData) {
          return (
            <div className="flex flex-col gap-1.5 py-1">
              <DatePickerSimple title="Start Date" value={tempEditData.startDate} onChange={(e) => setTempEditData({ ...tempEditData, startDate: e.target.value })} />
              <DatePickerSimple title="End Date" value={tempEditData.endDate} onChange={(e) => setTempEditData({ ...tempEditData, endDate: e.target.value })} />

            </div>
          )
        }

        const start = new Date(row.original.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = new Date(row.original.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return <span className="text-slate-500 text-[11px] whitespace-nowrap font-medium">{start} - {end}</span>
      },
    }),
    columnHelper.accessor('bodyType', {
      header: 'BODY',
      cell: (info) => (
        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium uppercase">
          <div className="w-5 h-4 border border-slate-300 rounded-[2px] flex items-center justify-center p-[1px] opacity-60">
            <div className="w-[1px] h-full bg-slate-400 mx-auto" />
          </div>
          <span className="text-slate-500">{info.getValue() === "narrow_body" ? "Narrow" : "Wide"}</span>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'STATUS',
      cell: ({ row }) => {
        const isEditing = state.editingId === row.original.id;
        const currentStatus = isEditing && tempEditData ? tempEditData.status : row.original.status;

        return (
          <Toggle
            checked={currentStatus === "Active"}
            disabled={savingIds.has(row.original.id)}
            onChange={() => {
              if (isEditing && tempEditData) {
                setTempEditData({ ...tempEditData, status: tempEditData.status === "Active" ? "Inactive" : "Active" });
              } else {
                dispatch({ type: "TOGGLE_STATUS", payload: row.original.id });
              }
            }}
          />
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => {
        const isEditing = state.editingId === row.original.id;
        const isSaving = savingIds.has(row.original.id);

        if (isEditing) {
          return (
            <div className="flex items-center gap-3">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto" />
              ) : (
                <>
                  <button
                    onClick={() => handleSave(row.original.id)}
                    className="text-green-500 hover:text-green-700 transition-all hover:scale-110"
                  >
                    <Check className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="text-slate-400 hover:text-slate-600 transition-all hover:scale-110"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </>
              )}
            </div>
          )
        }

        return (
          <div className="flex items-center gap-3">
            <button
              className="text-slate-300 hover:text-primary transition-all hover:scale-110 hover:cursor-pointer"
              onClick={() => startEditing(row.original)}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              className="text-slate-300 hover:text-red-500 transition-all hover:scale-110 hover:cursor-pointer"
              onClick={() => dispatch({ type: "DELETE_BY_ID", payload: row.original.id })}
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: state.filteredData,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  })

  const { rows } = table.getRowModel()

  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 8,
  })

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">

        <div className="max-w-[1240px] mx-auto space-y-4">
          <TableFilters
            filters={state.filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
            aocOptions={aocOptions}
          />

          <div className="flex justify-between items-center bg-white p-4 min-h-16 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Flight Schedules</h2>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by flight no., origin, or destination…"
                value={state.filters.searchQuery}
                onChange={(e) =>
                  dispatch({ type: "SET_FILTER", payload: { searchQuery: e.target.value } })
                }
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              {state.filters.searchQuery && (
                <button
                  onClick={() => dispatch({ type: "SET_FILTER", payload: { searchQuery: "" } })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {Object.keys(rowSelection).length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold border border-red-200"
              >
                <Trash className="w-4 h-4" />
                Delete Selected ({Object.keys(rowSelection).length})
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200 overflow-hidden">
            <div className="overflow-y-auto h-[600px] relative" ref={parentRef}>
              <table className="w-full text-left border-collapse table-fixed">
                <colgroup>
                  <col className="w-[50px]" />
                  <col className="w-[100px]" />
                  <col className="w-[60px]" />
                  <col className="w-[100px]" />
                  <col className="w-[80px]" />
                  <col className="w-[100px]" />
                  <col className="w-[180px]" />
                  <col className="w-[150px]" />
                  <col className="w-[100px]" />
                  <col className="w-[80px]" />
                  <col className="w-[90px]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-[#f8fafc] border-b border-slate-100">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="px-4 py-3 text-[10px] font-bold text-slate-400 tracking-[0.1em] uppercase overflow-hidden text-ellipsis whitespace-nowrap">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {virtualizer.getVirtualItems().length > 0 && virtualizer.getVirtualItems()[0].start > 0 && (
                    <tr>
                      <td colSpan={11} style={{ height: `${virtualizer.getVirtualItems()[0].start}px`, border: 'none' }} />
                    </tr>
                  )}
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index]
                    return (
                      <tr
                        key={row.id}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        className={`group border-b border-slate-50 hover:bg-[#e7e7e7] transition-all ${row.getIsSelected() ? 'bg-[#e7e7e7]' : ''
                          }`}
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-4 align-middle overflow-hidden">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                  {virtualizer.getVirtualItems().length > 0 && (virtualizer.getTotalSize() - virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].end) > 0 && (
                    <tr>
                      <td colSpan={11} style={{ height: `${virtualizer.getTotalSize() - virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1].end}px`, border: 'none' }} />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default App
