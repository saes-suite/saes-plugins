---
name: saes-methodology
description: Use when preparing benchmark CSV datasets, choosing statistical tests, or interpreting SAES hypothesis test results, effect sizes, and rankings for stochastic algorithms.
---

# SAES Statistical Methodology & Benchmark Schema

## 1. Required Benchmark CSV Schema

Every CSV loaded by `saesV2.load()` must follow the tidy long format with these required columns:

| Column | Type | Meaning |
| :--- | :--- | :--- |
| `algorithm` | `str` | Algorithm / solver name |
| `instance` | `str` | Problem instance / benchmark task |
| `metric` | `str` | Evaluation metric name (e.g. `HV`, `IGD`, `runtime`) |
| `run_id` | `int` | Integer run / seed identifier |
| `value` | `float` | Observed numeric metric value |
| `maximize` | `bool` | `true` if higher is better (e.g. Hypervolume), `false` if lower is better (e.g. IGD, error) |

Always validate with `saesV2.validate(dataset)` before running analyses or generating tables/plots.

## 2. Automated Test Selection & Assumption Checking

When writing or reviewing statistical evaluation logic:

- **2 algorithms (independent samples)**:
  1. Check normality per group (Shapiro-Wilk via `saesV2.statistics.shapiro`).
  2. Check variance homogeneity (Levene's test via `saesV2.statistics.levene`).
  3. If normal + equal variances -> Student's `ttest_ind`.
  4. If normal + unequal variances -> Welch's `ttest_welch`.
  5. If non-normal -> `mann_whitney` (or `wilcoxon` when paired across matched `run_id`/instances).
- **>2 algorithms (single `(instance, metric)` cell)**:
  1. Check normality and homoscedasticity.
  2. If normal + homoscedastic -> `anova_oneway`.
  3. If normal + heteroscedastic -> `anova_welch`.
  4. If non-normal -> `kruskal` (or `friedman_nemenyi` across multiple instances).
- **Multiple instances (omnibus + post-hoc)**:
  - Frequentist: `friedman_nemenyi` (Demšar 2006 Friedman + Nemenyi Critical Distance).
  - Bayesian: `bayesian_ranking` / `bayesian_signed_rank` / `bayesian_sign` (Benavoli et al. 2017) with a Region of Practical Equivalence (`rope_percent`, default `1.0`).

## 3. Reporting Standards

- **Never report p-values alone**: always pair statistical significance ($p < \alpha$) with **effect size** (Cohen's $d$, $\eta^2$, Vargha-Delaney $A_{12}$, or Cliff's $\delta$) and practical significance.
- **Multiple comparisons**: apply `adjust_pvalues(..., method="holm")` (or `bonferroni`, `hochberg`, `fdr_bh`) whenever conducting pairwise post-hoc tests.
- **Optimization direction**: always respect `maximize` when ranking algorithms or interpreting $A_{12}$ / Cliff's $\delta$.
- **Sample size & power**: use `saesV2.power(dataset, metric=..., target_power=0.80)` to audit whether non-significant results are underpowered rather than evidence of equivalence.
