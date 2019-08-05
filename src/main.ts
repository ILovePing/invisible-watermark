import initObserver from './mutationObserver';
import { measureText, resolveText } from './util';
import { SSO_API } from './constant';

export interface IWaterMarkConfig {
  text?: string;
  sso?: string;
  mode?: 'canvas' | 'svg';
  angle?: number;
  gap?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  el?: HTMLElement | null;
}

export default class WaterMark {
  options: IWaterMarkConfig;
  resolvedText: string[] = [];
  public constructor(options: IWaterMarkConfig = {}) {
    this.options = {
      sso: SSO_API,
      text: '',
      mode: 'canvas',
      angle: 0,
      gap: 80,
      fontSize: 13,
      fontFamily:
        "-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei','Helvetica Neue',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'",
      color: 'rgba(0,0,0,0.01)',
      el: null,
      ...options,
    };
  }

  private get getPixelRatio() {
    return window.devicePixelRatio || 1;
  }

  private get getBaseValue() {
    const { fontSize, gap } = this.options;
    const { resolvedText: texts } = this;
    const maxTextWidth = Math.max(...texts.map(text => measureText(text)));
    return {
      maxTextWidth,
      baseWidth: maxTextWidth + gap!,
      baseHeight: fontSize! * texts.length + 60,
    };
  }

  public resolveByCanvas(
    options: { resolvedText: string[] } & IWaterMarkConfig,
  ): Promise<string> {
    const { resolvedText, fontFamily, fontSize, color, angle } = options;
    const { baseWidth, baseHeight } = this.getBaseValue;
    const watermarkEl = document.createElement('canvas');
    const ctx =
      watermarkEl && watermarkEl.getContext && watermarkEl.getContext('2d');
    const ratio = this.getPixelRatio;
    watermarkEl.width = baseWidth * ratio;
    watermarkEl.height = baseHeight * ratio;

    ctx!.font = `${fontSize! * ratio}px ${fontFamily}`;
    ctx!.textAlign = 'center';
    ctx!.translate(watermarkEl.width / 2, watermarkEl.height / 2);
    ctx!.rotate(angle! * (Math.PI / 180));
    ctx!.textBaseline = 'middle';
    ctx!.fillStyle = color as string;
    resolvedText.forEach((text, rowIndex) => {
      ctx!.fillText(text, 0, fontSize! * ratio * rowIndex);
    });
    ctx!.scale(ratio, ratio);
    return new Promise((resolve, reject) => {
      if (watermarkEl.toBlob) {
        watermarkEl.toBlob(blob => {
          resolve((URL || webkitURL).createObjectURL(blob));
        });
      } else {
        resolve(watermarkEl.toDataURL());
      }
    });
  }

  public resolveBySvg(options: { resolvedText: string[] } & IWaterMarkConfig) {
    const { fontSize, resolvedText, color, angle, fontFamily } = options;
    const { baseWidth, baseHeight } = this.getBaseValue;
    const svgStr = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${baseWidth}px"
        height="${baseHeight}px"
      >
        <foreignObject
          width="${baseWidth}"
          height="${baseHeight}"
          x="${0}"
          y="${(baseHeight - fontSize! * resolvedText.length) / 2}"
          dy="${fontSize}px"
          transform="rotate(${angle} ${baseWidth / 2} ${baseHeight / 2})"
        >
        <body xmlns="http://www.w3.org/1999/xhtml">
          ${resolvedText
            .map(
              text => `
                <p style="
                    text-align:center;
                    line-height:${fontSize}px;
                    font-size:${fontSize}px;
                    font-family: '${fontFamily}';
                    margin:0;
                    color: ${color}"
                >
                  ${text}
                </p>`,
            )
            .join('')}
          </body>
        </foreignObject>
      </svg>
    `;
    return `data:image/svg+xml;base64,${window.btoa(
      unescape(encodeURIComponent(svgStr)),
    )}`;
  }

  public async resolveBackgroundImageUrl() {
    const { mode } = this.options;
    this.resolvedText = await resolveText(this.options);
    return {
      url: await (this as any)[
        { canvas: 'resolveByCanvas', svg: 'resolveBySvg' }[mode!]
      ]({
        resolvedText: this.resolvedText,
        ...this.options,
      }),
      width: this.getBaseValue.baseWidth,
    };
  }

  public async render() {
    const { url: blobUrl, width } = await this.resolveBackgroundImageUrl();
    const { el } = this.options;
    if (!el) {
      const watermarkEl = document.createElement('div');
      const id = `wm_${+new Date()}`;
      watermarkEl.id = id;
      watermarkEl.style.backgroundImage = `url(${blobUrl})`;
      watermarkEl.style.backgroundRepeat = 'space repeat';
      watermarkEl.style.backgroundSize = `${width}px`;
      watermarkEl.style.width = '100%';
      watermarkEl.style.height = `100%`;
      watermarkEl.style.position = 'fixed';
      watermarkEl.style.bottom = '0';
      watermarkEl.style.left = '0';
      watermarkEl.style.zIndex = '1';
      watermarkEl.style.pointerEvents = 'none';
      document.body.appendChild(watermarkEl);
      initObserver(watermarkEl);
      initObserver(document.body);
    } else if (el instanceof HTMLDivElement || el instanceof HTMLBodyElement) {
      el.style.backgroundImage = `url(${blobUrl})`;
      el.style.backgroundRepeat = 'space repeat';
      el.style.backgroundSize = `${this.getBaseValue.baseWidth}px`;
    }
    return;
  }
}

export const autoInject = (options?: IWaterMarkConfig) =>
  new WaterMark(options).render();
