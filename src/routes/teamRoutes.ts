import { Router } from 'express';
import { 
    inviteMember, 
    getTeam, 
    removeMember, 
    updateMemberPrivileges,
    getInviteDetails 
} from '../controllers/teamController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/details/:token', getInviteDetails);
router.use(authMiddleware);

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
router.post('/invite', inviteMember);

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
router.get('/', getTeam);

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
router.delete('/:id', removeMember);


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
router.patch('/:id/privileges', updateMemberPrivileges);

export default router;
