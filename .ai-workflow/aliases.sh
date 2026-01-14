#!/bin/bash
# AI Workflow 간편 시작 명령어
# 이 파일을 ~/.zshrc 또는 ~/.bashrc에 추가하세요:
# source /Users/jeanne/BADA-Report/.ai-workflow/aliases.sh

# 프로젝트 디렉토리로 이동하는 함수
function goto-bada() {
    cd /Users/jeanne/BADA-Report
}

# Claude 워크플로우 시작 (간편 버전)
alias claude-start='cat /Users/jeanne/BADA-Report/.ai-workflow/START_CLAUDE.md'

# Gemini 워크플로우 시작 (간편 버전)
alias gemini-start='cat /Users/jeanne/BADA-Report/.ai-workflow/START_GEMINI.md'

# 타임라인 확인
alias ai-timeline='cat /Users/jeanne/BADA-Report/.ai-workflow/TIMELINE.md'

# 최근 계획서 확인
alias ai-plans='ls -lt /Users/jeanne/BADA-Report/.ai-workflow/plans/ | head -6'

# 최근 QA 리포트 확인
alias ai-qa='ls -lt /Users/jeanne/BADA-Report/.ai-workflow/qa/ | head -6'

# 회고 확인
alias ai-retro='cat /Users/jeanne/BADA-Report/.ai-workflow/retrospectives/CURRENT_SPRINT.md'

# 전체 README 확인
alias ai-help='cat /Users/jeanne/BADA-Report/.ai-workflow/README.md'

echo "✅ AI Workflow aliases loaded!"
echo "사용 가능한 명령어:"
echo "  goto-bada        - 프로젝트 디렉토리로 이동"
echo "  claude-start     - Claude 워크플로우 시작"
echo "  gemini-start     - Gemini 워크플로우 시작"
echo "  ai-timeline      - 타임라인 확인"
echo "  ai-plans         - 최근 계획서 확인"
echo "  ai-qa            - 최근 QA 확인"
echo "  ai-retro         - 회고 확인"
echo "  ai-help          - 전체 가이드 확인"
