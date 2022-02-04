const express = require('express');
const router = express.Router();

const PlayerController = require('../controllers/players');

const checkPlayerAuth = require('../middleware/check-player-auth');

// POST routes
router.post('/login', PlayerController.login_player);
router.post('/createOrder/:playerId', checkPlayerAuth, PlayerController.create_order);
router.post('/createTransaction/:playerId', checkPlayerAuth, PlayerController.create_transaction);
router.post('/stake/:playerId', checkPlayerAuth, PlayerController.stake);
router.post('/unstake/:playerId', checkPlayerAuth, PlayerController.unstake);


// GET routes
router.get('/gameData/:playerId', checkPlayerAuth, PlayerController.get_game_data);


//DELETE routes
router.delete('/cancelOrder/:playerId', checkPlayerAuth, PlayerController.cancel_order);
router.delete('/cancelTransaction/:playerId', checkPlayerAuth, PlayerController.cancel_transaction);



module.exports = router;
