"""
Run this ONCE before running main.py to create all database tables.
Usage: uv run python setup_db.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from app.database.connection import engine, get_database_url
from app.database.models import Base

def setup():
    print(f"Connecting to: {get_database_url()}")
    try:
        Base.metadata.create_all(engine)
        print("✓ All tables created successfully:")
        for table in Base.metadata.tables:
            print(f"  - {table}")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup()