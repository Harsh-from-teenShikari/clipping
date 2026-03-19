import sqlite3
import os

def migrate():
    db_path = "./clipping.db"
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found. Skipping migration.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if columns exist
        cursor.execute("PRAGMA table_info(verified_submissions)")
        columns = [column[1] for column in cursor.fetchall()]

        if "review_status" not in columns:
            print("Adding review_status column...")
            cursor.execute("ALTER TABLE verified_submissions ADD COLUMN review_status VARCHAR DEFAULT 'pending'")
        
        if "rejection_reason" not in columns:
            print("Adding rejection_reason column...")
            cursor.execute("ALTER TABLE verified_submissions ADD COLUMN rejection_reason VARCHAR")

        conn.commit()
        print("Migration completed successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
