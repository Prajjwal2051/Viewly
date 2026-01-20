import express from "express";
import { healthCheck } from "../controllers/health.controller.js";

const router = express.Router();

router.get('/users/health',healthCheck)

export default router