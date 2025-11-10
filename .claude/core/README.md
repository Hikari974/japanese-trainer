# Claude Code - Setup Guide

Quick setup guide for using this Claude Code template in a new project.

---

## Quick Setup (Interactive) - RECOMMENDED

**Setup in < 2 minutes with interactive questions:**

### 1. Copy .claude/ Folder

```bash
# Copy the entire .claude/ folder to your project root
cp -r /path/to/claude-code-template/.claude /path/to/your-project/
cd /path/to/your-project
```

### 2. Invoke Project Setup Agent

Open Claude Code in your project and say:

```
"Setup this project"
```

OR

```
"Configure the Claude Code template"
```

The **Project Setup Agent** will:
- Ask 4 simple questions (project name, backend, frontend, database)
- Generate `.claude/project.yml` automatically
- Generate `.claude/CLAUDE.md` personalized for your stack
- Create `.claude/tasks/context_session_1.md` initialized
- Clean generated folders (docs/, tasks/)
- Show configuration summary

**Next:** Read `.claude/core/METHODOLOGY.md` and start coding!

---

## Manual Setup (Fallback)

**If you prefer manual configuration or don't have Claude Code:**

### 1. Copy .claude/ Folder

```bash
# Copy the entire .claude/ folder to your project root
cp -r /path/to/claude-code-template/.claude /path/to/your-project/
cd /path/to/your-project
```

### 2. Clean Project-Specific Content

```bash
# Remove all generated plans and sessions
rm -rf .claude/docs/*
rm -rf .claude/tasks/*

# Restore README files
echo "# Agent Plans

This folder contains plans created by agents." > .claude/docs/README.md

echo "# Context Sessions

This folder contains context sessions." > .claude/tasks/README.md
```

### 3. Configure project.yml

Copy the template and customize:

```bash
cp .claude/core/templates/project.yml .claude/project.yml
```

Edit `.claude/project.yml`:

```yaml
project:
  name: "your-project-name"
  repository: "git@github.com:user/repo.git"
  version: "0.1.0"

stack:
  backend:
    framework: "fastapi"  # or django, nestjs, express, null
    language: "python"
    version: "Python 3.11+"

  frontend:
    framework: "react"    # or vue, angular, null
    meta: "Vite + React 18 + TypeScript"
    version: "React 18+"

  database:
    type: "postgresql"    # or mongodb, mysql, null
    version: "PostgreSQL 15+"

agents:
  plugins:
    backend: ["fastapi-expert"]      # Match your framework
    frontend: ["react-expert"]       # Match your framework
    database: ["postgresql-expert"]  # Match your database
```

### 4. Read the Methodology

**IMPORTANT:** Read `.claude/core/METHODOLOGY.md` first!

This file contains the complete work methodology. Understanding it is essential.

### 5. Create Initial Context Session

```bash
cp .claude/core/templates/context_template.md .claude/tasks/context_session_1.md
```

Edit `.claude/tasks/context_session_1.md` and fill in project details.

### 6. First Commit

```bash
git add .claude/
git commit -m "chore: setup Claude Code methodology infrastructure"
```

---

## File Structure

```
.claude/
├── core/                         # Generic (never modify)
│   ├── METHODOLOGY.md           # ⭐ Work methodology (READ THIS FIRST)
│   ├── system.md                # System configuration
│   ├── agents/                  # Core agents (3)
│   ├── rules/                   # Code review rules
│   ├── templates/               # Templates
│   └── README.md                # This file
│
├── plugins/                      # Stack-specific agents
│   ├── backend/
│   ├── frontend/
│   └── database/
│
├── project.yml                   # ⭐ YOUR PROJECT CONFIG (customize this)
├── docs/                         # Agent plans (generated)
└── tasks/                        # Context sessions (generated)
```

---

## Available Agents

### Core (Always Active)

- **Project Setup** - Interactive project configuration (one-time use)
- **Template Sync** - Synchronize template updates to project
- **DevOps Expert** - CI/CD, Docker, versioning, Git
- **Documentation Maintainer** - README, TODO, CHANGELOG
- **Code Review Agent** - Quality, security, best practices

### Plugins (Activate in project.yml)

**Backend:**
- fastapi-expert - Python FastAPI

**Frontend:**
- react-expert - React + Vite + TypeScript

**Database:**
- postgresql-expert - PostgreSQL

---

## Quick Reference

### Workflow

```
User Request → Identify Agent → Invoke → Read Plan → Validate → Implement
```

### Checkpoints (Mandatory)

- **VERSION:** DevOps Expert asks (release? version increment?)
- **TODO.md:** Verify updated before commit
- **CODE REVIEW:** Review if >100 lines or security/auth

### Fundamental Rules

1. Never assume tech choices
2. 1 responsibility = 1 function
3. Avoid verbosity
4. Plan BEFORE implementation

---

## Template Synchronization

Keep your project updated with latest template changes (new agents, methodology updates, rules).

### Interactive Sync (Recommended)

**List changes:**
```
User: "Check template updates"
→ Template Sync Agent lists changes (new files, modifications, conflicts)
```

**Apply changes:**
```
User: "Apply template sync"
→ Agent asks questions for each change
→ Apply approved changes interactively
→ Creates sync report
```

### Automated Sync (CI/CD)

```bash
# Run sync script (auto mode - safe files only)
./.claude/scripts/sync-template.sh --auto

# Interactive mode
./.claude/scripts/sync-template.sh
```

### Configuration

Edit `.claude/.template-config.yml`:
- `auto_sync`: Files synced automatically
- `merge_required`: Files requiring manual review
- `never_sync`: Files never synchronized (project-specific)

**See:** `.claude/core/agents/template-sync.md` for details

---

## Next Steps

1. Read `.claude/core/METHODOLOGY.md` ⭐
2. Configure `.claude/project.yml`
3. Create `.claude/tasks/context_session_1.md`
4. Start working with Claude Code agents!

---

**Remember:** The methodology is what matters, not the files.
