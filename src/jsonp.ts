let count = 0;
function noop() {}
/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */
interface IJsonpOptions {
  param?: string;
  prefix?: string;
  name?: string;
  timeout?: number;
}
type IJsonpFn = (err: string | Error | null, data?: any) => void;
export default function jsonp(
  url: string,
  opts: IJsonpOptions | IJsonpFn,
  fn: IJsonpFn,
) {
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  if (!opts) opts = {};
  const prefix = opts.prefix || '__jp';

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  const id = opts.name || prefix + count++;

  const param = opts.param || 'callback';
  const timeout = null != opts.timeout ? opts.timeout : 60000;
  const enc = encodeURIComponent;
  const target = document.getElementsByTagName('script')[0] || document.head;
  let script: any;
  let timer: any;

  if (timeout) {
    timer = setTimeout(function() {
      cleanup();
      if (fn) fn(new Error('Timeout'));
    }, timeout);
  }

  function cleanup() {
    if (script.parentNode) script.parentNode.removeChild(script);
    (window as any)[id] = noop;
    if (timer) clearTimeout(timer);
  }

  function cancel() {
    if ((window as any)[id]) {
      cleanup();
    }
  }
  (window as any)[id] = function(data: any) {
    cleanup();
    if (fn) fn(null, data);
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');

  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode!.insertBefore(script, target);

  return cancel;
}
