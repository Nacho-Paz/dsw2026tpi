export const DEFAULT_START_TIME = '08:00';

export const WEEK_DAYS = [
  { key: 'LUNES', label: 'Lunes', english: 'MONDAY', endTime: '16:00' },
  { key: 'MARTES', label: 'Martes', english: 'TUESDAY', endTime: '16:00' },
  {
    key: 'MIÉRCOLES',
    label: 'Miércoles',
    english: 'WEDNESDAY',
    endTime: '16:00',
  },
  { key: 'JUEVES', label: 'Jueves', english: 'THURSDAY', endTime: '16:00' },
  { key: 'VIERNES', label: 'Viernes', english: 'FRIDAY', endTime: '16:00' },
  { key: 'SÁBADO', label: 'Sábado', english: 'SATURDAY', endTime: '12:00' },
  { key: 'DOMINGO', label: 'Domingo', english: 'SUNDAY', endTime: '12:00' },
];

export const buildDefaultDays = () =>
  WEEK_DAYS.map(({ key, label, endTime }) => ({
    key,
    label,
    active: false,
    startTime: DEFAULT_START_TIME,
    endTime,
  }));
