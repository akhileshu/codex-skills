# Codex Skill Issues and Lessons

## Keep skill names under 64 characters

Codex skill names must use lowercase hyphen-case and be no longer than 64 characters. A name that exceeds this limit can fail validation and may not appear in Codex skill selectors.

Keep the same valid name in all naming surfaces:

- Skill folder name
- `SKILL.md` frontmatter `name`
- `agents/openai.yaml` `interface.display_name`
- README and `AGENTS.md` references

Validate new or renamed skills before finishing:

```bash
python3 /home/akhilesh/.codex/skills/.system/skill-creator/scripts/quick_validate.py /path/to/skill
```

Prefer a concise name that describes the skill’s action or scope rather than appending redundant role words such as `architect`.
