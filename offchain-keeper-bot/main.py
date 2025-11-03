#!/usr/bin/env python3
"""
Stratum Fi Keeper Bot - Entry Point
Main executable for running the automated yield harvester
"""

import sys
from pathlib import Path

# Add src to Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from keeper import main

if __name__ == "__main__":
    main()

