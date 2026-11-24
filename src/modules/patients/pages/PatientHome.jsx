import { useNavigate } from 'react-router-dom';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import useBookAppointment from '../hooks/useBookAppointment';
import { getDateKey, formatCalendarDate } from '../utils/calendarHelpers';

function PatientHome() {
  const navigate = useNavigate();
  const {
    specialties,
    filteredDoctors,
    specialtyId,
    doctorId,
    weekDays,
    weekOffset,
    slots,
    slotsByDate,
    slotId,
    setSlotId,
    selectedSlot,
    canGoNextWeek,
    reason,
    setReason,
    loadingDoctors,
    loadingSlots,
    saving,
    errorMessage,
    successMessage,
    handleSpecialtyChange,
    handleDoctorChange,
    goToPreviousWeek,
    goToNextWeek,
    bookAppointment,
  } = useBookAppointment();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-primary-900">
          Reservar turno médico
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Selecciona un médico, un horario y el motivo de la consulta.
        </p>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          <p>{successMessage}</p>
          <button
            type="button"
            className="underline font-semibold mt-1"
            onClick={() => navigate('/appointments')}
          >
            Ver mis turnos
          </button>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={bookAppointment} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="specialty" className="text-sm font-semibold">
              Especialidad
            </label>
            <select
              id="specialty"
              value={specialtyId}
              onChange={(event) => handleSpecialtyChange(event.target.value)}
              disabled={loadingDoctors || specialties.length === 0}
              className="w-full border border-med-border rounded-lg px-3 py-2.5 text-sm"
            >
              {specialties.length === 0 ? (
                <option value="">
                  {loadingDoctors
                    ? 'Cargando especialidades…'
                    : 'No hay especialidades disponibles'}
                </option>
              ) : (
                specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="doctor" className="text-sm font-semibold">
              Médico
            </label>
            <select
              id="doctor"
              value={doctorId}
              onChange={(event) => handleDoctorChange(event.target.value)}
              disabled={loadingDoctors || filteredDoctors.length === 0}
              className="w-full border border-med-border rounded-lg px-3 py-2.5 text-sm"
            >
              {loadingDoctors ? (
                <option>Cargando médicos…</option>
              ) : filteredDoctors.length === 0 ? (
                <option value="">No hay médicos para esta especialidad</option>
              ) : (
                filteredDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                    {doctor.specialty?.name
                      ? ` · ${doctor.specialty.name}`
                      : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-med-text-main">
                  Horarios disponibles
                </h2>
                <p className="text-xs text-med-text-muted mt-1">
                  Elegí un día y un horario de 30 minutos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousWeek}
                  disabled={weekOffset === 0 || loadingSlots}
                  aria-label="Ver semana anterior"
                >
                  ‹
                </Button>
                <span className="min-w-32 text-center text-xs font-medium text-med-text-sub">
                  {formatCalendarDate(weekDays[0])} –{' '}
                  {formatCalendarDate(weekDays[6])}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToNextWeek}
                  disabled={!canGoNextWeek || loadingSlots}
                  aria-label="Ver semana siguiente"
                >
                  ›
                </Button>
              </div>
            </div>

            {loadingSlots ? (
              <p className="py-8 text-center text-sm text-med-text-muted">
                Cargando horarios…
              </p>
            ) : slots.length === 0 ? (
              <p className="py-8 text-center text-sm text-med-text-muted">
                No hay horarios disponibles para este médico.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {weekDays.map((date) => {
                  const dateKey = getDateKey(date);
                  const daySlots = slotsByDate[dateKey] ?? [];

                  return (
                    <section
                      key={dateKey}
                      className="min-h-36 rounded-lg border border-med-border bg-white p-2"
                    >
                      <div className="mb-2 border-b border-med-border pb-2 text-center">
                        <p className="text-[10px] font-semibold uppercase text-med-text-muted">
                          {date.toLocaleDateString('es-AR', {
                            weekday: 'short',
                          })}
                        </p>
                        <p className="text-sm font-bold text-med-text-main">
                          {date.getDate()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {daySlots.length === 0 ? (
                          <p className="pt-2 text-center text-[10px] text-med-text-muted">
                            Sin horarios
                          </p>
                        ) : (
                          daySlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              aria-pressed={slotId === slot.id}
                              onClick={() => setSlotId(slot.id)}
                              className={`rounded-md border px-1 py-1.5 text-[11px] font-medium transition ${
                                slotId === slot.id
                                  ? 'border-med-primary-700 bg-med-primary-700 text-white'
                                  : 'border-med-border text-med-text-main hover:border-med-primary-600 hover:bg-med-primary-50'
                              }`}
                            >
                              {slot.startTime}
                            </button>
                          ))
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {selectedSlot && (
              <p className="rounded-lg bg-med-primary-50 p-3 text-xs text-med-primary-900">
                Turno seleccionado: {selectedSlot.slotDate} a las{' '}
                {selectedSlot.startTime}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reason" className="text-sm font-semibold">
              Motivo de la consulta
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={5}
              rows={3}
              className="w-full border border-med-border rounded-lg px-3 py-2.5 text-sm"
              placeholder="Describe brevemente el motivo"
            />
          </div>

          <Button type="submit" disabled={saving || !slotId}>
            {saving ? 'Reservando…' : 'Confirmar turno'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default PatientHome;
