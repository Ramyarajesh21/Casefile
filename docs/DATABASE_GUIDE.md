# MySQL Workbench Guide

## 1. Install MySQL

Install MySQL Server and MySQL Workbench on your machine.

## 2. Open MySQL Workbench

Launch MySQL Workbench and create a local connection.

## 3. Connect to MySQL

Use the root account or a user with enough privileges to create databases.

## 4. Run the schema

Open `database/schema.sql` and execute it in MySQL Workbench.

## 5. Verify the database

Check that the `casefile_db` database exists and contains the required tables.

## 6. Seed the database

Open `database/seed.sql` and execute it.

## 7. Verify sample records

Check a few tables such as `users`, `cases`, and `suspects` to ensure records were inserted.

## 8. Configure backend .env

Update `backend/.env` to point to your local database.

## 9. Start Flask

```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## 10. Start React

```bash
cd frontend
npm install
npm run dev
```

## 11. Test login

Use the demo account:

- Username: detective_demo
- Password: Detective@123

## 12. Common errors

- Access denied: check your MySQL username/password
- Unknown database: verify `casefile_db` was created
- Table doesn't exist: run `schema.sql` again
- Connection refused: ensure MySQL service is running
- Incorrect password: confirm the username and password in your `.env` file
