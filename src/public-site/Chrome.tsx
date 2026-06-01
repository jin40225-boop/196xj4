// Public site header + footer.
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Icon } from "../components/Icon";
import { Button } from "../components/ui";
import { useStore } from "../lib/store";

const NAV = [
  { to: "/", label: "首頁", end: true },
  { to: "/about", label: "關於我們" },
  { to: "/services", label: "服務介紹" },
  { to: "/news", label: "最新消息" },
  { to: "/contact", label: "聯絡我們" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="hdr">
      <div className="container hdr-in">
        <Link to="/" className="brand" onClick={close}>
          <img src="/assets/logo-transparent.png" alt="白露協會" />
          <div>
            <div className="zh">台灣白露社會福利服務協會</div>
            <div className="en">White Dew</div>
          </div>
        </Link>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="cta">
          <Link to="/news" onClick={close}>
            <Button size="sm" icon="heart">
              加入會員
            </Button>
          </Link>
        </div>
        <button className="burger" onClick={() => setOpen((v) => !v)} aria-label="選單">
          <Icon name={open ? "x" : "menu"} />
        </button>
      </div>
      {open && (
        <div className="sheet">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={close}
            >
              {n.label}
            </NavLink>
          ))}
          <Link to="/news" onClick={close}>
            <Button>加入會員</Button>
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { site } = useStore();
  const loc = useLocation();
  return (
    <footer className="footer">
      <div className="container footer-in">
        <div>
          <div className="brand">
            <span
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: 7,
                display: "inline-flex",
                boxShadow: "0 6px 18px rgba(0,0,0,.18)",
              }}
            >
              <img
                src="/assets/logo-transparent.png"
                alt="白露協會"
                style={{ width: 46, height: 46 }}
              />
            </span>
            <div>
              <div className="zh" style={{ fontWeight: 900, fontSize: 17 }}>
                台灣白露社會福利服務協會
              </div>
              <div
                className="en"
                style={{ fontFamily: "Nunito", fontWeight: 700, fontSize: 11, letterSpacing: ".2em" }}
              >
                WHITE DEW
              </div>
            </div>
          </div>
          <p>{site.footerTagline}</p>
        </div>
        <div>
          <h4>網站導覽</h4>
          <div className="fl">
            <Link to="/about">關於我們</Link>
            <Link to="/services">服務介紹</Link>
            <Link to="/news">最新消息</Link>
            <Link to="/contact">聯絡我們</Link>
          </div>
        </div>
        <div>
          <h4>聯絡資訊</h4>
          <div className="fl">
            <a href={"mailto:" + site.contact.email}>{site.contact.email}</a>
            <span>LINE 官方帳號：{site.contact.line}</span>
            {site.contact.phone && <span>電話：{site.contact.phone}</span>}
            {site.contact.address && <span>地址：{site.contact.address}</span>}
            <a href="/admin.html">管理後台登入</a>
          </div>
          <div className="socials">
            <a aria-label="Facebook">
              <Icon name="globe" />
            </a>
            <a aria-label="Instagram">
              <Icon name="camera" />
            </a>
            <a aria-label="Line">
              <Icon name="message-circle" />
            </a>
          </div>
        </div>
      </div>
      <div className="bottom">
        © 2025 社團法人台灣白露社會福利服務協會 Taiwan White Dew Social Welfare Service Association
        {import.meta.env.DEV && (
          <span style={{ marginLeft: 12, opacity: 0.55 }}>· dev · {loc.pathname}</span>
        )}
      </div>
    </footer>
  );
}
