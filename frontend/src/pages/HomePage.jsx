import { useState, useEffect } from 'react';
import axios from 'axios';
import TodoForm from '../components/TodoForm';
import TodoItem from '../components/TodoItem';

function HomePage() {
    const [todos, setTodos] = useState([]);

    const fetchTodos = async () => {
        const response = await axios.get("http://localhost:8080/api/todos");
        setTodos(response.data);
    };

    const addTodo = async (todo) => {
        const response = await axios.post("http://localhost:8080/api/todos", todo);
        setTodos([...todos, response.data]);
    };

    const deleteTodo = async (id) => {
        await axios.delete(`http://localhost:8080/api/todos/${id}`);
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    const toggleTodo = async (id) => {
        const todo = todos.find((t) => t.id === id);
        const response = await axios.put(`http://localhost:8080/api/todos/${id}`, { ...todo, completed: !todo.completed });
        setTodos(todos.map((t) => (t.id === id ? response.data : t)));
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
                        <TodoItem key={todo.id} todo={todo} onDelete={deleteTodo} onToggle={toggleTodo} />
                    ))
                ) : (
                    <p className="text-center text-gray-500">No tasks available. Add a new task above.</p>
                )}
            </div>
        </div>
    );
}

export default HomePage;
