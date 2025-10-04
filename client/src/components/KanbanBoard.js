// client/src/components/KanbanBoard.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const BoardContainer = styled.div`
  padding: 2rem;
  background: #f5f6f8;
  min-height: 100vh;
`;

const BoardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BoardTitle = styled.h1`
  margin: 0;
  color: #333;
`;

const ColumnsContainer = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
`;

const Column = styled.div`
  background: #ebecf0;
  border-radius: 8px;
  min-width: 300px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
`;

const ColumnHeader = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
`;

const ColumnTitle = styled.h3`
  margin: 0;
  color: #333;
`;

const TasksContainer = styled.div`
  padding: 1rem;
  flex-grow: 1;
  min-height: 100px;
`;



const TaskTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const TaskDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background: #0056b3;
  }
`;

const DangerButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background: #c82333;
  }
`;

const SecondaryButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background: #5a6268;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const MemberList = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
`;

const MemberItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  
  &:hover {
    background: #f8d7da;
    color: #721c24;
  }
  
  &:active {
    background: #f5c6cb;
  }
`;

const TaskActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
`;

const TaskWithActions = styled.div`
  position: relative;
  background: white;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    
    ${TaskActions} {
      opacity: 1;
    }
  }
`;

const ColumnActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TrashIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const KanbanBoard = () => {
  const { id } = useParams();
  const { currentBoard, loadBoard, addColumn, addTask, updateTask, deleteTask, deleteColumn, addMember, removeMember, updateMemberRole } = useBoard();
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Add loadBoard to the dependency array
  useEffect(() => {
    if (id) {
      loadBoard(id);
    }
  }, [id, loadBoard]); // Include loadBoard here

  // Add checks for currentBoard existence before accessing its properties
  const isOwner = currentBoard?.owner?._id === user?._id;
  // Use optional chaining and ensure m.user exists before accessing its _id
  const currentMember = currentBoard?.members?.find(m => m.user?._id === user?._id);
  const isAdmin = isOwner || currentMember?.role === 'admin';

  // Define the missing functions:

  const handleAddColumn = async () => {
    if (newColumnTitle.trim() && currentBoard) { // Check currentBoard exists
      try {
        await addColumn(currentBoard._id, { title: newColumnTitle.trim() });
        setNewColumnTitle('');
      } catch (error) {
        console.error("Error adding column:", error);
        // Optionally show an error message to the user
      }
    }
  };

   const handleAddTask = async (columnId) => {
    if (newTaskTitle.trim() && currentBoard) {
      try {
        // Pass null or undefined for assignee if not selected
        await addTask(currentBoard._id, {
          columnId,
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim(),
          assignee: null, // Explicitly pass null if no assignee is selected
          // dueDate: null, // Add if you have a due date input
          // priority: 'medium' // Add if you have a priority selector
        });
        setNewTaskTitle('');
        setNewTaskDescription('');
        setShowAddTaskModal(false);
      } catch (error) {
        console.error("Error adding task:", error);
        // Optionally show an error message to the user
        alert("Failed to add task: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleAddMember = async () => {
    if (newMemberEmail.trim() && currentBoard) { // Check currentBoard exists
      try {
        await addMember(currentBoard._id, { email: newMemberEmail.trim(), role: newMemberRole });
        setNewMemberEmail('');
        setShowAddMemberModal(false);
      } catch (error) {
        console.error("Error adding member:", error);
        // Optionally show an error message to the user
      }
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?') && currentBoard) { // Check currentBoard exists
      try {
        await removeMember(currentBoard._id, userId);
      } catch (error) {
        console.error("Error removing member:", error);
        // Optionally show an error message to the user
      }
    }
  };

  const handleUpdateMemberRole = async (userId, role) => {
    if (currentBoard) { // Check currentBoard exists
      try {
        await updateMemberRole(currentBoard._id, userId, role);
      } catch (error) {
        console.error("Error updating member role:", error);
        // Optionally show an error message to the user
      }
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (window.confirm('Are you sure you want to delete this column? All tasks in this column will be permanently deleted.') && currentBoard) {
      try {
        await deleteColumn(currentBoard._id, columnId);
      } catch (error) {
        console.error("Error deleting column:", error);
        alert("Failed to delete column: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDeleteTask = async (columnId, taskId) => {
    if (window.confirm('Are you sure you want to delete this task?') && currentBoard) {
      try {
        await deleteTask(currentBoard._id, columnId, taskId);
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDragStart = (e, taskId, sourceColumnId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');

    if (sourceColumnId !== targetColumnId && currentBoard) { // Check currentBoard exists
      try {
        await updateTask(currentBoard._id, {
          taskId,
          columnId: sourceColumnId,
          status: targetColumnId
        });
      } catch (error) {
        console.error("Error moving task:", error);
        // Optionally show an error message to the user
      }
    }
  };

  if (!currentBoard) {
    return <div>Loading...</div>; // Show loading state while data is being fetched
  }

  return (
    <BoardContainer>
      <BoardHeader>
        <BoardTitle>{currentBoard.title}</BoardTitle>
        <div>
          {isAdmin && ( // Only show admin buttons if user is admin or owner
            <>
              <input
                type="text"
                placeholder="New column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
              />
              <Button onClick={handleAddColumn}>Add Column</Button>
              <Button onClick={() => setShowAddMemberModal(true)}>Add Member</Button>
            </>
          )}
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </BoardHeader>

      {currentBoard.members && currentBoard.members.length > 0 && (
        <MemberList>
          <h3>Board Members</h3>
          {currentBoard.members.map((member) => (
            // Add a check to ensure member.user exists before rendering its properties
            member.user && (
              <MemberItem key={member.user._id}>
                <div>
                  <strong>{member.user.username}</strong> ({member.user.email}) - {member.role}
                </div>
                <div>
                  {isAdmin && member.user._id !== user._id && (
                    <>
                      <Select
                        value={member.role}
                        onChange={(e) => handleUpdateMemberRole(member.user._id, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </Select>
                      <DangerButton onClick={() => handleRemoveMember(member.user._id)}>
                        Remove
                      </DangerButton>
                    </>
                  )}
                </div>
              </MemberItem>
            )
          ))}
        </MemberList>
      )}

      <ColumnsContainer>
        {currentBoard.columns.map((column) => (
          <Column
            key={column._id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column._id)}
          >
            <ColumnHeader>
              <ColumnTitle>{column.title}</ColumnTitle>
              <ColumnActions>
                <Button onClick={() => {
                  setSelectedColumnId(column._id);
                  setShowAddTaskModal(true);
                }}>
                  +
                </Button>
                {isAdmin && (
                  <DeleteButton 
                    onClick={() => handleDeleteColumn(column._id)}
                    title="Delete column"
                  >
                    <TrashIcon />
                  </DeleteButton>
                )}
              </ColumnActions>
            </ColumnHeader>
            <TasksContainer>
              {column.tasks.map((task) => (
                <TaskWithActions
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id, column._id)}
                >
                  <TaskTitle>{task.title}</TaskTitle>
                  {task.description && (
                    <TaskDescription>{task.description}</TaskDescription>
                  )}
                  <TaskActions>
                    <DeleteButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(column._id, task._id);
                      }}
                      title="Delete task"
                    >
                      <TrashIcon />
                    </DeleteButton>
                  </TaskActions>
                </TaskWithActions>
              ))}
            </TasksContainer>
          </Column>
        ))}
      </ColumnsContainer>

      {showAddMemberModal && (
        <Modal>
          <ModalContent>
            <h2>Add Member</h2>
            <Input
              type="email"
              placeholder="Member's email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
            {isAdmin && (
              <Select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
            )}
            <div>
              <Button onClick={handleAddMember}>Add Member</Button>
              <SecondaryButton onClick={() => setShowAddMemberModal(false)}>
                Cancel
              </SecondaryButton>
            </div>
          </ModalContent>
        </Modal>
      )}

      {showAddTaskModal && (
        <Modal>
          <ModalContent>
            <h2>Add Task</h2>
            <Input
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <textarea
              placeholder="Task description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', minHeight: '100px' }}
            />
            <div>
              <Button onClick={() => handleAddTask(selectedColumnId)}>Add Task</Button>
              <SecondaryButton onClick={() => setShowAddTaskModal(false)}>
                Cancel
              </SecondaryButton>
            </div>
          </ModalContent>
        </Modal>
      )}
    </BoardContainer>
  );
};

export default KanbanBoard;