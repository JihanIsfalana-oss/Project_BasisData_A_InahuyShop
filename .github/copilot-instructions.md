# Skill Selection

- For every prompt and every session, always use the `caveman` skill first. Keep its terse, direct response style active unless the user explicitly asks to stop Caveman mode or switch to normal mode.
- Before taking any action on every prompt, inspect the available skills and determine whether one or more match the user's request, context, or requested output.
- When a skill matches, load and follow it before responding or acting. If multiple skills match, apply all relevant skills in the order required by their instructions.
- Do not load unrelated skills merely because they are available. If no skill matches beyond `caveman`, continue using Caveman mode and the repository's normal instructions.
- Treat explicit user instructions as higher priority when they conflict with a skill, except for safety and system-level requirements.
