import { useEffect, useRef, useState } from "react";
import { CANVAS_H, CANVAS_W, drawCollage, ensureCollageFonts, type MonthPhotos } from "../lib/collage";

interface Props {
  name: string;
  year: number;
  photos: MonthPhotos;
  onClose: () => void;
}

type ShareNavigator = Navigator & { canShare?: (data: ShareData) => boolean };

function webShareSupported(): boolean {
  const nav = navigator as ShareNavigator;
  if (typeof nav.share !== "function" || typeof nav.canShare !== "function") return false;
  return nav.canShare({ files: [new File([new Blob()], "probe.jpg", { type: "image/jpeg" })] });
}

export default function PreviewSheet({ name, year, photos, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const [shareable] = useState(webShareSupported);

  useEffect(() => {
    let alive = true;
    (async () => {
      await ensureCollageFonts();
      const canvas = canvasRef.current;
      if (!alive || !canvas) return;
      drawCollage(canvas, { name, year, photos });
    })();
    return () => {
      alive = false;
    };
  }, [name, year, photos]);

  const fileName = `월간-${name}-${year}.jpg`;

  const toBlob = () =>
    new Promise<Blob | null>((resolve) => {
      canvasRef.current?.toBlob(resolve, "image/jpeg", 0.92);
    });

  const save = async () => {
    setBusy(true);
    try {
      const blob = await toBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], fileName, { type: "image/jpeg" });
    try {
      await navigator.share({ files: [file], title: `월간 ${name}` });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) throw err;
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet liquid-glass" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="미리보기">
        <h2>이렇게 나왔어! 🎀</h2>
        <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} aria-label="콜라주 미리보기" />
        <div className="sheet-actions">
          <button type="button" className="primary-btn" onClick={save} disabled={busy}>
            {busy ? "만드는 중…" : "이미지 저장 💾"}
          </button>
          {shareable && (
            <button type="button" className="ghost-btn" onClick={share}>
              공유 📤
            </button>
          )}
        </div>
        <p className="sheet-note">4:3 · 2048×1536 JPEG — 인스타 게시글에 딱 맞아</p>
      </div>
    </div>
  );
}
