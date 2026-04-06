import express from "express";
import { handlerReadiness } from "./readiness";
import { handlerMetrics } from "./metrics";
import { handlerReset } from "./reset";
import { handlerChirpValidate } from "./chirps";
import { middlewareLogResponse, middlewareMetricsInc } from "./middleware";

const app = express();
const PORT = 7070;

app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerChirpValidate);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
