/* sulaw-formatter.js — 前端法規純文字轉 HTML，UTF-8 */

wp.domReady( function () {
    'use strict';

    /**
     * 取得頁面上唯一的 Custom HTML 區塊容器。
     * Custom HTML 區塊理應以 <div class="wp-block-html"> 輸出。
     * 若存在多個或零個，直接放棄（亦即，文章內必須恰好一個 HTML 區塊）。
     */
    const htmlBlocks = document.querySelectorAll( '.wp-block-html' );
    if ( htmlBlocks.length !== 1 ) {
        return;
    }

    const container = htmlBlocks[ 0 ];
    const rawText   = container.innerText || container.textContent;
    if ( ! rawText.trim() ) {
        return;
    }

    /**
     * 章節標題的 class 映射。
     * 鍵為中文字符，值為 sulaw- 開頭的縮寫 class。
     */
    const HEADING_CLASS = {
        '編': 'sulaw-div',
        '章': 'sulaw-chap',
        '節': 'sulaw-sec',
        '款': 'sulaw-hsub',
        '項': 'sulaw-hpara',
        '目': 'sulaw-hitem',
    };

    /** 章節標題 regex */
    const RE_HEADING = /^第[一二三四五六七八九十百千萬零]+[編章節款項目]/;
    /** 條號 regex（支援阿拉伯數字與中文數字，允許全形括弧條文標題） */
    const RE_ARTICLE = /^第\s*(?:\d+|[一二三四五六七八九十百千萬零]+)\s*條/;
    /** 全形空白開頭（項） */
    const RE_PARA    = /^　/;
    /** 款：中文數字＋頓號 */
    const RE_SUB     = /^[一二三四五六七八九十]+、/;
    /** 目：全形括弧中文數字 */
    const RE_ITEM    = /^（[一二三四五六七八九十]+）/;

    /**
     * 將一段純文字轉換為法規 HTML 字串。
     * 所有使用者文字均透過 escapeHtml() 處理後才放入 HTML，防止 XSS。
     *
     * @param {string} text
     * @returns {string}
     */
    function formatLaw( text ) {
        const lines   = text.split( '\n' );
        let html      = '<div class="sulaw-content">\n';
        let inArticle = false;

        lines.forEach( function ( line ) {
            // 1. 在 trim 前先偵測全形空白（項的標誌）
            const isPara = RE_PARA.test( line );

            // 2. trim 後進行各元素判斷
            line = line.trim();
            if ( line === '' ) return;

            // 安全化：逸出 HTML 特殊字符，防止 XSS
            const safe = escapeHtml( line );

            // ── 章節標題 ────────────────────────────────────────────
            if ( RE_HEADING.test( line ) ) {
                if ( inArticle ) {
                    html     += '  </div><!-- /sulaw-article -->\n';
                    inArticle = false;
                }
                const typeChar   = line.match( /第[一二三四五六七八九十百千萬零]+([編章節款項目])/ )[ 1 ];
                const headingCls = HEADING_CLASS[ typeChar ] || 'sulaw-chap';
                html += `  <div class="sulaw-heading"><p class="${headingCls}">${safe}</p></div>\n`;

            // ── 條號 ─────────────────────────────────────────────────
            } else if ( RE_ARTICLE.test( line ) ) {
                if ( inArticle ) {
                    html += '  </div><!-- /sulaw-article -->\n';
                }
                html     += `  <div class="sulaw-article">\n    <p class="sulaw-artnum">${safe}</p>\n`;
                inArticle = true;

            // ── 項 ───────────────────────────────────────────────────
            } else if ( isPara ) {
                html += `    <p class="sulaw-para">${safe}</p>\n`;

            // ── 款 ───────────────────────────────────────────────────
            } else if ( RE_SUB.test( line ) ) {
                html += `    <p class="sulaw-sub">${safe}</p>\n`;

            // ── 目 ───────────────────────────────────────────────────
            } else if ( RE_ITEM.test( line ) ) {
                html += `    <p class="sulaw-item">${safe}</p>\n`;

            // ── 其他文字（備用） ────────────────────────────
            } else {
                html += `    <p class="sulaw-misc">${safe}</p>\n`;
            }
        } );

        if ( inArticle ) {
            html += '  </div><!-- /sulaw-article -->\n';
        }
        html += '</div><!-- /sulaw-content -->';
        return html;
    }

    /**
     * HTML 特殊字符逸出，防止 XSS。
     * 使用 TextNode 轉換，比手動 replace 更可靠。
     *
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml( str ) {
        const div = document.createElement( 'div' );
        div.appendChild( document.createTextNode( str ) );
        return div.innerHTML;
    }

    // 將轉換結果注入容器（取代原始純文字）
    container.innerHTML = formatLaw( rawText );
} );
