# 交接清冊 · HANDOFF

> **給接手這個專案的 AI 助手（例如 Google Antigravity、Claude Code、Cursor）以及未來的人類維護者。**
>
> 讀完這份文件後你應該有能力獨立維護網站、修 bug、加功能、跟原使用者溝通。
> 想跳過細節先動手，直接看最底下的 [第 13 章 首日上工檢查清單](#13-首日上工檢查清單)。

---

## 0. TL;DR（30 秒摘要）

- **這是什麼**：社團法人台灣白露社會福利服務協會的官方網站，含公開站（5 頁）與內容管理後台。
- **誰用**：協會行政人員，目前唯一管理員是 `jin40225@gmail.com`。
- **技術**：Vite + React + TypeScript（前端）／Supabase（資料庫+登入）／Cloudflare Workers Static Assets（部署）。
- **線上網址**：<https://196xj4.jin40225.workers.dev>
- **原始碼**：<https://github.com/jin40225-boop/196xj4>（branch `main`）
- **本機路徑**：`C:\Users\User\projects\whitedew-site\`（**不在** OneDrive，因 node_modules 會搞掛同步）
- **目前版本**：見 `git describe --tags`（最後一版 tag 是 `v1.0.6`）
- **費用**：每月 NT$0（全部都在 Cloudflare + Supabase 的免費額度內）

---

## 1. 使用者背景與專案脈絡

### 1.1 使用者是誰

- 主要對接者：**陳冠宏**（協會理事長）
- 帳號：`jin40225@gmail.com`（Cloudflare / Supabase / GitHub 都同一個 email）
- GitHub username：`jin40225-boop`
- **背景**：非技術人員。能讀 Markdown、會用瀏覽器、會點 SQL Editor 貼 SQL 並按 Run，但**不會寫程式、不會用 git CLI、不會看 console log**。
- **溝通語言**：繁體中文（台灣）。Markdown 內偶爾混英文技術名詞 OK，整段英文不行。
- **溝通風格喜好**（從訊息學到的）：
  - 喜歡簡短、條列、表格化的指示
  - 不喜歡冗長的說明
  - 對未知的 UI 會直接截圖問「這個是？」
  - 講「OK」「好了」「搞定了」就是已經完成你交辦的事
  - 對於失敗會直接貼錯誤訊息或截圖，期待你解析

### 1.2 協會是什麼

- 全名：**社團法人台灣白露社會福利服務協會**（這個全銜在網站任何地方都要完整出現，**不要省略「社團法人」前綴**——這在 v1.0.1 是使用者明確要求的）
- 立案：內政部 114/8/11 台內團字第 1140020432 號函；新竹地方法院 114/12/26 登記字第 1239 號
- 會址：新竹市香山區中山路 650 之 7 號 3 樓
- Email：`tw.whitedew@gmail.com`
- 宗旨：提升社工自我照顧與量能、為弱勢群體提供支援與關懷
- 服務對象：以社工為主、弱勢群體服務為輔
- 品牌氛圍：**溫暖、療癒、專業、柔和**。**禁止**彈跳動效、emoji 圖示、純黑陰影、科技感漸層、彩虹色

---

## 2. 技術棧速查表

| 層級 | 用什麼 | 為何選它 | 限制 |
|---|---|---|---|
| 前端框架 | React 18 + TypeScript 5 | 原型用 React，保留延續性 | strict mode 開啟 |
| 建置 | Vite 5 | 快、簡單、Hot Reload 好 | **不要升 Vite 6**——Cloudflare Workers 的 auto-detect 才支援 6+，我們刻意停在 5 並用 `wrangler.toml` 明確配置 |
| 路由 | react-router-dom 6 | SPA + 兩個 HTML entry（`/` 與 `/admin.html`） | 注意 deep link 透過 `public/_redirects` 對應 |
| 圖示 | lucide-react | 圓潤、tree-shake 友善 | 用 `src/components/Icon.tsx` 統一包裝，**不要直接 import lucide-react** |
| CSS | 純手寫 CSS + token 變數 | 沿用原型設計系統，不引入 Tailwind 避免破壞品牌一致性 | 所有 token 在 `src/styles/colors_and_type.css`，**不要新增色號** |
| 資料層 | Supabase JS SDK | BaaS 免後端 | RLS 啟用，前端用 anon key |
| 部署 | Cloudflare Workers Static Assets | 免費、全球 CDN、自動 GitHub 部署 | 不是 Pages，是新版的 Workers + Assets |
| Git | GitHub | 標準 | branch `main`、PR/tag 都直推 |

---

## 3. 服務、網址、與帳號一覽

### 3.1 公開網址

| 用途 | 網址 |
|---|---|
| 官方首頁 | <https://196xj4.jin40225.workers.dev> |
| 後台登入 | <https://196xj4.jin40225.workers.dev/admin.html> |
| 版本診斷頁 | <https://196xj4.jin40225.workers.dev/version> |

### 3.2 第三方服務後台

| 服務 | 網址 | 帳號 |
|---|---|---|
| Cloudflare 控制台 | <https://dash.cloudflare.com/aa1fbbd1e4870d165c0ea5e0172c2c7f/workers/services/view/196xj4/production> | `jin40225@gmail.com` |
| Supabase 控制台 | <https://supabase.com/dashboard/project/sssseazkhiswjhtmbluh> | `jin40225@gmail.com` |
| Supabase SQL Editor | <https://supabase.com/dashboard/project/sssseazkhiswjhtmbluh/sql/new> | 同上 |
| Supabase Auth Users | <https://supabase.com/dashboard/project/sssseazkhiswjhtmbluh/auth/users> | 同上 |
| GitHub repo | <https://github.com/jin40225-boop/196xj4> | `jin40225-boop` |
| GitHub gh CLI（本機已登入） | 已配置 PAT；`gh auth status` 可確認 | 同上 |

### 3.3 認證 / 環境變數

| 變數 | 值 | 存在哪裡 |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://sssseazkhiswjhtmbluh.supabase.co` | 本機 `.env.production`（committed）+ Cloudflare Build Variables |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_XyhMnX5iThUucQ2z-jrOhQ_zF2uEUfw` | 同上 |
| 第一位 admin 帳號 | `jin40225@gmail.com` | 密碼**只有使用者知道**——不要問、不要記錄 |

`anon` key 是 Supabase 新版的 `sb_publishable_*` 格式，**設計上可公開**——RLS 保護所有寫入。`.env.production` 刻意 committed 到 repo（見該檔案 header 註釋的理由）。

### 3.4 沒有的東西

- ❌ 沒有 Supabase service_role key 寫進專案任何地方（用不到，也不該寫進）
- ❌ 沒有 Cloudflare API token 寫進專案（也不該寫進）
- ❌ 沒有自訂網域（目前用免費的 `*.workers.dev`）
- ❌ 沒有 SMTP / 郵件發送服務（contact form 只是寫進 DB，沒送 email 通知）
- ❌ 沒有 CI/CD pipeline 配置（除了 Cloudflare 自動 build）
- ❌ 沒有 staging 環境（main branch 直接打到 production）

---

## 4. Repo 結構

```
whitedew-site/
├─ .claude/launch.json                # Claude Code preview server 配置
├─ .env.example                       # 範本，給開發者參考
├─ .env.production                    # 真實 env vars（committed，公開可安全）
├─ .gitignore
├─ CHANGELOG.md                       # 版本變更紀錄
├─ HANDOFF.md                         # 本文件
├─ README.md                          # 開發 + 部署完整指南
├─ admin.html                         # 後台 SPA entry
├─ index.html                         # 公開站 SPA entry
├─ package.json                       # deps + scripts
├─ tsconfig.json / .app.json / .node.json
├─ vite.config.ts                     # 多 entry build + git commit 嵌入
├─ wrangler.toml                      # Cloudflare Workers 配置（assets 模式）
├─ public/
│  ├─ _headers                        # Cloudflare HTTP headers
│  ├─ _redirects                      # SPA fallback（/admin/* → /admin.html）
│  ├─ assets/                         # logo 圖檔
│  └─ robots.txt
├─ src/
│  ├─ admin/                          # 後台 SPA
│  │  ├─ main.tsx                     # 入口、router、auth gate
│  │  ├─ auth.ts                      # Supabase Auth 包裝（含離線 demo 模式）
│  │  ├─ Login.tsx
│  │  ├─ Shell.tsx                    # 側邊欄 + 頂列
│  │  ├─ Toast.tsx                    # useToast hook + Toggle 元件
│  │  ├─ Overview.tsx                 # 總覽
│  │  ├─ NewsAdmin.tsx                # 消息 CRUD + 抽屜編輯器
│  │  ├─ Pages.tsx                    # 頁面文案編輯
│  │  ├─ Members.tsx                  # 會員管理
│  │  ├─ Messages.tsx                 # 聯絡訊息（需 Supabase）
│  │  └─ Settings.tsx
│  ├─ components/                     # 公開站+後台共用元件
│  │  ├─ Icon.tsx                     # lucide-react 包裝（registry 模式）
│  │  ├─ Linkify.tsx                  # 自動把 URL / email 變成 <a>
│  │  └─ ui.tsx                       # Button / Blob / Reveal / IconTile
│  ├─ lib/                            # 資料層
│  │  ├─ types.ts                     # 全域 TypeScript 介面
│  │  ├─ defaults.ts                  # 離線模式 fallback / seed 對照
│  │  ├─ data.ts                      # 靜態結構：PILLARS / ENTRIES / TIERS
│  │  ├─ supabase.ts                  # client（env 缺時 = null）
│  │  └─ store.ts                     # WDStore：read/write/realtime/offline
│  ├─ public-site/                    # 公開站 SPA
│  │  ├─ main.tsx
│  │  ├─ Chrome.tsx                   # Header + Footer
│  │  ├─ Home.tsx
│  │  ├─ About.tsx                    # 含 Services + PageHead + Pillars
│  │  ├─ News.tsx
│  │  ├─ Contact.tsx
│  │  └─ Version.tsx                  # /version 診斷頁
│  ├─ styles/                         # CSS（沿用原型 token）
│  │  ├─ colors_and_type.css          # 色票 + 字級 + 圓角 + 陰影 + 間距
│  │  ├─ site.css                     # 公開站樣式
│  │  └─ admin.css                    # 後台樣式
│  └─ version.ts                      # build-time 版本資訊 export
├─ supabase/
│  ├─ migrations/
│  │  ├─ 0001_init.sql                # 4 張表 + RLS + Realtime publication
│  │  └─ 0002_full_legal_name.sql     # 把舊文案的「白露協會」改為全銜
│  └─ seed.sql                        # 初始示範資料
└─ scripts/
   └─ gen-docs.mjs                    # 產生兩份 .docx 手冊
```

---

## 5. 設計鐵則（**不可違背**，使用者非常在意）

從 `白露協會官網構築/README.md`（原始設計簡報）：

1. **配色只用 `colors_and_type.css` 的 token**。冷色為主、暖色點綴；低彩度高明度；文字永不純黑。
2. **全圓角**。按鈕 pill 或 12–16px；卡片 16–24px；大面板 32px。
3. **陰影帶深青墨色調** `rgba(53,91,99,…)`，不要灰/黑硬陰影。
4. **動效溫和**。280ms `cubic-bezier(.33,.8,.4,1)`，淡入 + 輕微上浮，**禁止彈跳**。
5. **裝飾用柔和水彩、模糊粉彩團、有機 blob/波形**。禁止硬幾何、忙碌花紋、科技感漸層（不要藍→紫）。
6. **圖像用 placeholder**，不要自畫 SVG 插畫。Logo 是唯一例外。
7. **文案語氣**：溫暖、真誠、略帶文學感；用「我們／您」；繁體中文台灣用法、全形標點。
8. **不要 emoji 當 UI 圖示**——用 Lucide line icons。

---

## 6. 程式碼慣例

- **TypeScript strict mode**：`tsc -b` 必須過。
- **不要新增 dependency** 除非確實必要——目前已經很精簡（react、react-router、@supabase/supabase-js、lucide-react）。
- **不要引入 Tailwind / styled-components / CSS-in-JS**——維持手寫 CSS 模組化。
- **資料層走 `WDStore`**：所有 Supabase 讀寫都透過 `src/lib/store.ts`，**不要在 component 直接 import supabase client**。
- **離線/線上雙模式**：所有改動都要保證 `HAS_SUPABASE === false` 時還能跑（用 DEFAULTS fallback）。
- **i18n 不需要**：純繁體中文站，不做多語。
- **檔名規範**：React component PascalCase（`Foo.tsx`）；util kebab-case 或 camelCase（`linkify.tsx` 也可，但目前用 PascalCase）。

---

## 7. 資料庫 schema 概要

四張表，全部啟用 RLS（見 `supabase/migrations/0001_init.sql`）：

| 表 | 用途 | 公開可讀 | 寫入權限 |
|---|---|---|---|
| `site_content` | 單列 jsonb（id=1），含 hero/about/contact/membershipNote/footerTagline | ✓ 全部 | authenticated |
| `news` | 消息列表 | ✓ 僅 published=true | authenticated |
| `members` | 會員 | ✗ | authenticated only |
| `contact_messages` | 聯絡表單收件箱 | ✗ 但 anon 可 INSERT | authenticated 讀/改 |

修改 schema：**不要直接在 Dashboard 改表結構**——新增 `supabase/migrations/0003_xxx.sql` 寫 ALTER TABLE，叫使用者貼到 SQL Editor 跑，**並且記得 commit migration 檔案**讓未來重建環境可重現。

---

## 8. 目前狀態 / 最新版本

- **branch**：`main`
- **最新 tag**：跑 `git describe --tags --abbrev=0` 取得（這份文件寫完時是 `v1.0.5`）
- **線上 commit**：開 <https://196xj4.jin40225.workers.dev/version> 看 `commit` 那行
- **線上是否連線 DB**：同上頁 `supabase 連線` 那行應該寫「已連線」

### 8.1 怎麼確認 build 是新版

每次 build 後 main bundle 的 hash 都會變（`/assets/main-XXXX.js`）。可用：

```pwsh
$base = 'https://196xj4.jin40225.workers.dev'
(Invoke-WebRequest -UseBasicParsing -Uri "$base/?cb=$(Get-Random)").Content `
  | Select-String -Pattern '/assets/[\w-]+\.js' -AllMatches `
  | ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
```

如果想驗 env vars 有 baked 進去：**Supabase URL 是在 `version-*.js` chunk 不是 `main-*.js`**——Vite tree-shake 把第三方依賴（含 supabase-js + URL 字串）分到單獨 chunk。曾經有一個 session 因為這個誤判耗了 30 分鐘，**請記住**。

---

## 9. 最近版本變更（看 CHANGELOG.md 完整列表）

| 版本 | 大概什麼 |
|---|---|
| v1.0.0 | 首次上線（5 頁公開 + 6 分頁後台 + Supabase 連線） |
| v1.0.1 | 全銜統一、移除 Hero blob、URL linkify |
| v1.0.2 | 修最新消息 modal 手機無法捲動 |
| v1.0.3 | 調淡首頁 hero gradient + .blob 透明度 |
| v1.0.4 | 手機 hero embrace 圓環縮小 |
| v1.0.6 | 官方 LINE 資料更新為 @839degei |
| v1.0.5 | orbit 圖標重排成四個對稱位置（satellite 模式）+ 本份 HANDOFF |

---

## 10. 已知 quirks / 踩過的坑

### 10.1 Cloudflare Workers Static Assets 的 env var 注入不穩定
- 加 build variables 後即使 retry build、清 cache，**有時候 env var 還是沒進 bundle**
- 解法：committed `.env.production`（值都是公開可安全的）作為保底
- 別嘗試把 .env.production 拿掉再依賴 Cloudflare 注入——不可靠

### 10.2 Vite 把第三方依賴拆 chunk
- 想驗 env 有沒有 baked，grep `version-*.js` 不是 `main-*.js`
- 同理，react、lucide-react、supabase-js 全部都在 `version-*.js`

### 10.3 OneDrive 同步陷阱
- 專案**不要**放在 OneDrive 內——node_modules 幾萬個小檔會搞掛同步
- 但**素材**（PDF、docx、設計檔）放在 `C:\Users\User\OneDrive\Desktop\白露協會官網構築\` 是 OK 的
- 兩份 .docx 手冊（維護手冊 + 新手教學）刻意放 OneDrive 桌面方便使用者翻

### 10.4 預覽工具看到舊版本
- 使用者用 iPhone Safari 看時常會吃舊快取
- 修 CSS 後請使用者**下拉重整**（不是普通重新整理）
- `/version` 頁的 commit hash 是判斷「線上跑的是不是最新 build」的權威來源

### 10.5 PowerShell git commit identity
- 本機沒設 git user.email / user.name
- 用 inline：`git -c user.email=dev@local -c user.name=dev commit -m "..."`
- 千萬不要叫使用者 `git config --global user.email "..."`——他不知道要填什麼

### 10.6 Cloudflare 介面變動頻繁
- 我們是「Workers + Static Assets」流程，不是經典「Pages」
- Cloudflare 偶爾會 auto-open PR 改 wrangler.toml 的 name（讓它跟 Worker 實際名稱一致）——直接合併即可
- 部署設定在 Settings → Build → Variables and secrets（**不是**右邊側欄的 Variables and Secrets——那個是 runtime 變數，Vite 看不到）

### 10.7 後台「展示模式」徽章
- 若使用者看到右上角橘色「展示模式」徽章，表示 `HAS_SUPABASE === false`，即 env vars 沒讀到
- 不是 bug，是 fallback 機制——但代表 deploy 出問題了

---

## 11. 接下來可能要做的事（使用者**未要求**，但是合理的下一步）

- [ ] 綁協會自有網域（例如 `whitedew.org.tw`）——需要使用者先到 TWNIC 註冊
- [ ] 聯絡表單收信後**自動寄 email** 通知協會：寫 Supabase Edge Function 串 Resend / Postmark
- [ ] 線上入會表單（目前會員資料純人工輸入）
- [ ] SEO 強化：sitemap.xml、structured data、Open Graph 圖片改成正式視覺
- [ ] 行動版下載速度優化：把 LXGW WenKai TC 字體做 subset 或只在 quote band 載入
- [ ] Cookie 同意條款（若未來要加 GA / Pixel）
- [ ] 後台帳號分權（管理員 vs 編輯者）——目前所有 auth 使用者權限相同
- [ ] 自動備份排程（目前只靠 Supabase 7 天 PITR）

---

## 12. 跟使用者溝通的注意事項

從先前對話累積的觀察：

### 12.1 該做的
- ✅ 用繁體中文回覆
- ✅ 條列、表格、短句
- ✅ 給網址時用完整 https://...（讓他 Ctrl+click 直接開）
- ✅ 改動完明確說「請打開 X 確認 Y」
- ✅ 失敗時主動承認、給替代方案
- ✅ 用 4 行報告版本對位（資料夾/分支/commit/網址）
- ✅ 給「對外公告用更新日誌」（民國年、白話、不含技術細節）

### 12.2 不要做的
- ❌ 不要丟一大段純文字段落
- ❌ 不要假設他知道 git/npm/PowerShell 命令——示範時要完整貼
- ❌ 不要要求他做技術判斷（例如「你覺得這樣 OK 嗎？」要改成「我建議 A 因為 X，你接受嗎？」）
- ❌ 不要在沒有 commit 的情況下宣稱「完成」
- ❌ 不要產生 emoji（除非他先用）
- ❌ 不要碰他的密碼或暗中讀寫敏感資料

### 12.3 他的全域偏好（從 `C:\Users\User\.claude\CLAUDE.md` 摘錄）
- Karpathy guidelines：思考優先、簡潔優先、外科手術式改動、目標導向執行
- Preview Version Alignment：每次給預覽網址都要附 4 行對位報告（資料夾/分支/commit/網址）
- 不要創 .md 文件除非他明確要求——README/CHANGELOG/HANDOFF 是例外（這些是他要求過的）

---

## 13. 首日上工檢查清單

接手第一天，依序做這些：

1. **打開 repo**：`code C:\Users\User\projects\whitedew-site` 或對等 IDE
2. **裝 deps**：`npm install`（已有 node_modules 的話略過）
3. **本機開發測試**：`npm run dev` → 開 <http://localhost:5176>
   - 公開站 5 頁全部能開
   - <http://localhost:5176/admin.html> 能顯示登入頁
   - 不應該看到任何 console error（warning OK）
4. **build 一次**：`npm run build`，應該綠勾 + 5 個 .js + 3 個 .css 在 `dist/`
5. **typecheck**：`npm run typecheck`，無錯
6. **驗線上版本**：`curl https://196xj4.jin40225.workers.dev/version` → 確認 commit 跟 `git rev-parse --short HEAD` 一致
7. **登入後台**：請使用者給你他自己的 Supabase 帳號 email（密碼自己改）；或請他幫你建一個專屬 admin email
8. **試一次完整流程**：後台改一筆消息標題、儲存、開公開站 `/news` 看更新有沒有即時出現
9. **讀完這份 HANDOFF.md**
10. **讀 `README.md`**（部署流程詳述）
11. **讀 `CHANGELOG.md`**（看最近改了什麼）
12. **讀 `白露協會官網構築/CODEX_BRIEF.md`**（原始設計簡報，建構脈絡）

完成以上你就能獨立維護了。有疑問先看本文件 [第 10 章 已知 quirks](#10-已知-quirks--踩過的坑)；找不到答案再問使用者。

---

## 附錄 A：常用命令速查

```pwsh
# 本機開發
cd C:\Users\User\projects\whitedew-site
npm install                # 第一次或拉新版時
npm run dev                # http://localhost:5176
npm run build              # 建置到 dist/
npm run typecheck

# Git（注意 inline identity）
git pull -q --rebase
git -c user.email=dev@local -c user.name=dev commit -q -m "..."
git push -q
git -c user.email=dev@local -c user.name=dev tag -a v1.0.X -m "..."
git push --tags -q

# 驗線上 bundle env vars baked
curl https://196xj4.jin40225.workers.dev/version

# Supabase 透過 REST API 驗資料（anon key 已可讀公開資料）
$h = @{ apikey = 'sb_publishable_XyhMnX5iThUucQ2z-jrOhQ_zF2uEUfw' }
Invoke-WebRequest -UseBasicParsing -Uri 'https://sssseazkhiswjhtmbluh.supabase.co/rest/v1/news?select=title,date&order=date.desc' -Headers $h
```

## 附錄 B：對外公告用更新日誌格式

```
115-06-01 更新日誌
1. 清除首頁圖塊，避免遮擋文字。
2. 全站協會名稱統一為全銜「社團法人台灣白露社會福利服務協會」。
3. ...
```

民國年（西元 - 1911）、白話、無技術術語、每項一句。

---

*本文件版本：v1.0.6（2026-06-08）。改動時請同時更新版本與日期。*
