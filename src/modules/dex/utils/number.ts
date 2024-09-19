export const getChange = (
  valueNow: number | undefined,
  value24HoursAgo: number | undefined,
): number => {
  if (valueNow && value24HoursAgo) {
    const change = (valueNow - value24HoursAgo) / value24HoursAgo;
    if (isFinite(change)) return change;
  }
  return 0;
};

export const get2DayChange = (
  valueNow: string,
  value24HoursAgo: string,
  value48HoursAgo: string,
): [number, number] => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
  const previousChange = parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo);
  const adjustedPercentChange = (currentChange - previousChange) / previousChange;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};
