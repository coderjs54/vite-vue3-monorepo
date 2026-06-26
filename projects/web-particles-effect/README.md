# Web Particles Effect

基于 Vue 3 和原生 Canvas API 实现的全屏动态粒子星空背景效果。

## 功能特性

- **全屏覆盖** - 粒子效果完全覆盖浏览器视口
- **响应式设计** - 自动适应不同屏幕尺寸
- **HiDPI 支持** - 在高分屏上清晰渲染
- **粒子连线** - 近距离粒子之间自动连线
- **鼠标引力** - 粒子会受到鼠标位置的引力作用

## 粒子属性

- 随机大小（1-3px）
- 随机速度（0.2-0.8）
- 随机透明度（0.3-1.0）
- 自然漂浮运动（正弦/余弦漂移）

## 配置参数

在 `src/components/Particles.vue` 中可调整以下参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| maxConnectionDistance | number | 150 | 粒子最大连线距离（像素） |
| minParticleSize | number | 1 | 粒子最小尺寸（像素） |
| maxParticleSize | number | 3 | 粒子最大尺寸（像素） |
| minSpeed | number | 0.2 | 粒子最小速度 |
| maxSpeed | number | 0.8 | 粒子初始最大速度 |
| particleDensity | number | 8000 | 粒子密度（每像素²） |
| backgroundColor | string | '#0a0a1a' | 背景颜色 |
| gravityStrength | number | 0.08 | 鼠标引力强度系数 |
| gravityMaxDistance | number | 200 | 鼠标引力最大作用距离（像素） |
| maxSpeed | number | 2.5 | 粒子最大速度限制 |
| damping | number | 0.98 | 速度阻尼系数 |

## 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 技术栈

- Vue 3 (Composition API)
- Vite
- 原生 Canvas API
- TypeScript（可选）

## 实现原理

1. 使用 `requestAnimationFrame` 实现流畅动画
2. Canvas 尺寸根据 `window.innerWidth/innerHeight` 动态调整
3. 粒子连线使用平方距离比较优化性能
4. 鼠标引力采用距离反比公式，支持速度限制和阻尼效果