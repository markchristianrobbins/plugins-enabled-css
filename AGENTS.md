<!-- 
# TEMPLATE: AGENTS.template.md
# INSTRUCTIONS FOR THE AI AGENT:
# This file defines the operational boundaries, tool restrictions, platforms, 
# and instructions for the AI Coding Agent working on this project.
# Use this template to keep the AI aligned on scope and prevent unsafe edits.
# Populate all placeholder fields [indicated by brackets] with real project constraints.
-->

<!-- markdownlint-disable MD013 -->
# AGENTS

<!-- 
  INSTRUCTION: Maintain this list of primary documentation files. 
  Ensure they are formatted as beautiful markdown links pointing back and forth.
-->
## AI Primary Files
- 🔸[AGENTS.md](AGENTS.md)
- ▪️[AILOG.md](AILOG.md)
- ▪️[AITASKS.md](AITASKS.md)
- ▪️[BUILD.md](BUILD.md)
- ▪️[CODE.md](CODE.md)
- ▪️[FEATURES.md](FEATURES.md)
- ▪️[MANUAL.md](MANUAL.md)
- ▪️[README.md](README.md)
- ▪️[SPEC.md](SPEC.md)
- ▪️[TESTING.md](TESTING.md)

<!-- 
  INSTRUCTION: Specify the core objective / purpose of the application.
  Provide a concise 1-2 sentence description of what system is being built.
-->
## Application
- [Describe the core application/extension being built here, e.g., "A VS Code extension to bind files together..."]

<!-- 
  INSTRUCTION: List the environment, target runner, code editors, OS, 
  or platforms where this app compiles and executes.
-->
## Platform
- [Specify platforms, e.g., Cursor, VS Code, Node.js, AHK, Windows, Web, etc.]

<!-- 
  INSTRUCTION: Document strict instructions regarding what the AI can and cannot modify.
  This includes package.json rules, read-only third party vendor folders, etc.
-->
## File Restrictions
- [List any strict file edits rules, e.g., "Do not create new files unless requested", "package.json field edits list"]

<!-- 
  INSTRUCTION: Maintain a hard list of restricted files that should NEVER be deleted, 
  renamed, modified, or altered in any shape or form by the AI.
-->
### Do NOT alter Files
- `!🌐index.md`
- `!🏗️setup.md`
- `.gitignore`
- [List other critical files, e.g., tsconfig.json, LICENSE, .eslintrc.json, etc.]

<!-- 
  INSTRUCTION: Specify how the AI parses inline tasks/comments in the source code.
  Example: //! task comments, TODO, FIXME annotations.
-->
### Inline Tasks
- [Specify inline system tasks parser format, e.g., "comments in the form of //! {instructions} found in ts/js code are AI Tasks"]

<!-- 
  INSTRUCTION: Detail the environment context (e.g., test fixtures, sandboxing, 
  permissions, emulator settings, mock data rules).
-->
## Project Context
- [Describe any local development directories or resources, e.g., "The test-fixture folder is for standalone testing only."]

<!-- 
  INSTRUCTION: List verification rules that MUST happen before complete cycles are closed.
  For example, running 'lint_applet' or 'compile_applet'.
-->
## Build
- **Linter & Verification**: [Provide check rules, e.g., "Always run lint_applet after edits before finishing your turn."]

<!-- 
  INSTRUCTION: Link directly to the code quality guidelines and style preferences.
-->
## Code Styling and Preferences
- See [CODE](./CODE.md)

---
## Go to...
- 🔸[AGENTS.md](AGENTS.md)
- ▪️[AILOG.md](AILOG.md)
- ▪️[AITASKS.md](AITASKS.md)
- ▪️[BUILD.md](BUILD.md)
- ▪️[CODE.md](CODE.md)
- ▪️[FEATURES.md](FEATURES.md)
- ▪️[MANUAL.md](MANUAL.md)
- ▪️[README.md](README.md)
- ▪️[SPEC.md](SPEC.md)
- ▪️[TESTING.md](TESTING.md)
