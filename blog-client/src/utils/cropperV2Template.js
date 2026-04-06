/**
 * cropperjs@2.x 默认模板（与包内 DEFAULT_TEMPLATE 一致）。
 * Vite 预构建不会保留包内命名导出，故集中维护一处供多处复用。
 */
export const CROPPER_DEFAULT_TEMPLATE =
  '<cropper-canvas background>' +
  '<cropper-image rotatable scalable skewable translatable></cropper-image>' +
  '<cropper-shade hidden></cropper-shade>' +
  '<cropper-handle action="select" plain></cropper-handle>' +
  '<cropper-selection initial-coverage="0.5" movable resizable>' +
  '<cropper-grid role="grid" bordered covered></cropper-grid>' +
  '<cropper-crosshair centered></cropper-crosshair>' +
  '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>' +
  '<cropper-handle action="n-resize"></cropper-handle>' +
  '<cropper-handle action="e-resize"></cropper-handle>' +
  '<cropper-handle action="s-resize"></cropper-handle>' +
  '<cropper-handle action="w-resize"></cropper-handle>' +
  '<cropper-handle action="ne-resize"></cropper-handle>' +
  '<cropper-handle action="nw-resize"></cropper-handle>' +
  '<cropper-handle action="se-resize"></cropper-handle>' +
  '<cropper-handle action="sw-resize"></cropper-handle>' +
  '</cropper-selection>' +
  '</cropper-canvas>'

const SELECTION_OPEN = '<cropper-selection initial-coverage="0.5" movable resizable>'

/**
 * 在默认模板上锁定选区宽高比（如封面 200/120、头像 1）。
 */
export function cropperTemplateWithAspectRatio(aspectRatio) {
  return CROPPER_DEFAULT_TEMPLATE.replace(
    SELECTION_OPEN,
    `<cropper-selection initial-coverage="0.5" movable resizable aspect-ratio="${aspectRatio}">`
  )
}
