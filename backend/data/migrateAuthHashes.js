require("dotenv").config();
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "coffee.sqlite");
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Không thể kết nối database:", err.message);
        process.exit(1);
    }
});

function isBcryptHash(value) {
    return typeof value === "string" && /^\$2[aby]\$/.test(value);
}

function listLegacyUsers() {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, username, password, security_answer FROM users", (err, rows) => {
            if (err) {
                return reject(err);
            }

            resolve(rows);
        });
    });
}

async function migrate() {
    const users = await listLegacyUsers();
    for (const user of users) {
        const updates = [];

        if (!isBcryptHash(user.password)) {
            updates.push(bcrypt.hash(user.password, SALT_ROUNDS));
        }

        if (user.security_answer && !isBcryptHash(user.security_answer)) {
            updates.push(bcrypt.hash(String(user.security_answer).trim().toLowerCase(), SALT_ROUNDS));
        }

        if (updates.length === 0) {
            continue;
        }

        const [hashedPassword, hashedSecurityAnswer] = await Promise.all(updates);

        await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET password = ?, security_answer = ? WHERE id = ?",
                [
                    isBcryptHash(user.password) ? user.password : hashedPassword,
                    user.security_answer && !isBcryptHash(user.security_answer) ? hashedSecurityAnswer : user.security_answer,
                    user.id
                ],
                (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }
            );
        });
    }

    console.log("Migration completed");
    db.close();
}

migrate().catch((err) => {
    console.error("Migration failed:", err.message);
    db.close();
    process.exit(1);
});
