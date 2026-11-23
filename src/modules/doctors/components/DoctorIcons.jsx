function Icon({ children }) {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Path({ d }) {
  return (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  );
}

export function SearchIcon() {
  return (
    <Icon>
      <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </Icon>
  );
}

export function ClockIcon() {
  return (
    <Icon>
      <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
  );
}

export function EyeIcon() {
  return (
    <Icon>
      <Path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <Path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </Icon>
  );
}

export function PencilIcon() {
  return (
    <Icon>
      <Path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </Icon>
  );
}

export function TrashIcon() {
  return (
    <Icon>
      <Path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </Icon>
  );
}
