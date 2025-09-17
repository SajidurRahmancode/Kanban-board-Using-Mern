import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBoard } from '../context/BoardContext';
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

const Task = styled.div`
  background: white;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  }
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

const AddColumnButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const KanbanBoard = () => {
  const { id } = useParams();
  const { currentBoard, loadBoard, addColumn, addTask, updateTask } = useBoard();
  const [newColumnTitle, setNewColumnTitle] = useState('');

  useEffect(() => {
    if (id) {
      loadBoard(id);
    }
  }, [id]);

  const handleAddColumn = async () => {
    if (newColumnTitle.trim()) {
      await addColumn(id, { title: newColumnTitle.trim() });
      setNewColumnTitle('');
    }
  };

  const handleAddTask = async (columnId) => {
    const title = prompt('Enter task title:');
    if (title) {
      await addTask(id, {
        columnId,
        title,
        description: ''
      });
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

    if (sourceColumnId !== targetColumnId) {
      await updateTask(id, {
        taskId,
        columnId: sourceColumnId,
        status: targetColumnId
      });
    }
  };

  if (!currentBoard) {
    return <div>Loading...</div>;
  }

  return (
    <BoardContainer>
      <BoardHeader>
        <BoardTitle>{currentBoard.title}</BoardTitle>
        <div>
          <input
            type="text"
            placeholder="New column title"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
          />
          <AddColumnButton onClick={handleAddColumn}>
            Add Column
          </AddColumnButton>
        </div>
      </BoardHeader>

      <ColumnsContainer>
        {currentBoard.columns.map((column) => (
          <Column
            key={column._id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column._id)}
          >
            <ColumnHeader>
              <ColumnTitle>{column.title}</ColumnTitle>
              <button onClick={() => handleAddTask(column._id)}>
                +
              </button>
            </ColumnHeader>
            <TasksContainer>
              {column.tasks.map((task) => (
                <Task
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id, column._id)}
                >
                  <TaskTitle>{task.title}</TaskTitle>
                  {task.description && (
                    <TaskDescription>{task.description}</TaskDescription>
                  )}
                </Task>
              ))}
            </TasksContainer>
          </Column>
        ))}
      </ColumnsContainer>
    </BoardContainer>
  );
};

export default KanbanBoard;