import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/productmanager";
let connectionPromise = null;

const getConnectionString = () =>
  process.env.MONGODB_CONNECTIONSTRING ||
  process.env.MONGODB_URI ||
  DEFAULT_MONGODB_URI;

const maskConnectionString = (connectionString) =>
  connectionString.replace(/\/\/.*@/, "//***:***@");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const connectionString = getConnectionString();

  try {
    console.log("Dang ket noi MongoDB...");
    console.log("Connection string:", maskConnectionString(connectionString));

    connectionPromise = mongoose.connect(connectionString);
    await connectionPromise;

    console.log("MongoDB da ket noi thanh cong");
    console.log("Database:", mongoose.connection.db.databaseName);
    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    console.error("Loi khi ket noi MongoDB:", error.message);
    console.error(
      "Kiem tra lai connection string hoac dam bao MongoDB dang chay",
    );
    console.error("Chi tiet loi:", error);
    throw error;
  }
};

export default connectDB;
