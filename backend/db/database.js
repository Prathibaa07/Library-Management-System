const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'library.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      // Create Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`);

      // Create Books table
      db.run(`CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT,
        category TEXT,
        author TEXT,
        totalCopies INTEGER,
        available INTEGER
      )`);

      // Create IssuedBooks table
      db.run(`CREATE TABLE IF NOT EXISTS issuedBooks (
        id TEXT PRIMARY KEY,
        bookId TEXT,
        userId TEXT,
        issueDate TEXT,
        dueDate TEXT,
        status TEXT,
        fine INTEGER
      )`);

      // Create Requests table
      db.run(`CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        userId TEXT,
        bookTitle TEXT,
        author TEXT,
        reason TEXT,
        status TEXT,
        date TEXT
      )`);

      // Seed data if empty
      db.get("SELECT count(*) as count FROM users", (err, row) => {
        if (row && row.count === 0) {
          const insertUser = db.prepare(`INSERT INTO users VALUES (?, ?, ?, ?, ?)`);
          insertUser.run('u1', 'John Doe', 'john@student.com', 'password123', 'student');
          insertUser.run('u2', 'Jane Smith', 'jane@student.com', 'password123', 'student');
          insertUser.run('admin', 'Admin User', 'admin@library.com', 'admin@123', 'admin');
          insertUser.finalize();
          console.log('Seeded Users.');
        }
      });

      db.get("SELECT count(*) as count FROM books", (err, row) => {
        if (row && row.count === 0) {
          const insertBook = db.prepare(`INSERT INTO books VALUES (?, ?, ?, ?, ?, ?)`);
          insertBook.run('b1', 'Tamil Ilakkiyam', 'Tamil', 'Avvaiyar', 5, 5);
          insertBook.run('b2', 'Advanced English Grammar', 'English', 'Martin', 3, 2);
          insertBook.run('b3', 'Calculus for Beginners', 'Maths', 'James Stewart', 4, 4);
          insertBook.run('b4', 'Quantum Physics', 'Physics', 'H.C. Verma', 2, 0);
          insertBook.run('b5', 'Introduction to Computer Science', 'Computer', 'John Doe', 10, 8);
          insertBook.finalize();
          console.log('Seeded Books.');
        }
      });
    });
  }
});

module.exports = db;
