/*
 * Liquid Glass 변위 맵 — shuding/liquid-glass(MIT, 2025, https://github.com/shuding/liquid-glass)의
 * rounded-rect SDF 변위 맵 생성 기법을 이 앱용으로 각색. App.tsx의 공유 SVG 필터 #lg-map에 주입된다.
 * R 채널 = 수평 변위, G 채널 = 수직 변위 (feDisplacementMap 규격).
 */

const SIZE = 200;
const HALF_UV = 0.42;
const RADIUS_UV = 0.18;

function smoothStep(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function roundedRectSDF(x: number, y: number, w: number, h: number, r: number): number {
  const qx = Math.abs(x) - w + r;
  const qy = Math.abs(y) - h + r;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

export function glassMapDataURL(): string {
  const data = new Uint8ClampedArray(SIZE * SIZE * 4);
  const raw: number[] = [];
  let max = 0;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const ix = x / SIZE - 0.5;
      const iy = y / SIZE - 0.5;
      const dist = roundedRectSDF(ix, iy, HALF_UV, HALF_UV, RADIUS_UV);
      // 가장자리에서 중심을 향해 샘플을 끌어오는 굴절 (shuding의 smoothStep 폴백 곡선)
      const disp = smoothStep(0, 1, smoothStep(0.8, 0, dist - 0.15));
      const dx = -ix * disp;
      const dy = -iy * disp;
      max = Math.max(max, Math.abs(dx), Math.abs(dy));
      raw.push(dx, dy);
    }
  }

  let i = 0;
  for (let p = 0; p < raw.length; p += 2) {
    data[i++] = (raw[p] / max + 0.5) * 255;
    data[i++] = (raw[p + 1] / max + 0.5) * 255;
    data[i++] = 0;
    data[i++] = 255;
  }

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.putImageData(new ImageData(data, SIZE, SIZE), 0, 0);
  return canvas.toDataURL();
}
