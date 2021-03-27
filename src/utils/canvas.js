/**
 * 设置canvas并解决canvas渲染模糊的问题
 * @param {Object} canvas canvas对象
 * @param {Number} width canvas宽
 * @param {Number} height canvas高
 */
export function setCanvas(canvas, width, height) {
  const ctx = canvas.getContext('2d')
  const backingStorePixelRatio = ctx.backingStorePixelRatio ||
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1;

  const pixelRatio = (window.devicePixelRatio || 1) / backingStorePixelRatio;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  ctx.scale(pixelRatio, pixelRatio);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  return ctx
}

/**
 * 根据两点坐标获取带箭头线的箭头的坐标
 * */
export function getArrowCoordinate(x1, y1, x2, y2) {
  const l1 = 15;
  const l2 = 0;
  const angle = Math.PI / 5;
  const rotate = Math.atan2(y2 - y1, x2 - x1);

  const a1 = x2 - l1 * Math.sin(Math.PI / 2 - rotate - angle);
  const b1 = y2 - l1 * Math.cos(Math.PI / 2 - rotate - angle);

  const a2 = x2 - l2 * Math.cos(rotate);
  const b2 = y2 - l2 * Math.sin(rotate);

  const a3 = x2 - l1 * Math.cos(rotate - angle);
  const b3 = y2 - l1 * Math.sin(rotate - angle);

  return [a1, b1, a2, b2, a3, b3];
}
