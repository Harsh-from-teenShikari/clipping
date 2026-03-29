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
        # ── verified_submissions columns ──────────────────────────────
        cursor.execute("PRAGMA table_info(verified_submissions)")
        vs_columns = [column[1] for column in cursor.fetchall()]

        if "review_status" not in vs_columns:
            print("Adding review_status column to verified_submissions...")
            cursor.execute("ALTER TABLE verified_submissions ADD COLUMN review_status VARCHAR DEFAULT 'pending'")

        if "rejection_reason" not in vs_columns:
            print("Adding rejection_reason column to verified_submissions...")
            cursor.execute("ALTER TABLE verified_submissions ADD COLUMN rejection_reason VARCHAR")

        # ── campaigns columns ─────────────────────────────────────────
        cursor.execute("PRAGMA table_info(campaigns)")
        camp_columns = [column[1] for column in cursor.fetchall()]

        if "operator_id" not in camp_columns:
            print("Adding operator_id column to campaigns...")
            cursor.execute("ALTER TABLE campaigns ADD COLUMN operator_id VARCHAR")

        conn.commit()
        print("Migration completed successfully.")

    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
