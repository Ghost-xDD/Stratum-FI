"""
Setup configuration for Stratum Fi Keeper Bot
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="stratum-keeper-bot",
    version="1.0.0",
    author="Stratum Fi Team",
    description="Automated yield harvester for Stratum Fi self-repaying loans",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/stratum-fi-keeper",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.9",
    install_requires=[
        "web3>=6.15.1",
        "python-dotenv>=1.0.0",
        "requests>=2.31.0",
        "pydantic>=2.6.1",
        "pydantic-settings>=2.1.0",
        "prometheus-client>=0.19.0",
        "schedule>=1.2.1",
        "colorlog>=6.8.2",
        "tenacity>=8.2.3",
    ],
    entry_points={
        "console_scripts": [
            "stratum-keeper=keeper:main",
        ],
    },
)

