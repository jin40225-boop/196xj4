// Admin login — real Supabase email/password, with fallback to demo mode
// when env vars are missing.
import { useState, type FormEvent } from "react";
import { Icon } from "../components/Icon";
import { signIn } from "./auth";
import { HAS_SUPABASE } from "../lib/supabase";

export function Login({ onIn }: { onIn: () => void }) {
  const [email, setEmail] = useState(HAS_SUPABASE ? "" : "demo@whitedew.local");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signIn(email, password);
      onIn();
    } catch (e) {
      const msg = (e as Error).message ?? "登入失敗";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <img className="lg" src="/assets/logo-transparent.png" alt="社團法人台灣白露社會福利服務協會" />
        <h1 style={{ fontSize: 20, lineHeight: 1.3 }}>社團法人台灣白露社會福利服務協會</h1>
        <div className="en" style={{ marginBottom: 28 }}>White Dew · Admin</div>
        <div className="field">
          <label>電子信箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label>密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {err && (
          <div
            role="alert"
            style={{
              background: "#FBEEEC",
              border: "1px solid #EAC9C4",
              color: "#C0564A",
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 14,
              marginBottom: 14,
            }}
          >
            {err}
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "登入中…" : "登入後台"}
          <Icon name="arrow-right" />
        </button>
        <div className="login-hint">
          {HAS_SUPABASE ? (
            <>請使用協會核發的後台帳號登入。<br />忘記密碼？請來信 tw.whitedew@gmail.com</>
          ) : (
            <>
              <strong>展示模式</strong>：尚未連線資料庫，輸入任意帳密皆可登入，
              <br />
              所有變更只會留在這個瀏覽器分頁，重新整理就會還原。
            </>
          )}
        </div>
      </form>
    </div>
  );
}
