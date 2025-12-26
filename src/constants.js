// ============================================
// DATABASE CONFIGURATION CONSTANTS
// ============================================
// Centralized database name constant used across the application.
// Using a constant prevents typos and makes it easy to change the database name project-wide.

/**
 * DB_NAME - MongoDB Database Name
 * 
 * Purpose:
 * - Ensures consistent database name across all database connections
 * - Single source of truth for the database identifier
 * - Easy to update if project name changes
 * 
 * Usage:
 * - Used in db_connection.js when establishing MongoDB connection
 * - Format: mongodb://localhost:27017/VidNest
 */
export const DB_NAME = "VidNest"