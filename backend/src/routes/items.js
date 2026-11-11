const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemsController');

// Items CRUD Endpoints
router.get('/', itemsController.getItems);
router.get('/:id', itemsController.getItemById);
router.post('/', itemsController.createItem);
router.put('/:id', itemsController.updateItem);
router.delete('/:id', itemsController.deleteItem);

// Cache management endpoint
router.post('/cache/flush', itemsController.clearCache);

module.exports = router;
