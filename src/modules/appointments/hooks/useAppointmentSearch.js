import { useEffect, useState } from "react";
import AppointmentsService from "../services/AppointmentsService";
import {
  INITIAL_FILTERS,
  PAGE_SIZE,
  LOAD_ERROR,
  CATALOG_ERROR,
} from "../constants/appointmentConstants";

const nowLabel = () =>
  new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

export default function useAppointments() {
  const [filters, setFilters] = useState(INITIAL_FILTERS); // lo que se escribe
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS); // lo que se buscó
  const [pageIndex, setPageIndex] = useState(1);

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [catalogError, setCatalogError] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("—");
  const [reloadKey, setReloadKey] = useState(0);

  // Catálogos para los selects
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingCatalogs(true);
      setCatalogError(null);
      try {
        const [s, d] = await Promise.all([
          AppointmentsService.getSpecialties(),
          AppointmentsService.getDoctors(),
        ]);
        if (ignore) return;
        setSpecialties(s);
        setDoctors(d);
      } catch {
        if (!ignore) setCatalogError(CATALOG_ERROR);
      } finally {
        if (!ignore) setLoadingCatalogs(false);
      }
    })();
    return () => { ignore = true; };
  }, [reloadKey]);

  // Búsqueda paginada
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await AppointmentsService.searchAppointments({
          ...appliedFilters,
          pageIndex,
          pageSize: PAGE_SIZE,
        });
        if (ignore) return;
        setAppointments(result.items);
        setTotal(result.total);
        setLastUpdated(nowLabel());
      } catch {
        if (ignore) return;
        setError(LOAD_ERROR);
        setAppointments([]);
        setTotal(0);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [appliedFilters, pageIndex, reloadKey]);

  // Doctores según la especialidad elegida (el doctor trae specialty.specialtyId)
  const filteredDoctors = filters.specialtyId
    ? doctors.filter((d) => String(d.specialty?.specialtyId) === String(filters.specialtyId))
    : doctors;

  const changeFilter = (field, value) =>
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "specialtyId" ? { doctorId: "" } : {}),
    }));

  const applyFilters = (e) => {
    e.preventDefault();
    setPageIndex(1);
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setPageIndex(1);
  };

  const removeFilter = (field) => {
    const updated = { ...appliedFilters, [field]: "" };
    setFilters(updated);
    setAppliedFilters(updated);
    setPageIndex(1);
  };

  const retry = () => setReloadKey((k) => k + 1);

  return {
    filters, appliedFilters, specialties, doctors, filteredDoctors,
    loadingCatalogs, catalogError, appointments, total, pageIndex,
    loading, error, lastUpdated,
    changeFilter, applyFilters, clearFilters, removeFilter, setPageIndex, retry,
  };
}