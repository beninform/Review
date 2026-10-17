// set-up-page.js


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    
    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };
    
    const renderTodos = () => {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.textContent = todo;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => {
                todos.splice(index, 1);
                saveTodos();
                renderTodos();
            });
            
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    };
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const todo = input.value.trim();
        if (todo) {
            todos.push(todo);
            saveTodos();
            renderTodos();
            input.value = '';
        }
    });
    
    renderTodos();
});