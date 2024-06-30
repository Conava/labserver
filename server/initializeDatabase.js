const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

let db;

function createDatabase() {
    // Initialize the database
    db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the users database.');
    });

    // Create the users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users
            (
                id
                    INTEGER
                    PRIMARY
                        KEY
                    AUTOINCREMENT,
                username
                    TEXT
                    NOT
                        NULL
                    UNIQUE,
                password
                    TEXT
                    NOT
                        NULL,
                objectPassphrase
                    TEXT
            )`, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Users table created or already exists.');
    });
}

function addUser(username, password, objectPassphrase) {
    bcrypt.hash(password, 10, function (err, passwordHash) {
        if (err) {
            return console.error(err);
        }
        bcrypt.hash(objectPassphrase, 10, function (err, passphraseHash) {
            if (err) {
                return console.error(err);
            }
            db.run(`INSERT INTO users(username, password, objectPassphrase)
                    VALUES (?, ?, ?)`, [username, passwordHash, passphraseHash], function (err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`User added with ID: ${this.lastID}`);
            });
        });
    });
}

function initializeDatabase() {
    createDatabase();
    addUser('admin', 'nimda', 'any');
    addUser('Marlon', 'nimda', 'lighter');
    addUser('Silas', 'nimda', 'hand');
    addUser('Oskar', 'nimda', 'pen');
    addUser('Laurin', 'nimda', 'watch');
    addUser('Ludwig', 'nimda', 'pointer');
}


module.exports = initializeDatabase;