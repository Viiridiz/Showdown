const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI is missing bro");
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully.");
    } catch (error) {
        console.log("DB error:", error);
        process.exit(1);
    }
};

module.exports = { connectDB };