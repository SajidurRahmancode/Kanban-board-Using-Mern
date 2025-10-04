import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const BoardCardContainer = styled.div`
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    
    .delete-button {
      opacity: 1;
    }
  }
`;

const BoardCard = styled(Link)`
  display: block;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
`;

const BoardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const BoardDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const BoardMeta = styled.div`
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
  font-size: 0.8rem;
  color: #888;
`;

const CreateBoardButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 0.5rem;
`;

const CreateButton = styled(Button)`
  background: #28a745;
  color: white;
  
  &:hover {
    background: #218838;
  }
`;

const CancelButton = styled(Button)`
  background: #6c757d;
  color: white;
  
  &:hover {
    background: #5a6268;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  
  &:hover {
    background: #f8d7da;
    color: #721c24;
  }
  
  &:active {
    background: #f5c6cb;
  }
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

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const { boards, loadBoards, createBoard, deleteBoard } = useBoard();
  const { logout, user } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  const handleCreateBoard = async () => {
    if (newBoard.title.trim()) {
      await createBoard(newBoard);
      setNewBoard({ title: '', description: '' });
      setShowCreateModal(false);
    }
  };

  const handleDeleteBoard = async (boardId, boardTitle, event) => {
    event.preventDefault(); // Prevent navigation to the board
    event.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete the board "${boardTitle}"? This action cannot be undone and will delete all columns and tasks.`)) {
      try {
        await deleteBoard(boardId);
      } catch (error) {
        console.error("Error deleting board:", error);
        alert("Failed to delete board: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container>
      <Header>
        <h1>My Boards</h1>
        <div>
          <CreateBoardButton onClick={() => setShowCreateModal(true)}>
            Create New Board
          </CreateBoardButton>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </div>
      </Header>

      <BoardsGrid>
        {boards.map((board) => (
          <BoardCardContainer key={board._id}>
            <BoardCard to={`/board/${board._id}`}>
              <BoardTitle>{board.title}</BoardTitle>
              <BoardDescription>
                {board.description || 'No description'}
              </BoardDescription>
              <BoardMeta>
                <div>Owner: {board.owner.username}</div>
                <div>Members: {board.members.length}</div>
              </BoardMeta>
            </BoardCard>
            {user && board.owner._id === user._id && (
              <DeleteButton 
                className="delete-button"
                onClick={(e) => handleDeleteBoard(board._id, board.title, e)}
                title="Delete board"
              >
                <TrashIcon />
              </DeleteButton>
            )}
          </BoardCardContainer>
        ))}
      </BoardsGrid>

      {showCreateModal && (
        <Modal>
          <ModalContent>
            <h2>Create New Board</h2>
            <Input
              type="text"
              placeholder="Board title"
              value={newBoard.title}
              onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
            />
            <TextArea
              placeholder="Board description (optional)"
              value={newBoard.description}
              onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
            />
            <div>
              <CreateButton onClick={handleCreateBoard}>
                Create Board
              </CreateButton>
              <CancelButton onClick={() => setShowCreateModal(false)}>
                Cancel
              </CancelButton>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Dashboard;