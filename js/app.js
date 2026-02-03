// Belladonna Board - Main Application (Browser-Compatible)

class BelladonnaBoard {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentSection = 'all';
        this.currentTaskId = null;
        
        this.init();
    }

    init() {
        this.renderBoard();
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    // Data Management
    loadTasks() {
        try {
            const data = localStorage.getItem('belladonna-board-tasks');
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error loading tasks:', e);
        }
        
        // Default tasks
        return [
            {
                id: 'task-1',
                section: 'film426',
                status: 'backlog',
                title: 'Fix heartbeat scheduler bug',
                description: 'Cron jobs save but don\'t fire. Gateway PID verified.',
                assignee: 'belladonna',
                dueDate: '2026-02-03',
                createdAt: new Date().toISOString(),
                comments: []
            },
            {
                id: 'task-2',
                section: 'film426',
                status: 'inprogress',
                title: 'Set up YouTube API',
                description: 'For scheduling FILM426 content.',
                assignee: 'belladonna',
                dueDate: null,
                createdAt: new Date().toISOString(),
                comments: []
            },
            {
                id: 'task-3',
                section: 'film426',
                status: 'backlog',
                title: 'Integrate ElevenLabs Voice',
                description: 'Conversational AI voice for Belladonna personality.',
                assignee: 'belladonna',
                dueDate: null,
                createdAt: new Date().toISOString(),
                comments: []
            },
            {
                id: 'task-4',
                section: 'film426',
                status: 'done',
                title: 'Build Belladonna Board App',
                description: 'Shared Kanban board for FILM426 and Tesco tasks.',
                assignee: 'belladonna',
                dueDate: '2026-02-02',
                createdAt: new Date().toISOString(),
                comments: []
            },
            {
                id: 'task-5',
                section: 'tesco',
                status: 'backlog',
                title: 'Whoosh Tracker Development',
                description: 'On hold until Paul starts role late next week.',
                assignee: 'paul',
                dueDate: null,
                createdAt: new Date().toISOString(),
                comments: []
            },
            {
                id: 'task-6',
                section: 'film426',
                status: 'backlog',
                title: 'Set up Gemini RAG',
                description: 'Google Drive document search for FILM426/Tesco.',
                assignee: 'paul',
                dueDate: null,
                createdAt: new Date().toISOString(),
                comments: []
            }
        ];
    }

    saveTasks() {
        localStorage.setItem('belladonna-board-tasks', JSON.stringify(this.tasks));
        this.renderBoard();
    }

    generateId() {
        return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Rendering
    renderBoard() {
        const columns = ['backlog', 'inprogress', 'review', 'done'];
        
        columns.forEach(status => {
            const column = document.getElementById(status);
            if (!column) return;
            
            const taskList = column.querySelector('.task-list');
            const countSpan = column.querySelector('.task-count');
            
            // Filter and sort tasks
            let filteredTasks = this.tasks.filter(task => task.status === status);
            if (this.currentSection !== 'all') {
                filteredTasks = filteredTasks.filter(task => task.section === this.currentSection);
            }
            
            // Update count
            countSpan.textContent = filteredTasks.length;
            
            // Render tasks
            taskList.innerHTML = filteredTasks.map(task => this.renderTaskCard(task)).join('');
            
            // Add click handlers to task cards
            taskList.querySelectorAll('.task-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    // Don't open modal if dragging
                    if (card.classList.contains('dragging')) return;
                    const taskId = card.dataset.taskId;
                    this.openModal(taskId);
                });
            });
            
            // Re-setup drag events for new cards
            this.setupDragAndDrop();
        });
    }

    renderTaskCard(task) {
        const sectionLabels = {
            film426: '🎬 FILM426',
            tesco: '🏪 Tesco',
            sonic: '🎵 Sonic'
        };
        
        const assigneeLabels = {
            belladonna: '🖤 Belladonna',
            paul: '👤 Paul'
        };
        
        const dueDate = task.dueDate ? this.formatDate(task.dueDate) : null;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
        const commentsCount = task.comments ? task.comments.length : 0;
        
        return `
            <div class="task-card" draggable="true" data-task-id="${task.id}">
                <div class="task-card-header">
                    <span class="task-section ${task.section}">${sectionLabels[task.section]}</span>
                    <span class="task-assignee">${assigneeLabels[task.assignee]}</span>
                </div>
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-footer">
                    ${dueDate ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">📅 ${dueDate}</span>` : '<span></span>'}
                    ${commentsCount > 0 ? `<span class="task-comments">💬 ${commentsCount}</span>` : ''}
                </div>
            </div>
        `;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event Listeners
    setupEventListeners() {
        // Add task buttons
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openModal(null, btn.dataset.status);
            });
        });

        // Close modal
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal on backdrop click
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'taskModal') {
                    this.closeModal();
                }
            });
        }

        // Form submission
        const form = document.getElementById('taskForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTask();
            });
        }

        // Delete task
        const deleteBtn = document.getElementById('deleteTask');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (this.currentTaskId && confirm('Delete this task?')) {
                    this.deleteTask(this.currentTaskId);
                }
            });
        }

        // Add comment
        const commentBtn = document.getElementById('addComment');
        if (commentBtn) {
            commentBtn.addEventListener('click', () => {
                this.addComment();
            });
        }

        // Section toggle
        document.querySelectorAll('.section-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSection = btn.dataset.section;
                this.renderBoard();
            });
        });

        // Sync button
        const syncBtn = document.getElementById('syncBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                this.syncWithGit();
            });
        }
    }

    setupDragAndDrop() {
        const cards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.task-list');

        cards.forEach(card => {
            // Remove old listeners to prevent duplicates
            card.removeEventListener('dragstart', this.handleDragStart);
            card.removeEventListener('dragend', this.handleDragEnd);
            
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        columns.forEach(column => {
            column.removeEventListener('dragover', this.handleDragOver);
            column.removeEventListener('drop', this.handleDrop);
            
            column.addEventListener('dragover', this.handleDragOver.bind(this));
            column.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    handleDragStart(e) {
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.currentTarget.dataset.taskId);
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        const container = e.currentTarget;
        const afterElement = this.getDragAfterElement(container, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (dragging) {
            if (afterElement == null) {
                container.appendChild(dragging);
            } else {
                container.insertBefore(dragging, afterElement);
            }
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = e.currentTarget.id;
        
        // Update task status
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.showToast('Task moved to ' + newStatus, 'success');
        }
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Modal Functions
    openModal(taskId = null, status = 'backlog') {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const commentsSection = document.getElementById('commentsSection');
        
        this.currentTaskId = taskId;
        
        if (taskId) {
            // Edit existing task
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                document.getElementById('modalTitle').textContent = 'Edit Task';
                document.getElementById('taskId').value = task.id;
                document.getElementById('taskStatus').value = task.status;
                document.getElementById('taskSection').value = task.section;
                document.getElementById('taskAssignee').value = task.assignee;
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskDueDate').value = task.dueDate || '';
                document.getElementById('deleteTask').style.display = 'block';
                
                // Show comments
                commentsSection.style.display = 'block';
                this.renderComments(task);
            }
        } else {
            // New task
            document.getElementById('modalTitle').textContent = 'New Task';
            form.reset();
            document.getElementById('taskId').value = '';
            document.getElementById('taskStatus').value = status;
            document.getElementById('deleteTask').style.display = 'none';
            commentsSection.style.display = 'none';
        }
        
        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentTaskId = null;
    }

    saveTask() {
        const taskId = document.getElementById('taskId').value;
        const taskData = {
            section: document.getElementById('taskSection').value,
            assignee: document.getElementById('taskAssignee').value,
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            dueDate: document.getElementById('taskDueDate').value || null,
            status: document.getElementById('taskStatus').value
        };

        if (taskId) {
            // Update existing
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                Object.assign(task, taskData);
                this.showToast('Task updated!', 'success');
            }
        } else {
            // Create new
            const newTask = {
                id: this.generateId(),
                ...taskData,
                createdAt: new Date().toISOString(),
                comments: []
            };
            this.tasks.push(newTask);
            this.showToast('Task created!', 'success');
        }

        this.saveTasks();
        this.closeModal();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.closeModal();
        this.showToast('Task deleted', 'success');
    }

    // Comments
    renderComments(task) {
        const commentsList = document.getElementById('commentsList');
        const comments = task.comments || [];
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem;">No comments yet</p>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span>${comment.author === 'belladonna' ? '🖤 Belladonna' : '👤 Paul'}</span>
                    <span>${this.formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            </div>
        `).join('');
    }

    addComment() {
        const commentText = document.getElementById('newComment').value.trim();
        if (!commentText || !this.currentTaskId) return;

        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (task) {
            if (!task.comments) task.comments = [];
            
            task.comments.push({
                text: commentText,
                author: 'belladonna',
                createdAt: new Date().toISOString()
            });
            
            this.saveTasks();
            this.renderComments(task);
            document.getElementById('newComment').value = '';
            this.showToast('Comment added!', 'success');
        }
    }

    // Git Sync (Browser-Compatible: Download/Upload JSON)
    syncWithGit() {
        const syncBtn = document.getElementById('syncBtn');
        syncBtn.classList.add('syncing');
        syncBtn.innerHTML = '<span class="sync-icon">🔄</span> Syncing...';
        
        // For browser, we'll export tasks as JSON and show instructions
        const tasksJson = JSON.stringify(this.tasks, null, 2);
        
        // Create downloadable file
        const blob = new Blob([tasksJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'belladonna-board-data.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('📥 Downloaded tasks.json - Send to Belladonna to sync!', 'success');
        
        setTimeout(() => {
            syncBtn.classList.remove('syncing');
            syncBtn.innerHTML = '<span class="sync-icon">🔄</span> Sync';
        }, 1000);
    }

    // Import from JSON (for when Paul sends updates)
    importFromJson(jsonData) {
        try {
            const importedTasks = JSON.parse(jsonData);
            // Merge intelligently - keep tasks that exist, add new ones
            importedTasks.forEach(importedTask => {
                const existingIndex = this.tasks.findIndex(t => t.id === importedTask.id);
                if (existingIndex >= 0) {
                    this.tasks[existingIndex] = importedTask;
                } else {
                    this.tasks.push(importedTask);
                }
            });
            this.saveTasks();
            this.showToast('📤 Tasks imported from Belladonna!', 'success');
        } catch (e) {
            this.showToast('Import failed: Invalid JSON', 'error');
        }
    }

    // Toast
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast ' + type;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.board = new BelladonnaBoard();
    
    // Check for shared data in URL hash
    const hash = window.location.hash;
    if (hash && hash.startsWith('#import=')) {
        try {
            const encodedData = hash.substring(8);
            const jsonData = decodeURIComponent(atob(encodedData));
            window.board.importFromJson(jsonData);
            window.location.hash = '';
        } catch (e) {
            console.error('Import error:', e);
        }
    }
});

// Export for use
window.BelladonnaBoard = BelladonnaBoard;
