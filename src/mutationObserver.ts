declare global {
  interface Window {
    MutationObserver: any;
    WebKitMutationObserver: any;
    MozMutationObserver: any;
  }
}

const MutationObserver =
  window.MutationObserver ||
  window.WebKitMutationObserver ||
  window.MozMutationObserver;

const supportMutationObserver = !!MutationObserver;

const watermarkDefaultConfig = {
  attributes: true,
  attributeOldValue: true,
  childList: true,
};

function watermarkCallback(mutationList: any[], observer: any) {
  mutationList.forEach(mutationRecord => {
    const {
      type,
      attributeName,
      target,
      oldValue,
      addedNodes,
      removedNodes,
    } = mutationRecord;
    if (type === 'attributes') {
      observer.disconnect();
      if (attributeName === 'style') {
        target.style = oldValue;
      } else if (attributeName === 'id') {
        target.id = oldValue;
      }
      observer.observe(target, watermarkDefaultConfig);
    }
    if (type === 'childList' && !addedNodes[0] && removedNodes[0]) {
      //判断删除的节点s中是否有水印的dom，有的话重新插入
      Array.prototype.forEach.call(removedNodes, item => {
        if (item.id.match(/^wm_/)) {
          observer.disconnect();
          document.body.append(item);
          observer.observe(target, watermarkDefaultConfig);
        }
      });
    }
  });
}

function initObserver($el: HTMLElement | null, config?: Object) {
  if (!$el) return;
  if (supportMutationObserver) {
    const om = new MutationObserver(watermarkCallback);
    om.observe($el, watermarkDefaultConfig);
  }
}

export default initObserver;
