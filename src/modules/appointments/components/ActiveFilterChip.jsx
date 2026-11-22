function ActiveFilterChip({ label, value, onRemove, className = "bg-sky-100/70 text-sky-800" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}: {value}
      <button type="button" onClick={onRemove} aria-label={`Quitar filtro ${label}`} className="font-bold hover:opacity-70">
        ×
      </button>
    </span>
  );
}

export default ActiveFilterChip;