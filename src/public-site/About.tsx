// 關於我們 + 服務介紹（兩個頁面共用 PageHead 和 Pillars）
import { Blob, Reveal } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStore } from "../lib/store";
import { PILLARS } from "../lib/data";
import { CTABand, QuoteBand } from "./Home";

export function PageHead({ kick, title, sub }: { kick: string; title: string; sub: string }) {
  return (
    <section className="pagehead">
      <Blob color="var(--sky-100)" w="240px" h="240px" style={{ top: "-10%", right: "4%" }} />
      <Blob color="var(--mint-100)" w="160px" h="160px" style={{ bottom: "-22%", left: "8%" }} />
      <div className="container pagehead-in">
        <div className="kick">{kick}</div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
    </section>
  );
}

export function Pillars({ withNum }: { withNum?: boolean }) {
  return (
    <div className="pillars">
      {PILLARS.map((p, i) => (
        <div className="pillar" key={i}>
          <div
            className="ic"
            style={{ background: p.bg, borderRadius: 16 }}
          >
            <Icon name={p.icon} style={{ color: p.color }} />
          </div>
          {withNum && <div className="num">{p.num}</div>}
          <h3>{p.title}</h3>
          <p>{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function About() {
  const { site } = useStore();
  const a = site.about;
  return (
    <main>
      <PageHead kick="About us" title="關於我們" sub={a.lead} />
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container prose" style={{ margin: "0 auto" }}>
          <Reveal>
            <h2 className="prose-h">協會介紹</h2>
            <p className="prose-p">{a.intro}</p>
            <h2 className="prose-h" style={{ marginTop: 34 }}>
              緣起
            </h2>
            <p className="prose-p">{a.origin1}</p>
            <p className="prose-p">{a.origin2}</p>
          </Reveal>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <Reveal>
            <div className="sec-head">
              <div className="kick">Our work</div>
              <h2>本會之任務</h2>
              <p>依相關法令規定推動及執行，從照顧助人者到回饋社會。</p>
            </div>
          </Reveal>
          <Reveal>
            <Pillars withNum />
          </Reveal>
        </div>
      </section>
      <CTABand />
    </main>
  );
}

export function Services() {
  return (
    <main>
      <PageHead
        kick="Services"
        title="服務介紹"
        sub="從助人者的自我照顧，到弱勢群體的支援與關懷——我們提供多元的陪伴與支持。"
      />
      <section className="section" style={{ paddingTop: 56 }}>
        <div className="container">
          <Reveal>
            <Pillars />
          </Reveal>
        </div>
      </section>
      <QuoteBand />
      <CTABand />
    </main>
  );
}
