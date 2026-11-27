---
name: saes-python-api
description: Use when writing, debugging, or refactoring Python code that imports `saes` (or `saes`) for benchmark loading, validation, hypothesis testing, or statistical pipelines.
---

# SAES Python Library (`saes`) — API Guide

Target library: `saes >= 2.0.0` (`import saes`).

## Installation Extras

- `pip install saes` — Core statistical library (NumPy, Pandas, Pydantic V2, SciPy, Statsmodels)
- `pip install "saes[viz]"` — Adds Matplotlib, Seaborn, Plotly for `plot()` / `export_plot()`
- `pip install "saes[api]"` — Adds FastAPI / Uvicorn REST server
- `pip install "saes[all]"` — Full installation (`viz` + `api`)

## Standard End-to-End Pipeline

Always follow `load -> validate -> analyze/explore` when building scripts against `saes`:

```python
import saes

# 1. Load CSV (filepath or file-like buffer) -> Dataset
dataset = saes.load("benchmark.csv")

# 2. Validate structure, schema, and types -> ValidationReport
report_val = saes.validate(dataset)
if not report_val.is_valid:
    raise ValueError(f"Invalid dataset: {report_val}")

# 3. Explore distributions & get test recommendations -> DataExplorationResult
exploration = saes.explore(dataset, alpha=0.05)

# 4. Automated statistical analysis across all (instance, metric) cells -> AnalysisReport
#    paired=False by default (independent stochastic runs); pass paired=True for matched folds/CRN
report = saes.analyze(dataset, alpha=0.05, generate_plots=False, paired=False)
df_summary = report.to_dataframe()
cell = report.get(instance="ZDT1", metric="HV")
```

## Public Top-Level Functions (`saes.*`)

- `saes.load(source) -> Dataset`
- `saes.validate(dataset: Dataset) -> ValidationReport`
- `saes.analyze(dataset: Dataset, alpha: float = 0.05, generate_plots: bool = True, paired: bool = False) -> AnalysisReport`
- `saes.explore(dataset: Dataset, metrics=None, algorithms=None, instances=None, alpha: float = 0.05) -> DataExplorationResult`
- `saes.export_exploration(exploration, view_mode="reveal_metrics", export_format="csv", stat_format="mean_std", normality_filter="all", output_path=None) -> bytes`
- `saes.generate_table(..., paired: bool = False) -> StatisticalTableResult`
- `saes.export_table(table_result, export_format="latex", ...) -> bytes`
- `saes.plot(dataset, plot_type="boxplot", metric=None, instance=None, interactive=False, **kwargs) -> Figure`
- `saes.export_plot(dataset, plot_type="boxplot", metric=None, instance=None, export_format="png", dpi=300, **kwargs) -> tuple[bytes, str, str]`
- `saes.profiles(dataset, metric=None, alpha=0.05, max_tau=None, num_tau_points=60, paired=False, posthoc_correction="holm") -> PerformanceProfilesResult` (alias: `saes.compute_performance_profiles`)
- `saes.power(dataset, metric=None, alpha=0.05, target_power=0.80, target_effect_size=0.50, paired=False) -> PowerAnalysisResult` (alias: `saes.analyze_statistical_power`)
- `saes.tost(x1, x2, low_eqbound, high_eqbound=None, alpha=0.05, paired=False, equal_var=False, ...) -> TOSTResult` (alias: `saes.tost_equivalence_test`)
- `saes.compute_minimum_detectable_effect(n, target_power=0.80, alpha=0.05, paired=False) -> float`
- `saes.reproducibility(dataset, metric=None, alpha=0.05, filename="dataset.csv", raw_csv=None) -> ReproducibilityResult` (alias: `saes.generate_reproducibility_artifacts`)

## Low-Level Programmatic Namespace (`saes.statistics.*`)

Use `saes.statistics` when running specific tests on `groups: dict[str, np.ndarray]` or `Dataset` objects:

- **Assumptions**:
  - `saes.statistics.shapiro(groups, alpha=0.05) -> list[AssumptionResult]`
  - `saes.statistics.lilliefors(groups, alpha=0.05) -> list[AssumptionResult]`
  - `saes.statistics.anderson(groups, alpha=0.05) -> list[AssumptionResult]`
  - `saes.statistics.levene(groups, alpha=0.05) -> AssumptionResult`
- **Two-group & Multi-group Tests** (all take `groups: dict[str, np.ndarray], alpha: float = 0.05 -> StatisticalResult`, including `effect_size.ci_lower` / `ci_upper`):
  - Parametric: `saes.statistics.ttest_ind`, `saes.statistics.ttest_welch`, `saes.statistics.ttest_rel`, `saes.statistics.anova_oneway`, `saes.statistics.anova_welch`
  - Non-parametric: `saes.statistics.mann_whitney`, `saes.statistics.wilcoxon`, `saes.statistics.brunner_munzel`, `saes.statistics.kruskal`
- **Effect Sizes with CIs**:
  - `saes.statistics.cohens_d_ci(d, n1, n2=None, alpha=0.05, paired=False, hedges_correction=False) -> tuple[float, float]`
  - `saes.statistics.eta_squared_ci(f_stat, df_between, df_within, alpha=0.05) -> tuple[float, float]`
  - `saes.statistics.vargha_delaney_a12(x1, x2, maximize=True) -> tuple[float, str]`
  - `saes.statistics.vargha_delaney_a12_ci(x1, x2, maximize=True, alpha=0.05) -> tuple[float, str, tuple[float, float]]`
  - `saes.statistics.cliffs_delta(x1, x2, maximize=True) -> tuple[float, str]`
  - `saes.statistics.cliffs_delta_ci(x1, x2, maximize=True, alpha=0.05) -> tuple[float, str, tuple[float, float]]`
  - `saes.statistics.effect_size_forest(dataset, metric, scope="single-instance", instance=None, reference_algorithm=None, alpha=0.05, paired=False, p_adjust="holm") -> EffectSizeForestResult`
