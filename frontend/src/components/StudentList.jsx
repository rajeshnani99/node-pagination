/** @format */

import React, { useState, useEffect } from "react";
import { Table, Button, Pagination, Form, Modal } from "react-bootstrap";
import {
	getStudents,
	deleteStudent,
	createMark,
	getMarks,
} from "../services/api";
import Swal from "sweetalert2";
import StudentForm from "./StudentForm";

const StudentList = () => {
	const [students, setStudents] = useState([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 5,
		totalPages: 0,
		total: 0,
	});
	const [showAddMarkModal, setShowAddMarkModal] = useState(false);
	const [showAddStudentModal, setShowAddStudentModal] = useState(false);
	const [markData, setMarkData] = useState({
		studentId: "",
		subject: "",
		score: "",
	});
	const [searchId, setSearchId] = useState("");

	useEffect(() => {
		fetchStudents();
	}, [pagination.page]);

	const fetchStudents = async () => {
		try {
			const response = await getStudents(pagination.page, pagination.limit);
			setStudents(response.data.data || []);
			setPagination((prev) => ({
				...prev,
				totalPages: response.data.metadata.totalPages || 0,
				total: response.data.metadata.total || 0,
			}));
		} catch (error) {
			console.error(
				"Error fetching students:",
				error.response?.data || error.message
			);
			setStudents([]);
		}
	};

	const handleDelete = async (id) => {
		const result = await Swal.fire({
			title: "Are you sure?",
			text: "You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Yes, delete it!",
		});

		if (result.isConfirmed) {
			try {
				await deleteStudent(id);
				fetchStudents();
				Swal.fire("Deleted!", "Student has been deleted.", "success");
			} catch (error) {
				Swal.fire(
					"Error",
					error.response?.data?.error || "Failed to delete student",
					"error"
				);
			}
		}
	};

	const handlePageChange = (newPage) => {
		setPagination((prev) => ({ ...prev, page: newPage }));
	};

	const handleAddMark = async () => {
		try {
			await createMark(markData.studentId, {
				subject: markData.subject,
				score: Number(markData.score),
			});
			setMarkData({ studentId: "", subject: "", score: "" });
			setShowAddMarkModal(false);
			Swal.fire("Success", "Mark added successfully!", "success");
		} catch (error) {
			Swal.fire(
				"Error",
				error.response?.data?.error || "Failed to add mark",
				"error"
			);
		}
	};

	const handleSearchMarks = async () => {
		if (!searchId) {
			Swal.fire("Error", "Please enter a Member Parent ID", "error");
			return;
		}
		try {
			const response = await getMarks(searchId);
			const marks = response.data;
			if (marks.length === 0) {
				Swal.fire("Info", "No marks found for this ID", "info");
			} else {
				const marksText = marks
					.map((m) => `${m.subject}: ${m.score}`)
					.join("\n");
				Swal.fire("Marks", `Marks for ${searchId}:\n${marksText}`, "info");
			}
		} catch (error) {
			Swal.fire(
				"Error",
				error.response?.data?.error || "Failed to fetch marks",
				"error"
			);
		}
	};

	const handleStudentAdded = () => {
		fetchStudents();
		setShowAddStudentModal(false);
	};

	return (
		<div className="mt-4">
			<h2>Student List</h2>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "15px",
				}}>
				{/* Left Side: Search Box and Button */}
				<div style={{ display: "flex", alignItems: "center" }}>
					<Form.Control
						type="text"
						placeholder="Search by Member Parent ID"
						value={searchId}
						onChange={(e) => setSearchId(e.target.value)}
						style={{ width: "200px", marginRight: "10px" }}
					/>
					<Button
						style={{
							backgroundColor: "#90EE90",
							borderColor: "#90EE90",
							color: "#808080",
						}}
						size="md"
						onClick={handleSearchMarks}>
						Search Marks
					</Button>
				</div>

				{/* Right Side: Add New Member and Add Marks Buttons */}
				<div>
					<Button
						style={{
							backgroundColor: "#90EE90",
							borderColor: "#90EE90",
							color: "#808080",
							marginRight: "10px",
						}}
						size="md"
						onClick={() => setShowAddStudentModal(true)}>
						Add New Member
					</Button>
					<Button
						style={{
							backgroundColor: "#90EE90",
							borderColor: "#90EE90",
							color: "#808080",
						}}
						size="md"
						onClick={() => setShowAddMarkModal(true)}>
						Add Marks
					</Button>
				</div>
			</div>

			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Member Parent ID</th>
						<th>Member Name</th>
						<th>Member Email</th>
						<th>Member Age</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{students.length > 0 ? (
						students.map((student) => (
							<tr key={student.memberParentId}>
								<td>{student.memberParentId}</td>
								<td>{student.memberName}</td>
								<td>{student.memberEmail}</td>
								<td>{student.memberAge}</td>
								<td>
									<Button
										style={{
											backgroundColor: "#FF0000",
											borderColor: "#FF0000",
											color: "#FFFFFF",
										}} // Red with white text
										size="md"
										onClick={() => handleDelete(student.memberParentId)}>
										Delete
									</Button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan="5" className="text-center">
								No students found
							</td>
						</tr>
					)}
				</tbody>
			</Table>

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}>
				<span>
					Page {pagination.page} of {pagination.totalPages}
				</span>
				{pagination.totalPages > 1 && (
					<Pagination>
						<Pagination.Prev
							onClick={() => handlePageChange(pagination.page - 1)}
							disabled={pagination.page === 1}
						/>
						{[...Array(pagination.totalPages)].map((_, index) => (
							<Pagination.Item
								key={index + 1}
								active={index + 1 === pagination.page}
								onClick={() => handlePageChange(index + 1)}>
								{index + 1}
							</Pagination.Item>
						))}
						<Pagination.Next
							onClick={() => handlePageChange(pagination.page + 1)}
							disabled={pagination.page === pagination.totalPages}
						/>
					</Pagination>
				)}
			</div>

			{/* Add Mark Modal */}
			<Modal
				show={showAddMarkModal}
				onHide={() => setShowAddMarkModal(false)}
				centered>
				<Modal.Header closeButton>
					<Modal.Title>Add Mark</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group className="mb-3">
							<Form.Label>
								Member Parent ID <span style={{ color: "red" }}>*</span>
							</Form.Label>
							<Form.Control
								type="text"
								value={markData.studentId}
								onChange={(e) =>
									setMarkData({ ...markData, studentId: e.target.value })
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>
								Subject <span style={{ color: "red" }}>*</span>
							</Form.Label>
							<Form.Control
								type="text"
								value={markData.subject}
								onChange={(e) =>
									setMarkData({ ...markData, subject: e.target.value })
								}
								required
							/>
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>
								Score <span style={{ color: "red" }}>*</span>
							</Form.Label>
							<Form.Control
								type="number"
								value={markData.score}
								onChange={(e) =>
									setMarkData({ ...markData, score: e.target.value })
								}
								required
							/>
						</Form.Group>
						<Button
							style={{
								backgroundColor: "#90EE90",
								borderColor: "#90EE90",
								color: "#808080",
							}}
							size="md"
							onClick={handleAddMark}>
							Add Mark
						</Button>
					</Form>
				</Modal.Body>
			</Modal>

			{/* Add Student Modal */}
			<StudentForm
				show={showAddStudentModal}
				onHide={() => setShowAddStudentModal(false)}
				onStudentAdded={handleStudentAdded}
			/>
		</div>
	);
};

export default StudentList;
