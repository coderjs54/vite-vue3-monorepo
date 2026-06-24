<template>
  <div
    class="rich-editor"
    :class="{ 'rich-editor--dragging': isDragging }"
    ref="containerRef"
  >
    <!-- 左侧编辑器面板 -->
    <div class="rich-editor__panel rich-editor__panel--editor" :style="leftPanelStyle">
      <div class="rich-editor__toolbar-header">
        <span class="rich-editor__label">编辑器</span>
      </div>
      <div class="rich-editor__editor-wrapper">
        <QuillEditor
          ref="editorRef"
          v-model:content="editorContent"
          content-type="html"
          :toolbar="toolbarOptions"
          :placeholder="'请在这里输入内容...'"
          theme="snow"
          @ready="onEditorReady"
        />
      </div>
    </div>

    <!-- 中间分隔线（拖拽手柄） -->
    <div
      class="rich-editor__divider"
      @mousedown="onDividerMouseDown"
      @touchstart.prevent="onDividerTouchStart"
    ></div>

    <!-- 右侧预览面板 -->
    <div class="rich-editor__panel rich-editor__panel--preview" :style="rightPanelStyle">
      <div class="rich-editor__toolbar-header">
        <span class="rich-editor__label">实时预览</span>
      </div>
      <div class="rich-editor__preview-wrapper">
        <div class="rich-editor__preview-content" v-html="editorContent"></div>
        <div v-if="!editorContent" class="rich-editor__placeholder">
          <div class="rich-editor__placeholder-icon">&#9998;</div>
          <p>在左侧编辑器中输入内容，此处将实时预览</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
import { useResizablePanels } from '../composables/useResizablePanels'

/**
 * Quill 编辑器工具栏配置
 * 提供完整的富文本编辑功能
 */
const toolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  [{ script: 'sub' }, { script: 'super' }],
  [{ direction: 'rtl' }],
  ['link', 'image', 'video'],
  ['clean']
]

// ============================================
// 编辑器内容状态
// ============================================

// 使用 shallowRef 避免深层响应式追踪，优化大文档性能
const editorContent = shallowRef('')

// 编辑器实例引用
const editorRef = ref(null)

/**
 * 编辑器就绪回调
 * 注册快捷键支持
 */
const onEditorReady = (quill) => {
  quill.keyboard.addBinding({
    key: 'B',
    shortKey: true
  }, () => {
    quill.format('bold', !quill.getFormat().bold)
  })

  quill.keyboard.addBinding({
    key: 'I',
    shortKey: true
  }, () => {
    quill.format('italic', !quill.getFormat().italic)
  })

  quill.keyboard.addBinding({
    key: 'U',
    shortKey: true
  }, () => {
    quill.format('underline', !quill.getFormat().underline)
  })
}

// ============================================
// 分隔线拖拽调整宽度（使用 composable）
// ============================================

/** 容器根元素引用 */
const containerRef = ref(null)

/** 使用可复用的面板调整 composable */
const {
  leftPercent,
  leftPanelStyle,
  rightPanelStyle,
  isDragging,
  onDividerMouseDown,
  onDividerTouchStart
} = useResizablePanels({
  containerRef,
  initialPercent: 50,  // 初始左侧宽度百分比
  minPercent: 20,      // 最小宽度百分比
  maxPercent: 80,      // 最大宽度百分比
  dividerWidth: 1,     // 分隔线视觉宽度（px）
  enableOnMobile: false // 移动端禁用拖拽
})
</script>

<style lang="scss" scoped>
// ============================================
// 富文本编辑器 - 双栏布局
// ============================================

