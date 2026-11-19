---
name: saes-python-api
description: Use when writing, debugging, or refactoring Python code that imports `saesV2` (or `saes`) for benchmark loading, validation, hypothesis testing, or statistical pipelines.
---

# SAES Python Library (`saesV2`) — API Guide

Target library: `saesV2 >= 0.2.0` (`import saesV2` or backward-compatibility alias `import saes`).

## Installation Extras

- `pip install saesV2` — Core statistical library (NumPy, Pandas, Pydantic, SciPy, Statsmodels, Tabulate)
- `pip install "saesV2[viz]"` — Adds Matplotlib, Seaborn, Plotly for `plot()` / `export_plot()`
- `pip install "saesV2[api]"` — Adds FastAPI / Uvicorn REST server
- `pip install "saesV2[all]"` — Full installation (`viz` + `api`)

## Standard End-to-End Pipeline

Always follow `load -> validate -> analyze/explore` when building scripts against `saesV2`:

```python
import saesV2

# 1. Load CSV (filepath or file-like buffer) -> Dataset
dataset = saesV2.load("benchmark.csv")

# 2. Validate structure, schema, and types -> ValidationReport
report_val = saesV2.validate(dataset)
if not report_val.is_valid:
    raise ValueError(f"Invalid dataset: {report_val}")

# 3. Explore distributions & get test recommendations -> DataExplorationResult
exploration = saesV2.explore(dataset, alpha=0.05)

# 4. Automated statistical analysis across all (instance, metric) cells -> AnalysisReport
report = saesV2.analyze(dataset, alpha=0.05, generate_plots=False)
df_summary = report.to_dataframe()
cell = report.get(instance="ZDT1", metric="HV")
```

## Public Top-Level Functions (`saesV2.*`)

- `saesV2.load(source) -> Dataset`
- `saesV2.validate(dataset: Dataset) -> ValidationReport`
- `saesV2.analyze(dataset: Dataset, alpha: float = 0.05, generate_plots: bool = True) -> AnalysisReport`
- `saesV2.explore(dataset: Dataset, metrics=None, algorithms=None, instances=None, alpha: float = 0.05) -> DataExplorationResult`
- `saesV2.export_exploration(exploration, view_mode="reveal_metrics", export_format="csv", stat_format="mean_std", normality_filter="all", output_path=None) -> bytes`
- `saesV2.generate_table(...) -> StatisticalTableResult`
- `saesV2.export_table(table_result, export_format="latex", ...) -> bytes`
- `saesV2.plot(dataset, plot_type="boxplot", metric=None, instance=None, interactive=False, **kwargs) -> Figure`
- `saesV2.export_plot(dataset, plot_type="boxplot", metric=None, instance=None, export_format="png", dpi=300, **kwargs) -> tuple[bytes, str, str]`
- `saesV2.profiles(dataset, metric=None, alpha=0.05, max_tau=None, num_tau_points=60) -> PerformanceProfilesResult` (alias: `compute_performance_profiles`)
- `saesV2.power(dataset, metric=None, alpha=0.05, target_power=0.80, target_effect_size=0.50) -> PowerAnalysisResult` (alias: `analyze_statistical_power`)
- `saesV2.reproducibility(dataset, metric=None, alpha=0.05, filename="dataset.csv", raw_csv=None) -> ReproducibilityResult` (alias: `generate_reproducibility_artifacts`)

## Low-Level Programmatic Namespace (`saesV2.statistics.*`)

Use `saesV2.statistics` when running specific tests on `groups: dict[str, np.ndarray]` or `Dataset` objects:

- **Assumptions**:
  - `saesV2.statistics.shapiro(groups, alpha=0.05) -> list[AssumptionResult]`
  - `saesV2.statistics.levene(groups, alpha=0.05) -> AssumptionResult`
- **Two-group & Multi-group Tests** (all take `groups: dict[str, np.ndarray], alpha: float = 0.05 -> StatisticalResult`):
  - Parametric: `ttest_ind`, `ttest_welch`, `ttest_rel`, `anova_oneway`, `anova_welch`
  - Non-parametric: `mann_whitney`, `wilcoxon`, `kruskal`
- **Effect Sizes & Multiple Comparisons**:
  - `saesV2.statistics.vargha_delaney_a12(x1, x2, maximize=True) -> tuple[float, str]`
  - `saesV2.statistics.cliffs_delta(x1, x2, maximize=True) -> tuple[float, str]`
  - `saesV2.statistics.adjust_pvalues(p_values: list[float], method: str = "holm") -> list[float]` (`holm`, `bonferroni`, `hochberg`, `fdr_bh`)
- **Multi-Instance Ranking**:
  - `saesV2.statistics.friedman_nemenyi(dataset, metric, alpha=0.05, scope="all-instances", instance=None) -> CriticalDistanceResult`
  - `saesV2.statistics.bayesian_ranking(dataset, metric, scope="all-instances", instance=None, rope_percent=1.0, num_samples=1500, algo_a=None, algo_b=None, method="signed-rank") -> BayesianRankResult`
  - Shorthands: `bayesian_sign(...)`, `bayesian_signed_rank(...)`

## Exceptions (`saesV2.domain.exceptions`)

Catch `SAESError` as the base exception, or specific subclasses:
`InputError`, `ValidationError`, `ConfigurationError`, `StatisticalAnalysisError`, `VisualizationError`, `InfrastructureError`.

## Authoring Rules

- Never reimplement statistical tests manually with `scipy.stats` when `saesV2` already exposes them; delegate to `saesV2`.
- All result objects are Pydantic V2 models (`model_dump()`, `model_dump_json()`).
- If unsure about an optional parameter on a specific `saesV2` version installed in the environment, inspect `inspect.signature(saesV2.<fn>)` in Python rather than guessing.
