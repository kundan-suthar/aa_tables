import { useReducer, useState, useMemo } from "react";
import { flightsData } from "../data/flights";
import type { FilterCriteria, Flight, State } from "../types/flight";

// ─── Types ────────────────────────────────────────────────────────────────────

type FlightState = State & { filters: FilterCriteria };

type Action =
  | { type: "SET_DATA"; payload: Flight[] }
  | { type: "DELETE_BY_ID"; payload: string }
  | { type: "DELETE_MULTIPLE"; payload: string[] }
  | { type: "TOGGLE_STATUS"; payload: string }
  | { type: "EDIT_FLIGHT"; payload: string | null }
  | { type: "UPDATE_FLIGHT"; payload: Flight }
  | { type: "SET_FILTER"; payload: Partial<FilterCriteria> }
  | { type: "CLEAR_FILTERS" };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialFilters: FilterCriteria = {
  dateRange: { from: null, to: null },
  days: [],
  status: "all",
  aoc: "all",
  bodyType: "all",
  searchQuery: "",
};

const initialState: FlightState = {
  data: flightsData.flights as Flight[],
  filteredData: flightsData.flights as Flight[],
  editingId: null,
  filters: initialFilters,
};

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

function filterFlights(data: Flight[], filters: FilterCriteria): Flight[] {
  return data.filter((flight) => {
    if (filters.status !== "all" && flight.status !== filters.status) return false;
    if (filters.bodyType !== "all" && flight.bodyType !== filters.bodyType) return false;
    if (filters.aoc !== "all" && flight.aoc !== filters.aoc) return false;

    if (filters.days.length > 0) {
      if (!flight.daysOfOperation.some((d) => filters.days.includes(d))) return false;
    }

    if (filters.dateRange.from && filters.dateRange.to) {
      if (!(flight.startDate <= filters.dateRange.from && flight.endDate >= filters.dateRange.to)) {
        return false;
      }
    }

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      const matches =
        flight.flightNumber.toLowerCase().includes(q) ||
        flight.origin.toLowerCase().includes(q) ||
        flight.destination.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: FlightState, action: Action): FlightState {
  switch (action.type) {
    case "SET_DATA": {
      return {
        ...state,
        data: action.payload,
        filteredData: filterFlights(action.payload, state.filters),
      };
    }
    case "DELETE_BY_ID": {
      const nextData = state.data.filter((f) => f.id !== action.payload);
      return { ...state, data: nextData, filteredData: filterFlights(nextData, state.filters) };
    }
    case "DELETE_MULTIPLE": {
      const nextData = state.data.filter((f) => !action.payload.includes(f.id));
      return { ...state, data: nextData, filteredData: filterFlights(nextData, state.filters) };
    }
    case "TOGGLE_STATUS": {
      const nextData = state.data.map((f) =>
        f.id === action.payload
          ? { ...f, status: (f.status === "Active" ? "Inactive" : "Active") as Flight["status"] }
          : f
      );
      return { ...state, data: nextData, filteredData: filterFlights(nextData, state.filters) };
    }
    case "EDIT_FLIGHT": {
      return { ...state, editingId: action.payload };
    }
    case "UPDATE_FLIGHT": {
      const nextData = state.data.map((f) => (f.id === action.payload.id ? action.payload : f));
      return {
        ...state,
        data: nextData,
        filteredData: filterFlights(nextData, state.filters),
        editingId: null,
      };
    }
    case "SET_FILTER": {
      const nextFilters = { ...state.filters, ...action.payload };
      return { ...state, filters: nextFilters, filteredData: filterFlights(state.data, nextFilters) };
    }
    case "CLEAR_FILTERS": {
      return { ...state, filters: initialFilters, filteredData: state.data };
    }
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFlightSchedules() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
  const [tempEditData, setTempEditData] = useState<Flight | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────

  const aocOptions = useMemo(
    () => Array.from(new Set(state.data.map((f) => f.aoc))).sort(),
    [state.data]
  );

  const selectedCount = Object.keys(rowSelection).length;

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleFilterChange = (filters: Partial<FilterCriteria>) => {
    dispatch({ type: "SET_FILTER", payload: filters });
  };

  const handleClearFilters = () => {
    dispatch({ type: "CLEAR_FILTERS" });
  };

  const handleSearchChange = (searchQuery: string) => {
    dispatch({ type: "SET_FILTER", payload: { searchQuery } });
  };

  const startEditing = (flight: Flight) => {
    setTempEditData({ ...flight });
    dispatch({ type: "EDIT_FLIGHT", payload: flight.id });
  };

  const cancelEditing = () => {
    setTempEditData(null);
    dispatch({ type: "EDIT_FLIGHT", payload: null });
  };

  const updateTempEdit = (patch: Partial<Flight>) => {
    setTempEditData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async (id: string) => {
    if (!tempEditData) return;

    setSavingIds((prev) => new Set(prev).add(id));
    setErrorIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    try {
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => (Math.random() > 0.1 ? resolve() : reject("Failed to save")), 1000);
      });

      dispatch({ type: "UPDATE_FLIGHT", payload: tempEditData });
      setTempEditData(null);
    } catch {
      setErrorIds((prev) => new Set(prev).add(id));
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteById = (id: string) => {
    dispatch({ type: "DELETE_BY_ID", payload: id });
  };

  const handleDeleteSelected = () => {
    dispatch({ type: "DELETE_MULTIPLE", payload: Object.keys(rowSelection) });
    setRowSelection({});
  };

  const handleToggleStatus = (id: string) => {
    dispatch({ type: "TOGGLE_STATUS", payload: id });
  };

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    // State
    state,
    tempEditData,
    rowSelection,
    savingIds,
    errorIds,
    aocOptions,
    selectedCount,

    // Row selection (passed directly to react-table)
    setRowSelection,

    // Actions
    handleFilterChange,
    handleClearFilters,
    handleSearchChange,
    startEditing,
    cancelEditing,
    updateTempEdit,
    handleSave,
    handleDeleteById,
    handleDeleteSelected,
    handleToggleStatus,
  };
}