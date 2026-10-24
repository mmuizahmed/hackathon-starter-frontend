// Same rounding the server uses when it derives HRA and medical, so the
// numbers on screen match the row that gets saved.
export function roundMoney(value) {
  const sign = value < 0 ? -1 : 1;
  return (sign * Math.round((Math.abs(value) + Number.EPSILON) * 100)) / 100;
}

export function deriveSalary(basic) {
  const amount = Number(basic);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const rounded = roundMoney(amount);
  const hra = roundMoney(rounded * 0.4);
  const medical = roundMoney(rounded * 0.1);
  const other = 0;
  return {
    basic: rounded,
    hra,
    medical,
    other,
    gross: roundMoney(rounded + hra + medical + other),
  };
}

// Paid days are the employed working days minus the days payroll deducts.
// Paid leave and a missing checkout stay in the count. Half days count as 0.5.
export function paidDayCount(inputs) {
  if (!inputs) return null;
  const employed = Number(inputs.employedWorkingDays);
  if (!Number.isFinite(employed)) return null;
  const absent = Number(inputs.absentDays) || 0;
  const unpaid = Number(inputs.unpaidLeaveDays) || 0;
  const half = Number(inputs.halfDays) || 0;
  const lateHalf = Number(inputs.latePenaltyHalfDays) || 0;
  return roundMoney(employed - absent - unpaid - half * 0.5 - lateHalf * 0.5);
}
