const Board = require('../models/Board');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new board
exports.createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    const board = new Board({
      title,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      columns: [
        { title: 'To Do', tasks: [] },
        { title: 'In Progress', tasks: [] },
        { title: 'Done', tasks: [] }
      ]
    });

    await board.save();
    
    // Populate members for response
    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
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
    console.log('getBoards called for user:', req.user._id);
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('members.user', 'username email')
    .populate('owner', 'username email')
    .sort({ createdAt: -1 });

    console.log('Found boards:', boards.length);
    res.json(boards);
  } catch (error) {
    console.error("Error in getBoards:", error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Get single board
exports.getBoard = async (req, res) => {
  try {
    console.log('getBoard called for board ID:', req.params.id, 'by user:', req.user._id);
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid board ID format');
      return res.status(400).json({ message: 'Invalid board ID format' });
    }

    const board = await Board.findById(req.params.id)
      .populate('members.user', 'username email')
      .populate('owner', 'username email');

    if (!board) {
      console.log('Board not found');
      return res.status(404).json({ message: 'Board not found' });
    }

    console.log('Board found, checking access...');
    console.log('Board members:', JSON.stringify(board.members, null, 2));
    
    // Check if user has access
    const isOwner = board.owner._id.toString() === req.user._id.toString();
    
    // Handle both old and new member schema formats
    const isMember = board.members.some(member => {
      // New schema: member.user._id
      if (member.user && member.user._id) {
        return member.user._id.toString() === req.user._id.toString();
      }
      // Old schema: member is directly an ObjectId
      if (member._id) {
        return member._id.toString() === req.user._id.toString();
      }
      // Fallback for direct ObjectId reference
      if (typeof member === 'object' && member.toString) {
        return member.toString() === req.user._id.toString();
      }
      return false;
    });

    console.log('Access check - isOwner:', isOwner, 'isMember:', isMember);

    if (!isOwner && !isMember) {
      console.log('Access denied');
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Access granted, returning board');
    res.json(board);
  } catch (error) {
    console.error('Error in getBoard:', error);
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
    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
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

    await Board.findByIdAndDelete(req.params.id);
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Add member to board
exports.addMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is owner or admin
    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (board.owner.toString() !== req.user._id.toString() && member?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is already a member
    if (board.members.some(m => m.user.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    board.members.push({ user: user._id, role });
    await board.save();

    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Remove member from board
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is owner or admin
    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (board.owner.toString() !== req.user._id.toString() && member?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent owner from removing themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove yourself from board' });
    }

    board.members = board.members.filter(m => m.user.toString() !== userId);
    await board.save();

    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is owner
    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prevent owner from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const member = board.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role;
    await board.save();

    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
    res.json(board);
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
    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (board.owner.toString() !== req.user._id.toString() && 
        member?.role !== 'admin' && 
        !board.members.some(m => m.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    board.columns.push({ title, tasks: [] });
    await board.save();

    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
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
    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (board.owner.toString() !== req.user._id.toString() && 
        member?.role !== 'admin' && 
        !board.members.some(m => m.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    column.title = title;
    await board.save();

    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
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
    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (board.owner.toString() !== req.user._id.toString() && 
        member?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    board.columns = board.columns.filter(col => col._id.toString() !== columnId);
    await board.save();

    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
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
    console.log('addTask: received request body:', JSON.stringify(req.body, null, 2));
    const { columnId, title, description, assignee, dueDate, priority } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    console.log('addTask: checking access for board:', req.params.id, 'user:', req.user._id);
    console.log('addTask: board members:', JSON.stringify(board.members, null, 2));
    
    const isOwner = board.owner.toString() === req.user._id.toString();
    
    // Handle both old and new member schema formats safely
    const isMember = board.members.some(member => {
      // New schema: member.user._id
      if (member.user && member.user._id) {
        return member.user._id.toString() === req.user._id.toString();
      }
      // Old schema or direct reference: member._id
      if (member._id) {
        return member._id.toString() === req.user._id.toString();
      }
      // Fallback for direct ObjectId reference
      if (typeof member === 'object' && member.toString) {
        return member.toString() === req.user._id.toString();
      }
      return false;
    });

    console.log('addTask: isOwner:', isOwner, 'isMember:', isMember);

    if (!isOwner && !isMember) {
      console.log('addTask: Access denied');
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('addTask: Access granted, looking for column:', columnId);
    console.log('addTask: Available columns:', board.columns.map(col => ({ id: col._id, name: col.name })));
    
    const column = board.columns.id(columnId);
    if (!column) {
      console.log('addTask: Column not found');
      return res.status(404).json({ message: 'Column not found' });
    }
    
    console.log('addTask: Column found:', column.name);

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required' });
    }

    console.log('addTask: Validating assignee if provided...');
    console.log('addTask: assignee value:', assignee, 'type:', typeof assignee);
    // Validate assignee if provided
    let assigneeId = null;
    if (assignee && assignee !== null && assignee !== '' && assignee !== 'null') {
      console.log('addTask: Validating assignee:', assignee);
      // Check if assignee is a valid ObjectId string
      if (!mongoose.Types.ObjectId.isValid(assignee)) {
        console.log('addTask: Invalid assignee ID');
        return res.status(400).json({ message: 'Invalid assignee ID' });
      }
      // Optional: Verify the user exists
      console.log('addTask: Checking if user exists...');
      const userExists = await User.findById(assignee);
      if (!userExists) {
        console.log('addTask: Assignee user not found');
        return res.status(404).json({ message: 'Assignee user not found' });
      }
      assigneeId = assignee;
      console.log('addTask: Assignee validated');
    } else {
      console.log('addTask: No assignee provided');
    }

    const task = {
      title: title.trim(),
      description: description ? description.trim() : '',
      assignee: assigneeId, // Use the validated ID
      dueDate: dueDate || undefined, // Keep as Date object or undefined
      priority: priority || 'medium' // Default to 'medium' if not provided
    };

    console.log('addTask: Adding task to column:', task);
    column.tasks.push(task);
    
    console.log('addTask: Task added, fixing member data structure...');
    // Fix members data structure if needed (temporary migration)
    board.members = board.members.map(member => {
      if (!member.user) {
        // Convert old format to new format
        return {
          user: member._id,
          role: member.role || 'member'
        };
      }
      return member;
    });
    
    console.log('addTask: Saving board...');
    await board.save();
    
    console.log('addTask: Board saved successfully');

    // Repopulate for the response to include user details if assigned
    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    // Optionally populate assignee details in tasks if needed, though this requires a more complex query
    // For now, the response will contain the task with just the assignee ID.
    
    res.json(board);
  } catch (error) {
    console.error("Error in addTask:", error); // Log the error for debugging
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
    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (board.owner.toString() !== req.user._id.toString() && 
        member?.role !== 'admin' && 
        !board.members.some(m => m.user.toString() === req.user._id.toString())) {
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
    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
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
    const member = board.members.find(m => m.user.toString() === req.user._id.toString());
    if (board.owner.toString() !== req.user._id.toString() && 
        member?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({ message: 'Column not found' });
    }

    column.tasks = column.tasks.filter(task => task._id.toString() !== taskId);
    await board.save();

    await board.populate('members.user', 'username email');
    await board.populate('owner', 'username email');
    
    res.json(board);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};