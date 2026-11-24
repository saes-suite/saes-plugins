---
name: saes-methodology
description: Use when preparing benchmark CSV datasets, choosing statistical tests, or interpreting SAES hypothesis test results, effect sizes, and rankings for stochastic algorithms.
---

# SAES Statistical Methodology & Benchmark Schema

## 1. Required Benchmark CSV Schema

Every CSV loaded by `saes.load()` must follow the tidy long format with these required columns:

| Column | Type | Meaning |
| :--- | :--- | :--- |
| `algorithm` | `str` | Algorithm / solver name |
| `instance` | `str` | Problem instance / benchmark task |
| `metric` | `str` | Evaluation metric name (e.g. `HV`, `IGD`, `runtime`) |
| `run_id` | `int` | Integer run / seed identifier |
| `value` | `float` | Observed numeric metric value |
| `maximize` | `bool` | `true` if higher is better (e.g. Hypervolume), `false` if lower is better (e.g. IGD, error) |

Always validate with `saes.validate(dataset)` before running analyses or generating tables/plots.

## 2. Explicit Pairing & Automated Test Selection

- **Never assume pairing from matching `run_id` indices**: Independent stochastic runs numbered `0..29` are unpaired (`paired=False`, the default across `saes.analyze`, `saes.generate_table`, `saes.profiles`, and `saes.power`). Pass `paired=True` explicitly only when using identical cross-validation folds or Common Random Numbers (CRN).
- **2 algorithms (independent samples, `paired=False`)**:
  1. Check normality per group (`saes.statistics.shapiro`, `saes.statistics.lilliefors`, or `saes.statistics.anderson`).
  2. Check variance homogeneity (`saes.statistics.levene`).
  3. If normal + equal variances -> Student's `saes.statistics.ttest_ind`.
  4. If normal + unequal variances -> Welch's `saes.statistics.ttest_welch`.
  5. If non-normal -> `saes.statistics.mann_whitney` (or `saes.statistics.brunner_munzel` for non-parametric heteroscedastic stochastic equality).
- **2 algorithms (explicitly paired, `paired=True`)**:
  1. Check Shapiro-Wilk normality on paired differences $x_1 - x_2$.
  2. If normal -> `saes.statistics.ttest_rel`; if non-normal -> `saes.statistics.wilcoxon`.
  3. For repeated $k$-fold cross-validation, prefer `saes.statistics.bayesian_correlated_ttest(..., rho=n_test / n_train)`.
- **>2 algorithms (single `(instance, metric)` cell)**:
  1. Normal + homoscedastic -> `saes.statistics.anova_oneway` + `saes.statistics.tukey_hsd` (or `saes.statistics.dunnett` vs. control).
  2. Normal + heteroscedastic -> `saes.statistics.anova_welch` + `saes.statistics.games_howell`.
  3. Non-normal -> `saes.statistics.kruskal` + `saes.statistics.dunn` or `saes.statistics.conover_iman`.
- **Multiple instances (blocked omnibus + post-hoc)**:
  - Never run unblocked One-Way ANOVA or Kruskal-Wallis on pooled instance means.
  - Frequentist blocked omnibus: `saes.statistics.friedman_nemenyi` (exact tie-corrected Friedman + Iman-Davenport + Nemenyi CD), `saes.statistics.friedman_aligned_ranks`, `saes.statistics.quade`, or `saes.statistics.rm_anova` (with Greenhouse-Geisser $\varepsilon$).
  - Bayesian blocked analysis: `saes.statistics.bayesian_signed_rank` / `saes.statistics.bayesian_sign` (Benavoli et al. 2017, exact DP prior with optional absolute `rope` in metric units) and `saes.statistics.bayesian_plackett_luce` (Calvo et al. 2018).

## 3. Reporting Standards

- **Never report p-values alone**: always pair statistical significance ($p < \alpha$) with **effect size and its confidence interval** (Cohen's $d$ / Hedges' $g$ via noncentral-$t$, $\eta^2$ via noncentral-$F$, Vargha-Delaney $A_{12}$, or Cliff's $\delta$ via Brunner-Munzel logit CI).
- **Multiple comparisons**: apply `saes.statistics.adjust_pvalues(..., method="holm")` (or `bonferroni`, `hochberg`, `hommel`, `finner`, `holland`, `rom`, `li`, `fdr_bh`, `fdr_by`), or matrix-level `saes.statistics.adjust_pvalues_shaffer` / `saes.statistics.adjust_pvalues_bergmann_hommel` for all-pairs comparisons.
- **Optimization direction**: always respect `maximize` when ranking algorithms or interpreting $A_{12}$ / Cliff's $\delta$.
- **Power, sensitivity & equivalence**: never interpret a non-significant $p \ge \alpha$ as evidence of equivalence, and avoid relying on observed ("post-hoc") power (Hoenig & Heisey 2001). Report a priori sample size planning (`saes.power`), Minimum Detectable Effect Size (`saes.statistics.minimum_detectable_effect`), and formal equivalence testing via `saes.tost` (Schuirmann 1987; Lakens 2017).
