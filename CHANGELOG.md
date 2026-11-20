# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [Released]

## [0.2.1] — 2026-11-20 (@rorro6787)

### Added
- Automatic git tag (`vX.Y.Z`) creation and GitHub Release publishing in `.github/workflows/release.yml`.

## [0.2.0] — 2026-11-19 (@rorro6787)

### Added
- Initial Claude Code plugin marketplace (`.claude-plugin/marketplace.json`) and `saes` plugin (`plugins/saes/.claude-plugin/plugin.json`).
- Core `saesV2` Python development skills: `saes-python-api`, `saes-methodology`, and `saes-reporting-viz`.
- Versioning, release stamping (`scripts/release_stamp.js`), plugin validation (`scripts/validate.py`), `Makefile`, and GitHub Actions CI/CD workflows (`.github/workflows/tests.yml`, `.github/workflows/release.yml`).

