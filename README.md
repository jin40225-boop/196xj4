# 白露協會官方網站 · White Dew Official Site

社團法人台灣白露社會福利服務協會的正式網站，含 5 頁公開官網與一套內容管理後台。

- **公開站** — 首頁、關於、服務介紹、最新消息、聯絡，全部使用同一份品牌設計系統。
- **後台** — 登入後可即時編輯頁面文案、發布消息、管理會員與聯絡訊息。
- **資料層** — Supabase (PostgreSQL + Auth + Realtime)。
- **部署** — Cloudflare Pages，自動連結 GitHub。

---

## 1 快速開始（本機開發）

```bash
# 安裝
npm install

# 啟動開發伺服器
npm run dev          # http://localhost:5176

# 型別檢查
npm run typecheck

# 建置產品版本
npm run build        # 輸出至 dist/

# 預覽建置結果
npm run preview      # http://localhost:4173
```

開發模式下，若沒有設定 Supabase（無 `.env.local`），網站會自動以「展示模式」運行——所有編輯只留在當前瀏覽器分頁，重新整理會還原。Supabase 設定完成後即會自動切換為「線上模式」。

---

## 2 連線到 Supabase

### 2.1 建立 Supabase 專案

1. 前往 <https://supabase.com>，使用 GitHub 或 email 註冊。
2. 點「New project」，建議 region 選 `Northeast Asia (Tokyo)`。
3. 設定一個 **強密碼**（不會在這個專案用到，但 Supabase 必填）。
4. 等待 1–2 分鐘 provisioning 完成。

### 2.2 套用資料庫 schema 與初始內容

1. 在 Supabase Dashboard 進入 **SQL Editor → New query**。
2. 把 `supabase/migrations/0001_init.sql` 整檔貼進去，按 **Run**。
3. 接著建立另一個 New query，把 `supabase/seed.sql` 整檔貼進去，按 **Run**。

執行後在 **Table Editor** 應該能看到四張表：`site_content`、`news`、`members`、`contact_messages`。

### 2.3 拿取連線金鑰

在 Supabase Dashboard：

- **Project Settings → API**
  - **Project URL** → `VITE_SUPABASE_URL`
  - **anon public** key → `VITE_SUPABASE_ANON_KEY`

複製到專案根目錄的 `.env.local`：

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...（很長）
```

`anon` key 可以安全地放在前端 bundle 裡——`0001_init.sql` 已建立 RLS（Row-Level Security）保護所有寫入操作，前端只能讀公開內容，需要登入才能改。

### 2.4 建立第一個管理員帳號

在 Supabase Dashboard：

1. **Authentication → Providers** 確認 **Email** 已啟用。
2. **Authentication → Users → Add user → Create new user**。
3. 填寫 email + 密碼，**取消勾選 Auto Confirm User 以外的選項**並勾選 **Auto Confirm User**（這樣可直接登入，不必收信認證）。
4. 把帳密交給協會的後台管理者。

之後可在同處新增更多管理員。

### 2.5 重啟 dev server

```bash
npm run dev
```

瀏覽 `/admin.html`，左上角不再顯示「展示模式」徽章——表示已成功連線。

---

## 3 部署到 Cloudflare Pages

### 3.1 推上 GitHub

```bash
# 在 GitHub 建立空 repo，然後在本機：
git remote add origin git@github.com:你的帳號/whitedew-site.git
git branch -M main
git push -u origin main
```

### 3.2 建立 Cloudflare Pages 專案

1. 註冊 / 登入 <https://dash.cloudflare.com>。
2. 左側 **Workers & Pages → Create → Pages → Connect to Git**。
3. 授權 GitHub，選擇 `whitedew-site` repo。
4. 設定 build：
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`（預設）
5. **Environment variables** 加入：
   - `VITE_SUPABASE_URL` = 你的 Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 anon key
6. 按 **Save and Deploy**。

### 3.3 自訂網域（選用）

Cloudflare Pages 預設給你 `whitedew-site.pages.dev`。要綁協會自己的網域：

1. Pages 專案 → **Custom domains → Set up a custom domain**。
2. 輸入網域（例如 `whitedew.org.tw`）。
3. 依指示在 DNS 加 CNAME（或直接由 Cloudflare 託管 DNS 一鍵設定）。

### 3.4 驗證部署

部署完成後，打開 `https://你的網域/version`，應顯示：

```
branch     main
commit     <你最新 commit 的 short hash>
built at   <ISO 時間>
origin     https://你的網域
supabase 連線    已連線
```

這頁的存在是為了確認：「現在線上跑的就是你剛 push 的那一版」。

---

## 4 維運手冊

### 4.1 新增消息 / 編輯頁面文字

