export const PAGE_SIZE = 10;
// TODO: el backend pagina los catálogos; pedimos una sola página grande (limitación conocida)
export const CATALOG_PAGE_SIZE = 100;
export const MAX_DNI_LENGTH = 10;
export const LOAD_ERROR = "No se pudieron cargar los registros de citas.";
export const CATALOG_ERROR = "No se pudieron cargar especialidades y doctores.";

export const INITIAL_FILTERS = { dni: "", specialtyId: "", doctorId: "", date: "" };

const STATUS_CONFIG = {
  BOOKED: { label: "CONFIRMADO", badgeClass: "bg-med-active-bg text-med-active-text", dotClass: "bg-med-active-text" },
  CANCELLED: { label: "CANCELADO", badgeClass: "bg-med-danger-bg text-med-danger-text", dotClass: "bg-med-danger-text" },
  ATTENDED: { label: "ATENDIDO", badgeClass: "bg-slate-100 text-slate-700", dotClass: "bg-slate-500" },
  NO_SHOW: { label: "NO ASISTIÓ", badgeClass: "bg-amber-50 text-amber-700", dotClass: "bg-amber-500" },
};

export const getStatusInfo = (status) =>
  STATUS_CONFIG[String(status).toUpperCase()] ?? {
    label: String(status ?? "DESCONOCIDO"),
    badgeClass: "bg-slate-100 text-slate-700",
    dotClass: "bg-slate-500",
  };