.rich-editor {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
  overflow: hidden;

  // 拖拽中禁止文本选中
  &--dragging {
    cursor: col-resize;

    * {
      user-select: none !important;
      -webkit-user-select: none !important;
    }
  }

  // ==========================================
  // 左右面板通用样式
  // ==========================================
  &__panel {
    display: flex;
    flex-direction: column;
    min-width: 0; // 防止 flex 溢出
    background-color: #fff;
    overflow: hidden;
  }

  // ==========================================
  // 工具栏头部
  // ==========================================
  &__toolbar-header {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    background: #fafbfc;
    border-bottom: 1px solid #e8eaed;
    flex-shrink: 0;
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: #5f6368;
    letter-spacing: 0.5px;
    text-transform: uppercase;

    &::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
    }
  }

  // ==========================================
  // 编辑器区域
  // ==========================================
  &__panel--editor {
    .rich-editor__label::before {
      background-color: #1a73e8;
    }
  }

  &__editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    // 覆盖 Quill 编辑器默认样式
    :deep(.ql-toolbar) {
      border: none;
      border-bottom: 1px solid #e8eaed;
      background: #ffffff;
      padding: 8px 12px;
      flex-shrink: 0;

      // 响应式：小屏幕下工具栏换行
      @media (max-width: 1200px) {
        .ql-formats {
          margin-right: 8px;
        }
      }
    }

    // Quill 编辑区域
    :deep(.ql-container) {
      flex: 1;
      overflow-y: auto;
      border: none;
      font-size: 16px;
      line-height: 1.75;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        'Helvetica Neue', Arial, sans-serif;
    }

    :deep(.ql-editor) {
      min-height: 200px;
      padding: 20px 24px;

      &:focus {
        background: #fff;
      }

      // 编辑区段落样式
      p {
        margin-bottom: 8px;
      }

      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 12px;
        font-weight: 600;
        color: #202124;
      }

      blockquote {
        border-left: 4px solid #1a73e8;
        padding-left: 16px;
        color: #5f6368;
        font-style: italic;
      }

      pre.ql-syntax {
        background-color: #f8f9fa;
        border-radius: 4px;
        padding: 16px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
        font-size: 14px;
        overflow-x: auto;
      }
    }
  }

  // ==========================================
  // 预览区域
  // ==========================================
  &__panel--preview {
    .rich-editor__label::before {
      background-color: #34a853;
    }

    // 实时预览指示点动画
    .rich-editor__label::after {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #34a853;
      margin-left: 8px;
      vertical-align: middle;
      animation: pulse-dot 2s ease-in-out infinite;
    }
  }

  &__preview-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    position: relative;
    background: #fff;
  }

  &__preview-content {
    max-width: 100%;
    font-size: 16px;
    line-height: 1.75;
    color: #3c4043;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      'Helvetica Neue', Arial, sans-serif;
    word-wrap: break-word;

    // 预览区标题样式
    h1 {
      font-size: 2em;
      font-weight: 700;
      margin: 0.67em 0;
      color: #202124;
      line-height: 1.3;
    }

    h2 {
      font-size: 1.5em;
      font-weight: 600;
      margin: 0.83em 0;
      color: #202124;
      line-height: 1.35;
    }

    h3 {
      font-size: 1.25em;
      font-weight: 600;
      margin: 1em 0;
      color: #202124;
    }

    h4 {
      font-size: 1em;
      font-weight: 600;
      margin: 1.33em 0;
      color: #202124;
    }

    h5, h6 {
      font-size: 0.83em;
      font-weight: 600;
      margin: 1.67em 0;
      color: #202124;
    }

    // 段落
    p {
      margin: 0 0 1em;
    }

    // 引用
    blockquote {
      border-left: 4px solid #dadce0;
      padding: 8px 16px;
      margin: 16px 0;
      color: #5f6368;
      background: #f8f9fa;
      border-radius: 0 4px 4px 0;
    }

    // 代码块
    pre {
      background: #f8f9fa;
      border-radius: 4px;
      padding: 16px;
      margin: 16px 0;
      overflow-x: auto;
      font-size: 14px;
      line-height: 1.5;
      border: 1px solid #e8eaed;

      code {
        background: none;
        padding: 0;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
      }
    }

    code {
      background: #f1f3f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
      font-size: 0.9em;
      color: #ea4335;
    }

    // 列表
    ul, ol {
      padding-left: 24px;
      margin: 8px 0;

      li {
        margin-bottom: 4px;
      }
    }

    // 链接
    a {
      color: #1a73e8;
      text-decoration: underline;

      &:hover {
        color: #1557b0;
      }
    }

    // 图片
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 16px 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    // 表格
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;

      td, th {
        border: 1px solid #dadce0;
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
      }
    }

    // Quill 字体大小样式（使用 :deep 穿透 scoped，因为 v-html 插入的元素不带 data 属性）
    :deep(.ql-size-small) {
      font-size: 0.75em;
    }

    :deep(.ql-size-large) {
      font-size: 1.5em;
    }

    :deep(.ql-size-huge) {
      font-size: 2.5em;
    }

    // Quill 文字对齐样式
    :deep(.ql-align-center) {
      text-align: center;
    }

    :deep(.ql-align-right) {
      text-align: right;
    }

    :deep(.ql-align-justify) {
      text-align: justify;
    }

    // 水平线
    hr {
      border: none;
      border-top: 1px solid #dadce0;
      margin: 24px 0;
    }
  }

  // ==========================================
  // 空状态占位符
  // ==========================================
  &__placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #9aa0a6;
    user-select: none;
    pointer-events: none;
  }

  &__placeholder-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  &__placeholder p {
    font-size: 14px;
    margin: 0;
    color: #9aa0a6;
  }

  // ==========================================
  // 中间分隔线（可拖拽调整大小）
  // ==========================================
  &__divider {
    width: 9px;               // 实际视觉 1px + 左右各 4px 点击区域
    flex-shrink: 0;
    position: relative;
    cursor: col-resize;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;

    // 分隔线视觉线条（居中 1px）
    &::after {
      content: '';
      width: 1px;
      height: 100%;
      background: linear-gradient(
        to bottom,
        transparent,
        #dadce0 5%,
        #dadce0 95%,
        transparent
      );
      transition: background-color 0.2s ease;
    }

    // 分隔线中间的拖拽手柄装饰
    &::before {
      content: '\22EE'; // ⋮ 竖排省略号
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      color: #9aa0a6;
      font-size: 16px;
      padding: 6px 4px;
      border-radius: 4px;
      border: 1px solid #dadce0;
      line-height: 1;
      letter-spacing: 2px;
      z-index: 2;
      transition:
        color 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    }

    // 悬停时高亮手柄（仅支持 hover 的设备）
    @media (hover: hover) {
      &:hover::before {
        color: #1a73e8;
        border-color: #1a73e8;
        box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
      }
    }

    // 拖拽中高亮
    &:active::before,
    .rich-editor--dragging &::before {
      color: #1a73e8;
      border-color: #1a73e8;
      background: #e8f0fe;
      box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.25);
    }

    :deep(.rich-editor--dragging) &::after {
      background-color: #1a73e8;
    }
  }

  // ==========================================
  // 动画
  // ==========================================
  @keyframes pulse-dot {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.8);
    }
  }
}

