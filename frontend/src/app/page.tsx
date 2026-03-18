"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, clearTokens } from '@/lib/api';
import styles from './page.module.css';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'COMPLETED';
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  
  // Edit states
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Toast
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ page: page.toString(), limit: '5' });
      if (statusFilter) query.set('status', statusFilter);
      if (search) query.set('search', search);

      const res = await fetchWithAuth(`/tasks?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasToken = localStorage.getItem('access_token');
    if (!hasToken) {
      router.push('/login');
      return;
    }
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, search]);

  const addOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      if (editingTask) {
        const res = await fetchWithAuth(`/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTaskTitle, description: newTaskDesc })
        });
        if (res.ok) {
          showToast('Task updated successfully');
          setEditingTask(null);
          setNewTaskTitle('');
          setNewTaskDesc('');
          loadTasks();
        }
      } else {
        const res = await fetchWithAuth('/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTaskTitle, description: newTaskDesc })
        });
        if (res.ok) {
          showToast('Task added successfully');
          setNewTaskTitle('');
          setNewTaskDesc('');
          loadTasks();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDesc(task.description || '');
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDesc('');
  };

  const toggleTask = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/tasks/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        showToast('Task status updated');
        loadTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Task deleted');
        if (editingTask?.id === id) cancelEdit();
        loadTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  if (loading && tasks.length === 0) {
    return <div className={styles.loading}>Loading Dashboard...</div>;
  }

  return (
    <main className={styles.container}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>TaskApp</div>
          <span className={styles.badge}>Pro</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </header>

      <div className={styles.dashboard}>
        <section className={styles.sidebar}>
          <div className={styles.card}>
            <h3>{editingTask ? 'Edit Task' : 'Create Task'}</h3>
            <form onSubmit={addOrUpdateTask} className={styles.form}>
              <input
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className={styles.input}
              />
              <textarea
                placeholder="Description (optional)"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                className={styles.input}
                rows={3}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className={styles.primaryBtn} disabled={!newTaskTitle.trim()} style={{ flex: 1 }}>
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
                {editingTask && (
                  <button type="button" onClick={cancelEdit} className={styles.primaryBtn} style={{ background: 'var(--bg-tertiary)' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className={styles.mainContent}>
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchBar}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className={styles.taskList}>
            {tasks.length === 0 && !loading && (
              <div className={styles.emptyState}>No tasks found. Create one to get started!</div>
            )}
            
            {tasks.map(task => (
              <div key={task.id} className={`${styles.taskItem} ${task.status === 'COMPLETED' ? styles.completed : ''}`}>
                <div className={styles.taskContent}>
                  <h4 className={styles.taskTitle}>{task.title}</h4>
                  {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                </div>
                <div className={styles.taskActions}>
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`${styles.actionBtn} ${styles.toggleBtn}`}
                    title="Toggle Status"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => startEdit(task)}
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    title="Edit Task"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    title="Delete Task"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className={styles.pageBtn}
              >
                Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {pagination.totalPages}</span>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
