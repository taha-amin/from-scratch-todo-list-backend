const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeToDo = require('../middleware/authorizeToDo');
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
  })

  .put('/:id', authenticate, authorizeToDo, async (req, res, next) => {
    try {
      const todo = await ToDo.updateById(req.params.id, req.body);
      res.json(todo);
    } catch (error) {
      next(error);
    }
  })

  .delete('/:id', authenticate, authorizeToDo, async (req, res, next) => {
    try {
      const item = await ToDo.delete(req.params.id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });
