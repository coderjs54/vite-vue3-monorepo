# Vue3 Monorepo

一个基于 Vue 3 + Vite 的 monorepo 仓库，用于管理多个独立的 Web 前端项目。采用 pnpm workspaces 进行依赖管理，支持统一构建和部署。

### 访问地址

| 项目 | 地址 |
|------|------|
| web-picture-collage | https://coderjs54.github.io/vite-vue3-monorepo/web-picture-collage/ |
| web-quill-editor | https://coderjs54.github.io/vite-vue3-monorepo/web-quill-editor/ |

## 目录结构

```
vite-vue3-monorepo/
├── projects/                 # 子项目目录
│   ├── web-picture-collage/  # 拼图工坊
│   └── web-quill-editor/     # 富文本编辑器
├── shared/                   # 共享配置
│   └── viteConfig.js         # Vite 共享配置
├── package.json              # 根依赖配置
├── pnpm-workspace.yaml       # pnpm 工作区配置
└── README.md                 # 本文件
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5 | UI 框架 |
| Vite | ^8.1 | 构建工具 |
| pnpm | ^10.34 | 包管理器 |
| SCSS | ^1.101 | CSS 预处理器 |
| @vitejs/plugin-vue | ^6.0 | Vue 插件 |

## 子项目列表

| 项目名称 | 功能简介 | 文档链接 |
|----------|----------|----------|
| [web-picture-collage](projects/web-picture-collage/README.md) | 自由画布拼图工具，支持图片上传、拖拽、缩放、旋转、文字添加等功能 | [查看详情](projects/web-picture-collage/README.md) |
| [web-quill-editor](projects/web-quill-editor/README.md) | 双栏布局富文本编辑器，左侧编辑区，右侧实时预览区 | [查看详情](projects/web-quill-editor/README.md) |

## 安装与构建

### 环境要求

- Node.js >= 20
- pnpm >= 10

### 安装依赖

```bash
# 安装所有子项目依赖
pnpm install
```

### 构建所有项目

```bash
# 构建 web-picture-collage
pnpm build:web-picture-collage

# 构建 web-quill-editor
pnpm build:web-quill-editor
```

### 并行构建（推荐）

```bash
# 使用 pnpm 并行构建所有项目
pnpm --filter web-picture-collage build & pnpm --filter web-quill-editor build
```

## 开发环境

### 启动开发服务器

```bash
# 启动 web-picture-collage 开发服务器
pnpm dev:web-picture-collage

# 启动 web-quill-editor 开发服务器
pnpm --filter web-quill-editor dev
```

### 开发配置

开发环境下，Vite 的 `base` 路径为 `/${projectName}/`，生产环境下为 `/vite-vue3-monorepo/${projectName}/`。

## 测试与部署

### 预览生产版本

```bash
# 预览 web-picture-collage
pnpm preview:web-picture-collage

# 预览 web-quill-editor
pnpm --filter web-quill-editor preview
```

### GitHub Pages 部署

项目已配置 GitHub Actions 自动部署，推送代码到 `main` 分支后会自动构建并部署到 GitHub Pages。

**访问地址**：

- web-picture-collage: `https://<username>.github.io/vite-vue3-monorepo/web-picture-collage/`
- web-quill-editor: `https://<username>.github.io/vite-vue3-monorepo/web-quill-editor/`

**部署配置**：

- 工作流文件：`.github/workflows/deploy-pages.yml`
- 构建产物目录：`projects/<project>/dist/`
- 部署目标：GitHub Pages（子路径模式）

## 贡献指南

### 代码风格

- 使用 Vue 3 `<script setup>` 语法
- 变量命名使用 camelCase
- 组件命名使用 PascalCase
- 代码缩进使用 2 个空格
- 使用 SCSS 进行样式编写

### 提交规范

```
<type>(<scope>): <description>

<body>

<footer>
```

**type 类型**：

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

### 开发流程

1. Fork 仓库
2. 创建特性分支：`git checkout -b feat/<feature-name>`
3. 提交代码：`git commit -m "feat(web-picture-collage): 添加功能"`
4. 推送到远程：`git push origin feat/<feature-name>`
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。