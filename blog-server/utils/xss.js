const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

// 初始化 jsdom 环境
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * 清理并格式化用户输入的评论消息，以防止 XSS 攻击。
 *
 * @param {string} input - 用户输入的原始评论消息。
 * @returns {string} - 清理后的安全评论消息。
 */
function sanitizeComment(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.');
  }

  // 配置 DOMPurify 选项，可以根据需求进一步定制
  const cleanOptions = {
    USE_PROFILES: { html: true }, // 允许基本 HTML 结构
    ADD_TAGS: [],                 // 允许额外的标签
    ADD_ATTR: [],                 // 允许额外的属性
    FORBID_TAGS: ['script', 'iframe'], // 禁止特定标签
    FORBID_ATTR: ['onclick', 'onmouseover', 'style'], // 禁止特定属性
  };

  // 使用 DOMPurify 清理输入内容
  const sanitizedHtml = purify.sanitize(input, cleanOptions);

  return sanitizedHtml;
}

module.exports = {
  sanitizeComment
};