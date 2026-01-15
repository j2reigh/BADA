---
type: guide
category: deployment
last_updated: 2026-01-15
status: current
---

# 🚀 BADA 배포 가이드

BADA 프로젝트를 다양한 환경에 배포하는 방법을 설명합니다.

---

## 📋 환경 요구사항

### 시스템 요구사항
- **Node.js**: 18.x 이상
- **PostgreSQL**: 14.x 이상
- **TypeScript**: 5.6.3

### 필수 환경 변수

```bash
# 데이터베이스
SUPABASE_DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]  # fallback

# AI 서비스
GEMINI_API_KEY=your_google_ai_api_key

# 이메일 서비스 (선택)
RESEND_API_KEY=your_resend_api_key

# 세션 (프로덕션)
SESSION_SECRET=your_random_secret_key

# 포트 설정
PORT=5001  # 기본값, 다른 포트는 방화벽에 막혀있음
```

---

## 🔧 Replit 배포 (추천)

### Replit 환경 특징
BADA는 Replit 환경에서 최적화되어 있습니다.

```typescript
// 프로젝트 구조
BADA-Report/
├── client/           # React 프론트엔드
├── server/           # Express 백엔드
├── shared/           # 공유 타입/스키마
├── lib/              # 핵심 비즈니스 로직
└── package.json      # 통합 빌드 스크립트
```

### 배포 과정

1. **의존성 설치**
```bash
npm install
```

2. **데이터베이스 스키마 적용**
```bash
npm run db:push
```

3. **서버 시작**
```bash
npm run dev    # 개발 모드
npm run start  # 프로덕션 모드
```

### Replit 특화 설정

```typescript
// server/index.ts - 포트 설정
const port = parseInt(process.env.PORT || "5001", 10);

// Replit에서는 5001 포트만 외부 접근 가능
// 다른 포트는 방화벽으로 차단됨
```

### 빌드 프로세스

```json
// package.json 스크립트
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "tsx script/build.ts",
    "start": "NODE_ENV=production node dist/index.cjs",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

---

## 🗄️ 데이터베이스 설정

### Supabase PostgreSQL (권장)

```typescript
// 연결 우선순위 (server/db.ts)
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

// Supabase URL 형식
// postgresql://[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

### 스키마 마이그레이션

```bash
# 개발 환경
drizzle-kit push --verbose

# 프로덕션 환경  
NODE_ENV=production drizzle-kit push
```

### 중요한 테이블

```sql
-- 주요 테이블 구조
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL,
  name varchar(255),
  marketing_consent boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE saju_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id),
  user_input jsonb NOT NULL,      -- 설문 응답 + 출생 정보
  saju_data jsonb,                -- 사주팔자 계산 결과
  report_data jsonb,              -- AI 생성 리포트
  is_paid boolean DEFAULT false, -- 결제 상태
  created_at timestamp DEFAULT now()
);
```

---

## 🤖 AI 서비스 설정

### Google Gemini API

```typescript
// lib/gemini_client.ts 설정
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

// API 사용량 모니터링 필요
// 사용자당 약 $0.02-0.05 비용 발생
```

### 비용 최적화

```typescript
// 중복 리포트 방지 로직
const existingResult = await storage.findSajuResultByEmail(email);
if (existingResult) {
  // 기존 리포트 재사용, API 호출 없음
  return existingResult;
}

// 새 리포트 생성시만 Gemini API 호출
const reportData = await generateSajuReport(sajuData, surveyScores);
```

---

## 📧 이메일 서비스 (선택)

### Resend 설정 (권장)

```typescript
// 이메일 발송 설정
const resend = new Resend(process.env.RESEND_API_KEY);

// 인증 이메일 템플릿
await resend.emails.send({
  from: 'BADA <noreply@yourdomain.com>',
  to: userEmail,
  subject: '🔮 Your BADA Report is Ready!',
  html: verificationEmailTemplate(reportId)
});
```

### 이메일 없이 배포

