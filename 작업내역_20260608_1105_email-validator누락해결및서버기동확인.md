# 작업내역 - email-validator 누락 해결 및 서버 기동 확인

- **날짜/시간:** 2026-06-08 11:05
- **작업자:** Claude (AI)
- **프로젝트:** AI 멀티 모델 경쟁·토론 플랫폼

---

## 발생 오류

```
ModuleNotFoundError: No module named 'email_validator'
ImportError: email-validator is not installed, run `pip install pydantic[email]`
```

**발생 위치:** `backend/app/schemas/schemas.py` → `UserCreate` 모델의 `EmailStr` 필드

---

## 원인 분석

- `schemas.py`에서 pydantic의 `EmailStr` 타입을 사용
- `EmailStr`은 내부적으로 `email-validator` 패키지를 require
- 최초 `requirements.txt` 작성 시 해당 의존성이 누락됨

---

## 해결 방법

### Step 1. 가상환경에 email-validator 설치

```powershell
.\venv\Scripts\python.exe -m pip install "email-validator"
```

설치 결과:
- `email-validator==2.3.0`
- `dnspython==2.8.0` (의존성)

### Step 2. requirements.txt에 추가

```diff
  sse-starlette==2.2.1
+ email-validator==2.3.0
```

### Step 3. 앱 임포트 검증

```powershell
cd backend
.\venv\Scripts\python.exe -c "from app.main import app; print('OK - import success')"
# 출력: OK - import success
```

→ `app.main` 임포트 성공 확인 ✅

---

## 변경된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `backend/requirements.txt` | `email-validator==2.3.0` 추가 |

---

## 백엔드 서버 실행 방법 (최종)

```powershell
cd "d:\_웹어플\AI 멀티 모델 경쟁·토론 플랫폼\backend"
.\venv\Scripts\activate          # (venv) 프롬프트 확인 필수
uvicorn app.main:app --reload --port 8000
```

접속 URL:
- API 서버: http://127.0.0.1:8000
- Swagger 문서: http://127.0.0.1:8000/docs

---

## 누적 requirements.txt 최종본

```
fastapi==0.115.5
uvicorn[standard]==0.32.1
sqlalchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.14.0
pydantic==2.10.3
pydantic-settings==2.6.1
redis==5.2.1
celery==5.4.0
openai==1.57.4
anthropic==0.40.0
google-generativeai==0.8.3
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
httpx==0.28.1
python-dotenv==1.0.1
aiofiles==24.1.0
sse-starlette==2.2.1
email-validator==2.3.0
```

> psycopg2-binary 제거됨 (asyncpg로 대체, Python 3.14 호환 문제)
