/** @format */

const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const Mark = require("../models/mark");

// Create a new student record
router.post("/", async (req, res) => {
	try {
		const { memberParentId, memberName, memberEmail, memberAge } = req.body;

		// Validate required fields
		if (!memberParentId || !memberName || !memberEmail || !memberAge) {
			return res
				.status(400)
				.json({ error: "Member Parent ID, name, email, and age are required" });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(memberEmail)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Validate age (must be a number)
		if (isNaN(memberAge) || memberAge <= 0) {
			return res.status(400).json({ error: "Invalid age provided" });
		}

		// Check if the email or memberParentId already exists
		const existingStudent = await Student.findOne({
			$or: [{ memberEmail }, { memberParentId }],
		});
		if (existingStudent) {
			return res
				.status(400)
				.json({ error: "Member Parent ID or email already exists" });
		}

		// Create and save student
		const student = new Student({
			memberParentId,
			memberName,
			memberEmail,
			memberAge,
		});
		await student.save();

		// Respond with created student data
		res.status(201).json({
			memberParentId: student.memberParentId,
			memberName: student.memberName,
			memberEmail: student.memberEmail,
			memberAge: student.memberAge,
			createdAt: student.createdAt,
			updatedAt: student.updatedAt,
		});
	} catch (error) {
		console.error("Error creating student:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Retrieve a list of all students
router.get("/", async (req, res) => {
	try {
		const { page = 1, limit = 5 } = req.query;
		const parsedPage = parseInt(page);
		const parsedLimit = parseInt(limit);

		if (isNaN(parsedPage) || parsedPage < 1) {
			return res.status(400).json({ error: "Invalid page number" });
		}
		if (isNaN(parsedLimit) || parsedLimit < 1) {
			return res.status(400).json({ error: "Invalid limit value" });
		}

		const skip = (parsedPage - 1) * parsedLimit;
		const students = await Student.find()
			.skip(skip)
			.limit(parsedLimit)
			.sort({ createdAt: -1 });

		const total = await Student.countDocuments();
		const totalPages = Math.ceil(total / parsedLimit);

		res.json({
			data: students.map((student) => ({
				memberParentId: student.memberParentId,
				memberName: student.memberName,
				memberEmail: student.memberEmail,
				memberAge: student.memberAge,
				createdAt: student.createdAt,
				updatedAt: student.updatedAt,
			})),
			metadata: {
				total,
				page: parsedPage,
				limit: parsedLimit,
				totalPages,
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Retrieve a single student by custom ID with marks
router.get("/:id", async (req, res) => {
	try {
		const student = await Student.findOne({ memberParentId: req.params.id });
		if (!student) {
			return res.status(404).json({ error: "Student not found" });
		}

		const marks = await Mark.find({ studentId: student.memberParentId });
		res.json({
			memberParentId: student.memberParentId,
			memberName: student.memberName,
			memberEmail: student.memberEmail,
			memberAge: student.memberAge,
			createdAt: student.createdAt,
			updatedAt: student.updatedAt,
			marks: marks.map((mark) => ({
				_id: mark._id,
				studentId: mark.studentId,
				subject: mark.subject,
				score: mark.score,
				createdAt: mark.createdAt,
				updatedAt: mark.updatedAt,
			})),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Update a student's information
router.put("/:id", async (req, res) => {
	try {
		const { memberName, memberEmail, memberAge } = req.body;
		if (!memberName || !memberEmail || !memberAge) {
			return res
				.status(400)
				.json({ error: "Name, email, and age are required" });
		}

		const student = await Student.findOneAndUpdate(
			{ memberParentId: req.params.id },
			{ memberName, memberEmail, memberAge },
			{ new: true, runValidators: true }
		);

		if (!student) {
			return res.status(404).json({ error: "Student not found" });
		}

		res.json({
			memberParentId: student.memberParentId,
			memberName: student.memberName,
			memberEmail: student.memberEmail,
			memberAge: student.memberAge,
			createdAt: student.createdAt,
			updatedAt: student.updatedAt,
		});
	} catch (error) {
		if (error.code === 11000) {
			res.status(400).json({ error: "Email already exists" });
		} else {
			res.status(400).json({ error: error.message });
		}
	}
});

// Delete a student record
router.delete("/:id", async (req, res) => {
	try {
		const student = await Student.findOneAndDelete({
			memberParentId: req.params.id,
		});
		if (!student) {
			return res.status(404).json({ error: "Student not found" });
		}

		await Mark.deleteMany({ studentId: req.params.id });
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Create a new mark for a student
router.post("/:id/marks", async (req, res) => {
	try {
		const { subject, score } = req.body;
		const studentId = req.params.id;

		const student = await Student.findOne({ memberParentId: studentId });
		if (!student) {
			return res.status(404).json({ error: "Student not found" });
		}

		if (!subject || typeof score !== "number") {
			return res
				.status(400)
				.json({ error: "Subject and score (number) are required" });
		}

		const mark = new Mark({ studentId, subject, score });
		await mark.save();
		res.status(201).json({
			_id: mark._id,
			studentId: mark.studentId,
			subject: mark.subject,
			score: mark.score,
			createdAt: mark.createdAt,
			updatedAt: mark.updatedAt,
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Retrieve all marks for a student
router.get("/:id/marks", async (req, res) => {
	try {
		const studentId = req.params.id;

		const student = await Student.findOne({ memberParentId: studentId });
		if (!student) {
			return res.status(404).json({ error: "Student not found" });
		}

		const marks = await Mark.find({ studentId });
		res.json(
			marks.map((mark) => ({
				_id: mark._id,
				studentId: mark.studentId,
				subject: mark.subject,
				score: mark.score,
				createdAt: mark.createdAt,
				updatedAt: mark.updatedAt,
			}))
		);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