```typescript
// 이메일 서비스 없이도 동작 가능
// 콘솔에 인증 링크 출력
console.log(`Verification link: ${verificationUrl}`);
```

---

## 🔐 보안 설정

### 세션 관리

```typescript
// express-session + PostgreSQL
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    connectionString: databaseUrl
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));
```

### 환경 변수 보안

```bash
# .env 파일 (개발용만)
GEMINI_API_KEY=your_key_here
SUPABASE_DATABASE_URL=postgresql://...

# 프로덕션에서는 시스템 환경 변수 사용
# Replit Secrets 또는 서버 환경 설정
```

---

## 🏗️ 빌드 최적화

### TypeScript 컴파일

```typescript
// tsconfig.json 핵심 설정
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["client/src", "server", "shared", "lib"]
}
```

### 프론트엔드 빌드

```typescript
// vite.config.ts 최적화
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', 'framer-motion']
        }
      }
    }
  }
});
```

---

## 📊 성능 모니터링

### 로그 설정

```typescript
// server/index.ts 로깅
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  
  console.log(`${formattedTime} [${source}] ${message}`);
}

// API 요청 로깅
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});
```

### 헬스 체크

```typescript
// 기본 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// 상세 헬스 체크 (향후)
app.get('/health/detailed', async (req, res) => {
  const checks = {
    database: await checkDatabaseConnection(),
    gemini: await checkGeminiApi(),
    email: await checkEmailService()
  };
  
  res.json(checks);
});
```

---

## 🚨 트러블슈팅

### 자주 발생하는 문제

**1. 포트 문제**
```bash
# 에러: EADDRINUSE: address already in use :::5001
pkill -f "tsx server/index.ts"
npm run dev
```

**2. 데이터베이스 연결 실패**
```bash
# 스키마 동기화 확인
psql $SUPABASE_DATABASE_URL -c "\d saju_results"

# 누락된 컬럼 추가
ALTER TABLE saju_results ADD COLUMN is_paid BOOLEAN DEFAULT false;
```

**3. Gemini API 에러**
```typescript
// API 키 확인
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

// 요청 제한 확인
// 분당 60회, 일일 1000회 제한 (무료 티어)
```

**4. 빌드 에러**
```bash
# 타입 체크
npm run check

# 캐시 클리어
rm -rf node_modules/.cache
rm -rf dist
npm run build
```

### 디버깅 명령어

```bash
# 프로세스 확인
ps aux | grep "tsx server"
lsof -i :5001

# 데이터베이스 상태
psql $SUPABASE_DATABASE_URL -c "SELECT COUNT(*) FROM leads;"
psql $SUPABASE_DATABASE_URL -c "SELECT COUNT(*) FROM saju_results;"

# 로그 확인  
tail -f /tmp/server.log | grep "\[Assessment\]"
```

---

## 🔄 CI/CD 설정 (향후)

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Replit
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run check
      - run: npm run build
      
      # Replit 배포 스크립트
      - run: ./scripts/deploy-to-replit.sh
```

### 배포 체크리스트

배포 전 확인사항:

- [ ] 환경 변수 모두 설정됨
- [ ] `npm run check` 타입 체크 통과
- [ ] `npm run build` 빌드 성공
- [ ] 데이터베이스 마이그레이션 적용
- [ ] Gemini API 키 유효성 확인
- [ ] 포트 5001 외부 접근 가능
- [ ] 헬스 체크 엔드포인트 응답
- [ ] 샘플 설문 제출 테스트

---

## 📚 관련 문서

- **[아키텍처 문서](ARCHITECTURE.md)** - 시스템 구조 상세
- **[API 레퍼런스](API_REFERENCE.md)** - API 엔드포인트 (예정)
- **[Gumroad 설정](../config/GUMROAD_SETUP.md)** - 결제 연동
- **[트러블슈팅](../.ai-workflow/TROUBLESHOOTING.md)** - 문제 해결 기록

---

**마지막 업데이트:** 2026-01-15