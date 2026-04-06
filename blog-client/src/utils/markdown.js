import DOMPurify from 'dompurify'
import { marked, setOptions } from 'marked'

setOptions({
  gfm: true,
  breaks: true
})

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
 */
export function renderArticleBody(raw) {
  if (raw == null || raw === '') return ''
  const str = typeof raw === 'string' ? raw : String(raw)
  let html
  if (looksLikeLegacyRichHtml(str)) {
    html = str
  } else {
    const out = marked.parse(str)
    html = typeof out === 'string' ? out : String(out)
  }
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
