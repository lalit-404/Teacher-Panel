import { api } from "./client";

export async function fetchTeachers() {
  const data = await api.get("/teachers");
  return data.teachers;
}

export async function addTeacher(input) {
  const data = await api.post("/teachers", input);
  return data.teacher;
}
