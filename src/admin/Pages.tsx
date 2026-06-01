// Page-content editor — Hero / About / Contact / membershipNote / footerTagline.
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "../components/Icon";
import { useStore, WDStore } from "../lib/store";
import type { SiteHero, SiteAbout, SiteContact } from "../lib/types";

function Section({
  title,
  desc,
  onSave,
  children,
}: {
  title: string;
  desc?: string;
  onSave: () => void;
  children: ReactNode;
}) {
  return (
    <div className="panel" style={{ marginBottom: 22 }}>
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          {desc && (
            <p style={{ margin: "3px 0 0", fontSize: 13.5, color: "var(--ink-muted)" }}>{desc}</p>
          )}
        </div>
        <div className="spacer"></div>
        <button className="btn btn-primary btn-sm" onClick={onSave}>
          <Icon name="check" />
          儲存
        </button>
      </div>
      <div className="panel-pad">{children}</div>
    </div>
  );
}

export default function Pages({ toast }: { toast: (m: string) => void }) {
  const { site } = useStore();
  // Local edit state — initialise from store, re-sync when store changes (e.g. realtime updates).
  const [hero, setHero] = useState<SiteHero>(site.hero);
  const [about, setAbout] = useState<SiteAbout>(site.about);
  const [contact, setContact] = useState<SiteContact>(site.contact);
  const [misc, setMisc] = useState({
    membershipNote: site.membershipNote,
    footerTagline: site.footerTagline,
  });

  // If something else updates the store while editing (rare), refresh local state.
  useEffect(() => setHero(site.hero), [site.hero]);
  useEffect(() => setAbout(site.about), [site.about]);
  useEffect(() => setContact(site.contact), [site.contact]);
  useEffect(
    () => setMisc({ membershipNote: site.membershipNote, footerTagline: site.footerTagline }),
    [site.membershipNote, site.footerTagline]
  );

  const wrap = (fn: () => Promise<void>, msg: string) => async () => {
    try {
      await fn();
      toast(msg);
    } catch (e) {
      toast("儲存失敗：" + (e as Error).message);
    }
  };

  return (
    <>
      <Section
        title="首頁主視覺 Hero"
        desc="網站首頁最上方的標語與引言。"
        onSave={wrap(async () => WDStore.updateSiteSection("hero", hero), "已更新首頁主視覺")}
      >
        <div className="f full">
          <label>小標 Eyebrow</label>
          <input value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
        </div>
        <div className="fgrid">
          <div className="f">
            <label>主標 第一行</label>
            <input value={hero.titleA} onChange={(e) => setHero({ ...hero, titleA: e.target.value })} />
          </div>
          <div className="f">
            <label>主標 第二行（前段）</label>
            <input value={hero.titleB} onChange={(e) => setHero({ ...hero, titleB: e.target.value })} />
          </div>
          <div className="f">
            <label>主標 強調字</label>
            <input value={hero.titleHl} onChange={(e) => setHero({ ...hero, titleHl: e.target.value })} />
          </div>
          <div className="f">
            <label>主標 結尾</label>
            <input value={hero.titleC} onChange={(e) => setHero({ ...hero, titleC: e.target.value })} />
          </div>
        </div>
        <div className="f full" style={{ marginBottom: 0 }}>
          <label>引言 Lead</label>
          <textarea value={hero.lead} onChange={(e) => setHero({ ...hero, lead: e.target.value })} />
        </div>
      </Section>

      <Section
        title="關於我們 About"
        desc="關於頁與首頁簡介使用的文字。"
        onSave={wrap(async () => WDStore.updateSiteSection("about", about), "已更新關於我們")}
      >
        <div className="f full">
          <label>白露釋義（副標）</label>
          <input value={about.lead} onChange={(e) => setAbout({ ...about, lead: e.target.value })} />
        </div>
        <div className="f full">
          <label>協會介紹</label>
          <textarea
            value={about.intro}
            onChange={(e) => setAbout({ ...about, intro: e.target.value })}
          />
        </div>
        <div className="f full">
          <label>緣起（第一段）</label>
          <textarea
            value={about.origin1}
            onChange={(e) => setAbout({ ...about, origin1: e.target.value })}
            style={{ minHeight: 120 }}
          />
        </div>
        <div className="f full">
          <label>緣起（第二段）</label>
          <textarea
            value={about.origin2}
            onChange={(e) => setAbout({ ...about, origin2: e.target.value })}
            style={{ minHeight: 120 }}
          />
        </div>
        <div className="f full" style={{ marginBottom: 0 }}>
          <label>引述句 Quote</label>
          <textarea
            value={about.quote}
            onChange={(e) => setAbout({ ...about, quote: e.target.value })}
          />
        </div>
      </Section>

      <Section
        title="聯絡資訊 Contact"
        desc="顯示於聯絡頁與頁尾。"
        onSave={wrap(async () => WDStore.updateSiteSection("contact", contact), "已更新聯絡資訊")}
      >
        <div className="fgrid">
          <div className="f">
            <label>電子信箱</label>
            <input
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </div>
          <div className="f">
            <label>LINE 官方帳號</label>
            <input
              value={contact.line}
              onChange={(e) => setContact({ ...contact, line: e.target.value })}
            />
          </div>
          <div className="f">
            <label>聯絡電話</label>
            <input
              value={contact.phone ?? ""}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            />
          </div>
          <div className="f">
            <label>會址</label>
            <input
              value={contact.address ?? ""}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
            />
          </div>
        </div>
        <div className="f full" style={{ marginBottom: 0 }}>
          <label>組織性質</label>
          <input value={contact.org} onChange={(e) => setContact({ ...contact, org: e.target.value })} />
        </div>
      </Section>

      <Section
        title="其他文案"
        desc="會員招募說明與頁尾標語。"
        onSave={wrap(async () => WDStore.updateSiteRoot(misc), "已更新文案")}
      >
        <div className="f full">
          <label>會員招募說明</label>
          <textarea
            value={misc.membershipNote}
            onChange={(e) => setMisc({ ...misc, membershipNote: e.target.value })}
          />
        </div>
        <div className="f full" style={{ marginBottom: 0 }}>
          <label>頁尾標語</label>
          <textarea
            value={misc.footerTagline}
            onChange={(e) => setMisc({ ...misc, footerTagline: e.target.value })}
          />
        </div>
      </Section>
    </>
  );
}
