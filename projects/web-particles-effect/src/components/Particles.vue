<template>
  <canvas
    ref="canvasRef"
    class="particles-canvas"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  />
  
  <!-- 效果模式选择器 -->
  <div class="effect-selector">
    <span class="selector-label">效果模式：</span>
    <button
      class="mode-btn"
      :class="{ active: effectMode === 'normal' }"
      @click="effectMode = 'normal'"
    >
      普通效果
    </button>
    <button
      class="mode-btn"
      :class="{ active: effectMode === 'gravity' }"
      @click="effectMode = 'gravity'"
    >
      引力效果
    </button>
    <button
      class="mode-btn"
      :class="{ active: effectMode === 'repulsion' }"
      @click="effectMode = 'repulsion'"
    >
      斥力效果
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Canvas 引用
const canvasRef = ref(null)
// 动画帧 ID
let animationId = null
// 粒子数组
let particles = []
// 画布上下文
let ctx = null
// 窗口resize防抖定时器
let resizeTimeout = null
// 鼠标当前位置
let mousePos = null
// 视口宽度（CSS像素）
let viewportWidth = 0
// 视口高度（CSS像素）
let viewportHeight = 0
// 当前效果模式：normal（普通）/ gravity（引力）/ repulsion（斥力）
const effectMode = ref('normal')

/**
 * 配置参数对象
 * 包含粒子系统的所有可调参数
 */
const config = {
  // 粒子最大连线距离（像素）
  maxConnectionDistance: 150,
  // 粒子最小尺寸（像素）
  minParticleSize: 1,
  // 粒子最大尺寸（像素）
  maxParticleSize: 3,
  // 粒子初始最小速度
  minSpeed: 0.2,
  // 粒子初始最大速度
  initialMaxSpeed: 0.8,
  // 粒子密度（每多少像素²一个粒子）
  particleDensity: 8000,
  // 背景颜色
  backgroundColor: '#0a0a1a',
  // 鼠标引力强度系数
  gravityStrength: 0.08,
  // 鼠标引力最大作用距离（像素）
  gravityMaxDistance: 200,
  // 粒子最大速度限制
  maxSpeed: 2.5,
  // 速度阻尼系数（用于平滑减速）
  damping: 0.98
}

/**
 * 粒子类
 * 负责单个粒子的初始化、更新和绘制
 */
class Particle {
  constructor() {
    // 初始化粒子属性
    this.reset()
    // 漂浮运动的相位（用于生成自然的漂移效果）
    this.phase = Math.random() * Math.PI * 2
    // 相位变化速度（影响漂浮频率）
    this.phaseSpeed = 0.01 + Math.random() * 0.02
  }

  /**
   * 重置粒子属性
   * 将粒子随机放置在画布上，并赋予随机的初始速度和透明度
   */
  reset() {
    this.x = Math.random() * viewportWidth
    this.y = Math.random() * viewportHeight
    this.size = config.minParticleSize + Math.random() * (config.maxParticleSize - config.minParticleSize)
    this.speedX = (Math.random() - 0.5) * (config.initialMaxSpeed - config.minSpeed) * 2
    this.speedY = (Math.random() - 0.5) * (config.initialMaxSpeed - config.minSpeed) * 2
    this.opacity = 0.3 + Math.random() * 0.7
    this.baseSpeedX = this.speedX
    this.baseSpeedY = this.speedY
  }

  /**
   * 更新粒子状态
   * 包含漂浮运动、引力计算、速度限制、边界检测等逻辑
   */
  update() {
    // 更新漂浮相位，生成自然的漂移效果
    this.phase += this.phaseSpeed
    const driftX = Math.sin(this.phase) * 0.5
    const driftY = Math.cos(this.phase) * 0.5
    
    // 如果当前是引力模式且鼠标在画布上，计算引力效果
    if (effectMode.value === 'gravity' && mousePos) {
      const dx = mousePos.x - this.x
      const dy = mousePos.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // 只对在引力作用范围内的粒子施加引力
      if (distance < config.gravityMaxDistance && distance > 0) {
        // 引力强度与距离成反比：距离越近，引力越强
        const force = (1 - distance / config.gravityMaxDistance) * config.gravityStrength
        this.speedX += (dx / distance) * force
        this.speedY += (dy / distance) * force
      }
    }
    
    // 如果当前是斥力模式且鼠标在画布上，计算斥力效果
    if (effectMode.value === 'repulsion' && mousePos) {
      const dx = mousePos.x - this.x
      const dy = mousePos.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // 只对在斥力作用范围内的粒子施加斥力
      if (distance < config.gravityMaxDistance && distance > 0) {
        // 斥力强度与距离成反比：距离越近，斥力越强
        const force = (1 - distance / config.gravityMaxDistance) * config.gravityStrength
        this.speedX -= (dx / distance) * force
        this.speedY -= (dy / distance) * force
      }
    }
    
    // 速度限制：防止粒子速度无限增加
    const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)
    if (speed > config.maxSpeed) {
      this.speedX = (this.speedX / speed) * config.maxSpeed
      this.speedY = (this.speedY / speed) * config.maxSpeed
    }
    
