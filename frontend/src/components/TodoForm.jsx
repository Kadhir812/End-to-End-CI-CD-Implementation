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
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-4 rounded-md shadow-md">
            <input
                className="w-full border-2 border-gray-300 p-2 rounded-md focus:border-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task Title"
                required
            />
            <textarea
                className="w-full border-2 border-gray-300 p-2 rounded-md focus:border-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Task Description"
            />
            <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-300"
            >
                Add Task
            </button>
        </form>
    );
}

export default TodoForm;
