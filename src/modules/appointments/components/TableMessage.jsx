function TableMessage({ colSpan = 5, children, action }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-xs text-med-text-muted">
        {children}
        {action}
      </td>
    </tr>
  );
}

export default TableMessage;