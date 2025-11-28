// ============================================
// PLAYLIST ROUTES
// ============================================
// Defines all API endpoints for playlist operations (CRUD + video management)

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createPlayList,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist 
} from "../controllers/playlist.controller.js";

// ============================================
// INITIALIZE ROUTER
// ============================================
const router = Router()

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * GET PLAYLIST BY ID ROUTE
 * Retrieves detailed playlist information including all videos
 * 
 * Access Control:
 * - Public playlists: Accessible to everyone
 * - Private playlists: Only accessible to owner (enforced in controller)
 * 
 * @route GET /api/v1/playlists/:playlistId
 * @access Public (with privacy checks in controller)
 */
router.route('/:playlistId').get(getPlaylistById)

// ============================================
// PROTECTED ROUTES (Authentication Required)
// All routes below require verifyJWT middleware
// ============================================
router.use(verifyJWT)

/**
 * CREATE PLAYLIST ROUTE
 * Creates a new playlist for authenticated user
 * 
 * @route POST /api/v1/playlists
 * @access Private
 */
router.route('/').post(createPlayList)

/**
 * GET USER PLAYLISTS ROUTE
 * Retrieves paginated list of playlists for a specific user
 * 
 * @route GET /api/v1/playlists/user/:userId
 * @access Private (authenticated users can view any user's playlists)
 */
router.route('/user/:userId').get(getUserPlaylist)

/**
 * UPDATE & DELETE PLAYLIST ROUTES
 * Manage playlist metadata and lifecycle
 * 
 * PATCH: Update playlist name, description, or privacy settings
 * DELETE: Permanently delete the playlist
 * 
 * @route PATCH /api/v1/playlists/:playlistId
 * @route DELETE /api/v1/playlists/:playlistId
 * @access Private (only owner can modify)
 */
router.route('/:playlistId')
    .patch(updatePlaylist)
    .delete(deletePlaylist)

/**
 * ADD VIDEO TO PLAYLIST ROUTE
 * Adds a video to the specified playlist
 * 
 * @route PATCH /api/v1/playlists/add/:playlistId/:videoId
 * @access Private (only owner can add videos)
 */
router.route('/add/:playlistId/:videoId').patch(addVideoToPlaylist)

/**
 * REMOVE VIDEO FROM PLAYLIST ROUTE
 * Removes a video from the specified playlist
 * 
 * @route PATCH /api/v1/playlists/remove/:playlistId/:videoId
 * @access Private (only owner can remove videos)
 */
router.route('/remove/:playlistId/:videoId').patch(removeVideoFromPlaylist)

export default router