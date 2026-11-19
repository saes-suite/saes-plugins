# SAES Agent Plugins & Skills (`saes-plugins`)

Official Claude Code plugin marketplace and cross-agent skills repository for the **SAES (Stochastic Algorithm Evaluation Suite)** ecosystem.

## Included Plugins & Skills

### `saes` (`./plugins/saes`)
Pure context & methodology plugin (no MCP server required) designed for **agentic development using the `saesV2` Python library** directly.

Includes three on-demand skills (`SKILL.md` standard):
- `saes-python-api`: Public Python API (`saesV2.load`, `validate`, `explore`, `analyze`, `statistics.*`, models, exceptions).
- `saes-methodology`: Required tidy benchmark CSV schema, automated statistical test routing, effect sizes, and reporting rules.
- `saes-reporting-viz`: Publication-grade plots (`plot`, `export_plot`), tables (`generate_table`, `export_table`), performance profiles, power analysis, and FAIR reproducibility packages.

---

## Installation

### Option 1: Universal (Claude Code, Antigravity, Cursor, Codex, Gemini CLI)

Using the standard Agent Skills CLI (`skills.sh`):

```bash
npx skills add saes-suite/saes-plugins
```

### Option 2: Claude Code (Native Plugin Marketplace)

```text
/plugin marketplace add saes-suite/saes-plugins
/plugin install saes@saes-plugins
```

### Option 3: Antigravity / Manual `.agents/skills/` Setup

Copy or symlink the skills into your project's `.agents/skills/` (or `~/.gemini/config/skills/` for global availability):

```bash
mkdir -p .agents/skills
ln -s /path/to/saes-plugins/plugins/saes/skills/* .agents/skills/
```

---

## Local Development & Validation

Test the plugin locally in Claude Code without installing from GitHub:

```bash
claude --plugin-dir ./plugins/saes
```

Run repository validation (`make ci`):

```bash
make ci
```
