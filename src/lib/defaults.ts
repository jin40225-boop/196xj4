// Default content — used as a fallback when Supabase is unreachable
// AND as the seed data for a fresh Supabase database (see supabase/seed.sql).
// Keep these two in sync if you change anything here.
import type { SiteContent, NewsItem, Member } from "./types";

let _idCount = 0;
const sid = (prefix: string) => `${prefix}-${++_idCount}`;

export const DEFAULT_SITE: SiteContent = {
  hero: {
    eyebrow: "Taiwan White Dew · 社會福利服務協會",
    titleA: "讓需要支持的人，",
    titleB: "都能被",
    titleHl: "穩穩接住",
    titleC: "。",
    lead: "社團法人台灣白露社會福利服務協會以「助人工作者的自我照顧」為願景出發，致力營造長期提供助人服務的友善環境，一同向光而行。",
  },
  about: {
    lead: "白露：初秋微涼，小小水珠逐步凝結，清晨而起也能見得遍布滋養大地。",
    intro:
      "社團法人台灣白露社會福利服務協會於中華民國114年8月11日經內政部許可設立，並於114年12月26日完成法人登記（臺灣新竹地方法院登記字第1239號）。本會為依法設立、非以營利為目的之公益性社會團體，以提升社工自我照顧與量能、為弱勢群體提供支援與關懷為宗旨。",
    origin1:
      "協會創立的契機，源自於與社工夥伴們一次次聚餐。我們在聚餐中凝聚共識，看見現行體制對實務工作者的磨難——自身的生活品質與身心健康總為了解決實務困境而讓步，社會工作者的自我犧牲似乎已成常態。",
    origin2:
      "我們因此迸發創建協會的想法，希望成為善的起點，將重心回到善待助人者本身。協會將致力於營造長期提供助人服務的友善環境，也期望使助人者在工作、生活、家庭、自我實現上尋得平衡，讓此成為善的循環。",
    quote: "初秋微涼，小小水珠逐步凝結，清晨而起也能見得遍布滋養大地。",
  },
  contact: {
    email: "tw.whitedew@gmail.com",
    line: "@839degei · 掃描 QR 加好友",
    org: "社團法人 · 非以營利為目的之公益性社會團體",
    phone: "0980-686-968",
    address: "新竹市香山區中山路 650 之 7 號 3 樓",
  },
  membershipNote: "入會費 NT$500、年費 NT$500。歡迎個人、團體與贊助會員加入，與我們一同向光而行。",
  footerTagline:
    "社團法人台灣白露社會福利服務協會以「助人工作者的自我照顧」為願景出發，致力營造長期提供助人服務的友善環境，一同向光而行。",
};

export const DEFAULT_NEWS: NewsItem[] = [
  {
    id: sid("n"),
    date: "2025-12-29",
    category: "協會公告",
    icon: "sprout",
    published: true,
    title: "本會完成法人登記，正式成立",
    excerpt:
      "本會於 114 年 12 月 26 日經臺灣新竹地方法院登記字第 1239 號完成法人登記，正式成為依法設立的公益性社會團體。",
    body: "社團法人台灣白露社會福利服務協會於中華民國 114 年 8 月 11 日經內政部許可設立（台內團字第 1140020432 號函），並於 114 年 12 月 26 日完成法人登記（臺灣新竹地方法院 114 年度法登社字第 25 號、登記字第 1239 號）。本會將以提升社工自我照顧與量能、為弱勢群體提供支援與關懷為宗旨，持續推動相關服務。",
  },
  {
    id: sid("n"),
    date: "2025-02-18",
    category: "會員招募",
    icon: "users-round",
    published: true,
    title: "誠摯邀請您加入白露大家庭",
    excerpt: "現正招募新會員，與我們一同為社會福利盡一份心力。",
    body: "社團法人台灣白露社會福利服務協會誠摯邀請您加入。我們是一個專注於社工照顧與弱勢關懷的非營利組織，期待與您一同為社會福利盡一份心力。歡迎個人、團體與贊助會員加入，詳細申請流程請來信 tw.whitedew@gmail.com 洽詢。",
  },
  {
    id: sid("n"),
    date: "2025-03-05",
    category: "活動預告",
    icon: "wind",
    published: true,
    title: "身心放鬆・瑜珈冥想工作坊",
    excerpt: "為助人工作者打造的喘息空間，在忙碌之餘照顧自己的身心健康。",
    body: "本會將舉辦「身心放鬆・瑜珈冥想工作坊」，透過專業引導，為助人工作者打造一個喘息與自我照顧的空間。名額有限，敬請把握。",
  },
];

export const DEFAULT_MEMBERS: Member[] = [
  { id: sid("m"), name: "示範會員 A", type: "個人會員", date: "2025-02-20", status: "已繳費" },
];