    // 应用阻尼：使粒子速度逐渐衰减，产生平滑的过渡效果
    this.speedX *= config.damping
    this.speedY *= config.damping
    
    // 更新粒子位置（基础速度 + 漂浮漂移）
    this.x += this.speedX + driftX
    this.y += this.speedY + driftY

    // 边界检测：粒子到达边界时反弹
    if (this.x < 0 || this.x > viewportWidth) {
      this.speedX *= -1
      this.x = Math.max(0, Math.min(viewportWidth, this.x))
    }
    if (this.y < 0 || this.y > viewportHeight) {
      this.speedY *= -1
      this.y = Math.max(0, Math.min(viewportHeight, this.y))
    }
  }

  /**
   * 绘制粒子
   * 在画布上绘制一个圆形粒子
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
    ctx.fill()
  }
}

/**
 * 初始化粒子系统
 * 根据视口大小和密度计算粒子数量，并创建粒子实例
 */
function initParticles() {
  particles = []
  const particleCount = Math.floor((viewportWidth * viewportHeight) / config.particleDensity)
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }
}

/**
 * 绘制粒子连线
 * 检测粒子之间的距离，对近距离粒子绘制连线
 * 使用平方距离比较优化性能（避免开方运算）
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 */
function drawConnections(ctx) {
  // 预计算最大距离的平方，避免在循环中重复计算
  const maxDistanceSquared = config.maxConnectionDistance * config.maxConnectionDistance
  
  // 双重循环检测粒子对，只检测 i < j 的组合避免重复
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distanceSquared = dx * dx + dy * dy
      
      // 使用平方距离提前剪枝，只有距离足够近的粒子才绘制连线
      if (distanceSquared <= maxDistanceSquared) {
        const distance = Math.sqrt(distanceSquared)
        // 连线透明度随距离增加而降低
        const opacity = (1 - distance / config.maxConnectionDistance) * 0.3
        
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }
    }
  }
}

/**
 * 动画循环函数
 * 使用 requestAnimationFrame 实现流畅的60fps动画
 */
function animate() {
  if (!ctx || !canvasRef.value) return
  
  // 清除画布并填充背景色
  ctx.fillStyle = config.backgroundColor
  ctx.fillRect(0, 0, viewportWidth, viewportHeight)

  // 更新并绘制每个粒子
  particles.forEach(particle => {
    particle.update()
    particle.draw(ctx)
  })

  // 绘制粒子连线
  drawConnections(ctx)
  
  // 继续下一帧动画
  animationId = requestAnimationFrame(animate)
}

/**
 * 处理窗口resize事件
 * 调整Canvas尺寸和粒子系统配置，确保响应式适配
 */
function handleResize() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const dpr = window.devicePixelRatio || 1
  viewportWidth = window.innerWidth
  viewportHeight = window.innerHeight
  
  // 设置Canvas实际像素尺寸（考虑DPR）
  canvas.width = viewportWidth * dpr
  canvas.height = viewportHeight * dpr
  
  // 获取上下文并设置缩放比例
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  
  // 设置Canvas CSS显示尺寸
  canvas.style.width = `${viewportWidth}px`
  canvas.style.height = `${viewportHeight}px`
  
  // 重新初始化粒子
  initParticles()
}

/**
 * 防抖处理的resize函数
 * 避免频繁resize事件导致性能问题
 */
function debouncedResize() {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(handleResize, 100)
}

/**
 * 处理鼠标移动事件
 * 记录鼠标在画布上的坐标位置
 * @param {MouseEvent} e - 鼠标事件对象
 */
function handleMouseMove(e) {
  mousePos = {
    x: e.clientX,
    y: e.clientY
  }
}

/**
 * 处理鼠标离开事件
 * 清除鼠标位置，停止引力效果
 */
function handleMouseLeave() {
  mousePos = null
}

/**
 * 组件挂载时初始化
 * 设置Canvas尺寸、初始化粒子、启动动画循环
 */
onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const dpr = window.devicePixelRatio || 1
  viewportWidth = window.innerWidth
  viewportHeight = window.innerHeight
  
  // 设置Canvas实际像素尺寸（考虑DPR）
  canvas.width = viewportWidth * dpr
  canvas.height = viewportHeight * dpr
  
  // 获取上下文并设置缩放比例
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  
  // 设置Canvas CSS显示尺寸
  canvas.style.width = `${viewportWidth}px`
  canvas.style.height = `${viewportHeight}px`
  
  // 初始化粒子系统
  initParticles()
  // 启动动画循环
  animate()
  
  // 添加窗口resize监听（带防抖）
  window.addEventListener('resize', debouncedResize)
})

/**
 * 组件卸载时清理
 * 停止动画循环、清除定时器、移除事件监听
 */
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  window.removeEventListener('resize', debouncedResize)
})
</script>

<style lang="scss" scoped>
.particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}

.effect-selector {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(10, 10, 26, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.selector-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.mode-btn {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }
  
  &.active {
    background: rgba(100, 200, 255, 0.3);
    border-color: rgba(100, 200, 255, 0.5);
    color: #fff;
  }
}
</style>