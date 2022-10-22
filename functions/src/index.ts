import * as functions from "firebase-functions";
import cors from "cors";
import express from "express";
import admin from "firebase-admin";
import { serviceAccount } from "./config/firebase";
import { RuntimeOptions } from "firebase-functions";
import mainRoutes from "./routes/mainRoutes";
import dotenv from "dotenv";

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
export const db = admin.firestore();

const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: "2GB",
};

const app: express.Application = express();

app.use(express.urlencoded({ extended: false })).use(express.json());

app.use(cors({ origin: true }));

app.use("/api/", mainRoutes);

app.get("/", (_req: express.Request, res: express.Response) =>
  res.status(200).send("Hey there!")
);

exports.tasks = functions.runWith(runtimeOpts).https.onRequest(app);
