# DB 마이그레이션 주의사항

- **날짜**: 2026-06-09
- **관련 작업**: 관리자 메뉴 및 토론 삭제 구현

---

## 변경 내용

`users` 테이블에 `is_admin` 컬럼이 추가되었습니다.

| 컬럼 | 타입 | 기본값 |
|------|------|--------|
| `is_admin` | `BOOLEAN` | `FALSE` |

---

## 신규 DB (Docker 최초 실행)

별도 작업 불필요. `docker-compose up` 시 SQLAlchemy가 자동으로 테이블을 생성합니다.

---

## 기존 DB가 있는 경우

PostgreSQL에서 수동으로 컬럼을 추가해야 합니다.

```sql
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
```

또는 `backend/alter_add_is_admin.py` 스크립트 실행:

```bash
cd backend
venv/Scripts/python.exe alter_add_is_admin.py
```

---

## 관리자 계정 설정

컬럼 추가 후 `set_admin.py`로 관리자 권한을 부여합니다.

```bash
cd backend
venv/Scripts/python.exe set_admin.py admin@arena.com
```

### 현재 관리자 계정

| 이메일 | is_admin |
|--------|----------|
| `admin@arena.com` | `True` ✅ |

---

## 주의

- 기존 로그인 세션(localStorage)에는 `is_admin` 필드가 없습니다.
- 기존 로그인 유저는 **로그아웃 후 재로그인**해야 관리자 메뉴가 표시됩니다.
