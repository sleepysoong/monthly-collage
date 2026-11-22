# 월간 콜라주 🍊

한 해 12개월을 귀여운 한 장에 담는 인스타용 콜라주 메이커 PWA.

**Live: https://sleepysoong.github.io/monthly-collage/**

첫 방문에 이름을 입력하면 `2026 월간 {이름}` 타이틀이 붙고, 1월~12월 사진을 월별로 골라
인스타 게시글 규격(4:3 · 2048×1536 JPEG) 한 장으로 뽑아준다. 홈 화면에 추가하면 오프라인에서도 동작한다.

## 기능

- 이름 온보딩 — 입력한 이름은 기기에만 저장되고 타이틀에 쓰인다
- 12개월 사진 선택 — 탭해서 고르고, ✕로 지우고, 다시 골라 바꿀 수 있다
- 4:3 콜라주 렌더 — 귀여운 손글씨 타이틀(`TtukttakGamja`), 월 칩, 빈 달은 이모지 플레이스홀더
- 저장/공유 — JPEG 다운로드 + 기기 공유 시트(Web Share)
- PWA — 설치 가능, 서비스 워커 캐시로 오프라인 동작
- Liquid Glass UI — Apple 스타일 글래스 크롬

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # tsc -b && vite build
npm run preview  # 빌드 결과 서빙 (SW/PWA 검증은 여기서)
npm run lint     # oxlint
```

`main` 브랜치에 push하면 GitHub Actions가 빌드해 GitHub Pages로 배포한다.

## 크레딧

- 타이틀 폰트: [뚝딱감자체 (TtukttakGamja)](https://noonnu.cc/) — Project Noonnu 제공, 로컬 번들
- Liquid Glass 기법: [shuding/liquid-glass](https://github.com/shuding/liquid-glass) (MIT)를 이 앱에 맞게 각색
- 아이콘: `script/generate-icons.mjs` (bun)로 재생성 가능

## 라이선스

MIT — [LICENSE](./LICENSE)
