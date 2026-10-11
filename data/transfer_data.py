"""
Transfer CSV data to SQLite database (ndvs.db).

This script reads CSV files from the data/ directory and inserts
the data into their corresponding tables in assets/db/ndvs.db.

Mapping (all CSVs have uid -> id, other columns match by name):
  - prabhandham.csv  -> prabhandham    table
  - azhwars.csv      -> alwars         table
  - divya_desham.csv -> divya_deshams  table
  - acharyas.csv     -> acharyas       table
"""

import csv
import sqlite3
import os

# Resolve paths relative to this script's directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DB_PATH = os.path.join(PROJECT_DIR, "app", "assets", "db", "ndvs.db")
DATA_DIR = SCRIPT_DIR

# CSV filename -> (table name, list of (csv_col, db_col) mappings)
# 'uid' in CSV always maps to 'id' in the DB table.
# The CSV 'id' column is an export artifact and is skipped.
TRANSFERS = {
    "prabhandham.csv": {
        "table": "prabhandham",
        "columns": [
            ("uid", "id"),
            ("si_no", "si_no"),
            ("prabhandham", "prabhandham"),
            ("tamil_scripts", "tamil_scripts"),
            ("english_scripts", "english_scripts"),
            ("meaning", "meaning"),
            ("purport", "purport"),
            ("azhwar", "azhwar"),
            ("archavathara", "archavathara"),
            ("avataram", "avataram"),
            ("rasa", "rasa"),
        ],
    },
    "azhwars.csv": {
        "table": "alwars",
        "columns": [
            ("uid", "id"),
            ("name", "name"),
            ("incarnation", "incarnation"),
            ("bio", "bio"),
            ("time_period", "time_period"),
            ("birthplace", "birthplace"),
            ("taniyan_tamil", "taniyan_tamil"),
            ("taniyan_english", "taniyan_english"),
        ],
    },
    "divya_desham.csv": {
        "table": "divya_deshams",
        "columns": [
            ("uid", "id"),
            ("name", "name"),
            ("place", "place"),
            ("state", "state"),
            ("info", "info"),
            ("coordinates", "coordinates"),
        ],
    },
    "acharyas.csv": {
        "table": "acharyas",
        "columns": [
            ("uid", "id"),
            ("name", "name"),
            ("bio", "bio"),
            ("time_period", "time_period"),
            ("birthplace", "birthplace"),
        ],
    },
}


def transfer_csv(cursor: sqlite3.Cursor, csv_filename: str, config: dict) -> int:
    """
    Transfer a single CSV file into its target SQLite table.

    Args:
        cursor: SQLite cursor
        csv_filename: Name of the CSV file
        config: Dict with 'table' (str) and 'columns' (list of (csv_col, db_col) tuples)

    Returns:
        Number of rows inserted
    """
    csv_path = os.path.join(DATA_DIR, csv_filename)
    table = config["table"]
    col_mappings = config["columns"]

    if not os.path.exists(csv_path):
        print(f"  [SKIP] {csv_path} not found")
        return 0

    # Read CSV
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            values = []
            for csv_col, db_col in col_mappings:
                val = row.get(csv_col, "").strip()
                # Convert id to integer
                if db_col == "id":
                    values.append(int(val) if val else None)
                else:
                    values.append(val if val else None)
            rows.append(tuple(values))

    # Clear existing data and insert fresh
    db_cols = [db_col for _, db_col in col_mappings]
    placeholders = ", ".join(["?"] * len(db_cols))
    col_names = ", ".join(db_cols)

    cursor.execute(f"DELETE FROM {table}")
    cursor.executemany(
        f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})",
        rows,
    )
    return len(rows)


def main():
    print(f"Database: {DB_PATH}")
    print(f"Data dir: {DATA_DIR}")
    print()

    if not os.path.exists(DB_PATH):
        print(f"ERROR: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        for csv_filename, config in TRANSFERS.items():
            table = config["table"]
            print(f"Transferring {csv_filename} -> {table}...")
            count = transfer_csv(cursor, csv_filename, config)
            print(f"  Inserted {count} rows")

        conn.commit()
        print()
        print("All transfers complete!")

        # Verify counts
        print()
        print("Verification:")
        for config in TRANSFERS.values():
            table = config["table"]
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            row_count = cursor.fetchone()[0]
            print(f"  {table}: {row_count} rows")

    except Exception as e:
        conn.rollback()
        print(f"ERROR: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
