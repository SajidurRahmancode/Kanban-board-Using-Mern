import React, { createContext, useContext, useReducer } from 'react';
import API from '../services/api';

const BoardContext = createContext();

const boardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BOARDS':
      return { ...state, boards: action.payload };
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.payload };
    case 'ADD_BOARD':
      return { ...state, boards: [...state.boards, action.payload] };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board =>
          board._id === action.payload._id ? action.payload : board
        ),
        currentBoard: state.currentBoard?._id === action.payload._id 
          ? action.payload 
          : state.currentBoard
      };
    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board._id !== action.payload),
        currentBoard: state.currentBoard?._id === action.payload 
          ? null 
          : state.currentBoard
      };
    default:
      return state;
  }
};

export const BoardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, {
    boards: [],
    currentBoard: null
  });

  const loadBoards = async () => {
    try {
      const res = await API.get('/boards');
      dispatch({ type: 'SET_BOARDS', payload: res.data });
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadBoard = async (id) => {
    try {
      const res = await API.get(`/boards/${id}`);
      dispatch({ type: 'SET_CURRENT_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error loading board:', error);
      throw error;
    }
  };

  const createBoard = async (boardData) => {
    try {
      const res = await API.post('/boards', boardData);
      dispatch({ type: 'ADD_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  };

  const updateBoard = async (id, boardData) => {
    try {
      const res = await API.put(`/boards/${id}`, boardData);
      dispatch({ type: 'UPDATE_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error updating board:', error);
      throw error;
    }
  };

  const deleteBoard = async (id) => {
    try {
      await API.delete(`/boards/${id}`);
      dispatch({ type: 'DELETE_BOARD', payload: id });
    } catch (error) {
      console.error('Error deleting board:', error);
      throw error;
    }
  };

  const addColumn = async (boardId, columnData) => {
    try {
      const res = await API.post(`/boards/${boardId}/columns`, columnData);
      dispatch({ type: 'UPDATE_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error adding column:', error);
      throw error;
    }
  };

  const updateColumn = async (boardId, columnId, columnData) => {
    try {
      const res = await API.put(`/boards/${boardId}/columns`, { columnId, ...columnData });
      dispatch({ type: 'UPDATE_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error updating column:', error);
      throw error;
    }
  };

  const deleteColumn = async (boardId, columnId) => {
    try {
      const res = await API.delete(`/boards/${boardId}/columns`, { data: { columnId } });
      dispatch({ type: 'UPDATE_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error deleting column:', error);
      throw error;
    }
  };

  const addTask = async (boardId, taskData) => {
    try {
      const res = await API.post(`/boards/${boardId}/tasks`, taskData);
      dispatch({ type: 'UPDATE_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (boardId, taskData) => {
    try {
      const res = await API.put(`/boards/${boardId}/tasks`, taskData);
      dispatch({ type: 'UPDATE_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (boardId, columnId, taskId) => {
    try {
      const res = await API.delete(`/boards/${boardId}/tasks`, { 
        data: { columnId, taskId } 
      });
      dispatch({ type: 'UPDATE_BOARD', payload: res.data });
      return res.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  return (
    <BoardContext.Provider value={{
      ...state,
      loadBoards,
      loadBoard,
      createBoard,
      updateBoard,
      deleteBoard,
      addColumn,
      updateColumn,
      deleteColumn,
      addTask,
      updateTask,
      deleteTask
    }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};