# Security Policy

## 回報安全漏洞

若您發現本外掛存在安全性問題，懇請避免直接在 GitHub Issues 公開揭露，以免造成使用者風險。

請透過以下方式私下聯絡本會：

- 使用 GitHub 的 [Private Security Advisory](https://github.com/NTPU-Student-Headquarters/wp-regulation-formatter/security/advisories/new) 功能回報

回報內容請盡量包含：

1. 漏洞類型（例如 XSS、CSRF、權限繞過等）
2. 重現步驟
3. 潛在影響範圍
4. 若有，建議的修補方向

維護者收到回報後將於 7 個工作天內回覆。

## 已知安全設計

- 所有使用者輸入（法規純文字）均透過 `document.createTextNode()` 逸出後才注入 DOM，防止 XSS
- 外掛不涉及任何資料庫寫入或 AJAX 端點，無 CSRF 攻擊面
- PHP 端分類識別採整數 `term_id` 比對，不直接信任使用者可控的字串參數
