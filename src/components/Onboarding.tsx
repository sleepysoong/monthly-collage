import { useState, type FormEvent } from "react";

interface Props {
  initial: string;
  onSubmit: (name: string) => void;
}

export default function Onboarding({ initial, onSubmit }: Props) {
  const [value, setValue] = useState(initial);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (name) onSubmit(name.slice(0, 14));
  };

  return (
    <div className="onboarding">
      <div className="blobs" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="onboard-card liquid-glass">
        <div className="onboard-emoji">📸</div>
        <h1>월간 콜라주</h1>
        <p>
          너의 한 해를 한 장에 담아줄게.
          <br />
          이름을 알려줄래?
        </p>
        <form onSubmit={submit}>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="예) 수빈"
            maxLength={14}
            autoFocus
            aria-label="이름"
          />
          <button type="submit" className="primary-btn" disabled={!value.trim()}>
            시작할게 ✨
          </button>
        </form>
      </div>
    </div>
  );
}
