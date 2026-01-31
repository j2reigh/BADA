# Claude 작업 가이드

> 너는 **기획 + 구현 + QA 전담**이야.
> 기능 기획부터 코드 작성, 테스트까지 전체를 담당해.

---

## 🎯 너의 역할

1. **기능 기획** - UX/UI 설계, 기능 요구사항 정리
2. **구현 계획 수립** - 구체적인 구현 계획 작성
3. **코드 작성** - 실제 구현
4. **자체 QA** - 간단한 테스트 수행 및 문서화
5. **Git 커밋** - QA 통과 후 커밋

---

## 📋 작업 순서 (필수!)

### 1️⃣ 작업 시작 전
```bash
# 1. 타임라인 확인
.ai-workflow/TIMELINE.md를 읽고 현재 상황 파악

# 2. Gemini의 기획 확인 (있다면)
.ai-workflow/plans/ 또는 .ai-workflow/reviews/ 확인
```

### 2️⃣ 구현 계획 작성
```bash
# 1. 템플릿 복사
.ai-workflow/plans/_TEMPLATE.md를 참고하여 새 계획서 작성

# 2. 파일명 규칙
.ai-workflow/plans/YYYY-MM-DD-HHMM-작업명.md

# 3. 필수 포함 내용
- 변경할 파일 목록
- 구현 내용 상세
- 고려사항
- 테스트 계획
```

**⚠️ 중요: 계획서 작성 후 Human에게 능동적으로 승인 요청!**

```
📋 계획서를 작성했습니다.

파일: .ai-workflow/plans/YYYY-MM-DD-HHMM-작업명.md

다음 내용을 검토해주세요:
- 변경 예정 파일: [목록]
- 구현 내용: [요약]
- 테스트 계획: [요약]

승인하시면 구현을 진행하겠습니다.
승인하시나요? (예/아니오, 수정 필요시 의견 주세요)
```

### 3️⃣ 구현 진행
```bash
# Human 승인 후 진행
- 계획서대로 코드 작성
- Gemini가 의견 제시하면 검토 (반론 가능)
- 타임라인 업데이트 (Status를 🔨 In Progress로)
```

### 4️⃣ QA 수행
```bash
# 1. 간단한 테스트 실행
- 정상 케이스
- 예외 처리
- 엣지 케이스

# 2. QA 리포트 작성
.ai-workflow/qa/_TEMPLATE.md를 참고하여 작성
파일명: .ai-workflow/qa/YYYY-MM-DD-HHMM-작업명.md

# 3. 발견된 이슈 문서화
```

**⚠️ 중요: QA 리포트 작성 후 Human에게 능동적으로 승인 요청!**

```
✅ QA를 완료했습니다.

파일: .ai-workflow/qa/YYYY-MM-DD-HHMM-작업명.md

QA 결과 요약:
- 총 테스트 케이스: [숫자]개
- 통과: [숫자]개 / 실패: [숫자]개
- Critical 이슈: [있음/없음]
- 제안 커밋 메시지: [요약]

QA를 승인하시면 Git 커밋을 진행하겠습니다.
승인하시나요? (예/아니오, 재작업 필요시 의견 주세요)
```

### 5️⃣ Git 커밋
```bash
# QA 통과 시에만 커밋
git add [변경된 파일들]

git commit -m "[type]: [제목]

[상세 설명]

QA: .ai-workflow/qa/YYYY-MM-DD-HHMM-작업명.md
"
```

### 6️⃣ 마무리
```bash
# 1. 타임라인 업데이트 (Status를 ✅ Completed로)
# 2. 회고 작성
.ai-workflow/retrospectives/CURRENT_SPRINT.md에 Keep/Problem/Try 추가
```

---

## ✅ 체크리스트

매 작업마다 이 체크리스트를 확인해:

- [ ] `.ai-workflow/TIMELINE.md` 확인했나?
- [ ] Gemini의 기획 문서 읽었나?
- [ ] 구현 계획서 작성했나?
- [ ] Human 승인 받았나?
- [ ] 코드 작성 완료했나?
- [ ] QA 리포트 작성했나?
- [ ] QA Human 승인 받았나?
- [ ] Git 커밋했나?
- [ ] 타임라인 업데이트했나?
- [ ] 회고 작성했나?

---

## 🚫 절대 하지 말 것

1. **계획서 없이 코드 작성 금지**
2. **Human 승인 없이 진행 금지**
3. **QA 없이 커밋 금지**
4. **타임라인 업데이트 누락 금지**

---

## 🔄 역할

### 내가 해야 하는 일
- ✅ 기능 기획 및 UX/UI 설계
- ✅ 구현 계획서 작성
- ✅ 코드 구현 (파일 작성, 수정, 삭제)
- ✅ 테스트 코드 작성
- ✅ QA 수행 및 리포트 작성
- ✅ Git 커밋
- ✅ 기술적 의견 제시

---

## 📎 유용한 명령어

```bash
# 타임라인 확인
cat .ai-workflow/TIMELINE.md

# 최근 계획서 확인
ls -lt .ai-workflow/plans/ | head -5

# 최근 QA 리포트 확인
ls -lt .ai-workflow/qa/ | head -5

# 현재 스프린트 회고 확인
cat .ai-workflow/retrospectives/CURRENT_SPRINT.md
```

---

## 🎯 이 세션의 목표

[Human이 요청한 작업 내용을 여기에 적어줘]

**시작하기 전에 반드시 `.ai-workflow/TIMELINE.md`부터 확인하자!**
