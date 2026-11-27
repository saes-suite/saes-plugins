# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Documented `saes.PluginRegistry` (`saes.plugins`), `saes.SAESPlugin`, `saes.PluginManifest`, and the built-in `pareto` plugin plotting/EAF APIs in `saes-python-api/SKILL.md`.

## [Released]

## [1.0.0] — 2026-11-24 (@rorro6787)

### Changed

- Updated `.github/workflows/release.yml` to authenticate release stamp pushes and GitHub Releases via the `saes-release-bot` GitHub App (`actions/create-github-app-token@v1`) so protected `main` rulesets remain enforced.
- **Breaking (v1.0.0)**: Migrated all `saes-plugins` skills (`saes-python-api`, `saes-methodology`, `saes-reporting-viz`), manifests, and documentation from `saesV2` to canonical **`saes >= 2.0.0`** (`pip install saes`, `import saes`).
- Synchronized skills with all `saes` 2.0 public APIs: explicit `paired=False` default, Lilliefors & Anderson–Darling normality checkers, Brunner–Munzel test, effect-size CI helpers (`cohens_d_ci`, `eta_squared_ci`, `vargha_delaney_a12_ci`, `cliffs_delta_ci`, `effect_size_forest`), 11 multiple-testing adjustments + Shaffer & Bergmann–Hommel, post-hoc tests (`tukey_hsd`, `games_howell`, `dunnett`, `dunn`, `conover_iman`), blocked omnibus tests (`friedman_aligned_ranks`, `quade`, `rm_anova`), Bayesian correlated $t$-test & Plackett–Luce ranking, MDES sensitivity & TOST equivalence testing, `plackett-luce` / `effect-size-forest` plotters, and `TestRegistry` / `TableRendererRegistry` extensibility APIs.

## [0.2.1] — 2026-11-20 (@rorro6787)

### Added
- Automatic git tag (`vX.Y.Z`) creation and GitHub Release publishing in `.github/workflows/release.yml`.

## [0.2.0] — 2026-11-19 (@rorro6787)

### Added
- Initial Claude Code plugin marketplace (`.claude-plugin/marketplace.json`) and `saes` plugin (`plugins/saes/.claude-plugin/plugin.json`).
- Core `saesV2` Python development skills: `saes-python-api`, `saes-methodology`, and `saes-reporting-viz`.
- Versioning, release stamping (`scripts/release_stamp.js`), plugin validation (`scripts/validate.py`), `Makefile`, and GitHub Actions CI/CD workflows (`.github/workflows/tests.yml`, `.github/workflows/release.yml`).

