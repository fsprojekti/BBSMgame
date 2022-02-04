const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/admins');

const checkAdminAuth = require('../middleware/check-admin-auth');

// POST routes
router.post('/login', AdminController.login_admin);
router.post('/createPlayer', checkAdminAuth, AdminController.create_player);
router.post('/startGame', checkAdminAuth, AdminController.start_game);
router.post('/endGame', checkAdminAuth, AdminController.end_game);

module.exports = router;