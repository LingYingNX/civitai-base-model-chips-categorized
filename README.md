# Civitai 基础模型胶囊筛选（分类版）

把 Civitai 的「基础模型」下拉框换成分组折叠的胶囊筛选，79 个基础模型收进 8 个分类，组内新模型在左。

![预览](./preview.png)

## 来源

基于 [lericogit/civitai-base-model-chips](https://github.com/lericogit/civitai-base-model-chips)（v1.6.0，MIT）修改。胶囊替换下拉框、隐藏下拉框保留、`Copy model list`、黑白名单过滤等原有能力全部来自上游，版权归 **lericogit** 所有。本分支新增分类分组与组内排序。

## 功能

- 8 个可折叠分类，默认折叠，顶部有「全部展开 / 全部折叠」
- 组内左新右旧：`SD 3.5` 在 `SDXL 1.0` 左边，`Flux.3` 在 `Flux.2 D` 左边
- 每个分类可「全选 / 清空」，只写入筛选状态，实际筛选仍走站点的「应用筛选」
- 分类靠正则规则，Civitai 出新模型会自动归类
- 保留上游全部功能

## 安装

油猴（Tampermonkey / Violentmonkey / ScriptCat）安装直链：

```
https://raw.githubusercontent.com/LingYingNX/civitai-base-model-chips-categorized/main/civitai-base-model-chips.user.js
```

装完打开 <https://civitai.com/models> 即可。不要和上游脚本同时安装，两者抢同一批页面元素。

## 分类

| 分类 | 里边有哪些模型 |
| --- | --- |
| 二次元 / 卡通 | Anima、Pony V7、NoobAI、Illustrious、Pony |
| SD 系基座 | SD 3.5、SDXL Hyper、SDXL Lightning、SDXL 1.0、SD 2.1、SD 2.0、SD 1.5 系列、SD 1.4、Kolors |
| Flux 系列 | Flux.3、Flux 3 Video、Flux.2 系列、Flux.1 Kontext / Krea / D / S |
| Wan（万象） | Wan Video 3.0 / 2.7 / 2.5 / 2.2 / 14B / 1.3B、Wan Image 2.7 |
| 其他视频生成 | LTXV 系列、Hunyuan Video、Mochi、CogVideoX |
| 语言 / 多模态 | Qwen 系列、HiDream、Grok、Hunyuan 1、Ernie |
| 现代扩散与实验 | Ideogram 4.0、Krea 2、PixArt、Chroma、AuraFlow、Lumina、MageFlow、Reve、Muse、ZImage、Ming、Lens、MAI、Boogu、HappyHorse |
| 音频与实用 | MiniMax Music 3、MiniMax H3、ACE Audio、Sonilo、Upscaler、Other |

不在规则里的模型归到「未分类」。只有 Civitai 实际提供的模型才会渲染出来，所以某个分类显示的个数可能比上表少。

## 改分类

脚本开头的 `USER CONFIG` 区块：

```js
const MODEL_CATEGORIES = [
  {
    name: '分类名',
    patterns: [/^前缀/i],        // 不在 order 里的模型靠它归类
    order: ['模型甲', '模型乙'], // 从左到右，新的在前
  },
];
```

数组顺序就是显示顺序，加分类直接往数组里追加。

## 许可

MIT，见 [LICENSE](./LICENSE)。原作品版权归 [lericogit](https://github.com/lericogit)，修改部分归 [LingYingNX](https://github.com/LingYingNX)。
