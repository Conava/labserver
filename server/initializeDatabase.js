const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

let db;

/**
 * Initializes the SQLite database and creates a users table if it doesn't exist.
 * This function sets up the database connection and ensures the presence of the
 * necessary table for storing user information.
 */
function createDatabase() {
    // Connect to SQLite database; create if it doesn't exist
    db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the users database.');
    });

    // Create the users table with id, username, password, and objectPassphrase columns
    db.run(`CREATE TABLE IF NOT EXISTS users
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                objectPassphrase TEXT
            )`, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Users table created or already exists.');
    });
}

/**
 * Adds a new user to the users table with hashed password and object passphrase.
 * This function hashes the provided password and object passphrase using bcrypt
 * before inserting the new user record into the database.
 *
 * @param {string} username - The username of the new user.
 * @param {string} password - The plaintext password to be hashed and stored.
 * @param {string} objectPassphrase - The plaintext object passphrase to be hashed and stored.
 */
function addUser(username, password, objectPassphrase) {
    // Hash the password
    bcrypt.hash(password, 10, function (err, passwordHash) {
        if (err) {
            return console.error(err);
        }
        // Hash the object passphrase
        bcrypt.hash(objectPassphrase, 10, function (err, passphraseHash) {
            if (err) {
                return console.error(err);
            }
            // Insert the new user with hashed password and passphrase into the database
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

/**
 * Initializes the database and adds initial user records.
 * This function is the entry point for setting up the database and populating it
 * with initial data. It creates the database and adds a predefined set of users.
 */
function initializeDatabase() {
    createDatabase();
    // Add initial set of users with predefined usernames and passwords
    //todo: delete the hard coded credentials once proper signup is implemented
    addUser('admin', 'nimda', 'any');
    addUser('Marlon', 'nimda', 'lighter');
    addUser('Silas', 'nimda', 'hand');
    addUser('Oskar', 'nimda', 'pen');
    addUser('Laurin', 'nimda', 'watch');
    addUser('Ludwig', 'nimda', 'pointer');
}

module.exports = initializeDatabase;