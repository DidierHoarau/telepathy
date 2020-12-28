import * as bodyParser from "body-parser";
import * as express from "express";
import { agentApi } from "./agentApi";
import { taskApi } from "./taskApi";

export const router = express.Router();
router.use(bodyParser.json());

router.use("/agents", agentApi);
router.use("/tasks", taskApi);
