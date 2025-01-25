function TodoItem({ todo, onDelete, onToggle }) {
    return (
        <div className={`flex justify-between items-center p-4 mb-3 rounded-md shadow ${todo.completed ? 'bg-green-100' : 'bg-white'}`}>
            <div className="flex-grow">
                <h3 className={`font-semibold text-lg ${todo.completed ? 'line-through text-gray-500' : ''}`}>{todo.title}</h3>
                <p className={`${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>{todo.description}</p>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => onToggle(todo.id)}
                    className={`px-4 py-1 rounded-md font-semibold ${todo.completed ? 'bg-gray-400 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                    {todo.completed ? 'Undo' : 'Complete'}
                </button>
                <button
                    onClick={() => onDelete(todo.id)}
                    className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

export default TodoItem;
