import DOMPurify from 'dompurify'
import { marked, setOptions, Renderer } from 'marked'

setOptions({
  gfm: true,
  breaks: true
})

function escapeHtmlAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
}

/**
 * 详情页：围栏代码块外包一层 &lt;details&gt;，可在页内展开 / 折叠
 */
class FoldCodeRenderer extends Renderer {
  code(token) {
    const inner = super.code(token)
    const lang = (token.lang || '').trim().match(/^[^\s]+/)?.[0] || ''
    const label = lang ? escapeHtmlAttr(lang) : '代码'
    return (
      '<details class="markdown-code-fold" open>' +
      '<summary class="markdown-code-fold__bar">' +
      `<span class="markdown-code-fold__lang">${label}</span>` +
      '<span class="markdown-code-fold__hint">展开 / 折叠</span>' +
      '</summary>' +
      '<div class="markdown-code-fold__body">' +
      '<div class="markdown-code-scroll">' +
      '<div class="markdown-code-scroll__inner">' +
      inner +
      '</div></div></div></details>\n'
    )
  }
}

const foldCodeRenderer = new FoldCodeRenderer()

const PURIFY_DETAIL = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ['details', 'summary'],
  ADD_ATTR: ['open']
}

/**
 * 旧数据：富文本 HTML（如历史 wangEditor）常以块级标签开头。
 * 新数据：Markdown 原文入库，一般不会以 `<p`、`<div` 这类结构起头。
 */
function looksLikeLegacyRichHtml(s) {
  const t = s.trim()
  if (!t.startsWith('<')) return false
  return /^<(p|div|h[1-6]|article|section|blockquote|ul|ol|table|figure|img|pre|span)\b/i.test(
    t
  )
}

/**
 * 文章详情正文：Markdown 解析为 HTML 并消毒；历史 HTML 仅消毒。
 * @param {string} raw
 * @param {{ foldCodeBlocks?: boolean }} [opts] 仅详情页传 `foldCodeBlocks: true` 启用代码块折叠
 */
export function renderArticleBody(raw, opts = {}) {
  if (raw == null || raw === '') return ''
  const str = typeof raw === 'string' ? raw : String(raw)
  let html
  if (looksLikeLegacyRichHtml(str)) {
    html = str
  } else {
    const out = opts.foldCodeBlocks
      ? marked.parse(str, { renderer: foldCodeRenderer })
      : marked.parse(str)
    html = typeof out === 'string' ? out : String(out)
  }
  const purifyOpts = opts.foldCodeBlocks ? PURIFY_DETAIL : { USE_PROFILES: { html: true } }
  const sanitized = DOMPurify.sanitize(html, purifyOpts)
  return injectImgLazyAttrs(sanitized)
}

/**
 * 正文内图片：默认懒加载 + 异步解码，减轻首屏带宽与主线程压力
 */
function injectImgLazyAttrs(html) {
  if (!html || typeof html !== 'string') return html
  return html.replace(/<img(\s[^>]*)?>/gi, (full, attrs = '') => {
    let a = attrs
    if (!/\sloading\s*=/i.test(a)) a += ' loading="lazy"'
    if (!/\sdecoding\s*=/i.test(a)) a += ' decoding="async"'
    return `<img${a}>`
  })
}
