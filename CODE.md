<!-- 
# TEMPLATE: CODE.template.md
# INSTRUCTIONS FOR THE AI AGENT:
# This file governs programming guidelines, syntax conventions, indentation (tabs vs spaces), 
# ordering, and regions formatting. Every single code file must adhere strictly to these rules!
-->

# Code

## Go to...
- ▪️[AGENTS.md](AGENTS.md)
- ▪️[AILOG.md](AILOG.md)
- ▪️[AITASKS.md](AITASKS.md)
- ▪️[BUILD.md](BUILD.md)
- 🔸[CODE.md](CODE.md)
- ▪️[FEATURES.md](FEATURES.md)
- ▪️[MANUAL.md](MANUAL.md)
- ▪️[README.md](README.md)
- ▪️[SPEC.md](SPEC.md)
- ▪️[TESTING.md](TESTING.md)

## Implementation Guidelines
- **Encoding Safety**: Preserve UTF-8 signatures. Ensure icons, characters, emojis, and unicode symbols are written cleanly without corruption (mojibake).
- **Target Changes Only**: Avoid complete file rewrites. Prefer minor, highly precise surgical patches to retain existing code blocks and comments intact.

### Markdown Guidelines
- Use dashes (`-`) instead of asterisks (`*`) for Bullet list items.
- Maintain UPPERCASE.md documents cleanly with alphabetical features lists, updated logs, and checked backlogs.

### Formatting & Syntax Style
- **Indentation**: Specify spacing preference [e.g., "Use tabs for indentation" or "Use 2 spaces"].
- **Braces and Blocks**: Specify structural block guidelines [e.g., "Always use braces for control expressions (if, for, while), never inline single-line statements without brackets"].
- **Naming Conventions**: Specify casing for variables, functions, and files [e.g., camelCase, PascalCase, snake_case].

#### Global Function Ordering
- Specify function ordering policies [e.g., "Order by dependency within a region: a function is listed immediately after the ones it depends on. If no dependencies exist, sort them alphabetically."].

### Regions Division Style
<!-- 
  INSTRUCTION: Specify standard regions delimiters (#region / #endregion) 
  and naming rules to group structures systematically.
-->
- **Classes**: Wrap classes inside regions named `_classes`, or `_class_{classname}`.
- **Example Regions Map**:
  ```typescript
  // #region _globals
  const g_settingX = "Value";
  // #endregion

  // #region _classes
  // #region _class_Handler
  class Handler { ... }
  // #endregion
  // #endregion
  ```

---
## Go back to...
- ▪️[AGENTS.md](AGENTS.md)
- ▪️[AILOG.md](AILOG.md)
- ▪️[AITASKS.md](AITASKS.md)
- ▪️[BUILD.md](BUILD.md)
- 🔸[CODE.md](CODE.md)
- ▪️[FEATURES.md](FEATURES.md)
- ▪️[MANUAL.md](MANUAL.md)
- ▪️[README.md](README.md)
- ▪️[SPEC.md](SPEC.md)
- ▪️[TESTING.md](TESTING.md)
