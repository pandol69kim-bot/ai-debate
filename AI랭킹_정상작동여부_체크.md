# AI 랭킹 정상 작동 여부 체크

- **날짜**: 2026-06-09

---

## 랭킹 시스템 구조 요약

### 업데이트 시점
토론 완료(`done`) 시 `debate.py` 내 `run_debate_background` 태스크에서 자동 호출

```
토론 완료
  → JudgeEngine.evaluate() → 승자 결정
  → ConsensusEngine.generate()
  → RankingEngine.update_after_debate()  ← 여기서 랭킹 갱신
  → Conversation.status = DONE
```

### ELO 알고리즘
- 초기값: **1200.0**
- K-Factor: **32**
- 승자/패자 각각 ELO 조정 (패자가 여러 명일 경우 1:1 반복 계산)

### 업데이트 항목
| 항목 | 설명 |
|------|------|
| `elo_score` | ELO 공식으로 승패 반영 |
| `win_count` / `loss_count` | 승패 누적 |
| `total_debates` | 총 토론 수 |
| `avg_accuracy` | 누적 평균 정확도 점수 (judge 점수 / 50 정규화) |

### 현재 period 지원
- `all_time` 만 업데이트됨 (`weekly`, `monthly` 미집계)
- 프론트 필터에는 전체/이번 달/이번 주 탭이 존재하지만, **weekly·monthly 데이터는 항상 빈 목록**

---

## 체크리스트

### 백엔드

- [x] `GET /api/v1/rankings/?period=all_time` 엔드포인트 존재
- [x] `RankingEngine.update_after_debate()` — 토론 완료 시 호출
- [x] ELO 계산 로직 (`calculate_elo`) 구현
- [x] `_ensure_ranking()` — 첫 토론 시 랭킹 레코드 자동 생성
- [ ] **weekly / monthly 랭킹 미집계** → 토론 완료 시 `ALL_TIME`만 업데이트, 나머지 period 미처리
- [ ] **랭킹 초기 데이터 없음** — DB에 토론 완료 기록이 없으면 랭킹 페이지 빈 화면

### 프론트엔드

- [x] `/rankings` 페이지 존재
- [x] 전체 / 이번 달 / 이번 주 탭 필터
- [x] ELO 점수, 승/패/승률 표시
- [x] 승률 프로그레스 바
- [x] 데이터 없을 때 빈 화면 + "토론 시작하기" 안내
- [ ] **이번 달 / 이번 주 탭 — 항상 빈 화면** (백엔드 미집계)

---

## 잠재적 문제점

### 1. weekly / monthly 랭킹 미집계 (HIGH)
**현상**: 이번 달 / 이번 주 탭 클릭 시 항상 "아직 토론 기록이 없습니다"  
**원인**: `debate.py` 171번줄에서 `RankingPeriod.ALL_TIME`만 업데이트  
**수정 방안**:
```python
for period in [RankingPeriod.ALL_TIME, RankingPeriod.MONTHLY, RankingPeriod.WEEKLY]:
    await ranking_engine.update_after_debate(db, winner_provider, providers, scores_map, period)
```

### 2. avg_accuracy 정규화 기준 불명확 (LOW)
**현상**: judge 점수 합계(total)를 50으로 나눠 0~1 정규화  
**우려**: total이 50을 초과할 경우 1.0 초과 가능  
**수정 방안**: `min(score / 50.0, 1.0)` 클램핑 처리

### 3. 토론 삭제 시 랭킹 미보정 (MEDIUM)
**현상**: 관리자가 토론을 삭제해도 이미 반영된 ELO/승패는 그대로 유지  
**수정 방안**: 삭제 시 랭킹 롤백 또는 안내 문구 추가 (롤백 구현 복잡도 高)

---

## 수동 테스트 절차

1. Docker Desktop 실행 → `docker-compose up`
2. 토론 1회 완료 (done 상태 확인)
3. `GET http://localhost:8000/api/v1/rankings/?period=all_time` 응답 확인
4. `/rankings` 페이지에서 ELO 점수 표시 확인
5. "이번 달" / "이번 주" 탭 클릭 → 빈 화면 여부 확인 (현재 예상 동작)

---

## 개선 우선순위

| 우선순위 | 항목 |
|---------|------|
| HIGH | weekly / monthly 랭킹 집계 추가 |
| MEDIUM | 토론 삭제 시 랭킹 처리 정책 결정 |
| LOW | avg_accuracy 클램핑 처리 |
