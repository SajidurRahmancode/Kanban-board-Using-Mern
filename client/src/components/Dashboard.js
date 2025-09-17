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

const BoardCard = styled(Link)`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
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

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const { boards, loadBoards, createBoard } = useBoard();
  const { logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadBoards();
  }, []);

  const handleCreateBoard = async () => {
    if (newBoard.title.trim()) {
      await createBoard(newBoard);
      setNewBoard({ title: '', description: '' });
      setShowCreateModal(false);
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
          <BoardCard key={board._id} to={`/board/${board._id}`}>
            <BoardTitle>{board.title}</BoardTitle>
            <BoardDescription>
              {board.description || 'No description'}
            </BoardDescription>
          </BoardCard>
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