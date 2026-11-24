---
name: saes-reporting-viz
description: Use when generating publication-grade tables (LaTeX, PDF, DOCX, Markdown, CSV), plots (boxplot, violin, critical-distance, bayesian-rank, ECDF), performance profiles, power analysis, or FAIR reproducibility artifacts with `saes`.
---

# SAES Visualization, Tables & Reproducibility

Requires `saes[viz]` for plotting and PDF table rendering.

## 1. Publication-Grade Plots (`plot` & `export_plot`)

```python
import saes

dataset = saes.load("benchmark.csv")

# Return Matplotlib Figure (or Plotly Figure if interactive=True)
fig = saes.plot(
    dataset,
    plot_type="critical-distance",
    metric="HV",
    interactive=False,
)

# Export directly to PNG, SVG, or PDF bytes
img_bytes, media_type, ext = saes.export_plot(
    dataset,
    plot_type="boxplot",
    metric="HV",
    instance="ZDT1",
    export_format="png",
    dpi=300,
)
with open(f"zdt1_boxplot.{ext}", "wb") as f:
    f.write(img_bytes)
```

Supported `plot_type` values:
- Cell-level distributions & effect sizes: `'boxplot'`, `'violin'`, `'barplot'`, `'ecdf'`, `'lineplot'`, `'scatter'`, `'effect-size-forest'`
- Multi-instance rankings: `'critical-distance'`, `'bayesian-rank'`, `'bayesian-sign'`, `'bayesian-signed-rank'`, `'plackett-luce'`

## 2. Statistical Benchmark Tables (`generate_table` & `export_table`)

```python
table = saes.generate_table(
    dataset,
    metric="HV",
    table_type="instance_algorithm",  # or "pairwise_matrix", "omnibus_posthoc"
    test_type="auto",                 # or "wilcoxon", "brunner_munzel", "mann_whitney", "friedman", "friedman_aligned", "quade", "rm_anova", "kruskal", "anova_oneway", "anova_welch", "ttest_welch", "ttest_ind", "ttest_rel"
    posthoc_correction="holm",        # "holm", "bonferroni", "hochberg", "hommel", "finner", "holland", "rom", "li", "fdr_bh", "fdr_by", "shaffer", "bergmann_hommel", "none"
    reference_algorithm=None,
    alpha=0.05,
    precision=4,
    paired=False,
)

latex_bytes = saes.export_table(table, export_format="latex")
# Supported export_format: "latex", "csv", "markdown", "html", "docx", "pdf"
# Custom renderers can be registered via saes.TableRendererRegistry.register(...)
```

## 3. Performance Profiles, Power / MDES / TOST & FAIR Reproducibility

- **Dolan-Moré Performance Profiles & Multiplicity-Adjusted Win/Tie/Loss**:
  `prof = saes.profiles(dataset, metric="HV", alpha=0.05, paired=False, posthoc_correction="holm")`
- **Statistical Power, Sample Size Planning & Sensitivity (MDES)**:
  `pwr = saes.power(dataset, metric="HV", alpha=0.05, target_power=0.80, target_effect_size=0.50, paired=False)`
  Inspect `pwr.sensitivity_audit` for per-cell MDES, or run `saes.tost(x1, x2, low_eqbound=0.05)` for formal equivalence testing.
- **Standalone Reproducibility Package** (Python script, Jupyter Notebook, FAIR environment manifest including `statsmodels_version`):
  `repro = saes.reproducibility(dataset, metric="HV", alpha=0.05, filename="benchmark.csv")`
