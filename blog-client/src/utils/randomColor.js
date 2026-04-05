export function randomColor(min, max) {
  let r = Math.floor((Math.random() * (max - min) + min));
  let g = Math.floor((Math.random() * (max - min) + min));
  let b = Math.floor((Math.random() * (max - min) + min));
  return `rgb(${r},${g},${b})`;
}