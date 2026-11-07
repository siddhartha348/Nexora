"""Idempotent demo seed. Run from the repo root: python seed.py"""

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "backend"))

from app.db.mongo import db_manager  # noqa: E402
from app.db.seed import seed_demo_data  # noqa: E402


async def main() -> None:
    await db_manager.connect_db()
    await seed_demo_data()
    await db_manager.close_db()
    print("Seed finished.")


if __name__ == "__main__":
    asyncio.run(main())
