// Tiny toast system for admin actions.
import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Icon } from "../components/Icon";

export function useToast(): {
  node: ReactNode;
  toast: (msg: string) => void;
} {
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((m: string) => setMsg(m), []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? (
    <div className="toast">
      <Icon name="check-circle" />
      {msg}
    </div>
  ) : null;
  return { node, toast };
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <div className={"toggle" + (on ? " on" : "")} onClick={() => onChange(!on)}>
      <div className="track">
        <div className="knob" />
      </div>
      {label && <span className="tlabel">{label}</span>}
    </div>
  );
}
