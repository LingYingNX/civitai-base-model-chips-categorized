// ==UserScript==
// @name         Civitai 基础模型胶囊筛选+版本胶囊（分类版）
// @namespace    https://github.com/LingYingNX/
// @version      1.5
// @author       LingYingNX (original by lericogit)
// @description  Replaces Civitai Base model dropdowns with categorized chips and restores inline model version chips.
// @description:zh-CN  把 Civitai 的基础模型下拉框改成分组折叠的胶囊筛选，并把模型详情页的版本下拉框还原成横向版本胶囊；兼容 Civitai 汉化增强脚本。
// @license      MIT
// @homepageURL  https://github.com/LingYingNX/civitai-base-model-chips-categorized
// @supportURL   https://github.com/LingYingNX/civitai-base-model-chips-categorized/issues
// @downloadURL  https://raw.githubusercontent.com/LingYingNX/civitai-base-model-chips-categorized/main/civitai-base-model-chips.user.js
// @updateURL    https://raw.githubusercontent.com/LingYingNX/civitai-base-model-chips-categorized/main/civitai-base-model-chips.user.js
// @match        https://civitai.com/*
// @match        https://civitai.red/*
// @match        https://civitai.green/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  const SCRIPT_KEY = 'tm-civitai-base-model-chips';
  const STYLE_ID = `${SCRIPT_KEY}-style`;
  const WRAPPER_ATTR = 'data-tm-base-model-chips';
  const CHIP_ATTR = 'data-tm-base-model-chip';
  const HIDDEN_ATTR = 'data-tm-base-model-hidden';
  const CATEGORY_ATTR = 'data-tm-base-model-category';
  const CATEGORY_HEADER_ATTR = 'data-tm-base-model-category-header';
  const CATEGORY_BODY_ATTR = 'data-tm-base-model-category-body';
  const CATEGORY_ACTION_ATTR = 'data-tm-base-model-category-action';
  const TOOLBAR_ATTR = 'data-tm-base-model-toolbar';
  const OPTIONS_ATTR = 'data-tm-base-model-options';
  const VERSION_CHIPS_ATTR = 'data-tm-model-version-chips';
  const VERSION_CONTROL_KEY = 'tm-civitai-model-version-chips-enabled';
  const CCT_SWITCH_KEY = 'CCT_MODEL_VERSION_SWITCH_ENABLED';
  const MODELS_PATH_PATTERN = /^\/models(?:\/|$)/i;
  const MODEL_DETAIL_PATH_PATTERN = /^\/models\/(\d+)(?:\/|$)/i;
  const FILTER_MODES = {
    OFF: 'off',
    BLACKLIST: 'blacklist',
    WHITELIST: 'whitelist',
  };

  /*
   * ========================================================================
   * ====================== USER CONFIG - START HERE ========================
   * ========================================================================
   * Edit only this block if you want to customize the script.
   *
   * MODE:
   *   FILTER_MODES.OFF
   *   FILTER_MODES.BLACKLIST
   *   FILTER_MODES.WHITELIST
   *
   * IMPORTANT:
   * - These settings are visual-only.
   * - They only affect the custom chips added by this userscript.
   * - The real hidden dropdown stays intact and unchanged.
   * - ALL_BASE_MODELS is fallback-only for chip loading.
   * - The live Civitai list is always preferred when available.
   * ========================================================================
   */

  const MODE = FILTER_MODES.OFF;

  const ALL_BASE_MODELS = [
    'Anima',
    'AuraFlow',
    'Chroma',
    'CogVideoX',
    'Ernie',
    'Flux.1 S',
    'Flux.1 D',
    'Flux.1 Krea',
    'Flux.1 Kontext',
    'Flux.2 D',
    'Flux.2 Klein 9B',
    'Flux.2 Klein 9B-base',
    'Flux.2 Klein 4B',
    'Flux.2 Klein 4B-base',
    'Flux.3',
    'Flux 3 Video',
    'Grok',
    'HappyHorse',
    'HiDream',
    'HiDream-O1',
    'Hunyuan 1',
    'Hunyuan Video',
    'Ideogram 4.0',
    'Boogu',
    'Illustrious',
    'NoobAI',
    'Kolors',
    'Krea 2',
    'LTXV',
    'LTXV2',
    'LTXV 2.3',
    'LTXV 2.5',
    'Lens',
    'Lumina',
    'MageFlow',
    'MAI',
    'Mochi',
    'Upscaler',
    'Other',
    'PixArt a',
    'PixArt E',
    'Pony',
    'Pony V7',
    'Qwen',
    'Qwen 2',
    'Qwen 2.1',
    'Qwen 3',
    'Reve',
    'Muse Image',
    'Wan Video 1.3B t2v',
    'Wan Video 14B t2v',
    'Wan Video 14B i2v 480p',
    'Wan Video 14B i2v 720p',
    'Wan Video 2.2 TI2V-5B',
    'Wan Video 2.2 I2V-A14B',
    'Wan Video 2.2 T2V-A14B',
    'Wan Video 2.5 T2V',
    'Wan Video 2.5 I2V',
    'Wan Image 2.7',
    'Wan Video 2.7',
    'Wan Video 3.0',
    'SD 1.4',
    'SD 1.5',
    'SD 1.5 LCM',
    'SD 1.5 Hyper',
    'SD 2.0',
    'SD 2.1',
    'SD 3.5',
    'SDXL 1.0',
    'SDXL Lightning',
    'SDXL Hyper',
    'ZImageTurbo',
    'ZImageBase',
    'Ming Image Design 0.1',
    'Ming Image Design Layer 0.1',
    'MiniMax Music 3',
    'MiniMax H3',
    'ACE Audio',
    'Sonilo',
  ];

  const BLACKLIST = [
    // 'Flux.2 Klein 9B',
  ];

  const WHITELIST = [
    'Flux.2 Klein 9B',
    'Flux.2 Klein 9B-base',
    'Flux.2 Klein 4B',
    'Flux.2 Klein 4B-base',
    'ZImageTurbo',
    'ZImageBase',
    'Wan Video 2.2 I2V-A14B',
    'Wan Video 2.2 T2V-A14B',
    'LTXV2',
    'LTXV 2.3',
  ];

  /*
   * Base model categories.
   *
   * - `patterns`: first matching category wins (case-insensitive, tested against
   *   Civitai's raw option value). New models from Civitai land in the right
   *   category automatically and simply show up at the end of that category.
   * - `order`: left-to-right order inside the category, NEWEST FIRST.
   *   Anything not listed in `order` is appended after the listed models.
   */
  const MODEL_CATEGORIES = [
    {
      name: '二次元 / 卡通',
      patterns: [/^(Anima|Illustrious|NoobAI|Pony|Animagine|Anything|Meina|Counterfeit)/i],
      order: [
        'Anima',
        'Pony V7',
        'NoobAI',
        'Illustrious',
        'Pony',
      ],
    },
    {
      name: 'SD 系基座',
      patterns: [/^SD\s?(1|2|3|XL)/i, /^Stable Diffusion/i, /^Kolors/i],
      order: [
        'SD 3.5',
        'SDXL Hyper',
        'SDXL Lightning',
        'SDXL 1.0',
        'SD 2.1',
        'SD 2.0',
        'SD 1.5 Hyper',
        'SD 1.5 LCM',
        'SD 1.5',
        'SD 1.4',
        'Kolors',
      ],
    },
    {
      name: 'Flux 系列',
      patterns: [/^Flux/i],
      order: [
        'Flux.3',
        'Flux 3 Video',
        'Flux.2 D',
        'Flux.2 Klein 9B',
        'Flux.2 Klein 9B-base',
        'Flux.2 Klein 4B',
        'Flux.2 Klein 4B-base',
        'Flux.1 Kontext',
        'Flux.1 Krea',
        'Flux.1 D',
        'Flux.1 S',
      ],
    },
    {
      name: 'Wan（万象）',
      patterns: [/^Wan/i],
      order: [
        'Wan Video 3.0',
        'Wan Video 2.7',
        'Wan Image 2.7',
        'Wan Video 2.5 T2V',
        'Wan Video 2.5 I2V',
        'Wan Video 2.2 T2V-A14B',
        'Wan Video 2.2 I2V-A14B',
        'Wan Video 2.2 TI2V-5B',
        'Wan Video 14B i2v 720p',
        'Wan Video 14B i2v 480p',
        'Wan Video 14B t2v',
        'Wan Video 1.3B t2v',
      ],
    },
    {
      name: '其他视频生成',
      patterns: [/^(LTXV|Hunyuan Video|Mochi|CogVideoX|混元)/i],
      order: [
        'LTXV 2.5',
        'LTXV 2.3',
        'LTXV2',
        'LTXV',
        'Hunyuan Video',
        'Mochi',
        'CogVideoX',
      ],
    },
    {
      name: '语言 / 多模态',
      patterns: [/^(Qwen|HiDream|Grok|Hunyuan 1|Ernie)/i],
      order: [
        'Qwen 3',
        'Qwen 2.1',
        'Qwen 2',
        'Qwen',
        'HiDream-O1',
        'HiDream',
        'Grok',
        'Hunyuan 1',
        'Ernie',
      ],
    },
    {
      name: '现代扩散与实验',
      patterns: [/^(Ideogram|Krea|PixArt|Chroma|AuraFlow|Lumina|MageFlow|Reve|Muse|ZImage|Ming|Lens|MAI|Boogu|HappyHorse)/i],
      order: [
        'Ideogram 4.0',
        'Krea 2',
        'PixArt E',
        'PixArt a',
        'Chroma',
        'AuraFlow',
        'Lumina',
        'MageFlow',
        'Reve',
        'Muse Image',
        'ZImageTurbo',
        'ZImageBase',
        'Ming Image Design Layer 0.1',
        'Ming Image Design 0.1',
        'Lens',
        'MAI',
        'Boogu',
        'HappyHorse',
      ],
    },
    {
      name: '音频与实用',
      patterns: [/^(MiniMax|ACE Audio|Sonilo|Upscaler|Other|放大器|其他)/i],
      order: [
        'MiniMax Music 3',
        'MiniMax H3',
        'ACE Audio',
        'Sonilo',
        'Upscaler',
        'Other',
      ],
    },
  ];

  const UNCATEGORIZED_NAME = '未分类';
  const BASE_MODEL_LABEL_TEXTS = new Set(['base model', '基础模型', '基礎模型']);

  /*
   * ========================================================================
   * ======================= USER CONFIG - END HERE =========================
   * ========================================================================
   */

  let chipIdCounter = 0;
  let syncQueued = false;
  let batchDepth = 0;
  let pageObserver = null;
  let detailRequestToken = 0;
  let detailUiState = null;
  let detailWatchdog = null;
  let pageWatchdog = null;
  let cctSwitchOriginal;
  let cctInjectionTimer = null;
  const modelDetailCache = new Map();
  let versionChipsEnabled = readVersionChipsEnabled();

  function normalizeText(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeKey(text) {
    return normalizeText(text).toLowerCase();
  }

  function buildCategoryIndex() {
    const index = new Map();

    MODEL_CATEGORIES.forEach((category, categoryIndex) => {
      category.order.forEach((name, rank) => {
        const key = normalizeKey(name);
        if (key && !index.has(key)) {
          index.set(key, { categoryIndex, rank });
        }
      });
    });

    return index;
  }

  const CATEGORY_INDEX = buildCategoryIndex();
  const categoryCache = new Map();

  function resolveCategory(value) {
    const key = normalizeKey(value);
    const cached = categoryCache.get(key);
    if (cached) {
      return cached;
    }

    let result = CATEGORY_INDEX.get(key);

    if (!result) {
      for (let index = 0; index < MODEL_CATEGORIES.length; index += 1) {
        const category = MODEL_CATEGORIES[index];
        if (category.patterns.some((pattern) => pattern.test(value))) {
          result = { categoryIndex: index, rank: category.order.length };
          break;
        }
      }
    }

    if (!result) {
      result = { categoryIndex: MODEL_CATEGORIES.length, rank: 0 };
    }

    categoryCache.set(key, result);
    return result;
  }

  function categoryNameAt(categoryIndex) {
    const category = MODEL_CATEGORIES[categoryIndex];
    return category ? category.name : UNCATEGORIZED_NAME;
  }

  function compareOptions(a, b) {
    const categoryA = resolveCategory(a.value);
    const categoryB = resolveCategory(b.value);

    if (categoryA.categoryIndex !== categoryB.categoryIndex) {
      return categoryA.categoryIndex - categoryB.categoryIndex;
    }

    if (categoryA.rank !== categoryB.rank) {
      return categoryA.rank - categoryB.rank;
    }

    return a.value.localeCompare(b.value, 'en', { sensitivity: 'base' });
  }

  function sortOptionsByCategory(options) {
    return [...options].sort(compareOptions);
  }

  function groupOptionsByCategory(options) {
    const groups = new Map();

    for (const option of options) {
      const name = categoryNameAt(resolveCategory(option.value).categoryIndex);
      const bucket = groups.get(name);
      if (bucket) {
        bucket.push(option);
      } else {
        groups.set(name, [option]);
      }
    }

    return groups;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      [${WRAPPER_ATTR}="true"] {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: calc(0.375rem * var(--mantine-scale, 1));
      }

      [${TOOLBAR_ATTR}="true"] {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: calc(0.375rem * var(--mantine-scale, 1));
      }

      [${TOOLBAR_ATTR}="true"] .tm-toolbar-spacer {
        flex: 1 1 auto;
      }

      [${CATEGORY_ATTR}="true"] {
        border: calc(0.0625rem * var(--mantine-scale, 1)) solid var(--mantine-color-default-border, rgba(127, 127, 127, 0.3));
        border-radius: calc(0.375rem * var(--mantine-scale, 1));
        background: var(--mantine-color-default, rgba(127, 127, 127, 0.06));
        overflow: hidden;
      }

      [${CATEGORY_HEADER_ATTR}="true"] {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        gap: calc(0.375rem * var(--mantine-scale, 1));
        min-width: 0;
        padding: calc(0.3rem * var(--mantine-scale, 1)) calc(0.55rem * var(--mantine-scale, 1));
        cursor: pointer;
        user-select: none;
        font-size: var(--mantine-font-size-sm, 0.875rem);
        line-height: 1.35;
        transition: background-color 120ms ease;
      }

      [${CATEGORY_HEADER_ATTR}="true"]:hover {
        background: var(--mantine-color-default-hover, rgba(127, 127, 127, 0.12));
      }

      [${CATEGORY_ATTR}="true"] .tm-cat-arrow {
        flex: 0 0 auto;
        width: 0;
        height: 0;
        border-top: calc(0.25rem * var(--mantine-scale, 1)) solid transparent;
        border-bottom: calc(0.25rem * var(--mantine-scale, 1)) solid transparent;
        border-left: calc(0.3rem * var(--mantine-scale, 1)) solid var(--mantine-color-dimmed, rgba(127, 127, 127, 0.9));
        transition: transform 150ms ease;
      }

      [${CATEGORY_ATTR}="true"][data-open="true"] .tm-cat-arrow {
        transform: rotate(90deg);
      }

      [${CATEGORY_ATTR}="true"] .tm-cat-title {
        font-weight: 600;
        white-space: nowrap;
      }

      [${CATEGORY_ATTR}="true"] .tm-cat-count {
        color: var(--mantine-color-dimmed, rgba(127, 127, 127, 0.95));
        font-size: var(--mantine-font-size-xs, 0.75rem);
        white-space: nowrap;
      }

      [${CATEGORY_ATTR}="true"] .tm-cat-badge {
        border: calc(0.0625rem * var(--mantine-scale, 1)) solid currentColor;
        border-radius: 999px;
        color: var(--mantine-color-blue-6, #1c7ed6);
        font-size: var(--mantine-font-size-xs, 0.75rem);
        line-height: 1.4;
        min-width: calc(3.2rem * var(--mantine-scale, 1));
        padding: 0 calc(0.35rem * var(--mantine-scale, 1));
        text-align: center;
        white-space: nowrap;
      }

      [${CATEGORY_ATTR}="true"] .tm-cat-badge[data-empty="true"] {
        visibility: hidden;
      }

      [${CATEGORY_ATTR}="true"] .tm-cat-actions {
        display: inline-flex;
        align-items: center;
        gap: calc(0.25rem * var(--mantine-scale, 1));
        margin-left: auto;
      }

      .tm-mini-btn {
        appearance: none;
        background: var(--mantine-color-body, rgba(255, 255, 255, 0.95));
        border: calc(0.0625rem * var(--mantine-scale, 1)) solid var(--mantine-color-default-border, rgba(127, 127, 127, 0.35));
        border-radius: calc(0.25rem * var(--mantine-scale, 1));
        color: var(--mantine-color-text, inherit);
        cursor: pointer;
        font: inherit;
        font-size: var(--mantine-font-size-xs, 0.75rem);
        line-height: 1.2;
        padding: calc(0.1rem * var(--mantine-scale, 1)) calc(0.4rem * var(--mantine-scale, 1));
        transition: background-color 120ms ease, border-color 120ms ease;
      }

      .tm-mini-btn:hover {
        background: var(--mantine-color-default-hover, rgba(127, 127, 127, 0.14));
      }

      [${CATEGORY_BODY_ATTR}="true"] {
        display: none;
        flex-wrap: wrap;
        align-items: center;
        gap: calc(0.35rem * var(--mantine-scale, 1));
        padding: calc(0.45rem * var(--mantine-scale, 1)) calc(0.55rem * var(--mantine-scale, 1));
        border-top: calc(0.0625rem * var(--mantine-scale, 1)) solid var(--mantine-color-default-border, rgba(127, 127, 127, 0.24));
      }

      [${CATEGORY_ATTR}="true"][data-open="true"] > [${CATEGORY_BODY_ATTR}="true"] {
        display: flex;
      }

      [${CHIP_ATTR}="true"] {
        flex: 0 0 auto;
        max-width: 100%;
      }

      [${CHIP_ATTR}="true"] > label.mantine-Chip-label {
        transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
      }

      /*
       * The check icon keeps its box whether or not the chip is selected. Hiding
       * it outright would widen every chip on click, re-flow the whole chip row
       * and make the sidebar jump.
       */
      [${CHIP_ATTR}="true"] label.mantine-Chip-label .mantine-Chip-iconWrapper {
        display: inline-flex !important;
        opacity: 0;
        transition: opacity 120ms ease;
      }

      [${CHIP_ATTR}="true"] input:checked + label.mantine-Chip-label,
      [${CHIP_ATTR}="true"] label.mantine-Chip-label[data-checked="true"] {
        background-color: var(--mantine-color-blue-6, #1c7ed6) !important;
        border-color: var(--mantine-color-blue-6, #1c7ed6) !important;
        color: #fff !important;
      }

      [${CHIP_ATTR}="true"] input:checked + label.mantine-Chip-label .mantine-Chip-iconWrapper,
      [${CHIP_ATTR}="true"] label.mantine-Chip-label[data-checked="true"] .mantine-Chip-iconWrapper {
        opacity: 1 !important;
      }

    `;

    document.head.appendChild(style);
  }

  function hideElement(element) {
    if (!element) {
      return;
    }

    element.hidden = true;
    element.setAttribute(HIDDEN_ATTR, 'true');
    element.style.setProperty('display', 'none', 'important');
    element.style.setProperty('visibility', 'hidden', 'important');
    element.style.setProperty('opacity', '0', 'important');
    element.style.setProperty('pointer-events', 'none', 'important');
  }

  function readVersionChipsEnabled() {
    try {
      if (typeof GM_getValue === 'function') {
        return GM_getValue(VERSION_CONTROL_KEY, true) !== false;
      }
    } catch {
      // Fall through to localStorage.
    }

    try {
      return localStorage.getItem(VERSION_CONTROL_KEY) !== 'false';
    } catch {
      return true;
    }
  }

  function setVersionChipsEnabled(enabled) {
    versionChipsEnabled = Boolean(enabled);

    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue(VERSION_CONTROL_KEY, versionChipsEnabled);
      }
    } catch {
      // localStorage remains available as a fallback.
    }

    try {
      localStorage.setItem(VERSION_CONTROL_KEY, String(versionChipsEnabled));
    } catch {
      // Persistence is optional; the current page still updates.
    }

    refreshPageLifecycle();
  }

  function registerVersionChipMenu() {
    if (typeof GM_registerMenuCommand !== 'function') {
      return;
    }

    GM_registerMenuCommand('版本胶囊：开启', () => setVersionChipsEnabled(true));
    GM_registerMenuCommand('版本胶囊：关闭', () => setVersionChipsEnabled(false));
  }

  function getModelDetailId() {
    const match = window.location.pathname.match(MODEL_DETAIL_PATH_PATTERN);
    return match ? match[1] : null;
  }

  function isModelDetailPage() {
    return Boolean(getModelDetailId());
  }

  function getModelDetailData(modelId) {
    const key = String(modelId);

    if (!modelDetailCache.has(key)) {
      const request = fetch(`${window.location.origin}/api/v1/models/${key}`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Civitai model API returned ${response.status}`);
          }
          return response.json();
        })
        .catch((error) => {
          modelDetailCache.delete(key);
          throw error;
        });

      modelDetailCache.set(key, request);
    }

    return modelDetailCache.get(key);
  }

  function getVisibleDetailHeading() {
    return [...document.querySelectorAll('main h1, h1')].find((heading) => {
      const rect = heading.getBoundingClientRect();
      return normalizeText(heading.textContent) && rect.width > 0 && rect.height > 0;
    }) || null;
  }

  function getCurrentModelVersion(model) {
    const requestedId = new URLSearchParams(window.location.search).get('modelVersionId');
    const versions = Array.isArray(model?.modelVersions) ? model.modelVersions : [];

    return versions.find((version) => String(version.id) === requestedId)
      || versions[0]
      || null;
  }

  function getModelDetailTitleAnchor(heading) {
    return heading.closest('.mantine-Stack-root')
      || heading.closest('.mantine-Group-root')?.parentElement
      || heading.parentElement;
  }

  function syncCctVersionSwitch(enabled) {
    const cct = window.CCT;
    if (cctSwitchOriginal === undefined) {
      try {
        cctSwitchOriginal = typeof cct?.isModelVersionSwitchEnabled === 'function'
          ? cct.isModelVersionSwitchEnabled()
          : localStorage.getItem(CCT_SWITCH_KEY) !== 'false';
      } catch {
        cctSwitchOriginal = true;
      }
    }

    if (typeof cct?.setModelVersionSwitchEnabled === 'function') {
      cct.setModelVersionSwitchEnabled(enabled);
    } else {
      try {
        localStorage.setItem(CCT_SWITCH_KEY, String(enabled));
      } catch {
        // The class cleanup below still releases CCT's hidden version list.
      }
    }
  }

  function enableNativeVersionChipsForCct() {
    syncCctVersionSwitch(false);
    document.querySelectorAll('.cct-model-version-list-hidden')
      .forEach((element) => element.classList.remove('cct-model-version-list-hidden'));
    document.querySelectorAll('.cct-model-version-dropdown')
      .forEach((element) => element.remove());
    scheduleCctInjection(150);
    return true;
  }

  function scheduleCctInjection(delay = 0) {
    if (cctInjectionTimer) {
      window.clearTimeout(cctInjectionTimer);
    }

    cctInjectionTimer = window.setTimeout(() => {
      cctInjectionTimer = null;
      window.CCT?.injectModelVersionDropdown?.();
    }, delay);
  }

  function cleanupModelDetailUi() {
    if (cctSwitchOriginal !== undefined) {
      syncCctVersionSwitch(cctSwitchOriginal);
      cctSwitchOriginal = undefined;
      scheduleCctInjection(200);
    }

    stopDetailWatchdog();

    for (const wrapper of document.querySelectorAll(`[${VERSION_CHIPS_ATTR}="true"]`)) {
      wrapper.remove();
    }
    detailUiState = null;
  }

  function restoreModelDetailUiFromState() {
    const state = detailUiState;

    if (
      !state
      || !versionChipsEnabled
      || state.modelId !== getModelDetailId()
      || !state.titleAnchor.isConnected
    ) {
      return false;
    }

    enableNativeVersionChipsForCct();
    state.wrapper = null;
    return true;
  }

  function startDetailWatchdog() {
    if (detailWatchdog) {
      return;
    }

    detailWatchdog = window.setInterval(() => {
      if (!versionChipsEnabled || !isModelDetailPage()) {
        return;
      }

      if (!restoreModelDetailUiFromState()) {
        scheduleSync();
      }
    }, 150);
  }

  function startPageWatchdog() {
    if (pageWatchdog) {
      return;
    }

    pageWatchdog = window.setInterval(() => {
      const modelsPage = isModelsPage();
      const detailPage = isModelDetailPage();

      if (!modelsPage && !detailPage) {
        return;
      }

      if (detailPage) {
        if (!detailUiState) {
          scheduleSync();
        } else {
          restoreModelDetailUiFromState();
        }
      } else if (modelsPage) {
        const wrapper = document.querySelector(`[${WRAPPER_ATTR}="true"]`);
        if (!wrapper?.isConnected) {
          scheduleSync();
        }
      }
    }, 250);
  }

  function stopPageWatchdog() {
    if (!pageWatchdog) {
      return;
    }

    window.clearInterval(pageWatchdog);
    pageWatchdog = null;
  }

  function stopDetailWatchdog() {
    if (!detailWatchdog) {
      return;
    }

    window.clearInterval(detailWatchdog);
    detailWatchdog = null;
  }

  async function syncModelDetailPage() {
    const requestToken = ++detailRequestToken;
    const modelId = getModelDetailId();

    if (!versionChipsEnabled || !modelId) {
      cleanupModelDetailUi();
      return;
    }

    const heading = getVisibleDetailHeading();
    if (!heading) {
      return;
    }

    try {
      const model = await getModelDetailData(modelId);
      if (
        requestToken !== detailRequestToken
        || modelId !== getModelDetailId()
        || !versionChipsEnabled
      ) {
        return;
      }

      const versions = Array.isArray(model?.modelVersions) ? model.modelVersions : [];
      if (!versions.length) {
        cleanupModelDetailUi();
        return;
      }

      const titleAnchor = getModelDetailTitleAnchor(heading);
      if (!titleAnchor) {
        return;
      }

      enableNativeVersionChipsForCct();

      detailUiState = { modelId, wrapper: null, nativeControl: null, titleAnchor, model };
      startDetailWatchdog();
    } catch {
      // Keep the last working UI during transient API or hydration failures.
    }
  }

  function scheduleSync() {
    if (syncQueued) {
      return;
    }

    syncQueued = true;

    requestAnimationFrame(() => {
      syncQueued = false;

      if (batchDepth > 0) {
        return;
      }

      syncAllSections();
      syncModelDetailPage();
    });
  }

  function isModelsPage() {
    return MODELS_PATH_PATTERN.test(window.location.pathname)
      && !MODEL_DETAIL_PATH_PATTERN.test(window.location.pathname);
  }

  function getBaseModelSections() {
    return [...document.querySelectorAll('.mantine-Divider-label')]
      .filter((label) => BASE_MODEL_LABEL_TEXTS.has(normalizeText(label.textContent).toLowerCase()))
      .map((label) => label.closest('.mantine-Stack-root'))
      .filter(Boolean);
  }

  function getMultiSelectRoot(section) {
    return section.querySelector('.mantine-MultiSelect-root');
  }

  function buildOptionsFromNodes(nodes) {
    const seen = new Set();
    const options = [];

    for (const node of nodes) {
      const value = normalizeText(node.getAttribute('value') || node.textContent);
      if (!value || seen.has(value)) {
        continue;
      }

      seen.add(value);

      const spans = node.querySelectorAll('span');
      const labelNode = spans[spans.length - 1];
      const label = normalizeText(labelNode ? labelNode.textContent : value);

      options.push({ value, label });
    }

    return options;
  }

  function getLiveOptionNodes(section) {
    const scopedNodes = [...section.querySelectorAll('.mantine-MultiSelect-option[data-combobox-option]')];
    if (scopedNodes.length) {
      return scopedNodes;
    }

    const knownKeys = new Set(
      [...ALL_BASE_MODELS, ...getSelectedValuesFromHiddenInput(section)]
        .map((value) => normalizeKey(value))
        .filter(Boolean)
    );
    const dropdowns = [...document.querySelectorAll('.mantine-MultiSelect-dropdown')];
    const dropdownCandidates = [];
    let bestNodes = [];
    let bestScore = 0;
    let largestNodes = [];

    for (const dropdown of dropdowns) {
      const nodes = [...dropdown.querySelectorAll('.mantine-MultiSelect-option[data-combobox-option]')];
      if (!nodes.length) {
        continue;
      }

      dropdownCandidates.push(nodes);

      const score = nodes.reduce((total, node) => {
        const value = normalizeKey(node.getAttribute('value') || node.textContent);
        return total + (knownKeys.has(value) ? 1 : 0);
      }, 0);

      if (score > bestScore || (score === bestScore && score > 0 && nodes.length > bestNodes.length)) {
        bestNodes = nodes;
        bestScore = score;
      }

      if (nodes.length > largestNodes.length) {
        largestNodes = nodes;
      }
    }

    if (bestScore > 0) {
      return bestNodes;
    }

    if (dropdownCandidates.length === 1) {
      return dropdownCandidates[0];
    }

    return largestNodes;
  }

  function getLiveOptions(section) {
    return buildOptionsFromNodes(getLiveOptionNodes(section));
  }

  function getFallbackOptions(section) {
    const seen = new Set();
    const values = [];

    for (const value of [...ALL_BASE_MODELS, ...getSelectedValues(section)]) {
      const normalized = normalizeText(value);
      if (!normalized || seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      values.push({ value: normalized, label: normalized });
    }

    return values;
  }

  function getOptions(section) {
    const liveOptions = getLiveOptions(section);
    return liveOptions.length ? liveOptions : getFallbackOptions(section);
  }

  function buildKnownModelLookup(options) {
    const lookup = new Map();

    for (const value of ALL_BASE_MODELS) {
      const normalized = normalizeText(value);
      if (!normalized) {
        continue;
      }

      lookup.set(normalizeKey(normalized), normalized);
    }

    for (const option of options) {
      lookup.set(normalizeKey(option.value), option.value);
    }

    return lookup;
  }

  function resolveConfiguredValues(values, lookup, availableValues) {
    if (!Array.isArray(values)) {
      return new Set();
    }

    const resolved = new Set();

    for (const rawValue of values) {
      const normalized = normalizeText(typeof rawValue === 'string' ? rawValue : '');
      if (!normalized) {
        continue;
      }

      const canonicalValue = lookup.get(normalizeKey(normalized));
      if (canonicalValue && availableValues.has(canonicalValue)) {
        resolved.add(canonicalValue);
      }
    }

    return resolved;
  }

  function getVisualFilterConfig(options) {
    const availableValues = new Set(options.map((option) => option.value));
    const lookup = buildKnownModelLookup(options);
    const mode = normalizeKey(MODE);
    const blacklist = resolveConfiguredValues(BLACKLIST, lookup, availableValues);
    const whitelist = resolveConfiguredValues(WHITELIST, lookup, availableValues);

    if (mode === FILTER_MODES.BLACKLIST) {
      if (blacklist.size === 0 || blacklist.size >= options.length) {
        return { mode: FILTER_MODES.OFF, values: new Set() };
      }

      return { mode, values: blacklist };
    }

    if (mode === FILTER_MODES.WHITELIST) {
      if (whitelist.size === 0) {
        return { mode: FILTER_MODES.OFF, values: new Set() };
      }

      return { mode, values: whitelist };
    }

    return { mode: FILTER_MODES.OFF, values: new Set() };
  }

  function getVisibleChipOptions(options, selectedKeys) {
    const filterConfig = getVisualFilterConfig(options);

    if (filterConfig.mode === FILTER_MODES.OFF) {
      return options;
    }

    const visibleOptions = options.filter((option) => {
      if (selectedKeys.has(normalizeKey(option.value))) {
        return true;
      }

      if (filterConfig.mode === FILTER_MODES.BLACKLIST) {
        return !filterConfig.values.has(option.value);
      }

      return filterConfig.values.has(option.value);
    });

    return visibleOptions.length ? visibleOptions : options;
  }

  function getSelectedValuesFromHiddenInput(section) {
    const hiddenInput = section.querySelector('.mantine-MultiSelect-root input[type="hidden"]');
    if (hiddenInput) {
      return hiddenInput.value
        .split(',')
        .map((value) => normalizeText(value))
        .filter(Boolean);
    }

    return [];
  }

  function getSelectedValuesFromPills(section) {
    return [...section.querySelectorAll('.mantine-MultiSelect-pill')]
      .map((pill) => normalizeText(pill.querySelector('.mantine-Pill-label')?.textContent))
      .filter(Boolean);
  }

  function getSelectedValuesFromOptionNodes(section) {
    return getLiveOptionNodes(section)
      .filter((node) => node.getAttribute('aria-selected') === 'true')
      .map((node) => normalizeText(node.getAttribute('value') || node.textContent))
      .filter(Boolean);
  }

  /*
   * Civitai keeps filter changes pending until "Apply filters" is pressed, so the
   * hidden input and the pills do not necessarily reflect a chip click right away.
   * Every readable source is merged, and chip clicks are remembered locally until
   * the page state catches up with them.
   */
  const localSelectionMap = new WeakMap();

  function setLocalSelection(section, value, selected) {
    const key = normalizeKey(value);
    if (!key) {
      return;
    }

    let map = localSelectionMap.get(section);
    if (!map) {
      map = new Map();
      localSelectionMap.set(section, map);
    }

    map.set(key, Boolean(selected));
  }

  function resolveSelectedKeys(section, domValues) {
    const keys = new Set(domValues.map((value) => normalizeKey(value)).filter(Boolean));
    const map = localSelectionMap.get(section);
    if (!map) {
      return keys;
    }

    for (const [key, selected] of [...map.entries()]) {
      if (keys.has(key) === selected) {
        map.delete(key);
        continue;
      }

      if (selected) {
        keys.add(key);
      } else {
        keys.delete(key);
      }
    }

    return keys;
  }

  function getSelectedValues(section) {
    const values = new Map();

    for (const source of [
      getSelectedValuesFromHiddenInput(section),
      getSelectedValuesFromPills(section),
      getSelectedValuesFromOptionNodes(section),
    ]) {
      for (const value of source) {
        const key = normalizeKey(value);
        if (key && !values.has(key)) {
          values.set(key, value);
        }
      }
    }

    return [...values.values()];
  }

  function getChipTemplates() {
    const chips = [...document.querySelectorAll('.mantine-Chip-root')]
      .filter((chip) => !chip.closest(`[${WRAPPER_ATTR}]`));

    const unchecked = chips.find((chip) => !chip.querySelector('input')?.checked) || chips[0];
    const checked = chips.find((chip) => chip.querySelector('input')?.checked) || unchecked;

    return { unchecked, checked };
  }

  function buildLabelContent(templateLabel, text) {
    const icon = templateLabel.querySelector('.mantine-Chip-iconWrapper');
    const outer = document.createElement('span');
    const inner = document.createElement('span');

    inner.textContent = text;
    outer.appendChild(inner);

    return icon ? [icon.cloneNode(true), outer] : [outer];
  }

  function findOptionNode(section, value) {
    return getLiveOptionNodes(section)
      .find((node) => normalizeText(node.getAttribute('value') || node.textContent) === value) || null;
  }

  function nextFrame() {
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
  }

  async function ensureOptionNodesReady(section) {
    if (getLiveOptionNodes(section).length) {
      return true;
    }

    const input = section.querySelector('.mantine-MultiSelect-inputField, .mantine-PillsInputField-field');
    if (!input) {
      return false;
    }

    input.focus();
    input.click();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 60));
      if (getLiveOptionNodes(section).length) {
        return true;
      }
    }

    return false;
  }

  function clearSelections(section) {
    localSelectionMap.delete(section);

    const selectedValues = getSelectedValues(section);

    for (const value of selectedValues) {
      setLocalSelection(section, value, false);
    }

    const clearButton = section.querySelector('.mantine-InputClearButton-root');
    if (clearButton) {
      clearButton.click();
      scheduleSync();
      return;
    }

    for (const value of selectedValues) {
      const optionNode = findOptionNode(section, value);
      if (optionNode) {
        optionNode.click();
        continue;
      }

      const pill = [...section.querySelectorAll('.mantine-MultiSelect-pill')]
        .find((node) => normalizeText(node.querySelector('.mantine-Pill-label')?.textContent) === value);
      const removeButton = pill?.querySelector('.mantine-Pill-remove');
      if (removeButton) {
        removeButton.click();
      }
    }

    scheduleSync();
  }

  function toggleSelection(section, value) {
    const optionNode = findOptionNode(section, value);
    if (optionNode) {
      optionNode.click();
      scheduleSync();
      return;
    }

    const input = section.querySelector('.mantine-MultiSelect-inputField, .mantine-PillsInputField-field');
    if (!input) {
      return;
    }

    input.focus();
    input.click();

    window.setTimeout(() => {
      const delayedOptionNode = findOptionNode(section, value);
      if (delayedOptionNode) {
        delayedOptionNode.click();
      }

      scheduleSync();
    }, 30);
  }

  /*
   * Category-wide selection. Clicks the real dropdown options one by one (so
   * Civitai's own state stays in sync), serialized a frame apart so React never
   * batches away an intermediate value. Only "select" / "deselect" is applied —
   * applying the filters is still up to Civitai's own "Apply filters" button.
   */
  async function runSelectionBatch(section, values, select) {
    if (!values.length) {
      return;
    }

    batchDepth += 1;

    try {
      const ready = await ensureOptionNodesReady(section);
      if (!ready) {
        return;
      }

      for (const value of values) {
        const node = findOptionNode(section, value);

        if (node) {
          const isSelected = node.getAttribute('aria-selected') === 'true'
            || (node.dataset && node.dataset.checked === 'true');

          if (isSelected !== select) {
            node.click();
          }
        }

        setLocalSelection(section, value, select);
        await nextFrame();
      }
    } finally {
      batchDepth -= 1;
    }

    scheduleSync();
  }

  function applyChipState(chip, selected) {
    const input = chip.querySelector('input');
    const label = chip.querySelector('label');
    if (!input) {
      return;
    }

    input.checked = selected;

    if (selected) {
      input.setAttribute('checked', '');
    } else {
      input.removeAttribute('checked');
    }

    if (label) {
      if (selected) {
        label.setAttribute('data-checked', 'true');
      } else {
        label.removeAttribute('data-checked');
      }
    }
  }

  function createChip(section, templates, value, text, selected, isClearChip) {
    /*
     * Always build from the unchecked template. Civitai's checked template uses a
     * different label box, so mixing the two makes a chip change width the moment
     * it is clicked - the row re-wraps and the whole panel jumps. Every chip now
     * shares one markup, and the checked look comes from CSS alone.
     */
    const source = templates.unchecked;
    if (!source) {
      return null;
    }

    const chip = source.cloneNode(true);
    const input = chip.querySelector('input');
    const label = chip.querySelector('label');

    if (!input || !label) {
      return null;
    }

    chipIdCounter += 1;

    chip.setAttribute(CHIP_ATTR, 'true');
    input.id = `${SCRIPT_KEY}-${chipIdCounter}`;
    input.type = 'checkbox';
    input.value = value;
    input.name = '';

    label.htmlFor = input.id;
    label.replaceChildren(...buildLabelContent(label, text));
    applyChipState(chip, Boolean(selected));

    chip.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (isClearChip) {
        clearSelections(section);
        return;
      }

      const willSelect = !input.checked;
      applyChipState(chip, willSelect);
      setLocalSelection(section, value, willSelect);
      toggleSelection(section, value);
    });

    return chip;
  }

  function createMiniButton(label, onClick) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tm-mini-btn';
    button.textContent = label;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    });

    return button;
  }

  function getOrCreateWrapper(section) {
    let wrapper = section.querySelector(`[${WRAPPER_ATTR}="true"]`);
    if (wrapper) {
      return wrapper;
    }

    wrapper = document.createElement('div');
    wrapper.setAttribute(WRAPPER_ATTR, 'true');

    const multiSelectRoot = getMultiSelectRoot(section);
    if (multiSelectRoot) {
      multiSelectRoot.insertAdjacentElement('afterend', wrapper);
    } else {
      section.appendChild(wrapper);
    }

    return wrapper;
  }

  function getCategoryStateMap(wrapper) {
    if (!wrapper._tmCategoryState) {
      wrapper._tmCategoryState = new Map();
    }

    return wrapper._tmCategoryState;
  }

  function isCategoryOpen(wrapper, name) {
    return getCategoryStateMap(wrapper).get(name) === true;
  }

  function setAllCategoriesOpen(wrapper, open) {
    const map = getCategoryStateMap(wrapper);

    for (const group of wrapper.querySelectorAll(`[${CATEGORY_ATTR}="true"]`)) {
      group.dataset.open = String(open);
      const name = group.querySelector('.tm-cat-title')?.textContent;
      if (name) {
        map.set(name, open);
      }
    }
  }

  function buildToolbar(section, wrapper, templates, selectedKeys) {
    const toolbar = document.createElement('div');
    toolbar.setAttribute(TOOLBAR_ATTR, 'true');

    const clearChip = createChip(section, templates, '__all__', '所有基础模型', selectedKeys.size === 0, true);
    if (clearChip) {
      toolbar.appendChild(clearChip);
    }

    const spacer = document.createElement('span');
    spacer.className = 'tm-toolbar-spacer';
    toolbar.appendChild(spacer);

    toolbar.appendChild(createMiniButton('全部展开', () => setAllCategoriesOpen(wrapper, true)));
    toolbar.appendChild(createMiniButton('全部折叠', () => setAllCategoriesOpen(wrapper, false)));

    return toolbar;
  }

  function buildCategoryGroup(section, wrapper, templates, name, options, selectedKeys) {
    const group = document.createElement('div');
    group.setAttribute(CATEGORY_ATTR, 'true');
    group.dataset.open = String(isCategoryOpen(wrapper, name));

    const header = document.createElement('div');
    header.setAttribute(CATEGORY_HEADER_ATTR, 'true');
    header.addEventListener('click', (event) => {
      if (event.target.closest('.tm-mini-btn')) {
        return;
      }

      const map = getCategoryStateMap(wrapper);
      const next = group.dataset.open !== 'true';
      map.set(name, next);
      group.dataset.open = String(next);
    });

    const arrow = document.createElement('span');
    arrow.className = 'tm-cat-arrow';
    arrow.setAttribute('aria-hidden', 'true');

    const title = document.createElement('span');
    title.className = 'tm-cat-title';
    title.textContent = name;

    const count = document.createElement('span');
    count.className = 'tm-cat-count';
    count.textContent = `(${options.length})`;

    header.append(arrow, title, count);

    const values = options.map((option) => option.value);
    const selectedCount = values
      .filter((value) => selectedKeys.has(normalizeKey(value))).length;

    /*
     * The badge is always present and only toggles visibility, so the header
     * keeps its exact height and the sidebar never jumps when the count changes.
     */
    const badge = document.createElement('span');
    badge.className = 'tm-cat-badge';
    setCategoryBadge(badge, selectedCount);
    header.appendChild(badge);

    const actions = document.createElement('span');
    actions.className = 'tm-cat-actions';

    const selectButton = createMiniButton('全选', () => runSelectionBatch(section, values, true));
    selectButton.setAttribute(CATEGORY_ACTION_ATTR, 'select');

    const clearButton = createMiniButton('清空', () => runSelectionBatch(section, values, false));
    clearButton.setAttribute(CATEGORY_ACTION_ATTR, 'clear');

    actions.append(selectButton, clearButton);
    header.appendChild(actions);

    const body = document.createElement('div');
    body.setAttribute(CATEGORY_BODY_ATTR, 'true');

    const fragment = document.createDocumentFragment();

    for (const option of options) {
      const chip = createChip(
        section,
        templates,
        option.value,
        option.label,
        selectedKeys.has(normalizeKey(option.value)),
        false
      );

      if (chip) {
        fragment.appendChild(chip);
      }
    }

    body.appendChild(fragment);
    group.append(header, body);

    return group;
  }

  function renderWrapper(section, wrapper, templates, visibleOptions, selectedKeys) {
    const groups = groupOptionsByCategory(visibleOptions);
    const fragment = document.createDocumentFragment();

    fragment.appendChild(buildToolbar(section, wrapper, templates, selectedKeys));

    for (const [name, options] of groups.entries()) {
      fragment.appendChild(buildCategoryGroup(section, wrapper, templates, name, options, selectedKeys));
    }

    wrapper.replaceChildren(fragment);
  }

  function setCategoryBadge(badge, selectedCount) {
    if (!badge) {
      return;
    }

    const text = `已选 ${selectedCount}`;

    if (badge.textContent === text) {
      return;
    }

    badge.textContent = text;
    badge.dataset.empty = String(selectedCount === 0);
  }

  function optionsKeyFor(options) {
    return options.map((option) => `${option.value}\u0001${option.label}`).join('\u0002');
  }

  function updateCategoryBadges(wrapper, selectedKeys) {
    const groups = wrapper.querySelectorAll(`[${CATEGORY_ATTR}="true"]`);

    for (const group of groups) {
      const chips = group.querySelectorAll(`[${CATEGORY_BODY_ATTR}="true"] > [${CHIP_ATTR}="true"]`);
      let selectedCount = 0;

      for (const chip of chips) {
        const input = chip.querySelector('input');

        if (input && selectedKeys.has(normalizeKey(input.value))) {
          selectedCount += 1;
        }
      }

      setCategoryBadge(group.querySelector('.tm-cat-badge'), selectedCount);
    }
  }

  /*
   * Selection-only refresh: flip the affected chips and badges without
   * rebuilding the panel, so the sidebar keeps its scroll position, its
   * open/closed groups and its layout.
   */
  function updateSelectionState(wrapper, selectedKeys) {
    const chips = wrapper.querySelectorAll(`[${CATEGORY_BODY_ATTR}="true"] > [${CHIP_ATTR}="true"]`);

    for (const chip of chips) {
      const input = chip.querySelector('input');

      if (!input) {
        continue;
      }

      const selected = selectedKeys.has(normalizeKey(input.value));

      if (Boolean(input.checked) !== selected) {
        applyChipState(chip, selected);
      }
    }

    const clearChip = wrapper.querySelector(`[${TOOLBAR_ATTR}] > [${CHIP_ATTR}="true"]`);
    const clearSelected = selectedKeys.size === 0;
    const clearInput = clearChip ? clearChip.querySelector('input') : null;

    if (clearInput && clearInput.checked !== clearSelected) {
      applyChipState(clearChip, clearSelected);
    }

    updateCategoryBadges(wrapper, selectedKeys);
  }

  function syncSection(section) {
    const multiSelectRoot = getMultiSelectRoot(section);
    if (!multiSelectRoot) {
      return;
    }

    const liveOptions = getLiveOptions(section);
    const options = liveOptions.length ? liveOptions : getFallbackOptions(section);
    if (!options.length) {
      return;
    }

    hideElement(multiSelectRoot);
    hideElement(section.querySelector('.mantine-MultiSelect-dropdown'));

    const domSelectedValues = getSelectedValues(section);
    const selectedKeys = resolveSelectedKeys(section, domSelectedValues);
    const visibleOptions = sortOptionsByCategory(getVisibleChipOptions(options, selectedKeys));
    const wrapper = getOrCreateWrapper(section);
    const optionsKey = optionsKeyFor(visibleOptions);

    if (wrapper.getAttribute(OPTIONS_ATTR) === optionsKey && wrapper.hasChildNodes()) {
      updateSelectionState(wrapper, selectedKeys);
      return;
    }

    const templates = getChipTemplates();
    if (!templates.unchecked) {
      return;
    }

    wrapper.setAttribute(OPTIONS_ATTR, optionsKey);
    renderWrapper(section, wrapper, templates, visibleOptions, selectedKeys);
  }

  function syncAllSections() {
    if (!isModelsPage()) {
      return;
    }

    ensureStyles();

    for (const section of getBaseModelSections()) {
      syncSection(section);
    }
  }

  function startPageObserver() {
    if (pageObserver || !document.body) {
      return;
    }

    pageObserver = new MutationObserver(() => {
      scheduleSync();
    });

    pageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-selected', 'data-checked', 'checked', 'value'],
    });
  }

  function stopPageObserver() {
    if (!pageObserver) {
      return;
    }

    pageObserver.disconnect();
    pageObserver = null;
  }

  function refreshPageLifecycle() {
    const modelsPage = isModelsPage();
    const modelDetailPage = isModelDetailPage();

    if (!modelsPage && !modelDetailPage) {
      stopPageObserver();
      stopPageWatchdog();
      cleanupModelDetailUi();
      return;
    }

    ensureStyles();
    startPageObserver();
    startPageWatchdog();
    scheduleSync();

    if (!modelDetailPage) {
      cleanupModelDetailUi();
    }
  }

  function installHistoryHooks() {
    const methods = ['pushState', 'replaceState'];

    for (const method of methods) {
      const original = history[method];
      if (typeof original !== 'function' || original.__tmBaseModelWrapped) {
        continue;
      }

      const wrapped = function (...args) {
        const result = original.apply(this, args);
        refreshPageLifecycle();
        return result;
      };

      wrapped.__tmBaseModelWrapped = true;
      history[method] = wrapped;
    }
  }

  function start() {
    registerVersionChipMenu();
    installHistoryHooks();
    refreshPageLifecycle();
    window.addEventListener('popstate', refreshPageLifecycle);
    window.addEventListener('hashchange', refreshPageLifecycle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
