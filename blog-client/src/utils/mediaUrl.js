/** 未上传头像时的默认图（`public/image.png`，随站点 base 路径） */
export const DEFAULT_AVATAR_URL = `${import.meta.env.BASE_URL}image.png`

/**
 * 将后端返回的图片地址转为浏览器可访问的绝对 URL（兼容相对路径与完整 URL）
 */
export function resolveMediaUrl(src) {
  if (src == null || src === '') return ''
  let s = String(src).trim()
  if (!s) return ''
  // 库里若仍存开发环境绝对地址，线上用当前站点域名替换，避免指向 localhost
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s)
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        if (import.meta.env.DEV) return s
        const origin = typeof window !== 'undefined' ? window.location.origin : ''
        return `${origin}${u.pathname}${u.search}${u.hash}`
      }
    } catch {
      /* 非法 URL 则继续走下方逻辑 */
    }
    return s
  }
  const base = import.meta.env.DEV ? 'http://localhost:3000' : (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/${s.replace(/^\//, '')}`
}
