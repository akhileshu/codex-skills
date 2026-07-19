.PHONY: sync-codex-skills sync-agents-example

sync-codex-skills:
	@mkdir -p ./codex-skills
	@find ./codex-skills -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
	@cp -a /home/akhilesh/.codex/skills/. ./codex-skills/
	@echo "Mirrored /home/akhilesh/.codex/skills/ into ./codex-skills/"

sync-agents-example:
	@tmp="$$(mktemp)"; \
	trap 'rm -f "$$tmp"' EXIT; \
	: > "$$tmp"; \
	skills="$$(sed -n 's#^| \[`\([^`]*\)`\].*#\1#p' README.md)"; \
	for skill in $$skills; do \
		skill_file="/home/akhilesh/.codex/skills/$$skill/SKILL.md"; \
		test -f "$$skill_file" || { echo "Missing skill file: $$skill_file" >&2; exit 1; }; \
		entry="$$(awk '/^## AGENTS[.]md Reference Entry$$/ { in_entry=1; next } in_entry && /^- \*\*Skill Reference:/ { print; in_block=1; next } in_block && /^  - / { print; next } in_block { exit }' "$$skill_file")"; \
		test -n "$$entry" || { echo "Missing AGENTS.md Reference Entry: $$skill" >&2; exit 1; }; \
		printf '%s\n\n' "$$entry" >> "$$tmp"; \
	done; \
	mv "$$tmp" AGENTS.example.md; \
	trap - EXIT; \
	echo "Mirrored README-listed skill references into AGENTS.example.md"
