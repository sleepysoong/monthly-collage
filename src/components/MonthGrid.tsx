import { useRef } from "react";
import { MONTH_EMOJI, MONTH_LABELS, type MonthPhotos } from "../lib/collage";

interface Props {
  photos: MonthPhotos;
  onPick: (month: number, file: File) => void;
  onClear: (month: number) => void;
}

export default function MonthGrid({ photos, onPick, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const activeMonth = useRef(0);

  const openPicker = (month: number) => {
    activeMonth.current = month;
    inputRef.current?.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(activeMonth.current, file);
          e.target.value = "";
        }}
      />
      <div className="month-grid">
        {MONTH_LABELS.map((label, i) => {
          const photo = photos[i];
          return (
            <div key={label} className={`month-cell${photo ? " filled" : ""}`}>
              <button
                type="button"
                className="month-tile liquid-glass"
                onClick={() => openPicker(i)}
                aria-label={`${label} 사진 선택`}
              >
                {photo ? (
                  <img className="photo" src={photo.objectUrl} alt={label} />
                ) : (
                  <span className="empty">
                    <span className="empty-emoji">{MONTH_EMOJI[i]}</span>
                    <small>탭해서 추가</small>
                  </span>
                )}
                <span className="label">{label}</span>
              </button>
              {photo && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => onClear(i)}
                  aria-label={`${label} 사진 지우기`}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
