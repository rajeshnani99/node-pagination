/** @format */

import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { createStudent } from "../services/api";
import Swal from "sweetalert2";

const StudentForm = ({ show, onHide, onStudentAdded }) => {
	const [formData, setFormData] = useState({
		memberParentId: "",
		memberName: "",
		memberEmail: "",
		memberAge: "",
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const { memberParentId, memberName, memberEmail, memberAge } = formData;
		if (!memberParentId || !memberName || !memberEmail || !memberAge) {
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "All fields are required. Please fill them in.",
			});
			return;
		}

		try {
			const response = await createStudent(formData);
			console.log("API Response:", response.data);
			setFormData({
				memberParentId: "",
				memberName: "",
				memberEmail: "",
				memberAge: "",
			});
			Swal.fire({
				icon: "success",
				title: "Success",
				text: "Student added successfully!",
			});
			onStudentAdded();
		} catch (error) {
			console.error("API Error:", error.response?.data || error.message);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: error.response?.data?.error || "Failed to add student",
			});
		}
	};

	return (
		<Modal show={show} onHide={onHide} centered>
			<Modal.Header closeButton>
				<Modal.Title>Add New Student</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					<Form.Group className="mb-3">
						<Form.Label>
							Member Parent ID <span style={{ color: "red" }}>*</span>
						</Form.Label>
						<Form.Control
							type="text"
							name="memberParentId"
							value={formData.memberParentId}
							onChange={handleChange}
							required
							placeholder="e.g., STU001"
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>
							Member Name <span style={{ color: "red" }}>*</span>
						</Form.Label>
						<Form.Control
							type="text"
							name="memberName"
							value={formData.memberName}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>
							Member Email <span style={{ color: "red" }}>*</span>
						</Form.Label>
						<Form.Control
							type="email"
							name="memberEmail"
							value={formData.memberEmail}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>
							Member Age <span style={{ color: "red" }}>*</span>
						</Form.Label>
						<Form.Control
							type="number"
							name="memberAge"
							value={formData.memberAge}
							onChange={handleChange}
							required
						/>
					</Form.Group>
					<Button variant="primary" type="submit">
						Add Student
					</Button>
				</Form>
			</Modal.Body>
		</Modal>
	);
};

export default StudentForm;
