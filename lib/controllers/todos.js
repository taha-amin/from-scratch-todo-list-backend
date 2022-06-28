const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const ToDo = require('../models/ToDo');

module.exports = Router()
  .get('/', authenticate, async (req, res, next) => {
    try {
      const todos = await ToDo.getAll(req.user.id);
      res.json(todos);
    } catch (error) {
      next(error);
    }
  })

  .post('/', authenticate, async (req, res, next) => {
    try {
      const todo = await ToDo.insert({ ...req.body, user_id: req.user.id });
      res.json(todo);
    } catch (error) {
      next(error);
    }
  });
