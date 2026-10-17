// CopyStatus from the server (JSON string enum) in Hebrew.
const labels = {
  Available: 'זמין',
  Loaned: 'מושאל',
  Maintenance: 'בתחזוקה',
  Retired: 'יצא משימוש',
};

export function copyStatusLabel(status) {
  return labels[status] ?? status;
}
