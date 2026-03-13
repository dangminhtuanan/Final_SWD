import connectDB from "./config/db.js";
import app, { startOrderCompletionCron } from "./app.js";

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => {
    startOrderCompletionCron();
    app.listen(PORT, () => {
      console.log(`Server bat dau tren cong ${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/swagger`);
    });
  })
  .catch((error) => {
    console.error("Khong the khoi dong server:", error);
    process.exit(1);
  });
