 document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const openModalBtn = document.getElementById('open-modal-btn');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const cancelTaskBtn = document.getElementById('cancel-task-btn');
            const saveTaskBtn = document.getElementById('save-task-btn');
            const taskModal = document.getElementById('task-modal');
            const taskList = document.getElementById('task-list');
            const categoryFilter = document.getElementById('category-filter');
            const priorityFilter = document.getElementById('priority-filter');
            const statusFilter = document.getElementById('status-filter');
            const celebration = document.getElementById('celebration');
            const completedCount = document.getElementById('completed-count');
            const totalCount = document.getElementById('total-count');
            
            // Form elements
            const taskTitle = document.getElementById('task-title');
            const taskDescription = document.getElementById('task-description');
            const categoryOptions = document.querySelectorAll('.category-option');
            const priorityOptions = document.querySelectorAll('.priority-option');
            
            // Variables
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            let currentCategory = 'all';
            let currentPriority = 'all';
            let currentStatus = 'all';
            let selectedCategory = 'work';
            let selectedPriority = 'medium';
            
            // Initialize
            renderTasks();
            updateStats();
            
            // Event Listeners
            openModalBtn.addEventListener('click', openModal);
            closeModalBtn.addEventListener('click', closeModal);
            cancelTaskBtn.addEventListener('click', closeModal);
            
            saveTaskBtn.addEventListener('click', function() {
                const title = taskTitle.value.trim();
                
                if (title) {
                    const newTask = {
                        id: Date.now(),
                        title,
                        description: taskDescription.value,
                        category: selectedCategory,
                        priority: selectedPriority,
                        completed: false,
                        createdAt: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    };
                    
                    tasks.push(newTask);
                    saveTasks();
                    renderTasks();
                    closeModal();
                    resetForm();
                } else {
                    taskTitle.focus();
                }
            });
            
            categoryFilter.addEventListener('change', function() {
                currentCategory = this.value;
                renderTasks();
            });
            
            priorityFilter.addEventListener('change', function() {
                currentPriority = this.value;
                renderTasks();
            });
            
            statusFilter.addEventListener('change', function() {
                currentStatus = this.value;
                renderTasks();
            });
            
            // Category and Priority Selection
            categoryOptions.forEach(option => {
                option.addEventListener('click', function() {
                    categoryOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedCategory = this.dataset.value;
                });
            });
            
            priorityOptions.forEach(option => {
                option.addEventListener('click', function() {
                    priorityOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedPriority = this.dataset.value;
                });
            });
            
            // Set default selections
            document.querySelector('.category-option.work').classList.add('selected');
            document.querySelector('.priority-option.medium').classList.add('selected');
            
            // Functions
            function openModal() {
                taskModal.style.display = 'flex';
                setTimeout(() => {
                    taskModal.classList.add('active');
                }, 10);
                taskTitle.focus();
            }
            
            function closeModal() {
                taskModal.classList.remove('active');
                setTimeout(() => {
                    taskModal.style.display = 'none';
                }, 300);
            }
            
            function resetForm() {
                taskTitle.value = '';
                taskDescription.value = '';
                selectedCategory = 'work';
                selectedPriority = 'medium';
                
                // Reset selections
                categoryOptions.forEach(opt => opt.classList.remove('selected'));
                priorityOptions.forEach(opt => opt.classList.remove('selected'));
                document.querySelector('.category-option.work').classList.add('selected');
                document.querySelector('.priority-option.medium').classList.add('selected');
            }
            
            function renderTasks() {
                if (tasks.length === 0) {
                    taskList.innerHTML = `
                        <div class="empty-state">
                            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No tasks">
                            <p>No tasks yet. Add your first task!</p>
                        </div>
                    `;
                    updateStats();
                    return;
                }
                
                let filteredTasks = [...tasks];
                
                // Apply filters
                if (currentCategory !== 'all') {
                    filteredTasks = filteredTasks.filter(task => task.category === currentCategory);
                }
                
                if (currentPriority !== 'all') {
                    filteredTasks = filteredTasks.filter(task => task.priority === currentPriority);
                }
                
                if (currentStatus !== 'all') {
                    if (currentStatus === 'completed') {
                        filteredTasks = filteredTasks.filter(task => task.completed);
                    } else if (currentStatus === 'active') {
                        filteredTasks = filteredTasks.filter(task => !task.completed);
                    } else if (currentStatus === 'overdue') {
                        // Simple overdue logic (tasks older than 3 days)
                        filteredTasks = filteredTasks.filter(task => {
                            const createdDate = new Date(task.createdAt);
                            const daysOld = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
                            return !task.completed && daysOld > 3;
                        });
                    }
                }
                
                if (filteredTasks.length === 0) {
                    taskList.innerHTML = `
                        <div class="empty-state">
                            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No tasks">
                            <p>No tasks match your filters.</p>
                        </div>
                    `;
                    updateStats();
                    return;
                }
                
                taskList.innerHTML = '';
                
                filteredTasks.forEach(task => {
                    const taskItem = document.createElement('li');
                    taskItem.className = `task-item ${task.priority} ${task.completed ? 'task-completed' : ''}`;
                    taskItem.dataset.id = task.id;
                    
                    // Check if task is overdue
                    const createdDate = new Date(task.createdAt);
                    const daysOld = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
                    const isOverdue = !task.completed && daysOld > 3;
                    
                    if (isOverdue) {
                        taskItem.classList.add('overdue');
                    }
                    
                    // Get mood emoji
                    let moodEmoji = '';
                    if (isOverdue) {
                        moodEmoji = '😩';
                    } else if (daysOld > 1 && !task.completed) {
                        moodEmoji = '😕';
                    }
                    
                    taskItem.innerHTML = `
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <div class="task-content">
                            <div class="task-title">${task.title}</div>
                            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                            <div class="task-meta">
                                <span class="task-category" style="background-color: ${getCategoryColor(task.category)}">${task.category}</span>
                                <span class="task-priority">${getPriorityIcon(task.priority)} ${task.priority}</span>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="task-btn delete" title="Delete task">🗑️</button>
                        </div>
                        ${moodEmoji ? `<div class="mood-indicator">${moodEmoji}</div>` : ''}
                    `;
                    
                    taskList.appendChild(taskItem);
                    
                    // Add event listeners
                    const checkbox = taskItem.querySelector('.task-checkbox');
                    const deleteBtn = taskItem.querySelector('.delete');
                    
                    checkbox.addEventListener('change', function() {
                        toggleTaskComplete(task.id);
                    });
                    
                    deleteBtn.addEventListener('click', function() {
                        deleteTask(task.id);
                    });
                });
                
                updateStats();
            }
            
            function toggleTaskComplete(id) {
                tasks = tasks.map(task => {
                    if (task.id === id) {
                        const completed = !task.completed;
                        if (completed) {
                            createConfetti();
                        }
                        return { 
                            ...task, 
                            completed,
                            lastUpdated: new Date().toISOString()
                        };
                    }
                    return task;
                });
                
                saveTasks();
                renderTasks();
                
                // Show celebration if all tasks are completed
                if (tasks.length > 0 && tasks.every(task => task.completed)) {
                    celebration.style.display = 'block';
                    setTimeout(() => {
                        celebration.style.display = 'none';
                    }, 5000);
                }
            }
            
            function deleteTask(id) {
                if (confirm('Are you sure you want to delete this task?')) {
                    tasks = tasks.filter(task => task.id !== id);
                    saveTasks();
                    renderTasks();
                }
            }
            
            function updateStats() {
                const total = tasks.length;
                const completed = tasks.filter(task => task.completed).length;
                
                totalCount.textContent = total;
                completedCount.textContent = completed;
            }
            
            function saveTasks() {
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
            
            function getCategoryColor(category) {
                const colors = {
                    'work': '#6c5ce7',
                    'personal': '#00b894',
                    'shopping': '#fd79a8',
                    'health': '#0984e3'
                };
                return colors[category] || '#636e72';
            }
            
            function getPriorityIcon(priority) {
                const icons = {
                    'high': '🔥',
                    'medium': '⚠️',
                    'low': '🌱'
                };
                return icons[priority] || '';
            }
            
            function createConfetti() {
                const colors = ['#6c5ce7', '#fd79a8', '#00b894', '#fdcb6e', '#e17055'];
                
                for (let i = 0; i < 50; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + 'vw';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
                    confetti.style.animationDelay = (Math.random() * 0.5) + 's';
                    document.body.appendChild(confetti);
                    
                    setTimeout(() => {
                        confetti.remove();
                    }, 3000);
                }
            }
        });
