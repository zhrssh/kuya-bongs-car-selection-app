# Domain docs

This project uses a **multi-context** layout.

- `CONTEXT-MAP.md` at the root defines the mapping of contexts.
- Each context has its own `CONTEXT.md` file.
- ADRs are located under `docs/adr/`.

Skills requiring domain knowledge will parse `CONTEXT-MAP.md` to identify the relevant `CONTEXT.md` files based on the scope of the task.
