/** 未上传头像时的默认图（`public/image.png`，随站点 base 路径） */
export const DEFAULT_AVATAR_URL = `${import.meta.env.BASE_URL}image.png`

/**
 * 将后端返回的图片地址转为浏览器可访问的绝对 URL（兼容相对路径与完整 URL）
 */
export function resolveMediaUrl(src) {
  if (src == null || src === '') return ''
  const s = String(src).trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  const base = import.meta.env.DEV ? 'http://localhost:3000' : (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/${s.replace(/^\//, '')}`
}
