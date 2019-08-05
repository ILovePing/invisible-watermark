import jsonp from './jsonp';
import { IWaterMarkConfig } from './main';

let measureTextCtx: CanvasRenderingContext2D | null = null;
export function measureText(text: string, fontSize: number = 13) {
  if (!measureTextCtx) {
    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    measureTextCtx = canvas.getContext('2d');
  }
  if (typeof text !== 'string') return 0;
  measureTextCtx!.font = `${fontSize}px Microsoft YaHei`;
  return measureTextCtx!.measureText(text).width;
}

/**
 * 获取text或者sso返回的水印数据
 * @param param0
 * @returns string[]
 */
export function resolveText({
  sso,
  text,
}: IWaterMarkConfig): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (text) return resolve(text.split(/<br\/>/i));
    jsonp(sso!, { prefix: '__sso_jp' }, (err, res) => {
      if (err) {
        console.error(err);
        return resolve([]);
      }
      const { data } = res;
      const { displayName = '', jobnumber = '', iid = '', phone = '' } = data;
      let id = '';
      if (jobnumber) {
        id = jobnumber.substr(-5);
      } else if (iid) {
        id = iid;
      } else if (phone) {
        id = phone.substr(-4);
      }
      return resolve([displayName + ' ' + id]);
    });
  });
}
