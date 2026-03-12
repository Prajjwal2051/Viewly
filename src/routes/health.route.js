// ============================================================
// Copyright (c) 2026 Prajjwal (github.com/Prajjwal2051)
// Project : VidNest — Video Sharing Platform
// License : Proprietary — All Rights Reserved
// Unauthorized copying, modification, or distribution of this
// file, via any medium, is strictly prohibited.
// ============================================================
import express from "express";
import { healthCheck } from "../controllers/health.controller.js";

const router = express.Router();

router.get('/users/health',healthCheck)

export default router