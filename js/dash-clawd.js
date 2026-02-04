// Dash-Clawd v3 - Firebase Real-Time Sync
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA8P26qC3yk-FrFbF01zZybxvJ14EdHPSE",
  authDomain: "dash-clawd.firebaseapp.com",
  projectId: "dash-clawd",
  storageBucket: "dash-clawd.firebasestorage.app",
  messagingSenderId: "939773467218",
  appId: "1:939773467218:web:c2a418e8ce13edab189d8b",
  measurementId: "G-3E98G0C27K"
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let tasks = [];
let currentSection = 'all';
let unsubscribe = null;

// Load tasks from Firestore with real-time sync
function loadTasksFromFirebase() {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));
  
  unsubscribe = onSnapshot(q, (snapshot) => {
    tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    // Add defaults if empty
    if (tasks.length === 0) {
      addDefaultTasks();
    } else {
      renderBoard();
      showToast('Synced!', 'success');
    }
    
    const debug = document.getElementById('debug-status');
    if (debug) debug.textContent = `Tasks: ${tasks.length} | Firebase: ✅`;
  }, (error) => {
    console.error('Firebase error:', error);
    showToast('Sync failed - using local', 'error');
    loadFromLocalStorage();
  });
}

// Default tasks
function addDefaultTasks() {
  const defaults = [
    { title: 'Fix heartbeat scheduler bug', status: 'done', section: 'film426', assignee: 'belladonna', createdAt: Date.now() },
    { title: 'Set up YouTube API', status: 'inprogress', section: 'film426', assignee: 'belladonna', createdAt: Date.now() - 1000 },
    { title: 'Whoosh Tracker Development', status: 'backlog', section: 'tesco', assignee: 'paul', createdAt: Date.now() - 2000 },
    { title: 'Promote The Astral Promenade', status: 'backlog', section: 'sonic', assignee: 'paul', createdAt: Date.now() - 3000 },
    { title: 'Review LTX2 Workflow Update', status: 'backlog', section: 'film426', assignee: 'paul', createdAt: Date.now() - 4000 },
    { title: 'Review Z-Image Extra Details', status: 'backlog', section: 'film426', assignee: 'paul', createdAt: Date.now() - 5000 }
  ];
  
  defaults.forEach(task => {
    addTaskToFirebase(task);
  });
}

// Add task to Firebase
async function addTaskToFirebase(task) {
  const id = 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  await setDoc(doc(db, 'tasks', id), {
    ...task,
    id: id,
    updatedAt: Date.now()
  });
}

// Save task (create or update)
async function saveTaskToFirebase(task) {
  await setDoc(doc(db, 'tasks', task.id), {
    ...task,
    updatedAt: Date.now()
  });
}

// Delete task
async function deleteTaskFromFirebase(taskId) {
  await deleteDoc(doc(db, 'tasks', taskId));
}

// LocalStorage fallback
function loadFromLocalStorage() {
  const saved = localStorage.getItem('dash-clawd-tasks');
  if (saved) {
    tasks = JSON.parse(saved);
    renderBoard();
  }
}

function saveToLocalStorage() {
  localStorage.setItem('dash-clawd-tasks', JSON.stringify(tasks));
}

// Toast notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    background: ${type === 'success' ? '#025373' : type === 'error' ? '#dc3545' : '#2d1e5e'};
    color: white;
    padding: 10px 20px;
    margin-bottom: 5px;
    border-radius: 4px;
    font-size: 14px;
    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const debug = document.getElementById('debug-status');
  if (debug) debug.textContent = 'Connecting to Firebase...';
  
  loadTasksFromFirebase();
  setupEventListeners();
});

// Rendering
function renderBoard() {
  const columns = ['backlog', 'inprogress', 'review', 'done'];
  
  const countDebug = document.getElementById('task-count');
  if (countDebug) countDebug.textContent = `Tasks: ${tasks.length} | Firebase: ✅`;
  
  columns.forEach(status => {
    const taskList = document.getElementById(status);
    if (!taskList) return;
    
    let filteredTasks = tasks.filter(task => task.status === status);
    if (currentSection !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.section === currentSection);
    }
    
    const column = taskList.closest('.column');
    const countSpan = column.querySelector('.task-count');
    if (countSpan) countSpan.textContent = filteredTasks.length;
    
    taskList.innerHTML = filteredTasks.map(task => `
      <div class="task-card" data-task-id="${task.id}" onclick="openTaskModal('${task.id}')">
        <div class="task-card-header">
          <span class="task-section ${task.section}">${getSectionLabel(task.section)}</span>
          <span class="task-assignee">${getAssigneeLabel(task.assignee)}</span>
        </div>
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-status-badge">${getStatusLabel(task.status)}</div>
      </div>
    `).join('');
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
      openTaskModal(null, status);
    });
  });
  
  // Close modal
  const closeBtn = document.getElementById('closeModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeTaskModal);
  }
  
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
  
  // Delete button
  const deleteBtn = document.getElementById('deleteTask');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteTask);
  }
}

function openTaskModal(taskId, defaultStatus = 'backlog') {
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');
  const deleteBtn = document.getElementById('deleteTask');
  
  if (taskId) {
    // Edit existing
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskSection').value = task.section;
    document.getElementById('taskAssignee').value = task.assignee;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    
    if (deleteBtn) deleteBtn.style.display = 'inline-block';
  } else {
    // New task
    document.getElementById('modalTitle').textContent = 'New Task';
    form.reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskStatus').value = defaultStatus;
    document.getElementById('taskSection').value = 'film426';
    document.getElementById('taskAssignee').value = 'paul';
    
    if (deleteBtn) deleteBtn.style.display = 'none';
  }
  
  modal.classList.add('active');
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('active');
}

async function saveTask() {
  const taskId = document.getElementById('taskId').value;
  const title = document.getElementById('taskTitle').value;
  const section = document.getElementById('taskSection').value;
  const assignee = document.getElementById('taskAssignee').value;
  const status = document.getElementById('taskStatus').value;
  const description = document.getElementById('taskDescription').value;
  
  if (!title) {
    alert('Title required');
    return;
  }
  
  const taskData = {
    title,
    section,
    assignee,
    status,
    description,
    updatedAt: Date.now()
  };
  
  if (taskId) {
    // Update
    await saveTaskToFirebase({ ...taskData, id: taskId, createdAt: Date.now() });
    showToast('Task updated!', 'success');
  } else {
    // Create
    await addTaskToFirebase({ ...taskData, createdAt: Date.now() });
    showToast('Task created!', 'success');
  }
  
  closeTaskModal();
}

async function deleteTask() {
  const taskId = document.getElementById('taskId').value;
  if (!taskId) return;
  
  if (!confirm('Delete this task?')) return;
  
  await deleteTaskFromFirebase(taskId);
  showToast('Task deleted', 'info');
  closeTaskModal();
}

// Helpers
function getSectionLabel(section) {
  const labels = { film426: '🎬 FILM426', tesco: '🏪 Tesco', sonic: '🎵 Sonic' };
  return labels[section] || section;
}

function getAssigneeLabel(assignee) {
  const labels = { belladonna: '🖤 Belladonna', paul: '👤 Paul' };
  return labels[assignee] || assignee;
}

function getStatusLabel(status) {
  const labels = { backlog: '📋 Backlog', inprogress: '🔥 In Progress', review: '👁️ Review', done: '✅ Done' };
  return labels[status] || status;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

// Global functions for onclick
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;

console.log('Dash-Clawd v3 loaded');
