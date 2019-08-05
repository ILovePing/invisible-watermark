# invisible-watermark

水印插件，可自动往全局页面插入一层水印，也可自行调用watermark类，通过配置添加水印以及获取水印图片地址。

## api

 ```javascript
 export interface IWaterMarkConfig {
    text?: string; // 自定义文字，可使用<br/>换行
    sso?: string; // sso地址
    mode?: 'canvas' | 'svg'; // 水印生成模式
    gap?: number; // 单个水印之间的宽度间隔
    angle?: number; // 倾斜角度
    fontSize?: number; // 字体大小
    fontFamily?: string; // 字体
    color?: string; // 颜色
    el?: HTMLElement | null; // 添加水印的dom
}
// 实例方法
resolveBackgroundImageUrl();//获取背景图url
render();//渲染水印
 ```

## 安装

```javascript
  yarn add invisible-watermark
```

## 使用
1.自动注入一层全局水印

```javascript
import { autoInject } from 'invisible-watermark';
autoInject();
```

2.主动为指定dom插入隐水印

```javascript
import waterMark from 'invisible-watermark';
new waterMark({ el: document.body }).render();
```

3.获取配置生成的水印地址

注⚠️：```resolveBackgroundImageUrl```方法返回的为一个对象含```width```和```url```。如果使用canvas生成blob，因处理高清屏模糊的问题，生成时对canvas画布放大了```${ratio}```倍，因此导出的blob图片也是放大了的。请对要设置水印的dom设置background-size: `${width}px`对图片进行等比例还原。svg则没有该问题，可忽略width字段。

```javascript
import waterMark from 'invisible-watermark';
const {width,url} = new waterMark({
	angle: -15,
	color:'rgba(27,28,51,.1)',
	text: "测试文字第一行<br/>测试文字第二行"
 }).resolveBackgroundImageUrl()

```
