// Generates the two .docx hand-off documents for the White Dew site.
//   1. 白露官網維護手冊.docx — operational handbook (URLs, accounts, daily ops)
//   2. 網站製作新手教學.docx  — beginner explainer for Supabase + Cloudflare
//
// Run:  node scripts/gen-docs.mjs
// Output: ../白露協會官網構築/*.docx  (i.e. dropped on user's OneDrive desktop)

import fs from "node:fs";
import path from "node:path";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  LevelFormat,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  PageBreak,
  ExternalHyperlink,
} from "docx";

// ---------- Constants ----------
const OUT_DIR = "C:\\Users\\User\\OneDrive\\Desktop\\白露協會官網構築";

// A4 page in DXA (1440 DXA = 1 inch)
const PAGE = { width: 11906, height: 16838, margin: 1134 }; // ~0.79" margins
const CONTENT_W = PAGE.width - PAGE.margin * 2; // 9638 DXA

const FONT = "Microsoft JhengHei"; // CJK friendly on Windows
const FONT_MONO = "Consolas";

// ---------- Helpers ----------
const H1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT })],
    spacing: { before: 360, after: 200 },
  });

const H2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT })],
    spacing: { before: 280, after: 140 },
  });

const H3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: FONT })],
    spacing: { before: 200, after: 100 },
  });

// Body paragraph. Pass a string or an array of runs.
const P = (content, opts = {}) => {
  const runs =
    typeof content === "string"
      ? [new TextRun({ text: content, font: FONT, size: 22 })]
      : content;
  return new Paragraph({
    children: runs,
    spacing: { after: 140, line: 360 }, // ~1.5 line spacing
    ...opts,
  });
};

// Helper: build an array of runs from a string with **bold** markers.
const RUNS = (text, base = {}) => {
  const out = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) {
      out.push(new TextRun({ text: p.slice(2, -2), bold: true, font: FONT, size: 22, ...base }));
    } else {
      out.push(new TextRun({ text: p, font: FONT, size: 22, ...base }));
    }
  }
  return out;
};

const PB = (text) => P(RUNS(text)); // body paragraph with **bold** parsing

// Bullet list item using the numbering ref defined below.
const BULLET = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "bullets", level },
    children: RUNS(text),
    spacing: { after: 80, line: 340 },
  });

// Numbered list item.
const NUM = (text) =>
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: RUNS(text),
    spacing: { after: 100, line: 340 },
  });

// Monospace code block paragraph (single-line preferred).
const CODE = (text) =>
  new Paragraph({
    children: [new TextRun({ text, font: FONT_MONO, size: 20 })],
    shading: { fill: "F4F4F0", type: ShadingType.CLEAR },
    spacing: { after: 80, before: 60 },
  });

// Hyperlink run.
const LINK = (text, url) =>
  new ExternalHyperlink({
    children: [
      new TextRun({ text, font: FONT_MONO, size: 20, color: "2E6470", underline: {} }),
    ],
    link: url,
  });

// Paragraph that's a single hyperlink line.
const LINK_P = (text, url) =>
  new Paragraph({ children: [LINK(text, url)], spacing: { after: 80 } });

// Table cell with consistent padding + border.
const CELL = (textOrParas, opts = {}) => {
  const children = Array.isArray(textOrParas)
    ? textOrParas
    : [P(textOrParas)];
  const border = { style: BorderStyle.SINGLE, size: 4, color: "C9DAD3" };
  return new TableCell({
    children,
    borders: { top: border, bottom: border, left: border, right: border },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    shading: opts.shading
      ? { fill: opts.shading, type: ShadingType.CLEAR }
      : undefined,
    width: opts.width
      ? { size: opts.width, type: WidthType.DXA }
      : undefined,
  });
};

// 2-column table for label/value style rows.
const KV_TABLE = (rows) => {
  const COL_L = Math.round(CONTENT_W * 0.32);
  const COL_R = CONTENT_W - COL_L;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [COL_L, COL_R],
    rows: rows.map(([k, v]) =>
      new TableRow({
        children: [
          CELL([P([new TextRun({ text: k, bold: true, font: FONT, size: 22 })])], {
            width: COL_L,
            shading: "F4F8F6",
          }),
          CELL(Array.isArray(v) ? v : [P(v)], { width: COL_R }),
        ],
      })
    ),
  });
};

// 3-column table: name | url | note
const URL_TABLE = (rows) => {
  const COL1 = Math.round(CONTENT_W * 0.26);
  const COL3 = Math.round(CONTENT_W * 0.28);
  const COL2 = CONTENT_W - COL1 - COL3;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [COL1, COL2, COL3],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          CELL([P([new TextRun({ text: "用途", bold: true, font: FONT, size: 22 })])], { width: COL1, shading: "355B63" }),
          CELL([P([new TextRun({ text: "網址", bold: true, font: FONT, size: 22 })])], { width: COL2, shading: "355B63" }),
          CELL([P([new TextRun({ text: "備註", bold: true, font: FONT, size: 22 })])], { width: COL3, shading: "355B63" }),
        ],
      }),
      ...rows.map(([name, url, note]) =>
        new TableRow({
          children: [
            CELL([P([new TextRun({ text: name, bold: true, font: FONT, size: 22 })])], { width: COL1 }),
            CELL([new Paragraph({ children: [LINK(url, url)], spacing: { after: 0 } })], { width: COL2 }),
            CELL([P([new TextRun({ text: note, font: FONT, size: 20, color: "5D625F" })])], { width: COL3 }),
          ],
        })
      ),
    ],
  });
};

