import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './database.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ==================== AUTH ====================

// Přihlášení
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email a heslo jsou povinné' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }
    
    const isValidPassword = bcrypt.compareSync(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Neplatné přihlašovací údaje' });
    }
    
    // Neposílat heslo klientovi
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== USERS ====================

// Získat všechny uživatele
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat jednoho uživatele
app.get('/api/users/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vytvořit uživatele
app.post('/api/users', (req, res) => {
  try {
    const { name, email } = req.body;
    const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizovat uživatele
app.put('/api/users/:id', (req, res) => {
  try {
    const { name, email } = req.body;
    db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, req.params.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smazat uživatele
app.delete('/api/users/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'Uživatel smazán' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROJECTS ====================

// Získat všechny projekty
app.get('/api/projects', (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT p.*, u.name as user_name, u.email as user_email,
             (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat jeden projekt
app.get('/api/projects/:id', (req, res) => {
  try {
    const project = db.prepare(`
      SELECT p.*, u.name as user_name, u.email as user_email
      FROM projects p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Projekt nenalezen' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vytvořit projekt
app.post('/api/projects', (req, res) => {
  try {
    const { name, description, user_id } = req.body;
    const result = db.prepare('INSERT INTO projects (name, description, user_id) VALUES (?, ?, ?)').run(name, description, user_id);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizovat projekt
app.put('/api/projects/:id', (req, res) => {
  try {
    const { name, description, status } = req.body;
    db.prepare('UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ?').run(name, description, status, req.params.id);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smazat projekt
app.delete('/api/projects/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ message: 'Projekt smazán' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASKS ====================

// Získat všechny úkoly
app.get('/api/tasks', (req, res) => {
  try {
    const { project_id, status, priority } = req.query;
    let query = `
      SELECT t.*, p.name as project_name, u.name as user_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      query += ' AND t.project_id = ?';
      params.push(project_id);
    }
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY t.created_at DESC';

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Získat jeden úkol
app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = db.prepare(`
      SELECT t.*, p.name as project_name, u.name as user_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `).get(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Úkol nenalezen' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vytvořit úkol
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, status, priority, project_id, user_id, due_date } = req.body;
    const result = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, project_id, user_id, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, status || 'todo', priority || 'medium', project_id, user_id, due_date);
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aktualizovat úkol
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, description, status, priority, due_date, req.params.id);
    
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Smazat úkol
app.delete('/api/tasks/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ message: 'Úkol smazán' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== COMMENTS ====================

// Získat komentáře k úkolu
app.get('/api/tasks/:taskId/comments', (req, res) => {
  try {
    const comments = db.prepare(`
      SELECT c.*, u.name as user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at DESC
    `).all(req.params.taskId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Přidat komentář
app.post('/api/tasks/:taskId/comments', (req, res) => {
  try {
    const { content, user_id } = req.body;
    const result = db.prepare('INSERT INTO comments (content, task_id, user_id) VALUES (?, ?, ?)').run(content, req.params.taskId, user_id);
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATISTIKY ====================

app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalProjects: db.prepare('SELECT COUNT(*) as count FROM projects').get().count,
      totalTasks: db.prepare('SELECT COUNT(*) as count FROM tasks').get().count,
      completedTasks: db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get().count,
      inProgressTasks: db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in_progress'").get().count,
      todoTasks: db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'todo'").get().count,
      totalUsers: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Spuštění serveru
app.listen(PORT, () => {
  console.log(`🚀 Server běží na http://localhost:${PORT}`);
});
