/** @format */

const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		const mongodbUrl = "please add your database here";
		await mongoose.connect(mongodbUrl, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("MongoDB connected");
	} catch (error) {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	}
};

module.exports = connectDB;
