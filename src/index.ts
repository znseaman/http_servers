import express from "express";
import { handlerReadiness } from "./api/readiness";
import { handlerMetrics } from "./api/metrics";
import { handlerReset } from "./api/reset";
import { handlerChirpValidate } from "./api/chirps";
import {
  middlewareHandleErrors,
  middlewareLogResponse,
  middlewareMetricsInc,
} from "./api/middleware";

const app = express();
const PORT = 7070;

// Built-in JSON body parsing middleware
app.use(express.json());

app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", handlerChirpValidate);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.use(middlewareHandleErrors);
