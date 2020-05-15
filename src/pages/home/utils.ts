export class CanvasUtils {
  static drawOutlinedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number,
    fill: string,
    stroke: string,
    lineWidth: number
  ) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth * scale;

    ctx.fillRect(x * scale, y * scale, width * scale, height * scale);

    ctx.beginPath();
    const inset = ctx.lineWidth / 2;

    ctx.moveTo(x * scale + inset, y * scale + inset);
    ctx.lineTo(x * scale + inset, y * scale + height * scale - inset);
    ctx.lineTo(
      x * scale + width * scale - inset,
      y * scale + height * scale - inset
    );
    ctx.lineTo(x * scale + width * scale - inset, y * scale + inset);
    ctx.lineTo(x * scale + inset, y * scale + inset);

    ctx.stroke();
  }
}
