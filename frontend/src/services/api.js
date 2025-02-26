/** @format */

import axios from "axios";

const API_URL = "/api/students";

export const getStudents = (page, limit) =>
	axios.get(`${API_URL}?page=${page}&limit=${limit}`);

export const getStudent = (id) => axios.get(`${API_URL}/${id}`);

export const createStudent = (studentData) => axios.post(API_URL, studentData);

export const updateStudent = (id, studentData) =>
	axios.put(`${API_URL}/${id}`, studentData);

export const deleteStudent = (id) => axios.delete(`${API_URL}/${id}`);

export const createMark = (id, markData) =>
	axios.post(`${API_URL}/${id}/marks`, markData);

export const getMarks = (id) => axios.get(`${API_URL}/${id}/marks`);
