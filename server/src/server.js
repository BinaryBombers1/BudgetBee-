import http from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { seedSystemCategories } from "./seeds/categories.js";
import { initSocket } from "./config/socket.js";

async function main() {
  await connectDB();
  await seedSystemCategories();

  const server = http.createServer(app);
  initSocket(server);

  const PORT = process.env.PORT || env.PORT || 8080;

  server.listen(PORT, "0.0.0.0", () => {
    console.log(` Campus Coin API running on port ${PORT}`);
    console.log(`WebSocket initialized`);
    console.log(` Environment: ${env.NODE_ENV || "production"}`);
  });

  process.on("SIGINT", async () => {
    server.close(() => process.exit(0));
  });

  process.on("SIGTERM", async () => {
    server.close(() => process.exit(0));
  });
}

main().catch((e) => {
  console.error("Fatal startup error:", e);
  process.exit(1);
});
