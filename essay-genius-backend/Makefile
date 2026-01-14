.PHONY: help docker-preview docker-clean

KEYWORD ?=

SCRIPT := ./scripts/docker-clean-by-keyword.sh

help:
	@echo "Usage:"
	@echo "  make docker-preview KEYWORD=essay"
	@echo "  make docker-clean   KEYWORD=essay"

docker-preview:
	@if [ -z "$(KEYWORD)" ]; then \
		echo "❌ KEYWORD is required"; exit 1; \
	fi
	@echo "🔍 Preview delete with keyword: $(KEYWORD)"
	@docker ps -a --format "{{.ID}} {{.Image}}" | grep "$(KEYWORD)" || true
	@docker images --format "{{.ID}} {{.Repository}}:{{.Tag}}" | grep "$(KEYWORD)" || true

docker-clean:
	@if [ -z "$(KEYWORD)" ]; then \
		echo "❌ KEYWORD is required"; exit 1; \
	fi
	@chmod +x $(SCRIPT)
	@$(SCRIPT) $(KEYWORD)

