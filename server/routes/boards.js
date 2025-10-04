const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  addColumn,
  updateColumn,
  deleteColumn,
  addTask,
  updateTask,
  deleteTask,
  addMember,
  removeMember,
  updateMemberRole
} = require('../controllers/boardController');

// Board routes
router.route('/')
  .post(auth, createBoard)
  .get(auth, getBoards);

router.route('/:id')
  .get(auth, getBoard)
  .put(auth, updateBoard)
  .delete(auth, deleteBoard);

// Column routes
router.post('/:id/columns', auth, addColumn);
router.put('/:id/columns', auth, updateColumn);
router.delete('/:id/columns', auth, deleteColumn);

// Task routes
router.post('/:id/tasks', auth, addTask);
router.put('/:id/tasks', auth, updateTask);
router.delete('/:id/tasks', auth, deleteTask);

// Member routes
router.post('/:id/members', auth, addMember);
router.delete('/:id/members', auth, removeMember);
router.put('/:id/members', auth, updateMemberRole);

module.exports = router;