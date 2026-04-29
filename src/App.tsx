import Layout from "./layouts/layout"
import { flightsData } from "./data/flights"
import type { Flight, State } from "./types/flight"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React, { useReducer, useState } from "react"
import { Pencil, ChevronDown } from "lucide-react"
import { Checkbox } from "./components/ui/checkbox"


const initialState: State = {
  data: (flightsData.flights.slice(0, 30)) as Flight[],
  filteredData: (flightsData.flights) as Flight[],
  editingId: null,
}

type Action = { type: "DELETE_BY_ID"; payload: string } | { type: "TOGGLE_STATUS"; payload: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "DELETE_BY_ID":
      return {
        ...state,
        data: state.data.filter((flight) => flight.id !== action.payload),
      }
    case "TOGGLE_STATUS":
      return {
        ...state,
        data: state.data.map(f => f.id === action.payload ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f)
      }
    default:
      return state
  }
}

const columnHelper = createColumnHelper<Flight>()

// Small helper components for cells
const DayCircle = ({ active, label }: { active: boolean, label: string }) => (
  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${active
    ? 'bg-[#5c59f2] text-white'
    : 'bg-[#f1f5f9] text-[#94a3b8]'
    }`}>
    {label}
  </div>
)

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#10b981]' : 'bg-[#e2e8f0]'}`}
  >
    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
)

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rowSelection, setRowSelection] = useState({});

  const columns = [
    {
      id: 'select',
      header: ({ table }: any) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
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
        <div className="bg-[#f8fafc] border border-slate-100 rounded px-2 py-0.5 text-[10px] font-mono text-slate-500 text-center w-fit">
          {info.getValue()}
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
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-slate-800 text-sm whitespace-nowrap">{row.original.std}</span>
          <span className="font-mono text-slate-400 text-[10px] -mt-0.5">
            {row.original.sta}
          </span>
        </div>
      ),
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
      cell: ({ row }) => (
        <Toggle
          checked={row.original.status === "Active"}
          onChange={() => dispatch({ type: "TOGGLE_STATUS", payload: row.original.id })}
        />
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'ACTIONS',
      cell: () => (
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
      ),
    }),
  ]

  const table = useReactTable({
    data: state.data,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto">
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col className="w-[50px]" />
                <col className="w-[80px]" />
                <col className="w-[60px]" />
                <col className="w-[100px]" />
                <col className="w-[80px]" />
                <col className="w-[100px]" />
                <col className="w-[180px]" />
                <col className="w-[120px]" />
                <col className="w-[100px]" />
                <col className="w-[80px]" />
                <col className="w-[80px]" />
              </colgroup>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-[#f8fafc] border-b border-slate-100">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-4 py-3 text-[10px] font-bold text-slate-400 tracking-[0.1em] uppercase overflow-hidden text-ellipsis whitespace-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className={`group border-b border-slate-50 last:border-0 hover:bg-[#c2c4c7] transition-all relative ${row.getIsSelected() ? 'bg-[#c2c4c7]' : ''}`}
                  >
                    {/* Selection indicator bar */}
                    {/* {row.getIsSelected() && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#5c59f2] z-10" />
                    )} */}
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-4 align-middle overflow-hidden">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default App