// ---------- Shared document config ----------
const sharedStyles = {
  default: {
    document: { run: { font: FONT, size: 22 } }, // 11pt body
  },
  paragraphStyles: [
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: FONT, size: 36, bold: true, color: "355B63" }, // 18pt
      paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
    },
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: FONT, size: 30, bold: true, color: "2E6470" }, // 15pt
      paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
    },
    {
      id: "Heading3",
      name: "Heading 3",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: FONT, size: 26, bold: true, color: "3F4D47" }, // 13pt
      paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
    },
  ],
};

const sharedNumbering = {
  config: [
    {
      reference: "bullets",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 270 } } },
        },
        {
          level: 1,
          format: LevelFormat.BULLET,
          text: "◦",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 900, hanging: 270 } } },
        },
      ],
    },
    {
      reference: "numbers",
      levels: [
        {
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 360 } } },
        },
      ],
    },
  ],
};

const sharedSectionProps = {
  page: {
    size: { width: PAGE.width, height: PAGE.height },
    margin: { top: PAGE.margin, bottom: PAGE.margin, left: PAGE.margin, right: PAGE.margin },
  },
};

// ==========================================================================
// DOCUMENT 1: 白露官網維護手冊
// ==========================================================================
function buildManual() {
  const children = [];

  // --- Cover ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 400 },
      children: [
        new TextRun({ text: "白露官網", bold: true, font: FONT, size: 64, color: "355B63" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "維護手冊", bold: true, font: FONT, size: 56, color: "355B63" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1600 },
      children: [
        new TextRun({ text: "Taiwan White Dew Social Welfare Service Association", font: FONT_MONO, size: 22, color: "84B9C9" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "本文件包含維護這個網站需要的所有網址、帳號、流程與排錯方法。", font: FONT, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "首次上線：2026-06-01", font: FONT, size: 20, color: "5D625F" })],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // --- Section 1: 專案總覽 ---
  children.push(H1("一、專案總覽"));
  children.push(
    KV_TABLE([
      ["協會名稱", "社團法人 台灣白露社會福利服務協會"],
      ["協會 Email", "tw.whitedew@gmail.com"],
      ["協會地址", "新竹市香山區中山路 650 之 7 號 3 樓"],
      ["協會電話", "0980-686-968"],
      ["立案字號", "內政部 114/8/11 台內團字第 1140020432 號函"],
      ["法人登記", "臺灣新竹地方法院 114/12/26 登記字第 1239 號"],
      ["技術架構", "Vite + React + TypeScript（前端）、Supabase（資料庫+登入）、Cloudflare Workers（部署）"],
      ["原始碼", [LINK_P("https://github.com/jin40225-boop/196xj4", "https://github.com/jin40225-boop/196xj4")]],
      ["首次上線", "2026-06-01"],
      ["維護負責人", "（請填寫姓名與聯絡方式）"],
    ])
  );

  // --- Section 2: 網址速查表 ---
  children.push(H1("二、重要網址速查"));
  children.push(PB("以下是所有日常會用到的網址。按 Ctrl+滑鼠左鍵點擊可直接開啟。"));
  children.push(H2("公開網站（給訪客）"));
  children.push(
    URL_TABLE([
      ["官方首頁", "https://196xj4.jin40225.workers.dev", "對外公開連結，可寄給任何人"],
      ["關於我們", "https://196xj4.jin40225.workers.dev/about", "—"],
      ["服務介紹", "https://196xj4.jin40225.workers.dev/services", "—"],
      ["最新消息", "https://196xj4.jin40225.workers.dev/news", "—"],
      ["聯絡我們", "https://196xj4.jin40225.workers.dev/contact", "讀者透過此頁送訊息"],
      ["版本診斷頁", "https://196xj4.jin40225.workers.dev/version", "確認線上是哪個版本，是否已連線資料庫"],
    ])
  );

  children.push(H2("管理後台（給協會內部使用）"));
  children.push(
    URL_TABLE([
      ["後台登入", "https://196xj4.jin40225.workers.dev/admin.html", "需要管理員帳密"],
      ["總覽", "https://196xj4.jin40225.workers.dev/admin", "登入後預設頁面"],
      ["最新消息管理", "https://196xj4.jin40225.workers.dev/admin/news", "新增/編輯/刪除消息"],
      ["頁面內容編輯", "https://196xj4.jin40225.workers.dev/admin/pages", "改 Hero、關於、聯絡資訊等文案"],
      ["會員管理", "https://196xj4.jin40225.workers.dev/admin/members", "—"],
      ["聯絡訊息", "https://196xj4.jin40225.workers.dev/admin/messages", "讀者透過聯絡表單寄來的訊息"],
      ["後台設定", "https://196xj4.jin40225.workers.dev/admin/settings", "登出與版本資訊"],
    ])
  );

  children.push(H2("後端服務（給維護者）"));
  children.push(
    URL_TABLE([
      ["Supabase 主控台", "https://supabase.com/dashboard/project/sssseazkhiswjhtmbluh", "資料庫總覽"],
      ["Supabase SQL 編輯器", "https://supabase.com/dashboard/project/sssseazkhiswjhtmbluh/sql/new", "執行 SQL 查詢／修改"],
      ["Supabase 使用者管理", "https://supabase.com/dashboard/project/sssseazkhiswjhtmbluh/auth/users", "新增/刪除後台管理員"],
      ["Supabase 資料表瀏覽", "https://supabase.com/dashboard/project/sssseazkhiswjhtmbluh/editor", "直接看表格內容"],
      ["Supabase 備份", "https://supabase.com/dashboard/project/sssseazkhiswjhtmbluh/database/backups", "免費方案 7 天 PITR"],
      ["Cloudflare 主控台", "https://dash.cloudflare.com/", "登入後找 Workers & Pages → 196xj4"],
      ["Cloudflare 部署紀錄", "https://dash.cloudflare.com/aa1fbbd1e4870d165c0ea5e0172c2c7f/workers/services/view/196xj4/production/deployments", "看歷次 build 紀錄"],
      ["Cloudflare 設定", "https://dash.cloudflare.com/aa1fbbd1e4870d165c0ea5e0172c2c7f/workers/services/view/196xj4/production/settings", "環境變數、自訂網域"],
      ["GitHub 原始碼", "https://github.com/jin40225-boop/196xj4", "所有程式碼版本控制"],
    ])
  );

  // --- Section 3: 帳號與授權 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("三、帳號清單"));
  children.push(PB("以下是建構這個網站時用到的所有第三方服務帳號。**密碼請另外妥善保管，不要寫進這份文件**。"));

  children.push(H2("第三方服務帳號"));
  children.push(
    KV_TABLE([
      ["GitHub 帳號", "jin40225-boop（程式碼版控）"],
      ["Cloudflare 帳號", "jin40225@gmail.com（部署平台）"],
      ["Supabase 帳號", "jin40225@gmail.com（資料庫＋登入）"],
      ["協會公務信箱", "tw.whitedew@gmail.com（網站對外顯示）"],
    ])
  );

  children.push(H2("後台管理員（Supabase Auth Users）"));
  children.push(PB("這些是可以登入 /admin.html 的人。每個人都是同等權限——可以編輯所有內容。"));
  children.push(
    KV_TABLE([
      ["#1（首位管理員）", "jin40225@gmail.com"],
      ["#2", "（請填）"],
      ["#3", "（請填）"],
    ])
  );
  children.push(PB("**新增管理員的方法**："));
  children.push(NUM("打開 Supabase 使用者管理頁（網址見第二章）"));
  children.push(NUM("右上 Add user → Create new user"));
  children.push(NUM("填對方 Email + 你幫他設一組臨時密碼 + 勾 ✅ Auto Confirm User"));
  children.push(NUM("私訊把「後台網址、Email、臨時密碼」三件事給對方，並提醒他第一次登入後改密碼"));

  children.push(PB("**移除管理員的方法**：同一個頁面找到那位 → 右邊「⋯」→ Delete user。"));

  // --- Section 4: 日常維運 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("四、日常維運：編輯網站內容"));
  children.push(PB("所有日常內容更動都從後台完成，**不需要碰程式碼**。"));

  children.push(H2("新增 / 編輯 / 刪除最新消息"));
  children.push(NUM("登入後台（網址見第二章 → 「後台登入」）"));
  children.push(NUM("左側點「最新消息」"));
  children.push(NUM("**新增**：右上「新增消息」→ 填標題、分類、日期、圖示、摘要、內文 → 切換「已發布／草稿」開關 → 按右下「發布」"));
  children.push(NUM("**編輯**：點消息那一列的鉛筆圖示 ✏️ → 改完按「儲存」"));
  children.push(NUM("**刪除**：點那一列的垃圾桶 🗑️ → 確認"));
  children.push(PB("儲存後內容**即時**寫進 Supabase 並同步給所有正在看公開站的訪客（透過 Supabase Realtime）。"));

  children.push(H2("編輯頁面文字（Hero、關於、聯絡資訊等）"));
  children.push(NUM("登入後台 → 左側點「頁面內容」"));
  children.push(NUM("找到要改的區塊（首頁主視覺、關於我們、聯絡資訊、其他文案）"));
  children.push(NUM("直接在文字框裡修改"));
  children.push(NUM("**每個區塊有自己的「儲存」按鈕**——只改一個區塊就只按那個區塊的儲存"));

  children.push(H2("看聯絡訊息"));
  children.push(PB("讀者透過官網「聯絡我們」頁送出的訊息，會出現在後台「聯絡訊息」分頁。"));
  children.push(BULLET("每則訊息可以標記為「已處理／未處理」"));
  children.push(BULLET("點 Email 連結可以直接回信"));
  children.push(BULLET("無法在後台刪除——需要刪的話到 Supabase Dashboard → Table Editor → contact_messages 表手動刪"));

  children.push(H2("會員管理"));
  children.push(PB("目前會員資料是**手動**輸入：協會收到入會申請後，由管理員到後台「會員管理」新增。可切換「已繳費／審查中」狀態。"));
  children.push(PB("（未來如果想讓網站直接接受線上入會表單，需要再新增功能。）"));

  // --- Section 5: 部署 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("五、部署：把程式碼改動推上線"));
  children.push(PB("「日常內容更動」不需要部署（後台直接寫進 Supabase）。「程式碼修改」才需要部署。"));

  children.push(H2("一般流程（自動部署）"));
  children.push(NUM("在本機修改程式碼"));
  children.push(NUM("git commit + git push 到 GitHub"));
  children.push(NUM("Cloudflare **自動**偵測到 push，**自動**重新 build + 部署"));
  children.push(NUM("約 1.5–2 分鐘後線上版本就更新了"));

  children.push(H2("手動觸發部署（不改程式碼也想重 build）"));
  children.push(PB("適用於：剛改了 Cloudflare 環境變數、想重跑 build。"));
  children.push(NUM("回 Cloudflare 部署紀錄頁（網址見第二章）"));
  children.push(NUM("最上面找到最新那個 deployment"));
  children.push(NUM("右邊「⋯」選單 → Retry build"));

  children.push(H2("確認線上版本對位"));
  children.push(PB("最快確認方式：開 https://196xj4.jin40225.workers.dev/version"));
  children.push(BULLET("**commit** 那行的 hash 應該跟你 push 的最新一致"));
  children.push(BULLET("**supabase 連線** 應該寫「已連線」（如果寫「OFFLINE」表示環境變數沒生效）"));

  // --- Section 6: 備份與還原 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("六、備份與還原"));

  children.push(H2("Supabase 自動備份（免費方案）"));
  children.push(PB("Supabase 免費方案提供 **7 天 Point-in-Time Recovery**——可以還原到過去任何時間點。"));
  children.push(BULLET("查看備份：Supabase Dashboard → Database → Backups"));
  children.push(BULLET("若不小心刪錯內容，趕快去這頁找最近的還原點"));

  children.push(H2("手動匯出資料"));
  children.push(PB("想做更長期備份（例如月備份留檔）："));
  children.push(NUM("Supabase Dashboard → Database → Backups → Download backup"));
  children.push(NUM("會下載一份 SQL 檔，保存到雲端硬碟或外接硬碟"));

  children.push(H2("還原成預設內容（重置示範資料）"));
  children.push(PB("如果想把所有內容還原到網站剛建好時的狀態："));
  children.push(NUM("打開 Supabase SQL 編輯器（網址見第二章）"));
  children.push(NUM("把 GitHub repo 的 supabase/seed.sql 整檔貼進去 → Run"));
  children.push(NUM("注意：這會**覆蓋**現有的 site_content 跟 news 三則初始消息；會員與聯絡訊息不會動"));

  // --- Section 7: 排錯 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("七、常見問題排查"));

  children.push(H2("Q1：公開站打開是空白頁 / 載入失敗"));
  children.push(BULLET("先看 https://196xj4.jin40225.workers.dev/version 能不能開"));
  children.push(BULLET("不能開 → Cloudflare 服務有問題，到 https://www.cloudflarestatus.com 看是否有事故"));
  children.push(BULLET("能開但其他頁不行 → 多半是 Supabase 連線問題，看「supabase 連線」是否顯示「已連線」"));

  children.push(H2("Q2：後台登入失敗"));
  children.push(BULLET("確認 Email + 密碼大小寫"));
  children.push(BULLET("到 Supabase 使用者管理頁，確認該 Email 真的存在且未被封鎖"));
  children.push(BULLET("忘記密碼 → 在 Supabase 使用者頁找到該用戶 → ⋯ → Send password recovery"));

  children.push(H2("Q3：後台說「展示模式」（橘色徽章）"));
  children.push(BULLET("表示 Cloudflare 的 build 環境變數沒進到 bundle"));
  children.push(BULLET("檢查 Cloudflare 設定頁的 Build → Variables and secrets 有兩個變數（VITE_SUPABASE_URL、VITE_SUPABASE_ANON_KEY）"));
  children.push(BULLET("有就清 Build cache（同頁最下面）→ Retry build"));
  children.push(BULLET("還是不行 → 檢查本機 repo 是否有 .env.production，若無請從 GitHub repo 拉一份"));

  children.push(H2("Q4：改了消息但公開站沒更新"));
  children.push(BULLET("F5 重新整理一次"));
  children.push(BULLET("檢查那則消息是否勾了「已發布」（草稿不會出現在公開站）"));
  children.push(BULLET("檢查 /version 看「supabase 連線」狀態"));

  children.push(H2("Q5：Cloudflare 部署失敗"));
  children.push(BULLET("到部署紀錄頁找最新失敗的，展開 build log"));
  children.push(BULLET("常見原因：本機 git push 推上去前沒先跑過 npm run build 驗證"));
  children.push(BULLET("解法：本機跑 npm run build，看到綠勾再 push"));

  // --- Section 8: 程式碼維護 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("八、程式碼維護"));
  children.push(PB("**程式碼存放位置**："));
  children.push(BULLET("**雲端**：https://github.com/jin40225-boop/196xj4"));
  children.push(BULLET("**本機**：C:\\Users\\User\\projects\\whitedew-site\\"));
  children.push(PB("**重要**：本機資料夾**沒放在 OneDrive 內**，因為 node_modules 有幾萬個小檔會搞掛同步。"));

  children.push(H2("本機開發環境啟動"));
  children.push(CODE("cd C:\\Users\\User\\projects\\whitedew-site"));
  children.push(CODE("npm install        # 第一次或拉新版時"));
  children.push(CODE("npm run dev        # 啟動 dev server，會說 http://localhost:5176"));
  children.push(CODE("npm run build      # 建置正式版到 dist/"));
  children.push(CODE("npm run typecheck  # 檢查型別錯誤"));

  children.push(H2("更新套件版本"));
  children.push(PB("約半年到一年看一次套件更新："));
  children.push(CODE("npm outdated       # 看哪些套件有新版"));
  children.push(CODE("npm update         # 更新到允許範圍內的最新版（不會跳大版本）"));
  children.push(PB("更新後跑 `npm run build`、本機測試一輪，沒問題再 push。"));

  children.push(H2("改設計（顏色、字體、圓角等）"));
  children.push(PB("所有視覺設定 token 都在 src/styles/colors_and_type.css。改這份檔就會全站套用。"));

  children.push(H2("改業務邏輯（路由、組件行為）"));
  children.push(PB("公開站：src/public-site/ 底下的 .tsx 檔；後台：src/admin/ 底下；共用：src/components/ 跟 src/lib/。"));
  children.push(PB("資料層（讀寫 Supabase）：src/lib/store.ts 是單一入口。"));

  children.push(H2("資料表 schema 修改"));
  children.push(PB("不要直接在 Supabase Dashboard 改表結構——改完無法版本控制，未來重建環境會出包。正確流程："));
  children.push(NUM("在 supabase/migrations/ 新增 0002_xxx.sql 寫新的 ALTER TABLE 等 DDL"));
  children.push(NUM("到 Supabase SQL Editor 貼進去執行"));
  children.push(NUM("commit + push 到 GitHub 永久保存"));

  // --- Section 9: 費用 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("九、費用結構"));
  children.push(PB("**目前完全免費**——所有服務都在免費額度內。"));
  children.push(
    KV_TABLE([
      ["Cloudflare Workers", "免費方案：流量無上限、月 500 次 build；協會用一輩子也碰不到上限"],
      ["Supabase", "免費方案：500MB 資料庫、50,000 月活用戶、2GB 流量；協會用一輩子也碰不到上限"],
      ["GitHub", "Public repo 免費；Private repo 也免費（每位協作者只有總私有空間上限）"],
      ["網域名稱", "目前用 Cloudflare 送的 *.workers.dev 子網域（免費）"],
    ])
  );

  children.push(H2("唯一可能需要付費的：自訂網域"));
  children.push(PB("如果之後想用 whitedew.org.tw 之類的協會自有網域："));
  children.push(BULLET("**.org.tw**：約 NT$700/年，到 TWNIC 註冊商買（例如 Hinet、PChome）"));
  children.push(BULLET("**.org / .com**：約 NT$300–600/年，到任何國際註冊商買（Cloudflare Registrar 沒加價，最划算）"));
  children.push(BULLET("買好後在 Cloudflare 設定頁的 **Domains & Routes** 區塊新增即可"));
  children.push(PB("Cloudflare 本身不收主機費——你只付域名給註冊商。"));

  // --- 結尾 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("十、最後的小提醒"));
  children.push(BULLET("**這份手冊請存兩個地方**：OneDrive（雲端備份）+ 本機（網路掛掉時還能看）"));
  children.push(BULLET("**密碼**永遠不要寫進這份手冊。用密碼管理工具（如 1Password、Bitwarden）統一管理"));
  children.push(BULLET("**換維護者**時：把這份手冊 + Supabase 帳密 + Cloudflare 帳密 + GitHub 帳號 4 樣東西交接"));
  children.push(BULLET("**有疑問**：先看本手冊第七章「常見問題排查」；不在裡面的問題用 ChatGPT/Claude 描述「我在維護一個 Vite + React + Supabase + Cloudflare Workers 的網站，問題是…」開頭問"));

  return new Document({
    styles: sharedStyles,
    numbering: sharedNumbering,
    sections: [
      {
        properties: sharedSectionProps,
        children,
      },
    ],
  });
}

// ==========================================================================
// DOCUMENT 2: 網站製作新手教學
// ==========================================================================
function buildTutorial() {
  const children = [];

  // --- Cover ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 400 },
      children: [
        new TextRun({ text: "網站製作", bold: true, font: FONT, size: 64, color: "355B63" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: "新手教學", bold: true, font: FONT, size: 56, color: "355B63" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 1200 },
      children: [
        new TextRun({ text: "認識 Supabase 與 Cloudflare 兩大支柱", font: FONT, size: 26, color: "84B9C9" }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "本教學以白露官網的實際架構為例，", font: FONT, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "讓你了解現代網站背後常見的兩個第三方服務各自扮演什麼角色，", font: FONT, size: 22 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "以及未來你想做任何新網站時可以怎麼運用。", font: FONT, size: 22 })],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // --- Section 1: 為什麼這份教學 ---
  children.push(H1("一、為什麼你需要看這份教學"));
  children.push(PB("白露官網交付前你問了一個問題：「我先前不知道原來可以設定帳號、權限等等。」"));
  children.push(PB("那個問題很關鍵——它代表你不只想「用」這個網站，還想**理解它怎麼運作**。這份教學就是寫給這樣的你看的。"));
  children.push(PB("不需要會寫程式。讀完之後，你會明白：協會這個網站背後有兩個「**第三方服務**」幫忙做苦工，它們各自負責不同的事；未來你想做新網站（不管是另一個協會、家族活動、社團、個人作品集），知道這兩個工具就有 80% 的網站都能做出來。"));

  // --- Section 2: 三大零件 ---
  children.push(H1("二、現代網站的三大零件"));
  children.push(PB("把網站想像成一家餐廳。一家餐廳要能正常營業，需要三樣東西："));
  children.push(
    KV_TABLE([
      ["1. 菜單與裝潢", "客人看到的東西——菜色照片、桌椅、菜單版型。對應網站的「**前端程式碼**」（HTML/CSS/JS）。"],
      ["2. 廚房與倉庫", "後場——食材、配方、訂單管理、員工排班。對應網站的「**後端 + 資料庫**」（存資料、處理登入）。"],
      ["3. 店面位置與招牌", "讓客人找得到、進得來——地址、招牌、停車場、外送平台。對應網站的「**部署與發布**」（網域、伺服器、CDN）。"],
    ])
  );
  children.push(PB("傳統做網站，**三件事都要你自己做**——很辛苦。現代的做法是把後兩件事「外包」給專門的服務："));
  children.push(BULLET("「廚房與倉庫」→ 外包給 **Supabase**"));
  children.push(BULLET("「店面位置與招牌」→ 外包給 **Cloudflare**"));
  children.push(BULLET("你只需要專注做「菜單與裝潢」（前端設計）"));
  children.push(PB("這就是白露官網的架構，也是 2020 年代以後 95% 的小型網站採用的做法。"));

  // --- Section 3: Cloudflare ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("三、Cloudflare：把網站送到全世界"));

  children.push(H2("它本質上是什麼？"));
  children.push(PB("Cloudflare 最早是一家 **CDN**（Content Delivery Network，內容傳遞網路）公司。"));
  children.push(PB("**CDN 是什麼**：想像你開了一家手作餅乾店在新竹。如果客人從台北下單，餅乾要從新竹寄過去，運費高、時間長。但如果你在台北、高雄、台中各放一個小倉庫，每個倉庫都備一些餅乾，台北客人下單就從台北倉庫出貨——快、便宜。"));
  children.push(PB("Cloudflare 就是網路上的「小倉庫」——他們在全世界 300 多個城市有伺服器。你把網站「寄存」在 Cloudflare 一次，他們會自動把你的網站**複製到所有倉庫**。歐洲訪客連網站時，從歐洲倉庫送出來；台灣訪客連時，從台灣倉庫送出來。"));
  children.push(PB("**對協會網站來說，這意思是**：不管訪客在哪裡，網站都很快。而且 Cloudflare 自動扛 DDoS 攻擊、自動加上 SSL（https）、流量無上限。"));

  children.push(H2("Cloudflare 的免費方案 = 你能用到的全部功能"));
  children.push(PB("Cloudflare 賺企業客戶的錢，**小型網站完全免費而且功能不打折**："));
  children.push(BULLET("**流量無上限**——這在台灣的虛擬主機很罕見（中華電信、戰國雲都會算流量收費）"));
  children.push(BULLET("**請求次數無上限**——你不用擔心爆紅被收高額帳單"));
  children.push(BULLET("**全球 CDN 加速**——免費方案就有"));
  children.push(BULLET("**自動 SSL（https）**——免費方案就有"));
  children.push(BULLET("**自訂網域**——免費"));
  children.push(BULLET("**每月 500 次自動部署**——白露官網每天 push 一次也用不完"));
  children.push(PB("付費方案（Pro $20/月、Business $200/月）主要是企業在乎的分析報告、客服 SLA。協會用不到。"));

  children.push(H2("Cloudflare 的兩種「部署方式」：Workers vs Pages"));
  children.push(PB("這個你不需要記住技術細節，知道它存在就好——以後別人提到時不會聽不懂："));
  children.push(
    KV_TABLE([
      ["Cloudflare Pages（舊）", "專門給「靜態網站」用的服務。簡單、好懂、文件多。2024 年以前的教學大多是這個。"],
      ["Cloudflare Workers + Static Assets（新）", "2024 年起 Cloudflare 主推的新做法。功能更強（可以加伺服器邏輯）。白露官網用這個。"],
      ["差別", "對協會這種純靜態 + Supabase 後端的網站，兩種**效果幾乎一樣**。新版未來會吸收舊版功能。"],
    ])
  );

  children.push(H2("Cloudflare 對協會的關鍵功能（你會用到的）"));
  children.push(H3("1. 連結 GitHub → 自動部署"));
  children.push(PB("這是現代網站開發的標配。你只要把改動 push 到 GitHub，Cloudflare **自動偵測 + 自動 build + 自動上線**——不用 FTP、不用手動上傳。"));
  children.push(PB("白露官網的維護流程就是：改程式 → git push → 等 1.5 分鐘 → 上線。"));

  children.push(H3("2. 環境變數"));
  children.push(PB("有些設定值（例如資料庫連線字串、API key）不適合寫死在程式碼裡（容易外洩、不同環境要不同值）。Cloudflare 提供地方讓你儲存這些值，build 時注入。"));
  children.push(PB("白露官網把 Supabase 的 URL 跟 anon key 存在這裡。"));

  children.push(H3("3. 自訂網域"));
  children.push(PB("免費的子網域長相是 your-project.workers.dev。如果你想要 whitedew.org.tw 或 myassoc.com，買好網域後在 Cloudflare 設定頁加一筆，幾分鐘就生效。"));
  children.push(PB("**進階提示**：在 Cloudflare Registrar 買網域是「批發價」——不加價、不灌套件。其他地方買常會貴 1.5–3 倍。"));

  children.push(H2("什麼時候用 Cloudflare、什麼時候不要？"));
  children.push(H3("✓ 適合用"));
  children.push(BULLET("協會官網、個人作品集、活動頁、文件站、小規模電商展示頁"));
  children.push(BULLET("任何「主要是給人看的頁面」"));
  children.push(BULLET("不確定流量多少（爆紅也不會被收錢）"));
  children.push(H3("✗ 不適合"));
  children.push(BULLET("需要超長時間運算的服務（影音轉檔、AI 模型推論）——免費 Worker 有 10ms CPU 上限"));
  children.push(BULLET("非常規網路協定（不是 HTTP）"));
  children.push(BULLET("法規要求資料只能存某國（Cloudflare 是分散在全球，不能指定）"));

  // --- Section 4: Supabase ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("四、Supabase：取代「自架伺服器 + 自寫 API」"));

  children.push(H2("它本質上是什麼？"));
  children.push(PB("Supabase 是「**Backend as a Service**」（BaaS，後端即服務）。"));
  children.push(PB("**這個詞什麼意思**：傳統做網站，後端要自己寫——你得："));
  children.push(NUM("租一台 Linux 主機（月費 NT$300–1000）"));
  children.push(NUM("自己裝 PostgreSQL 資料庫、設定備份"));
  children.push(NUM("自己寫 API（Node.js / Python / PHP）連接資料庫跟前端"));
  children.push(NUM("自己寫登入系統（密碼雜湊、session 管理、忘記密碼信）"));
  children.push(NUM("自己處理 SSL、防火牆、安全更新"));
  children.push(PB("**這些事每一件都會做整個月**。Supabase 把這些通通做好了——你只要點幾下、寫一點 SQL，全部上面那些事都有了。"));

  children.push(H2("Supabase 包含哪 5 個功能"));
  children.push(PB("（這 5 個是 Supabase 的核心，未來其他專案有需要就知道找它）"));
  children.push(H3("1. Database（資料庫）"));
  children.push(PB("基於 **PostgreSQL**，業界最強的開源資料庫之一。你可以建立資料表、寫 SQL 查詢、存任何結構化資料。"));
  children.push(PB("白露官網用它存：站內文案、消息、會員、聯絡訊息。"));

  children.push(H3("2. Authentication（登入系統）"));
  children.push(PB("可以用 Email + 密碼、Google 登入、GitHub 登入、Facebook 登入、手機簡訊 OTP 等等。**這在傳統做法是要寫好幾週的事**。"));
  children.push(PB("白露官網用它做後台登入。"));

  children.push(H3("3. Storage（檔案儲存）"));
  children.push(PB("可以上傳/儲存大檔（照片、PDF、影片）。類似 Google Drive 但你的程式可以直接讀寫。免費 1GB。"));
  children.push(PB("白露官網**目前沒用到**——將來如果想讓消息附圖、會員上傳資料，就用這個。"));

  children.push(H3("4. Realtime（即時推播）"));
  children.push(PB("資料庫變動時可以**即時**推給所有正在看的人。"));
  children.push(PB("白露官網用它做：你在後台改一筆消息，公開站的訪客**不必重新整理**就會看到新內容。"));

  children.push(H3("5. Edge Functions（雲端函式）"));
  children.push(PB("可以寫一小段程式碼跑在 Supabase 伺服器上——例如「使用者送出聯絡表單時，自動寄一封通知信給協會 email」。"));
  children.push(PB("白露官網**目前沒用到**——之後如果想加自動 Email 通知、定時清舊資料，用這個。"));

  children.push(H2("Supabase 最重要的觀念：Row-Level Security（RLS）"));
  children.push(PB("這是傳統資料庫沒有、Supabase 內建的安全機制。**也是你問「可以設定權限」的答案**。"));
  children.push(PB("**問題**：網站前端的 JS 程式碼會直接連 Supabase 讀寫資料。但程式碼是公開的（瀏覽器按 F12 就能看），如果什麼都讓前端能寫，駭客 5 分鐘就能改光協會所有資料。"));
  children.push(PB("**RLS 的解法**：在資料庫**每一張表**上面寫「規則」——例如：「**任何人**可以讀已發布的消息；只有**登入的管理員**可以修改消息；任何人可以送聯絡訊息但只有管理員能看；會員資料只有管理員能讀。」"));
  children.push(PB("規則是用 SQL 寫的、存在資料庫裡，前端怎麼亂試都繞不過。白露官網的 RLS 設定在 supabase/migrations/0001_init.sql 這份 SQL 檔裡。"));

  children.push(H2("Supabase 的免費額度"));
  children.push(
    KV_TABLE([
      ["資料庫容量", "500 MB（協會用一輩子也碰不到——白露官網現在用 < 1 MB）"],
      ["每月活躍用戶", "50,000 人（後台管理員只算幾個）"],
      ["每月流量", "5 GB"],
      ["檔案儲存", "1 GB"],
      ["備份", "7 天 PITR（Point-in-Time Recovery）自動備份"],
      ["專案閒置", "7 天沒人用會自動「暫停」，有人來時自動喚醒（喚醒約 1 秒延遲）；付費方案 $25/月免暫停"],
    ])
  );
  children.push(PB("白露官網因為**每天都會被搜尋引擎或訪客瀏覽**，不會閒置到暫停。但如果是個人玩的小專案就要注意這個。"));

  children.push(H2("Supabase 哪些功能很重要、你會反覆用？"));
  children.push(H3("1. Authentication → Users 頁面"));
  children.push(PB("**所有「誰能登入」的事都在這裡管**——新增使用者、刪除、強迫重設密碼、看誰最近登入過。"));
  children.push(PB("白露官網的後台管理員授權就靠這個頁面。"));

  children.push(H3("2. Table Editor"));
  children.push(PB("Excel 般的介面看 / 改資料表。**不會寫 SQL 的人也能直接編輯資料**。緊急時刪錯一筆東西、補資料都很方便。"));

  children.push(H3("3. SQL Editor"));
  children.push(PB("執行任意 SQL。批次操作時用得到（例如：「把 2024 年以前的所有草稿消息刪掉」用 SQL 一行解決）。"));

  children.push(H3("4. Database → Backups"));
  children.push(PB("救命的地方。誤刪資料時來這裡點時間回溯。"));

  // --- Section 5: 兩者如何配合 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("五、Supabase + Cloudflare 怎麼配合？"));
  children.push(PB("以白露官網訪客打開首頁為例，背後發生這些事："));
  children.push(NUM("訪客在瀏覽器輸入 https://196xj4.jin40225.workers.dev"));
  children.push(NUM("**Cloudflare** 從最近的伺服器（台灣）瞬間送出網站的 HTML + CSS + JS"));
  children.push(NUM("瀏覽器執行 JS，看到「我要顯示三則最新消息」"));
  children.push(NUM("JS 直接打電話給 **Supabase**：「給我三則最新消息」"));
  children.push(NUM("Supabase 檢查 RLS 規則：「這個人是訪客（沒登入），他只能讀『已發布』的消息」→ 把三則合格的消息傳回去"));
  children.push(NUM("瀏覽器把消息畫到頁面上，訪客看到"));
  children.push(PB("**整個過程約 0.5 秒。**"));

  children.push(H2("這套架構的精妙之處"));
  children.push(BULLET("Cloudflare 負責「快、穩、便宜」——靜態檔案最擅長"));
  children.push(BULLET("Supabase 負責「資料、權限、登入」——動態邏輯最擅長"));
  children.push(BULLET("**它們互不依賴**——任一邊掛了還能維持部分功能（例如 Supabase 暫停時，網站還能顯示但拿不到最新消息）"));
  children.push(BULLET("**它們都送你「夠用一輩子」的免費額度**——對協會這種非商業用途幾乎是禮物"));

  // --- Section 6: 適合做什麼 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("六、適合 / 不適合的場景"));

  children.push(H2("✓ 適合用這套架構（Cloudflare + Supabase）"));
  children.push(BULLET("**非營利組織官網**（協會、社團、宗教團體）"));
  children.push(BULLET("**個人作品集 / 部落格**"));
  children.push(BULLET("**社區資訊平台**（社區佈告欄、家族活動）"));
  children.push(BULLET("**活動報名頁**（聚餐、研習、講座）"));
  children.push(BULLET("**小型 SaaS 試水溫**（你想做個工具給 100 人試用）"));
  children.push(BULLET("**內部行政工具**（協會內部的事項管理、會員資料系統）"));

  children.push(H2("✗ 不適合（要找別的方案）"));
  children.push(BULLET("**需要大量伺服器運算**（影音轉檔、AI 影像處理）→ 用 AWS / Google Cloud"));
  children.push(BULLET("**重 SEO 的內容站**（部落格動輒幾千篇）→ Next.js + Vercel 比較適合"));
  children.push(BULLET("**真實電商**（金流、物流）→ Shopify / WooCommerce 比較快"));
  children.push(BULLET("**App + 後端整套**（手機 App 才是主要產品）→ Firebase 比較適合（功能更全但收費）"));

  // --- Section 7: 下一步 ---
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H1("七、未來你想學更多"));
  children.push(PB("如果你想試做新的網站（或想懂目前白露官網的程式碼），照這個順序學最有效率："));

  children.push(H2("Step 1：學會「HTML/CSS/JavaScript」基礎"));
  children.push(BULLET("免費中文資源：MDN Web 文件 https://developer.mozilla.org/zh-TW/"));
  children.push(BULLET("免費影片：YouTube 搜「JavaScript 入門」、「彭彭」、「六角學院」"));
  children.push(BULLET("時間：每天 1 小時 × 1 個月 = 看得懂基本網頁"));

  children.push(H2("Step 2：學會「React」（白露官網用的前端框架）"));
  children.push(BULLET("官方教學：https://react.dev/learn（有中文翻譯版）"));
  children.push(BULLET("時間：每天 1 小時 × 1 個月 = 改得動白露官網的功能"));

  children.push(H2("Step 3：摸熟 Supabase 與 Cloudflare"));
  children.push(BULLET("Supabase 入門：https://supabase.com/docs/guides/getting-started"));
  children.push(BULLET("Cloudflare Workers：https://developers.cloudflare.com/workers/"));
  children.push(BULLET("時間：跟著做完一個自己的小專案 = 上手"));

  children.push(H2("Step 4（捷徑）：請 AI 助手幫忙"));
  children.push(PB("Claude / ChatGPT 對網站開發超強。**你不需要從頭背語法**——把需求說清楚，AI 寫程式，你看懂並調整。"));
  children.push(PB("白露官網就是這樣做出來的——你提供素材跟想法，AI（我）寫程式 + 部署 + 解 bug，全程不到 1 天。"));

  children.push(H2("最後一個小建議"));
  children.push(PB("**不要等學會了才開始做**——從一個「你真的需要的小網站」開始（例如：紀錄家族活動的頁面、給長輩看的食譜整理）。**做中學最快**，過程中遇到問題就查、就問 AI。一週就能做出第一個能用的成品。"));
  children.push(PB("白露官網是你的第一個——這個架構、這份知識，未來你做下一個、再下一個，會越來越快。"));

  return new Document({
    styles: sharedStyles,
    numbering: sharedNumbering,
    sections: [
      {
        properties: sharedSectionProps,
        children,
      },
    ],
  });
}

// ---------- Write files ----------
async function write(doc, filename) {
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`wrote ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

console.log("Building manual...");
await write(buildManual(), "白露官網維護手冊.docx");
console.log("Building tutorial...");
await write(buildTutorial(), "網站製作新手教學.docx");
console.log("Done.");
