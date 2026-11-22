import { useState } from "react";
import Onboarding from "./components/Onboarding";
import MonthGrid from "./components/MonthGrid";
import PreviewSheet from "./components/PreviewSheet";
import { glassMapDataURL } from "./lib/glassFilter";
import type { Photo } from "./lib/collage";

const NAME_KEY = "monthly-collage:name";
const YEAR = new Date().getFullYear();
const GLASS_MAP_HREF = glassMapDataURL();

const EMPTY: (Photo | null)[] = Array.from({ length: 12 }, () => null);

function loadPhoto(file: File, done: (photo: Photo) => void): void {
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => done({ img, objectUrl });
  img.onerror = () => URL.revokeObjectURL(objectUrl);
  img.src = objectUrl;
}

export default function App() {
  const [name, setName] = useState<string | null>(() => localStorage.getItem(NAME_KEY));
  const [editingName, setEditingName] = useState(false);
  const [photos, setPhotos] = useState<(Photo | null)[]>(EMPTY);
  const [previewOpen, setPreviewOpen] = useState(false);

  const commitName = (value: string) => {
    localStorage.setItem(NAME_KEY, value);
    setName(value);
    setEditingName(false);
  };

  const pick = (month: number, file: File) => {
    loadPhoto(file, (photo) => {
      setPhotos((prev) => {
        const old = prev[month];
        if (old) URL.revokeObjectURL(old.objectUrl);
        const next = prev.slice();
        next[month] = photo;
        return next;
      });
    });
  };

  const clear = (month: number) => {
    setPhotos((prev) => {
      const old = prev[month];
      if (old) URL.revokeObjectURL(old.objectUrl);
      const next = prev.slice();
      next[month] = null;
      return next;
    });
  };

  if (!name || editingName) {
    return <Onboarding initial={name ?? ""} onSubmit={commitName} />;
  }

  const filled = photos.filter(Boolean).length;

  return (
    <div className="app">
      <div className="blobs" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <svg className="lg-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter
            id="lg-map"
            filterUnits="objectBoundingBox"
            primitiveUnits="objectBoundingBox"
            x="0"
            y="0"
            width="1"
            height="1"
            colorInterpolationFilters="sRGB"
          >
            <feImage href={GLASS_MAP_HREF} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale="32" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <header className="topbar liquid-glass">
        <div className="topbar-title">
          <h1>월간 {name} ✨</h1>
          <p>한 해를 한 장에, {YEAR}</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => setEditingName(true)} aria-label="이름 변경">
          ✎
        </button>
      </header>
      <main>
        <p className="hint">매달 사진을 한 장씩 골라줘 📸</p>
        <MonthGrid photos={photos} onPick={pick} onClear={clear} />
      </main>
      <footer className="dock liquid-glass">
        <span className="dock-progress">{filled}/12</span>
        <button type="button" className="primary-btn" onClick={() => setPreviewOpen(true)}>
          미리보기
        </button>
      </footer>
      {previewOpen && <PreviewSheet name={name} year={YEAR} photos={photos} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
