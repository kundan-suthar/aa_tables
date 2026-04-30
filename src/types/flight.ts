

export type Flight = {
  id: string; // e.g. "FL-0001"
  aoc: string; // airline/operator code
  flightNumber: string;

  origin: string; // IATA code (e.g. "DAD")
  destination: string; // IATA code (e.g. "CEB")

  std: string; // scheduled time of departure (HH:mm)
  sta: string; // scheduled time of arrival (HH:mm)

  daysOfOperation: number[]; // 1–7 (Mon–Sun or Sun–Sat depending on system)

  bodyType: "narrow_body" | "wide_body"; // extend if needed

  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)

  status: "Active" | "Inactive" | "Cancelled"; // extendable
};


export type State = {
  data: Flight[];
  filteredData: Flight[];
  editingId: string | null;
};

export interface FilterCriteria {
  dateRange: { from: string | null; to: string | null };
  days: number[];
  status: "Active" | "Inactive" | "all";
  aoc: string;
  bodyType: "narrow_body" | "wide_body" | "all";
  searchQuery: string;
}
