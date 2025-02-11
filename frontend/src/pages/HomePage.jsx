import { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';

function HomePage() {
    const [todos, setTodos] = useState([]);
    
    // Use proxy-friendly API base URL
    const API_BASE_URL = "/api/todos";

    const fetchTodos = async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            setTodos(response.data);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    };

    const addTodo = async (todo) => {
        try {
            const response = await axios.post(API_BASE_URL, todo);
            setTodos([...todos, response.data]);
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            setTodos(todos.filter((todo) => todo.id !== id));
        } catch (error) {
            console.error("Error deleting todo:", error);
        }
    };

    const toggleTodo = async (id) => {
        try {
            const todo = todos.find((t) => t.id === id);
            const response = await axios.put(`${API_BASE_URL}/${id}`, 
                { ...todo, completed: !todo.completed }
            );
            setTodos(todos.map((t) => (t.id === id ? response.data : t)));
        } catch (error) {
            console.error("Error toggling todo:", error);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Todo Application</h1>
            <TodoForm onAdd={addTodo} />
            <div className="space-y-4">
                {todos.length ? (
                    todos.map((todo) => (
                        <TodoItem 
                            key={todo.id} 
                            todo={todo} 
                            onDelete={deleteTodo} 
                            onToggle={toggleTodo} 
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500">No tasks available. Add a new task above.</p>
                )}
            </div>
        </div>
    );
}

export default HomePage;
