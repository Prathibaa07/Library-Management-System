const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// --- Users ---
app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, role FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(row);
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  const id = 'u' + Date.now();
  db.run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [id, name, email, password, 'student'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name, email, role: 'student' });
  });
});

// --- Books ---
app.get('/api/books', (req, res) => {
  db.all('SELECT * FROM books', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/books', (req, res) => {
  const { title, author, category, totalCopies } = req.body;
  const id = 'b' + Date.now();
  db.run('INSERT INTO books (id, title, author, category, totalCopies, available) VALUES (?, ?, ?, ?, ?, ?)', 
    [id, title, author, category, totalCopies, totalCopies], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, title, author, category, totalCopies, available: totalCopies });
  });
});

// --- Issued Books ---
app.get('/api/issued', (req, res) => {
  db.all('SELECT * FROM issuedBooks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/issued', (req, res) => {
  const { bookId, userId } = req.body;
  const id = 'i' + Date.now();
  const issueDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('UPDATE books SET available = available - 1 WHERE id = ? AND available > 0', [bookId], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Book out of stock' });
      }
      db.run('INSERT INTO issuedBooks (id, bookId, userId, issueDate, dueDate, status, fine) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, bookId, userId, issueDate, dueDate, 'issued', 0], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          db.run('COMMIT');
          res.json({ id, bookId, userId, issueDate, dueDate, status: 'issued', fine: 0 });
        });
    });
  });
});

app.post('/api/issued/return/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT bookId FROM issuedBooks WHERE id = ? AND status != "returned"', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(400).json({ error: 'Invalid issue record' });
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      db.run('UPDATE issuedBooks SET status = "returned" WHERE id = ?', [id]);
      db.run('UPDATE books SET available = available + 1 WHERE id = ?', [row.bookId], function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        db.run('COMMIT');
        res.json({ message: 'Book returned successfully' });
      });
    });
  });
});

// --- Requests ---
app.get('/api/requests', (req, res) => {
  db.all('SELECT * FROM requests', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/requests', (req, res) => {
  const { userId, bookTitle, author, reason } = req.body;
  const id = 'r' + Date.now();
  const date = new Date().toISOString().split('T')[0];
  db.run('INSERT INTO requests (id, userId, bookTitle, author, reason, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, bookTitle, author, reason, 'pending', date], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, userId, bookTitle, author, reason, status: 'pending', date });
    });
});

app.put('/api/requests/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Request updated' });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
