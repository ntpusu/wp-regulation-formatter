# NTPUSU WordPress Regulation Formatter

這個專案已經棄用並歸檔，請統一使用 [ntpusu/regulation-sync-plugin](https://github.com/ntpusu/regulation-sync-plugin) 。

臺北大學學生會 WordPress 法規格式化外掛。

此外掛專供本會網站使用，自動偵測 WordPress 網站中歸類於「法規」分類（含子分類）下的文章，並將 Custom HTML 區塊內的純文字法規內容，透過前端 JavaScript 解析為帶有 CSS class 的結構化 HTML，套用專屬樣式。

## 功能特點

- 自動識別「法規」分類（slug: `regulation`）及其所有子分類下的文章
- 解析法規結構，包括編、章、節、款（標題中的）、項（同前）、目（同前）、條號、項、款、目等元素
- 支援阿拉伯數字與中文數字條號
- 多項條文自動以數字編列項次序號，單項條文不顯示序號
- 提供列印友好樣式
- 僅於法規頁面載入資源，不影響其他頁面效能
- 所有使用者輸入均經 HTML 逸出處理，防止 XSS

## 系統需求

- WordPress 6.0 以上
- PHP 7.4 以上
- 瀏覽器支援 CSS `:has()` 選擇器（Chrome 105+、Safari 15.4+、Firefox 121+）

## 安裝方式

### 方法一：上傳 ZIP（推薦）

1. 至 [Releases](https://github.com/NTPU-Student-Headquarters/wp-regulation-formatter/releases) 頁面下載最新版本的 `.zip` 檔
2. 登入 WordPress 後台，前往「外掛 > 安裝外掛 > 上傳外掛」
3. 選擇下載的 `.zip` 檔，點擊「立即安裝」
4. 安裝完成後點擊「啟用外掛」

### 方法二：手動上傳

1. 下載或 clone 本 repository
2. 將整個 `wp-regulation-formatter/` 資料夾上傳至伺服器的 `wp-content/plugins/` 目錄
3. 登入 WordPress 後台，前往「外掛」，找到「NTPUSU Regulation Formatter」並啟用

## 使用方式

### 前置設定

確認 WordPress 後台已建立名稱為「法規」、slug 為 `regulation` 的文章分類。子分類可任意建立，外掛會自動辨識整個樹狀分類。

### 撰寫法規文章

1. 建立新文章，並將其分類至「法規」或其任一子分類
2. 在編輯器中新增一個「自訂 HTML」區塊（Custom HTML block）
3. 將純文字法規內容直接貼入該區塊（注意：一篇文章只能有一個自訂 HTML 區塊）
4. 儲存並預覽，外掛會自動套用格式

### 純文字格式規範

法規純文字應遵循以下格式，外掛依此解析各元素：

| 元素 | 格式範例 | 說明 |
|---|---|---|
| 章節標題 | `第一章 總則` | 以「第＋中文數字＋編／章／節／款／項／目」開頭 |
| 條號 | `第1條` 或 `第一條`<br />或 `第1條（目的）` | 支援阿拉伯數字與中文數字，可接全形括弧標題 |
| 項 | `　本會設會長一人。` | 以全形空白開頭 |
| 款 | `一、會長之職權：` | 以「中文數字＋頓號」開頭 |
| 目 | `（一）執行會務。` | 以「全形括弧中文數字全形括弧」開頭 |

### 範例輸入

```
第一章 總則
第1條
　本自治規程依學生自治相關法規制定之。
第2條（會員資格）
　凡本校在學學生，均為本會會員，享有下列權利：
一、選舉及被選舉權
二、提案權
（一）提交議案
（二）連署議案
```

## CSS Class 對照表

所有樣式 class 均以 `sulaw-` 開頭，避免與佈景主題樣式衝突。

| 法規元素 | CSS Class |
|---|---|
| **章節標題容器** | `sulaw-heading` |
| 編（標題） | `sulaw-div` |
| 章（標題） | `sulaw-chap` |
| 節（標題） | `sulaw-sec` |
| 款（標題） | `sulaw-hsub` |
| 項（標題） | `sulaw-hpara` |
| 目（標題） | `sulaw-hitem` |
| **條文容器** | `sulaw-article` |
| 條號 | `sulaw-artnum` |
| 項 | `sulaw-para` |
| 款 | `sulaw-sub` |
| 目 | `sulaw-item` |
| **其他文字** | `sulaw-misc` |

## 專案結構

```
wp-regulation-formatter/
├── sulaw-formatter.php     # 外掛主程式（PHP）
├── css/
│   └── sulaw-style.css     # 法規樣式表
└── js/
    └── sulaw-formatter.js  # 前端解析腳本
```

## 安全性設計

- XSS 防護：所有使用者輸入的文字均透過 `document.createTextNode()` 逸出 HTML 特殊字符後才組入 DOM
- CSRF 防護：外掛為純前端樣式轉換，不涉及任何資料庫寫入或 AJAX 請求，無 CSRF 風險面
- 分類偵測：PHP 端以 `term_id`（整數）比對，而非直接信任 slug 字串，防止邏輯繞過
- 資源隔離：CSS 與 JS 僅在法規分類文章頁面載入，不影響其餘頁面
