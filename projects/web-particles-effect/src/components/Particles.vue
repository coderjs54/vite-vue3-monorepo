<template>
  <canvas
    ref="canvasRef"
    class="particles-canvas"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let particles = []
let ctx = null
let resizeTimeout = null
let mousePos = null
let viewportWidth = 0
let viewportHeight = 0

const config = {
  maxConnectionDistance: 150,
  minParticleSize: 1,
  maxParticleSize: 3,
  minSpeed: 0.2,
  maxSpeed: 0.8,
  particleDensity: 8000,
  backgroundColor: '#0a0a1a',
  gravityStrength: 0.08,
  gravityMaxDistance: 200,
  maxSpeed: 2.5,
  damping: 0.98
}

class Particle {
  constructor() {
    this.reset()
    this.phase = Math.random() * Math.PI * 2
    this.phaseSpeed = 0.01 + Math.random() * 0.02
  }

  reset() {
    this.x = Math.random() * viewportWidth
    this.y = Math.random() * viewportHeight
    this.size = config.minParticleSize + Math.random() * (config.maxParticleSize - config.minParticleSize)
    this.speedX = (Math.random() - 0.5) * (config.maxSpeed - config.minSpeed) * 2
    this.speedY = (Math.random() - 0.5) * (config.maxSpeed - config.minSpeed) * 2
    this.opacity = 0.3 + Math.random() * 0.7
    this.baseSpeedX = this.speedX
    this.baseSpeedY = this.speedY
  }

  update() {
    this.phase += this.phaseSpeed
    const driftX = Math.sin(this.phase) * 0.5
    const driftY = Math.cos(this.phase) * 0.5
    
    if (mousePos) {
      const dx = mousePos.x - this.x
      const dy = mousePos.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < config.gravityMaxDistance && distance > 0) {
        const force = (1 - distance / config.gravityMaxDistance) * config.gravityStrength
        this.speedX += (dx / distance) * force
        this.speedY += (dy / distance) * force
      }
    }
    
    const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY)
    if (speed > config.maxSpeed) {
      this.speedX = (this.speedX / speed) * config.maxSpeed
      this.speedY = (this.speedY / speed) * config.maxSpeed
    }
    
    this.speedX *= config.damping
    this.speedY *= config.damping
    
    this.x += this.speedX + driftX
    this.y += this.speedY + driftY

    if (this.x < 0 || this.x > viewportWidth) {
      this.speedX *= -1
      this.x = Math.max(0, Math.min(viewportWidth, this.x))
    }
    if (this.y < 0 || this.y > viewportHeight) {
      this.speedY *= -1
      this.y = Math.max(0, Math.min(viewportHeight, this.y))
    }
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
    ctx.fill()
  }
}

function initParticles() {
  particles = []
  const particleCount = Math.floor((viewportWidth * viewportHeight) / config.particleDensity)
  
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }
}

function drawConnections(ctx) {
  const maxDistanceSquared = config.maxConnectionDistance * config.maxConnectionDistance
  
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const distanceSquared = dx * dx + dy * dy
      
      if (distanceSquared <= maxDistanceSquared) {
        const distance = Math.sqrt(distanceSquared)
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

function animate() {
  if (!ctx || !canvasRef.value) return
  
  ctx.fillStyle = config.backgroundColor
  ctx.fillRect(0, 0, viewportWidth, viewportHeight)

  particles.forEach(particle => {
    particle.update()
    particle.draw(ctx)
  })

  drawConnections(ctx)
  
  animationId = requestAnimationFrame(animate)
}

function handleResize() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const dpr = window.devicePixelRatio || 1
  viewportWidth = window.innerWidth
  viewportHeight = window.innerHeight
  
  canvas.width = viewportWidth * dpr
  canvas.height = viewportHeight * dpr
  
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  
  canvas.style.width = `${viewportWidth}px`
  canvas.style.height = `${viewportHeight}px`
  
  initParticles()
}

function debouncedResize() {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(handleResize, 100)
}

function handleMouseMove(e) {
  mousePos = {
    x: e.clientX,
    y: e.clientY
  }
}

function handleMouseLeave() {
  mousePos = null
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const dpr = window.devicePixelRatio || 1
  viewportWidth = window.innerWidth
  viewportHeight = window.innerHeight
  
  canvas.width = viewportWidth * dpr
  canvas.height = viewportHeight * dpr
  
  ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  
  canvas.style.width = `${viewportWidth}px`
  canvas.style.height = `${viewportHeight}px`
  
  initParticles()
  animate()
  
  window.addEventListener('resize', debouncedResize)
})

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
</style>