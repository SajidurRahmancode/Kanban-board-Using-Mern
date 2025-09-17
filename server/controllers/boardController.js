const Board = require('../models/Board');

// Create a new board
exports.createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    const board = new Board({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
      columns: [
        { title: 'To Do', tasks: [] },
        { title: 'In Progress', tasks: [] },
        { title: 'Done', tasks: [] }
      ]
    });

    await board.save();
    
    // Populate members for response
    await board.populate('members', 'username email');
    
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get all boards for user
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }).populate('members', 'username email');

    res.json(boards);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get single board
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('members', 'username email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    if (board.owner.toString() !== req.user._id.toString() && 
        !board.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update board
exports.updateBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is owner
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    board.title = title || board.title;
    board.description = description || board.description;

    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Delete board
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is owner
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await board.remove();
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Add column to board
exports.addColumn = async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    if (board.owner.toString() !== req.user._id.toString() && 
        !board.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    board.columns.push({ title, tasks: [] });
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update column
exports.updateColumn = async (req, res) => {
  try {
    const { columnId, title } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    if (board.owner.toString() !== req.user._id.toString() && 
        !board.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    column.title = title;
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Delete column
exports.deleteColumn = async (req, res) => {
  try {
    const { columnId } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    if (board.owner.toString() !== req.user._id.toString() && 
        !board.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    board.columns = board.columns.filter(col => col._id.toString() !== columnId);
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Add task to column
exports.addTask = async (req, res) => {
  try {
    const { columnId, title, description, assignee, dueDate, priority } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    if (board.owner.toString() !== req.user._id.toString() && 
        !board.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    const task = {
      title,
      description,
      assignee,
      dueDate,
      priority
    };

    column.tasks.push(task);
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { columnId, taskId, title, description, assignee, dueDate, priority, status } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    if (board.owner.toString() !== req.user._id.toString() && 
        !board.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let taskFound = false;
    let sourceColumn = null;
    let task = null;

    // Find task in any column
    for (let column of board.columns) {
      const foundTask = column.tasks.id(taskId);
      if (foundTask) {
        taskFound = true;
        sourceColumn = column;
        task = foundTask;
        break;
      }
    }

    if (!taskFound) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;

    // Move task to different column if status is provided
    if (status && status !== columnId) {
      // Remove from current column
      sourceColumn.tasks = sourceColumn.tasks.filter(t => t._id.toString() !== taskId);
      
      // Add to new column
      const targetColumn = board.columns.id(status);
      if (targetColumn) {
        targetColumn.tasks.push(task);
      }
    }

    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { columnId, taskId } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    if (board.owner.toString() !== req.user._id.toString() && 
        !board.members.some(member => member.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    column.tasks = column.tasks.filter(task => task._id.toString() !== taskId);
    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};