登入 `/admin` → 直接在介面操作。所有變更會即時寫入 Supabase 並同步到所有開著公開站的訪客（透過 Supabase Realtime）。

### 4.2 新增管理員

到 Supabase Dashboard → Authentication → Users → Add user，建立新帳號即可。

### 4.3 備份資料

- 短期：Supabase 免費方案保留 7 天 PITR（point-in-time recovery）。
- 長期：在 Supabase Dashboard → Database → Backups 下載 SQL dump，或用 `pg_dump` 自動排程。

### 4.4 重新整理示範內容

如果想把資料庫還原到出廠值，重新跑一次 `supabase/seed.sql`。`site_content` 會被覆蓋；`news` 中三則初始消息會先被刪除再插入；`members` 與 `contact_messages` 不會被動。

### 4.5 修改內容預設值（程式碼層）

如果想改「離線模式 fallback」與「將來重新 seed 的初始內容」：

- `src/lib/defaults.ts` — TypeScript 端預設值（離線模式使用）。
- `supabase/seed.sql` — SQL 端初始資料。

**請把兩處保持一致**——否則展示模式與線上模式會顯示不同內容。

---

## 5 程式碼結構

```
whitedew-site/
├─ public/                    # 直接 copy 到 dist 的靜態檔
│  ├─ assets/                 # logo、品牌素材
│  ├─ _redirects              # Cloudflare Pages SPA fallback
│  ├─ _headers                # 安全與快取 headers
│  └─ robots.txt
├─ src/
│  ├─ styles/                 # CSS（沿用原 prototype 的設計 token）
│  │  ├─ colors_and_type.css  # 色票、字級、圓角、陰影、間距
│  │  ├─ site.css             # 公開站 component 樣式
│  │  └─ admin.css            # 後台 component 樣式
│  ├─ components/             # 公開站 + 後台共用元件
│  │  ├─ Icon.tsx             # lucide-react 包裝
│  │  └─ ui.tsx               # Button / Blob / Reveal / IconTile
│  ├─ lib/                    # 資料層與型別
│  │  ├─ types.ts             # 全域 TypeScript 介面
│  │  ├─ defaults.ts          # 離線模式 fallback / seed 對照
│  │  ├─ supabase.ts          # supabase-js client（缺 env 時為 null）
│  │  ├─ store.ts             # WDStore：read + write + realtime + offline fallback
│  │  └─ data.ts              # 靜態結構資料：PILLARS / ENTRIES / TIERS / NEWS_STYLE
│  ├─ public-site/            # 公開站 SPA
│  │  ├─ main.tsx             # 入口
│  │  ├─ Chrome.tsx           # Header / Footer
│  │  ├─ Home.tsx
│  │  ├─ About.tsx            # 也含 Services + PageHead + Pillars
│  │  ├─ News.tsx
│  │  ├─ Contact.tsx
│  │  └─ Version.tsx          # /version 診斷頁
│  └─ admin/                  # 後台 SPA
│     ├─ main.tsx             # 入口（含 useSession 守衛）
│     ├─ auth.ts              # Supabase Auth / 展示模式雙模式
│     ├─ Login.tsx
│     ├─ Shell.tsx            # 側邊欄 + 頂列
│     ├─ Toast.tsx            # useToast + Toggle
│     ├─ Overview.tsx
│     ├─ NewsAdmin.tsx        # 列表 + 抽屜編輯器
│     ├─ Pages.tsx            # 頁面文字編輯
│     ├─ Members.tsx
│     ├─ Messages.tsx         # 聯絡訊息（需 Supabase）
│     └─ Settings.tsx
├─ supabase/
│  ├─ migrations/0001_init.sql
│  └─ seed.sql
├─ index.html                 # 公開站入口
├─ admin.html                 # 後台入口
├─ vite.config.ts             # 多 entry build + git commit 嵌入
└─ package.json
```

---

## 6 設計依據

視覺與文案沿用 `colors_and_type.css` 內所有 design token，**不可自行新增色號或字級**。詳細品牌規範（語氣、圖示風格、不可違背的設計鐵則 8 條）寫在原始倉庫 `白露協會官網構築/README.md`。

主要原則：

- 配色：冷色為主、暖色點綴；低彩度高明度；文字永不純黑。
- 圓角：按鈕 pill、卡片 16–24px、大面板 32px。
- 陰影：帶深青墨色調 `rgba(53,91,99,…)`，不要灰/黑硬陰影。
- 動效：280ms `cubic-bezier(.33,.8,.4,1)`，淡入 + 輕微上浮，**不要彈跳**。
- 圖示：Lucide line icons，`stroke-width: 1.75`，stroke 不用純黑。
- 不要 emoji 當 UI 圖示。
