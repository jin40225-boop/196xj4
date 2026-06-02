# 變更紀錄 · CHANGELOG

依語意化版號（[SemVer](https://semver.org/lang/zh-TW/)）紀錄主要里程碑。

## v1.0.0 — 2026-06-01

第一個正式對外公開的版本。

### 新增

- **公開官網（5 頁）**：首頁、關於我們、服務介紹、最新消息、聯絡我們。
- **內容管理後台（6 分頁）**：總覽、最新消息 CRUD、頁面內容編輯、會員管理、聯絡訊息、設定。
- **資料層**：Supabase（PostgreSQL + Auth + Realtime + RLS）；前端透過 `WDStore` 統一存取。
- **部署**：Cloudflare Workers Static Assets，連結 GitHub 自動部署。
- **版本診斷頁** `/version`：顯示 branch / commit / built-at / 是否連線 Supabase。
- **公開鏈接**：[https://196xj4.jin40225.workers.dev](https://196xj4.jin40225.workers.dev)

### 文件

- `README.md`：開發、部署、Supabase 設定、Cloudflare 設定步驟。
- `白露官網維護手冊.docx`：10 章維運手冊，含網址速查、帳號管理、排錯流程。
- `網站製作新手教學.docx`：7 章新手教學，講解 Supabase + Cloudflare 角色。

### 設計

- 完整沿用原型的設計 token（`src/styles/colors_and_type.css`）。
- 全圓角、柔和粉彩、深青墨色調陰影、Lucide line icons。

---

## v1.0.5 — 2026-06-01

### 新增

- **`HANDOFF.md`**：13 章完整交接清冊，給後續接手的 AI 助手或人類維護者。包含技術棧、所有網址/帳號、repo 結構、設計鐵則、已知 quirks、首日上工檢查清單。

### 修正

- **首頁 orbit 圖標重新排列**：原本 4 個小圖標（水滴、葉子、愛心、閃光）用 `top`/`left`/`right` 百分比定位，分散在 embrace 容器的四個角，在手機上會跟 logo 重疊（特別是頂部的水滴會壓到 logo 上）。改用 **satellite-orbit transform 模式**：每個圖標從中心旋轉到指定角度、外推 `--orbit-r`、再轉回直立。4 個圖標固定在**上/右/下/左**四個對稱位置，由 CSS 變數驅動半徑：
  - 桌機：`--orbit-r: 210px` `--orbit-size: 54px`
  - ≤860px：`--orbit-r: 130px` `--orbit-size: 40px`
  - ≤480px：`--orbit-r: 118px` `--orbit-size: 34px`
  - 每個 breakpoint 都計算過確保「不蓋 logo」且「不超出螢幕」。

---

## v1.0.4 — 2026-06-01

### 修正

- **手機 hero embrace 遮擋標題**：圓圈包覆 logo 的裝飾環在 ≤860px 螢幕底部會壓到標題文字。改為：
  - ≤860px：embrace 寬度從 300px 縮到 240px、`r-outer` 透明度降到 .55、整體下方加 8px 留白。
  - ≤480px：直接隱藏 `r-outer` 大環，只保留虛線 + 內核圓 + logo，內核降到 .7 透明度。
  - 所有裝飾元素加 `pointer-events:none` 確保不會擋觸控。

---

## v1.0.3 — 2026-06-01

### 修正

- **首頁色塊調淡**：`.hero` 區的兩道 pastel radial gradient 從不透明 *-100 色票改為 `rgba(...)` 並降低透明度（35% / 28%）、縮小半徑；`.blob` 通用透明度從 0.8 降到 0.32 並加重模糊。對應多位反應「色塊會遮擋到文字」的情況。

---

## v1.0.2 — 2026-06-01

### 修正

- **最新消息 modal 手機無法捲動**：當文章內容超過螢幕高度時，被切掉的內容無法捲動到看。改為 modal 高度上限 = 視窗高度 - 邊距，內部 `.modal-scroll` 區自行捲動；關閉鈕（X）固定在右上角，捲動內容時始終可達。同時對 ≤640px 螢幕收緊邊距與字體留白。

---

## v1.0.1 — 2026-06-01

### 修正

- **全銜統一**：全站所有提到協會的地方統一使用「社團法人台灣白露社會福利服務協會」，包含 header、footer、admin 側邊欄、登入頁、SEO 標題、首頁 hero 引言。
- **首頁色塊**：移除 Hero 區左上、右下、右上三個 pastel `<Blob>` 裝飾——它們在窄螢幕下會遮擋標題文字。
- **內文 URL/Email 自動可點**：新增 `<Linkify>` 元件，最新消息的內文裡如果有 `https://...` 或 email，會自動變成可點連結。

### 內部

- `supabase/migrations/0002_full_legal_name.sql`：把線上資料庫的 `site_content` 與招募消息的 body 同步成新版文字。
- header `.brand .zh` 樣式調整（移除 `nowrap`、降字級到 15.5/16px），讓長協會名能優雅換行。
