.PHONY: sync-codex-skills

sync-codex-skills:
	@mkdir -p ./codex-skills
	@find ./codex-skills -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
	@cp -a /home/akhilesh/.codex/skills/. ./codex-skills/
	@echo "Mirrored /home/akhilesh/.codex/skills/ into ./codex-skills/"
