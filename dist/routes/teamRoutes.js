"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teamController_js_1 = require("../controllers/teamController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
router.get('/details/:token', teamController_js_1.getInviteDetails);
router.use(authMiddleware_js_1.authMiddleware);
/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Team management and invitations
 */
/**
 * @swagger
 * /api/v1/team/invite:
 *   post:
 *     summary: Invite a new team member
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [MANAGER, CARETAKER]
 *               adminPrivilege:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Invitation sent successfully
 */
router.post('/invite', teamController_js_1.inviteMember);
/**
 * @swagger
 * /api/v1/team:
 *   get:
 *     summary: Get all team members and pending invitations
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of team members and pending invites
 */
router.get('/', teamController_js_1.getTeam);
/**
 * @swagger
 * /api/v1/team/{id}:
 *   delete:
 *     summary: Remove a team member or invitation
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
router.delete('/:id', teamController_js_1.removeMember);
/**
 * @swagger
 * /api/v1/team/{id}/privileges:
 *   patch:
 *     summary: Update team member privileges
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminPrivilege:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Privileges updated successfully
 */
router.patch('/:id/privileges', teamController_js_1.updateMemberPrivileges);
exports.default = router;
