/**
 * 生成返回给前端、写入数据库的「站点根」地址（无尾斜杠）。
 * 部署到公网时请在 .env 设置 PUBLIC_ORIGIN=https://你的域名
 * 若仅依赖反代头，请配置 Nginx 的 X-Forwarded-Proto / Host，并启用 TRUST_PROXY=1（见 index.js）。
 */
function getPublicOrigin(ctx) {
  const raw = process.env.PUBLIC_ORIGIN || process.env.PUBLIC_URL
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).trim().replace(/\/+$/, '')
  }
  return `${ctx.protocol}://${ctx.host}`
}

module.exports = { getPublicOrigin }
