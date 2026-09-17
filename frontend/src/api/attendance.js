import { api } from "./client";

export function fetchTeacherMonth(teacherId, year, month) {
  return api.get(`/attendance/teacher/${teacherId}?year=${year}&month=${month}`);
}

export function fetchTodayRoster({ search = "", page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    pageSize: String(pageSize),
  });
  return api.get(`/attendance/today?${params.toString()}`);
}

export function fetchMonthlySummary(year, month) {
  return api.get(`/attendance/summary?year=${year}&month=${month}`);
}

