# Changelog

本文件紀錄本專案所有重要版本異動，格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，版本號遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [1.0.0] - 2026-03-05

### 新增

- WordPress 外掛主程式（`sulaw-formatter.php`），自動偵測「法規」分類（slug: `regulation`）及其子分類下的文章
- 前端 JavaScript（`sulaw-formatter.js`），解析 Custom HTML 區塊內的純文字法規，輸出結構化 HTML
- 支援法規結構元素：編、章、節、款（標題用）、項（臺北校區標題用）、目（標題用）、條號、項、款、目
- 支援阿拉伯數字與中文數字條號，以及全形括弧條文標題
- CSS 樣式表（`sulaw-style.css`），提供法規專屬排版與列印樣式
- 多項條文以羅馬數字自動編列項次序號，採用 CSS `:has()` 選擇器，單項條文不顯示序號
- 所有使用者輸入透過 `document.createTextNode()` 逸出，防止 XSS
- PHP 分類偵測採整數 `term_id` 比對，防止 slug 邏輯繞過
