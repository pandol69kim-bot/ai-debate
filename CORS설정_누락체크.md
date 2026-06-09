# CORS(Cross-Origin Resource Sharing) 설정 누락 체크

- **날짜**: 2026-06-09

---

## 현재 CORS 설정 현황

### 백엔드 (`backend/app/main.py`)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 허용 Origin 기본값 (`backend/app/core/config.py`)

```python
ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://frontend:3000"]
```

### Docker Compose 오버라이드 (`docker-compose.yml`)

```
ALLOWED_ORIGINS: '["http://localhost:3000","http://localhost","http://frontend:3000"]'
```

---

## 체크리스트

### 로컬 개발 환경

| 항목 | 상태 | 비고 |
|------|------|------|
| `http://localhost:3000` 허용 | ✅ | 프론트 dev 서버 |
| `http://frontend:3000` 허용 | ✅ | Docker 내부 통신 |
| `allow_credentials=True` | ✅ | JWT 쿠키/헤더 허용 |
| `allow_methods=["*"]` | ✅ | GET/POST/DELETE/PATCH 모두 허용 |
| `allow_headers=["*"]` | ✅ | Authorization 헤더 포함 |

### SSE(EventSource) CORS

| 항목 | 상태 | 비고 |
|------|------|------|
| SSE 스트림 엔드포인트 CORS | ✅ | 동일 미들웨어 적용 |
| `EventSource` 는 credentials 미전송 | ⚠️ | 토큰을 URL 쿼리가 아닌 헤더로 전달 중 — EventSource는 커스텀 헤더 불가 |

---

## 발견된 문제점

### 1. 프로덕션 배포 시 ALLOWED_ORIGINS 미설정 (HIGH)

**.env.example에 `ALLOWED_ORIGINS` 항목 없음**

실제 도메인으로 배포 시 `.env`에 추가하지 않으면
기본값(`localhost:3000`)만 허용되어 **프로덕션 프론트에서 API 호출 전체 차단**

**수정 방안**: `.env.example`에 항목 추가

```
# CORS (배포 시 실제 도메인으로 변경)
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost","https://yourdomain.com"]
```

### 2. `allow_origins=["*"]` 와 `allow_credentials=True` 동시 사용 불가 (참고)

현재는 특정 Origin 목록을 사용하므로 문제없음.
만약 `allow_origins=["*"]`로 변경하면 `allow_credentials=True`와 함께 사용 불가
(브라우저 CORS 스펙 위반 — FastAPI가 런타임 오류 발생)

### 3. SSE EventSource 인증 문제 (MEDIUM)

`EventSource`는 커스텀 헤더(`Authorization`)를 지원하지 않음.
현재 SSE 스트림 엔드포인트(`/debate/{id}/stream`)는 **인증 없이 접근 가능**.

**현재 동작**: conversation_id를 알면 누구든 스트림 수신 가능  
**수정 방안**: URL 쿼리 파라미터로 토큰 전달 또는 쿠키 인증으로 전환

```python
# 예: 쿼리 파라미터 토큰
GET /api/v1/debate/{id}/stream?token=<jwt>
```

### 4. nginx.conf 파일 없음 (MEDIUM)

`docker-compose.yml`에서 `./docker/nginx/nginx.conf`를 마운트하지만
**해당 파일이 존재하지 않음** → `docker-compose up` 시 nginx 컨테이너 실행 실패

nginx에서 CORS 헤더를 추가로 설정할 경우 백엔드 CORS 헤더와 **중복** 발생 가능
(일부 브라우저에서 중복 헤더 오류)

---

## 환경별 ALLOWED_ORIGINS 권장값

| 환경 | 설정값 |
|------|--------|
| 로컬 개발 | `["http://localhost:3000"]` |
| Docker Compose | `["http://localhost:3000","http://localhost","http://frontend:3000"]` |
| 프로덕션 | `["https://yourdomain.com"]` |

---

## 개선 우선순위

| 우선순위 | 항목 | 파일 |
|---------|------|------|
| HIGH | `.env.example`에 `ALLOWED_ORIGINS` 추가 | `.env.example` |
| MEDIUM | SSE 엔드포인트 인증 처리 | `backend/app/api/routes/debate.py` |
| MEDIUM | `docker/nginx/nginx.conf` 파일 생성 | `docker/nginx/nginx.conf` |
| LOW | nginx CORS 헤더 중복 방지 확인 | `nginx.conf` |
