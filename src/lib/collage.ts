/*
 * 콜라주 렌더러 — 4:3(2048×1536) 인스타용 이미지.
 * 4열×3행 = 12개월, 귀여운 타이틀 + 오렌지 스와시 + 월 칩.
 * 레이아웃 수치의 계산 근거는 HANDOFF.md §6.
 */

export const CANVAS_W = 2048;
export const CANVAS_H = 1536;

export const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"] as const;
export const MONTH_EMOJI = ["🎉", "💝", "🌱", "🌸", "🌷", "☀️", "🌊", "🍉", "🍂", "🎃", "🍁", "⛄"] as const;

export interface Photo {
  img: HTMLImageElement;
  objectUrl: string;
}
export type MonthPhotos = readonly (Photo | null)[];

const FONT_STACK = "'TtukttakGamja', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";
const CREAM = "#FFF9F4";
const INK = "#5B4636";
const ACCENT = "#FB923C";
const ACCENT_DEEP = "#E8630A";
const SLOT_BG = "#F6EFE7";
const SLOT_LINE = "#E2D6C6";

const PAD_X = 72;
const TITLE_BASELINE = 150;
const GRID_TOP = 232;
const PAD_BOTTOM = 70;
const GAP = 26;
const COLS = 4;
const ROWS = 3;

/** i번째(0~11) 셀의 사각형 — QA 픽셀 프로브가 쓴다. */
export function cellRect(i: number): { x: number; y: number; w: number; h: number } {
  const w = (CANVAS_W - PAD_X * 2 - GAP * (COLS - 1)) / COLS;
  const h = (CANVAS_H - GRID_TOP - PAD_BOTTOM - GAP * (ROWS - 1)) / ROWS;
  return {
    x: PAD_X + (i % COLS) * (w + GAP),
    y: GRID_TOP + Math.floor(i / COLS) * (h + GAP),
    w,
    h,
  };
}

/** 캔버스 그리기 전에 폰트를 확정 로딩한다. 실패해도 시스템 폰트로 그려진다. */
export async function ensureCollageFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load("400 116px 'TtukttakGamja'"),
      document.fonts.load("400 40px 'TtukttakGamja'"),
    ]);
  } catch {
    // 시스템 폰트 폴백으로 계속 진행
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function glow(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string): void {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number): void {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
}

function drawCell(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, i: number): void {
  const { x, y, w, h } = cellRect(i);

  ctx.save();
  roundedRect(ctx, x, y, w, h, 30);
  ctx.clip();
  if (img) {
    drawCover(ctx, img, x, y, w, h);
  } else {
    ctx.fillStyle = SLOT_BG;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 0.55;
    ctx.font = `400 130px ${FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(MONTH_EMOJI[i], x + w / 2, y + h / 2 + 10);
    ctx.globalAlpha = 1;
    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = SLOT_LINE;
    ctx.lineWidth = 4;
    roundedRect(ctx, x + 10, y + 10, w - 20, h - 20, 22);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();

  // 월 칩 (클립 밖 — 그림자가 잘리지 않게)
  const label = `${MONTH_LABELS[i]} ${MONTH_EMOJI[i]}`;
  ctx.save();
  ctx.font = `400 40px ${FONT_STACK}`;
  const chipW = ctx.measureText(label).width + 44;
  const chipH = 64;
  const chipX = x + 16;
  const chipY = y + 16;
  ctx.shadowColor = "rgba(91,70,54,0.22)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  roundedRect(ctx, chipX, chipY, chipW, chipH, 32);
  ctx.fill();
  ctx.restore();

  ctx.font = `400 40px ${FONT_STACK}`;
  ctx.fillStyle = ACCENT_DEEP;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, chipX + 22, chipY + chipH / 2 + 2);
}

export function drawCollage(
  canvas: HTMLCanvasElement,
  opts: { name: string; year: number; photos: MonthPhotos },
): void {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  glow(ctx, 130, 100, 640, "rgba(251,146,60,0.16)");
  glow(ctx, CANVAS_W - 120, CANVAS_H - 90, 600, "rgba(255,209,148,0.14)");

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 116px ${FONT_STACK}`;
  const title = `${opts.year} 월간 ${opts.name} ✨`;
  ctx.fillText(title, CANVAS_W / 2, TITLE_BASELINE);
  const tw = ctx.measureText(title).width;
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(CANVAS_W / 2 - tw / 2 + 8, 182);
  ctx.quadraticCurveTo(CANVAS_W / 2, 206, CANVAS_W / 2 + tw / 2 - 8, 180);
  ctx.stroke();

  for (let i = 0; i < COLS * ROWS; i++) {
    drawCell(ctx, opts.photos[i]?.img ?? null, i);
  }

  ctx.font = `400 30px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(91,70,54,0.42)";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("made with 월간 콜라주 💕", CANVAS_W - PAD_X, CANVAS_H - 28);
}
