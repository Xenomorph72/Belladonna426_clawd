// Belladonna Board v2 - Simplified and Working

let tasks = [];

// Load from localStorage or use defaults
function loadTasks() {
    try {
        const saved = localStorage.getItem('belladonna-board-tasks');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0) {
                console.log('Loaded from localStorage:', parsed.length, 'tasks');
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error loading tasks:', e);
    }
    
    // Default tasks
    return [
        { id: '1', title: 'Fix heartbeat scheduler bug', status: 'backlog', section: 'film426', assignee: 'belladonna' },
        { id: '2', title: 'Set up YouTube API', status: 'inprogress', section: 'film426', assignee: 'belladonna' },
        { id: '3', title: 'Integrate ElevenLabs Voice', status: 'backlog', section: 'film426', assignee: 'belladonna' },
        { id: '4', title: 'Build Belladonna Board App', status: 'done', section: 'film426', assignee: 'belladonna' },
        { id: '5', title: 'Whoosh Tracker Development', status: 'backlog', section: 'tesco', assignee: 'paul' },
        { id: '6', title: 'Set up Gemini RAG', status: 'backlog', section: 'film426', assignee: 'paul' },
        { id: '7', title: 'Review LTX2 Workflow Update', status: 'backlog', section: 'film426', assignee: 'paul' },
        { id: '8', title: 'Review Z-Image Extra Details + FX', status: 'backlog', section: 'film426', assignee: 'paul' },
        { id: '9', title: 'Review Z-IMAGE BASE workflow', status: 'backlog', section: 'film426', assignee: 'paul' },
        { id: '10', title: 'Review Z-IMAGE BASE ULTRA', status: 'backlog', section: 'film426', assignee: 'paul' },
        { id: '11', title: 'Check Ace-Step 1.5 Early Access', status: 'backlog', section: 'film426', assignee: 'paul' }
    ];
}

tasks = loadTasks();
let currentSection = 'all';

// Save to localStorage
function saveTasks() {
    localStorage.setItem('belladonna-board-tasks', JSON.stringify(tasks));
    console.log('Tasks saved to localStorage');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    const debug = document.getElementById('debug-status');
    if (debug) debug.textContent = 'JavaScript loaded!';
    console.log('Belladonna Board loading...');
    renderBoard();
    setupEventListeners();
    if (debug) debug.textContent = 'Board rendered!';
});

function renderBoard() {
    const columns = ['backlog', 'inprogress', 'review', 'done'];
    
    columns.forEach(status => {
        const taskList = document.getElementById(status);
        if (!taskList) {
            console.error('Missing element:', status);
            return;
        }
        
        // Filter tasks
        let filteredTasks = tasks.filter(task => task.status === status);
        if (currentSection !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.section === currentSection);
        }
        
        // Update count
        const column = taskList.closest('.column');
        const countSpan = column.querySelector('.task-count');
        if (countSpan) countSpan.textContent = filteredTasks.length;
        
        // Render tasks
        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-card" data-task-id="${task.id}" onclick="openTaskModal('${task.id}')">
                <div class="task-card-header">
                    <span class="task-section ${task.section}">${getSectionLabel(task.section)}</span>
                    <span class="task-assignee">${getAssigneeLabel(task.assignee)}</span>
                </div>
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-actions">
                    ${status !== 'backlog' ? `<button class="move-btn" onclick="event.stopPropagation();moveTask('${task.id}', 'prev')">←</button>` : ''}
                    ${status !== 'done' ? `<button class="move-btn" onclick="event.stopPropagation();moveTask('${task.id}', 'next')">→</button>` : ''}
                </div>
            </div>
        `).join('');
        
        console.log(`Rendered ${filteredTasks.length} tasks in ${status}`);
    });
}

function setupEventListeners() {
    // Section filters
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSection = this.dataset.section;
            renderBoard();
        });
    });
    
    // Add task buttons
    document.querySelectorAll('.add-task-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const status = this.dataset.status;
            addNewTask(status);
        });
    });
    
    // Close modal
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTaskModal);
    }
    
    // Close on backdrop click
    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeTaskModal();
        });
    }
    
    // Form submit
    const form = document.getElementById('taskForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTask();
        });
    }
    
    console.log('Event listeners attached');
}

function addNewTask(status) {
    const id = 'task-' + Date.now();
    const title = prompt('Task title:');
    if (!title) return;
    
    tasks.push({
        id: id,
        title: title,
        status: status,
        section: 'film426',
        assignee: 'paul'
    });
    
    saveTasks();
    renderBoard();
}

function openTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskSection').value = task.section;
    document.getElementById('taskAssignee').value = task.assignee;
    document.getElementById('taskTitle').value = task.title;
    
    document.getElementById('taskModal').classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
}

function saveTask() {
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const section = document.getElementById('taskSection').value;
    const assignee = document.getElementById('taskAssignee').value;
    const status = document.getElementById('taskStatus').value;
    
    if (!title) {
        alert('Title required');
        return;
    }
    
    if (taskId) {
        // Update existing
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.title = title;
            task.section = section;
            task.assignee = assignee;
            task.status = status;
        }
    } else {
        // Create new
        tasks.push({
            id: 'task-' + Date.now(),
            title: title,
            section: section,
            assignee: assignee,
            status: status
        });
    }
    
    saveTasks();
    closeTaskModal();
    renderBoard();
}

function getSectionLabel(section) {
    const labels = { film426: '🎬 FILM426', tesco: '🏪 Tesco', sonic: '🎵 Sonic' };
    return labels[section] || section;
}

function getAssigneeLabel(assignee) {
    const labels = { belladonna: '🖤 Belladonna', paul: '👤 Paul' };
    return labels[assignee] || assignee;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function moveTask(taskId, direction) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const statusOrder = ['backlog', 'inprogress', 'review', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    
    if (direction === 'next' && currentIndex < statusOrder.length - 1) {
        task.status = statusOrder[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
        task.status = statusOrder[currentIndex - 1];
    }
    
    saveTasks();
    renderBoard();
    console.log('Task moved to:', task.status);
}

console.log('Belladonna Board v2 loaded');

function resetBoard() {
    if (confirm('Reset all tasks to defaults? This cannot be undone.')) {
        localStorage.removeItem('belladonna-board-tasks');
        tasks = loadTasks();
        renderBoard();
        console.log('Board reset');
    }
}
