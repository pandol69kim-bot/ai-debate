# 작업계획: 토론 내용 복사 / MD 다운로드 버튼

- **날짜**: 2026-06-09
- **작업자**: Claude Code

---

## 목표

토론 상세 페이지(`/debate/[id]`)에서 토론 내용을 클립보드로 복사하거나
Markdown 파일로 다운로드할 수 있는 버튼을 추가한다.

---

## 구현 범위

### 버튼 위치

토론 상세 페이지 상단 또는 하단에 두 버튼 배치:
- **복사** — 전체 토론 내용을 Markdown 형식으로 클립보드 복사
- **MD 다운로드** — `토론_{주제}_{날짜}.md` 파일로 다운로드

### MD 포맷 예시

```markdown
# AI Arena 토론

**주제**: 인공지능이 인간의 일자리를 대체할 것인가?
**날짜**: 2026-06-09
**참가 모델**: GPT-4o, Claude Opus, Gemini 2.0
**상태**: 완료

---

## Round 1

### GPT-4o
(내용)

### Claude Opus
(내용)

### Gemini 2.0
(내용)

---

## Round 2
...

---

## 심사 결과

**승자**: Claude Opus

| 모델 | 점수 |
|------|------|
| GPT-4o | 82 |
| Claude Opus | 91 |
| Gemini 2.0 | 78 |

**심사 요약**: (summary 내용)

---

## 합의 결론

(final_answer 내용)
```

---

## 단계별 작업 목록

### Step 1. MD 변환 유틸 함수 (`frontend/src/lib/debateToMarkdown.ts`)

- `debateToMarkdown(conversation, judgeResult?, consensusResult?)` 함수 작성
- 입력: ConversationOut + JudgeResultOut + ConsensusResultOut (모두 선택적)
- 출력: Markdown 문자열

### Step 2. 복사 / 다운로드 훅 (`frontend/src/hooks/useExportDebate.ts`)

```typescript
export function useExportDebate(conversation, judgeResult, consensusResult) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const md = debateToMarkdown(conversation, judgeResult, consensusResult);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const md = debateToMarkdown(conversation, judgeResult, consensusResult);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `토론_${conversation.topic.slice(0, 20)}_${날짜}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { copy, download, copied };
}
```

### Step 3. ExportButtons 컴포넌트 (`frontend/src/components/debate/ExportButtons.tsx`)

- `Copy` 아이콘 버튼: 클릭 시 2초간 `Check` 아이콘 + "복사됨" 표시
- `Download` 아이콘 버튼: 클릭 즉시 파일 다운로드
- 토론 완료(`done`) 상태가 아닐 때도 그 시점까지의 내용으로 동작

### Step 4. 토론 상세 페이지에 버튼 삽입 (`frontend/src/app/debate/[id]/page.tsx`)

- 페이지 상단 주제 옆 또는 하단 고정 영역에 `<ExportButtons />` 추가

---

## 파일 변경 목록 (예상)

| 파일 | 변경 |
|------|------|
| `frontend/src/lib/debateToMarkdown.ts` | 신규 — MD 변환 유틸 |
| `frontend/src/hooks/useExportDebate.ts` | 신규 — 복사/다운로드 훅 |
| `frontend/src/components/debate/ExportButtons.tsx` | 신규 — 버튼 컴포넌트 |
| `frontend/src/app/debate/[id]/page.tsx` | 수정 — ExportButtons 삽입 |

---

## 주의사항

- `navigator.clipboard.writeText` 는 HTTPS 또는 localhost에서만 동작
- 토론 진행 중(`running`) 상태에서도 부분 내용 복사 가능하도록 처리
- 파일명의 특수문자(`/`, `?`, `:` 등) 제거 처리 필요
- 심사결과·합의결론이 없을 때 해당 섹션 생략
