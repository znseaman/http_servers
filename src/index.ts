import express from "express";
import { handlerReadiness } from "./readiness";
import { handlerMetrics } from "./metrics";
import { handlerReset } from "./reset";
import { middlewareLogResponse, middlewareMetricsInc } from "./middleware";

const app = express();
const PORT = 7070;

app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);