- **Multiple Comparisons & Post-Hoc Procedures**:
  - `saes.statistics.adjust_pvalues(p_values: list[float], method: str = "holm") -> list[float]` (`holm`, `bonferroni`, `hochberg`, `hommel`, `finner`, `holland`, `rom`, `li`, `fdr_bh`, `fdr_by`, `none`)
  - `saes.statistics.adjust_pvalues_shaffer(p_matrix) -> np.ndarray`
  - `saes.statistics.adjust_pvalues_bergmann_hommel(p_matrix, max_exact_k=9) -> tuple[np.ndarray, list[str]]`
  - `saes.statistics.tukey_hsd(groups, alpha=0.05) -> PostHocResult`
  - `saes.statistics.games_howell(groups, alpha=0.05) -> PostHocResult`
  - `saes.statistics.dunnett(groups, control, alpha=0.05) -> PostHocResult`
  - `saes.statistics.dunn(groups, alpha=0.05, p_adjust="holm") -> PostHocResult`
  - `saes.statistics.conover_iman(groups, alpha=0.05, p_adjust="holm") -> PostHocResult`
- **Multi-Instance Blocked Omnibus & Ranking**:
  - `saes.statistics.friedman_nemenyi(dataset, metric, alpha=0.05, scope="all-instances", instance=None) -> CriticalDistanceResult`
  - `saes.statistics.friedman_aligned_ranks(dataset, metric, alpha=0.05, scope="all-instances", instance=None) -> BlockedOmnibusResult`
  - `saes.statistics.quade(dataset, metric, alpha=0.05, scope="all-instances", instance=None) -> BlockedOmnibusResult`
  - `saes.statistics.rm_anova(dataset, metric, alpha=0.05, scope="all-instances", instance=None, greenhouse_geisser=True) -> BlockedOmnibusResult`
- **Bayesian Comparisons & Multi-Algorithm Ranking**:
  - `saes.statistics.bayesian_ranking(dataset, metric, scope="all-instances", instance=None, rope_percent=1.0, rope=None, prior_strength=1.0, num_samples=1500, algo_a=None, algo_b=None, method="signed-rank") -> BayesianRankResult`
  - Shorthands: `saes.statistics.bayesian_sign(...)`, `saes.statistics.bayesian_signed_rank(...)`
  - `saes.statistics.bayesian_correlated_ttest(x_a, x_b, algo_a=..., algo_b=..., rope=0.01, rho=None, maximize=True) -> BayesianCorrelatedTResult`
  - `saes.statistics.bayesian_plackett_luce(dataset, metric, scope="all-instances", instance=None, num_samples=400, prior_alpha=1.0) -> BayesianPlackettLuceResult`
- **Sensitivity (MDES) & Equivalence (TOST)**:
  - `saes.statistics.minimum_detectable_effect(n, target_power=0.80, alpha=0.05, paired=False) -> float`
  - `saes.statistics.tost(x1, x2, low_eqbound, high_eqbound=None, alpha=0.05, paired=False, equal_var=False) -> TOSTResult`

## Extensibility Registries & Python Plugins

- `saes.TestRegistry` + `saes.StatisticalTest` — Register custom hypothesis tests (runtime or PEP `entry_points`).
- `saes.TableRendererRegistry` + `saes.TableRenderer` — Register custom table export formats.
- `saes.PlotterRegistry` — Register custom plot generators.
- `saes.PluginRegistry` (package `saes.plugins`) + `saes.SAESPlugin` + `saes.PluginManifest` — Discover and register built-in (e.g. `pareto`) or external domain plugins via `saes.plugins.discover()`, `saes.plugins.list_installed()`, `saes.plugins.get(id)`, and `saes.plugins.get_namespace(id)`.
- **Built-in Pareto & EAF Plugin (`from saes.plugins import pareto`)**: `load_csv`, `load_directory`, `load_zip`, `load_reference_front`, `create_demo_collection`, `attainment`, `eaf_difference`, `coverage`, `plot(..., mode=..., show_reference=..., algorithms=..., legend_placement=..., title_mode=..., font_size=..., font_family=..., label_mode=..., bold_mode=..., show_grid=..., dark_theme=..., width_px=..., height_px=...)`, `export_plot`, and `FrontCollection.to_indicators_dataset() -> saes.Dataset`.

## Exceptions (`saes.domain.exceptions`)

Catch `SAESError` as the base exception, or specific subclasses:
`InputError`, `ValidationError`, `ConfigurationError`, `StatisticalAnalysisError`, `VisualizationError`, `InfrastructureError`.

## Authoring Rules

- Never reimplement statistical tests manually with `scipy.stats` when `saes` already exposes them; delegate to `saes`.
- All result objects are Pydantic V2 models (`model_dump()`, `model_dump_json()`) and expose `.summary()` / `.to_dataframe()` helpers.
- If unsure about an optional parameter on a specific `saes` version installed in the environment, inspect `inspect.signature(saes.<fn>)` in Python rather than guessing.
