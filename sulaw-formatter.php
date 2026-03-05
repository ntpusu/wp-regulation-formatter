<?php
/**
 * Plugin Name: NTPUSU Regulation Formatter
 * Plugin URI:  https://github.com/NTPU-Student-Headquarters/wp-regulation-formatter
 * Description: 自動偵測「法規」分類（含子分類）下的文章，將 Custom HTML 區塊內的純文字法規轉換為帶樣式的 HTML。
 * Version:     1.0.0
 * Author:      Zhen Huang
 * License:     GPL-2.0-or-later
 * Text Domain: sulaw-formatter
 */

// 禁止直接存取
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * 判斷目前文章是否屬於「regulation」分類或其任何子分類。
 * 使用 term_id 比對，而非直接信任使用者傳入的 slug，
 * 以避免因 slug 被竄改而導致的邏輯繞過問題。
 *
 * @return bool
 */
function sulaw_is_regulation_post(): bool {
    if ( ! is_singular( 'post' ) ) {
        return false;
    }

    // 取得 regulation slug 對應的 term（僅執行一次資料庫查詢）
    $regulation_term = get_term_by( 'slug', 'regulation', 'category' );
    if ( ! $regulation_term ) {
        return false;
    }

    $regulation_term_id = (int) $regulation_term->term_id;
    $post_id            = get_the_ID();

    // 取得文章的所有分類（包含祖先），全部轉為 int 後比對
    $post_categories = get_the_category( $post_id );
    if ( empty( $post_categories ) ) {
        return false;
    }

    foreach ( $post_categories as $cat ) {
        $cat_id = (int) $cat->term_id;

        // 直接命中 regulation 分類
        if ( $cat_id === $regulation_term_id ) {
            return true;
        }

        // 檢查祖先是否包含 regulation 分類（處理子分類情境）
        $ancestors = array_map( 'intval', get_ancestors( $cat_id, 'category' ) );
        if ( in_array( $regulation_term_id, $ancestors, true ) ) {
            return true;
        }
    }

    return false;
}

/**
 * 僅在法規文章頁面 enqueue CSS 與 JS。
 * 使用 wp_enqueue_scripts hook（前台），不影響後台。
 */
add_action( 'wp_enqueue_scripts', function () {
    if ( ! sulaw_is_regulation_post() ) {
        return;
    }

    $plugin_url     = plugin_dir_url( __FILE__ );
    $plugin_version = '1.0.0';

    // CSS
    wp_enqueue_style(
        'sulaw-formatter-style',
        $plugin_url . 'css/sulaw-style.css',
        [],
        $plugin_version
    );

    // JS（延遲載入，不阻礙渲染；依賴 wp-dom-ready 確保 DOM 就緒）
    wp_enqueue_script(
        'sulaw-formatter-script',
        $plugin_url . 'js/sulaw-formatter.js',
        [ 'wp-dom-ready' ],
        $plugin_version,
        true // 放在 </body> 前
    );
} );
