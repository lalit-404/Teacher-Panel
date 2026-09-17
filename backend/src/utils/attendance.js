function pad(n) {
  return String(n).padStart(2, "0");
}

function todayKeyFor(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildMonth(year, month, todayKey, records) {
  const byDate = new Map(records.map((r) => [r.dateKey, r]));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = todayKeyFor(date);
    let entry = {
      key,
      day: d,
      dow: date.getDay(),
      status: "upcoming",
      inMin: null,
      outMin: null
    };

    if (date.getDay() === 0) {
      // Sunday is the only weekly holiday. Saturday is a working day.
      entry.status = "weekend";
    } else if (key <= todayKey) {
      const record = byDate.get(key);
      if (record) {
        entry = { ...entry, ...record, key, day: d, dow: date.getDay() };
      } else {
        entry.status = "absent";
      }
    }

    days.push(entry);
  }
  return days;
}

function dayTypeFor(date) {
  if (date.getDay() === 0) return { type: "weekend" };
  return null;
}

function summarizeMonth(days) {
  const workingDays = days.filter((d) =>
    ["present", "late", "absent"].includes(d.status)
  );
  const present = days.filter((d) => d.status === "present").length;
  const late = days.filter((d) => d.status === "late").length;
  const absent = days.filter((d) => d.status === "absent").length;
  const attended = present + late;
  const pct = workingDays.length
    ? Math.round((attended / workingDays.length) * 100)
    : 0;

  return {
    present,
    late,
    absent,
    workingDays: workingDays.length,
    pct
  };
}

module.exports = {
  pad,
  todayKeyFor,
  buildMonth,
  dayTypeFor,
  summarizeMonth
};