// ============================================
// 响应式设计：移动端上下布局
// ============================================
@media (max-width: 768px) {
  .rich-editor {
    flex-direction: column;
    height: 100vh;

    &__panel {
      flex: none;
      height: 50vh;
      width: 100% !important;  // 覆盖内联宽度样式
    }

    &__divider {
      width: 100%;
      height: 9px;
      cursor: default;
      flex-direction: column;

      // 分隔线视觉线条（居中 1px）
      &::after {
        width: 100%;
        height: 1px;
        background: linear-gradient(
          to right,
          transparent,
          #dadce0 5%,
          #dadce0 95%,
          transparent
        );
      }

      // 横排省略号
      &::before {
        content: '\22EF'; // ⋯
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    &__editor-wrapper {
      :deep(.ql-toolbar) {
        padding: 4px 8px;

        .ql-formats {
          margin-right: 4px;
          margin-bottom: 2px;
        }
      }

      :deep(.ql-editor) {
        padding: 12px 16px;
        min-height: 120px;
      }
    }

    &__preview-wrapper {
      padding: 12px 16px;
    }
  }
}

// 平板设备适配
@media (min-width: 769px) and (max-width: 1024px) {
  .rich-editor {
    &__editor-wrapper {
      :deep(.ql-editor) {
        padding: 16px 20px;
      }
    }

    &__preview-wrapper {
      padding: 16px 20px;
    }
  }
}
</style>
