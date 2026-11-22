# AGENTS.md — 월간 콜라주 (monthly-collage)

인스타용 4:3(2048×1536) 월간 콜라주 생성 PWA. 이름 입력 → 1~12월 사진 선택 → 한 장 이미지.
배포: https://sleepysoong.github.io/monthly-collage/ · 전체 인수인계 상태는 `HANDOFF.md`(깃 제외), 실행 계획은 `PLAN.md` 참고.

## 명령어

- `npm run dev` — 개발 서버
- `npm run build` — `tsc -b && vite build` (타입체크 포함, 검증의 기준)
- `npm run preview` — dist 서빙. SW/PWA 검증은 반드시 빌드 후 이걸로
- `npm run lint` — oxlint

## 구조

- `src/lib/collage.ts` — 캔버스 렌더러(2048×1536, 4×3 그리드) + 월 상수. 레이아웃 수치는 `HANDOFF.md` §6
- `src/components/` — `Onboarding`(이름 게이트·localStorage), `MonthGrid`(12칸 선택), `PreviewSheet`(미리보기 + 저장/공유)
- `src/assets/fonts/` — `TtukttakGamja` woff2 로컬 번들. `src/fonts.css`가 로딩
- `src/liquid-glass.css` — 리퀴드 글래스. 출처: shuding/liquid-glass(MIT) 벤더링. Chromium은 `html.lg-distort` 클래스로 SVG 왜곡 업그레이드, Safari/FF는 프로스티 폴백
- `public/` — `manifest.webmanifest`, `sw.js`, `icons/` (아이콘 재생성: `bun script/generate-icons.mjs`)
- `.github/workflows/deploy.yml` — `main` push → 빌드 후 GitHub Pages 배포

## 절대 규칙

- **의존성 추가 금지.** PWA는 직접 만든 manifest + sw.js로 충분하다.
- `vite.config.ts`의 `base: './'` 유지 — GitHub Pages 서브패스(`/monthly-collage/`) 대응. 참조는 전부 상대경로로, `/...` 절대경로 금지.
- 타이틀 폰트 `TtukttakGamja`(weight 400 단일) 고정 — 사용자가 핀한 결정이다.
- 키컬러는 오렌지. 팔레트는 `src/styles.css`의 CSS 변수(`--bg`, `--ink`, `--accent`, `--accent-deep`)로만 관리한다.
- `sw.js`를 수정하면 `VERSION` 문자열을 bump해 캐시를 무효화한다.
- 콜라주 출력 규격 고정: 2048×1536 JPEG(q 0.92), 4×3 그리드, 타이틀 `2026 월간 {이름} ✨`.

## 검증 관습

- UI 변경 → 모바일 뷰포트(390×844) 스크린샷으로 확인 후 커밋.
- SW/manifest 변경 → `npm run build` 후 `npm run preview`에서 등록·캐시 동작 확인.
- 라이브 확인: `curl -sI https://sleepysoong.github.io/monthly-collage/` → 200.

## 배포

- `main` push → Actions가 `npm ci` → `npm run build` → Pages 배포. 수동 트리거: `gh workflow run deploy.yml`
- 레포: `sleepysoong/monthly-collage` (gh CLI 계정 `sleepysoong` 인증됨)
