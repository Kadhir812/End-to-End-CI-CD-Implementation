import { useState } from 'react';

function TodoForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ title, description, completed: false });
        setTitle('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-lg shadow-md border border-purple-100 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-purple-800 mb-3">Add a New Task</h2>
            <input
                className="w-full border border-purple-200 p-2 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition duration-200 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task Title"
                required
            />
            <textarea
                className="w-full border border-purple-200 p-2 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition duration-200 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task Description"
                rows="3"
            />
            <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-md shadow-sm hover:shadow-md transition duration-300 text-sm"
            >
                Add Task
            </button>
        </form>
    );
}

export default TodoForm;