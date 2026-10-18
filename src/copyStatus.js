// CopyStatus from the server (JSON string enum) in Hebrew.
const labels = {
  Available: 'זמין',
  Loaned: 'מושאל',
  Maintenance: 'בתחזוקה',
  Retired: 'יצא משימוש',
};

// CopyCondition, in the server's order.
const conditionLabels = {
  New: 'חדש',
  Good: 'טוב',
  Fair: 'סביר',
  NeedsRepair: 'דורש תיקון',
};

export const copyStatuses = Object.keys(labels);
export const copyConditions = Object.keys(conditionLabels);

export function copyStatusLabel(status) {
  return labels[status] ?? status;
}

export function copyConditionLabel(condition) {
  return conditionLabels[condition] ?? condition;
}
