/** @format */

const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
	{
		studentId: { type: String, required: true },
		subject: { type: String, required: true },
		score: { type: Number, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Mark", markSchema);
