/** @format */

const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
	memberParentId: { type: String, required: true },
	memberName: { type: String, required: true },
	memberEmail: { type: String, required: true, unique: true, trim: true },
	memberAge: { type: Number, required: true },
});

module.exports = mongoose.model("Student", StudentSchema);
