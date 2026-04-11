import express from "express";
import { handlerReadiness } from "./api/readiness";
import { handlerMetrics } from "./api/metrics";
import {
  handlerCreateChirp,
  handlerDeleteChirp,
  handlerGetChirp,
  handlerGetChirps,
} from "./api/chirps";
import {
  handlerCreateUser,
  handlerDeleteUsers,
  handlerUpdateUser,
} from "./api/users";
import {
  middlewareHandleErrors,
  middlewareLogResponse,
  middlewareMetricsInc,
} from "./api/middleware";

import { config } from "./config";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { handlerLogin, handlerRefresh, handlerRevoke } from "./api/auth";
import { handlerWebhooks } from "./api/webhooks";

const migrationClient = postgres(config.db.url, { max: 1 });
(async () => {
  await migrate(drizzle(migrationClient), config.db.migrationConfig);
})();

const app = express();

// Built-in JSON body parsing middleware
app.use(express.json());

app.use(middlewareLogResponse);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});

// @ts-ignore
app.post("/api/login", handlerLogin);
app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", handlerGetChirps);
app.get("/api/chirps/:chirpId", handlerGetChirp);
app.delete("/api/chirps/:chirpId", handlerDeleteChirp);
app.get("/api/healthz", handlerReadiness);
app.post("/api/users", handlerCreateUser);
app.put("/api/users", handlerUpdateUser);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerDeleteUsers);
app.post("/api/polka/webhooks", handlerWebhooks);

app.use(middlewareHandleErrors);
