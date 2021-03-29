import * as bodyParser from "body-parser";
import * as express from "express";
import { agentApi } from "./agentApi";
import { taskApi } from "./taskApi";
import { userApi } from "./userApi";

export const router = express.Router();
router.use(bodyParser.json());

router.use("/agents", agentApi);
router.use("/tasks", taskApi);
router.use("/users", userApi);
