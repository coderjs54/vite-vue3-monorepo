# 富文本编辑器实现说明

## 项目概述

基于 Vite + Vue 3 + Quill 构建的双栏布局富文本编辑器，左侧为编辑区，右侧为实时预览区。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vite | ^8.0 | 构建工具 |
| Vue | ^3.5 | UI 框架 |
| @vueup/vue-quill | latest | Quill 富文本编辑器 Vue 3 组件 |
| sass | ^1.101 | SCSS 预处理器 |

## 项目结构

```
src/
├── components/
│   └── RichTextEditor.vue   # 主组件：双栏编辑器 + 实时预览
├── App.vue                   # 根组件，引入 RichTextEditor
├── main.js                   # 入口，注册 QuillEditor 全局组件
└── style.css                 # 全局重置样式
```

## 核心实现

### 1. 双栏布局

- 使用 Flexbox 实现左右两栏（flex: 1 各占 50%）
- `height: 100vh` 占满视口高度
- 中间 `1px` 渐变分隔线，带 ⋮ 装饰手柄
- 移动端（≤768px）通过媒体查询切换为上下布局（flex-direction: column）

### 2. 富文本编辑器

- 使用 `@vueup/vue-quill`（Vue 3 官方推荐的 Quill 封装）
- 通过 `v-model:content` 实现双向数据绑定
- 提供完整的工具栏配置，包括：
  - 标题（H1-H6）
  - 文字样式（粗体、斜体、下划线、删除线）
  - 颜色/背景色
  - 字体/字号
  - 有序/无序列表
  - 缩进、对齐
  - 引用、代码块
  - 上标/下标
  - 链接、图片、视频
- 编辑器高度自适应，填满左侧面板

### 3. 实时预览

- 使用 Vue 的 `v-html` 指令直接渲染 HTML 内容
- 内容通过 `shallowRef` 管理，避免深层响应式追踪开销
- Quill 的 `@update:content` 事件实现毫秒级同步
- 预览区样式覆盖所有标准 HTML 元素（标题、段落、列表、引用、代码块、表格、图片等）
- 空内容时显示友好的占位提示

### 4. 性能优化

- 使用 `shallowRef` 存储 HTML 内容，避免大文档时的深层响应式开销
- 编辑器实例通过 `ref` 引用，不进行响应式追踪
- SCSS 样式使用 `scoped` 限定作用域，避免样式污染

### 5. 响应式设计

| 断点 | 布局 |
|------|------|
| >768px | 左右双栏 |
| ≤768px | 上下单栏（各 50vh）|

## 运行方式

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 浏览器兼容性

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）
