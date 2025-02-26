/** @format */

const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		const mongodbUrl = `mongodb+srv://nadsoft123:nadsoft123@cluster0.znlrw.mongodb.net/student-managment
?retryWrites=true&w=majority&appName=Cluster0`; // exposed because of testing
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
