---
name: saes-reporting-viz
description: Use when generating publication-grade tables (LaTeX, PDF, DOCX, Markdown, CSV), plots (boxplot, violin, critical-distance, bayesian-rank, ECDF), performance profiles, power analysis, or FAIR reproducibility artifacts with `saesV2`.
---

# SAES Visualization, Tables & Reproducibility

Requires `saesV2[viz]` for plotting.

## 1. Publication-Grade Plots (`plot` & `export_plot`)

```python
import saesV2

dataset = saesV2.load("benchmark.csv")

# Return Matplotlib Figure (or Plotly Figure if interactive=True)
fig = saesV2.plot(
    dataset,
    plot_type="critical-distance",
    metric="HV",
    interactive=False,
)

# Export directly to PNG, SVG, or PDF bytes
img_bytes, media_type, ext = saesV2.export_plot(
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
- Cell-level distributions: `'boxplot'`, `'violin'`, `'barplot'`, `'ecdf'`, `'lineplot'`, `'scatter'`
- Multi-instance rankings: `'critical-distance'`, `'bayesian-rank'`, `'bayesian-sign'`, `'bayesian-signed-rank'`

## 2. Statistical Benchmark Tables (`generate_table` & `export_table`)

```python
table = saesV2.generate_table(
    dataset,
    metric="HV",
    table_type="instance_algorithm",  # or "pairwise_matrix", "omnibus_posthoc"
    test_type="auto",                 # or "wilcoxon", "mann_whitney", "friedman", "kruskal", "anova_oneway", "anova_welch", "ttest_welch", "ttest_ind", "ttest_rel"
    posthoc_correction="holm",        # "holm", "bonferroni", "hochberg", "fdr_bh", "none"
    reference_algorithm=None,
    alpha=0.05,
    precision=4,
)

latex_bytes = saesV2.export_table(table, export_format="latex")
# Supported export_format: "latex", "csv", "markdown", "html", "docx", "pdf"
```

## 3. Performance Profiles, Power Analysis & FAIR Reproducibility

- **Dolan-Moré Performance Profiles & Win/Tie/Loss**:
  `prof = saesV2.profiles(dataset, metric="HV", alpha=0.05)`
- **Statistical Power & Sample Size Planning**:
  `pwr = saesV2.power(dataset, metric="HV", alpha=0.05, target_power=0.80, target_effect_size=0.50)`
- **Standalone Reproducibility Package** (Python script, Jupyter Notebook, environment manifest):
  `repro = saesV2.reproducibility(dataset, metric="HV", alpha=0.05, filename="benchmark.csv")`
