/**
 * 可拖拽调整左右面板大小的 Composable
 *
 * @description
 * 封装双栏布局中分隔线拖拽调整面板宽度的核心逻辑，支持鼠标和触摸事件。
 * 提供响应式的面板样式和拖拽状态，适用于任何需要可调整大小的双栏布局场景。
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue'
 * import { useResizablePanels } from '@/composables/useResizablePanels'
 *
 * const containerRef = ref(null)
 *
 * const {
 *   leftPercent,
 *   leftPanelStyle,
 *   rightPanelStyle,
 *   isDragging,
 *   onDividerMouseDown,
 *   onDividerTouchStart
 * } = useResizablePanels({
 *   containerRef,
 *   initialPercent: 50,  // 初始左侧宽度百分比
 *   minPercent: 20,      // 最小宽度百分比
 *   maxPercent: 80       // 最大宽度百分比
 * })
 * </script>
 *
 * <template>
 *   <div ref="containerRef" class="container">
 *     <div :style="leftPanelStyle">左侧面板</div>
 *     <div @mousedown="onDividerMouseDown" @touchstart="onDividerTouchStart">分隔线</div>
 *     <div :style="rightPanelStyle">右侧面板</div>
 *   </div>
 * </template>
 * ```
 *
 * @param {Object} options - 配置选项
 * @param {Ref<HTMLElement>} options.containerRef - 容器根元素的 ref 引用
 * @param {number} [options.initialPercent=50] - 初始左侧面板宽度百分比（0-100）
 * @param {number} [options.minPercent=20] - 左侧面板最小宽度百分比（0-100）
 * @param {number} [options.maxPercent=80] - 左侧面板最大宽度百分比（0-100）
 * @param {number} [options.dividerWidth=1] - 分隔线视觉宽度（px），用于计算偏移补偿
 * @param {boolean} [options.enableOnMobile=false] - 是否在移动端（≤768px）启用拖拽
 *
 * @returns {Object} 返回可用的响应式状态和方法
 * @returns {Ref<number>} leftPercent - 左侧面板当前宽度百分比
 * @returns {ComputedRef<Object>} leftPanelStyle - 左侧面板样式对象 { width, flex }
 * @returns {ComputedRef<Object>} rightPanelStyle - 右侧面板样式对象 { width, flex }
 * @returns {Ref<boolean>} isDragging - 是否正在拖拽中
 * @returns {Function} onDividerMouseDown - 鼠标拖拽开始处理函数
 * @returns {Function} onDividerTouchStart - 触摸拖拽开始处理函数
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useResizablePanels(options = {}) {
  const {
    containerRef,
    initialPercent = 50,
    minPercent = 20,
    maxPercent = 80,
    dividerWidth = 1,
    enableOnMobile = false
  } = options

  // ============================================
  // 状态管理
  // ============================================

  /** 左侧面板宽度百分比 */
  const leftPercent = ref(initialPercent)

  /** 是否正在拖拽中 */
  const isDragging = ref(false)

  // ============================================
  // 计算属性
  // ============================================

  /**
   * 左侧面板样式
   * 使用 flex: none 固定宽度，避免 flex 自动分配
   */
  const leftPanelStyle = computed(() => ({
    width: `${leftPercent.value}%`,
    flex: 'none'
  }))

  /**
   * 右侧面板样式
   * 宽度为剩余空间百分比
   */
  const rightPanelStyle = computed(() => ({
    width: `${100 - leftPercent.value}%`,
    flex: 'none'
  }))

  // ============================================
  // 核心逻辑
  // ============================================

  /**
   * 计算拖拽后左侧面板宽度百分比
   *
   * @param {number} clientX - 鼠标/触摸点的 X 坐标
   * @returns {number} 计算后的百分比（已限制在 minPercent 和 maxPercent 之间）
   */
  function calcLeftPercent(clientX) {
    if (!containerRef.value) return leftPercent.value

    const rect = containerRef.value.getBoundingClientRect()
    const containerWidth = rect.width

    // 拖拽位置相对于容器左边界的偏移（减去分隔线一半宽度以保持对齐）
    const offsetX = clientX - rect.left - dividerWidth / 2

    // 转换为百分比
    let percent = (offsetX / containerWidth) * 100

    // 限制最小/最大宽度
    percent = Math.max(minPercent, Math.min(maxPercent, percent))

    return percent
  }

  /**
   * 拖拽鼠标/手指移动处理
   *
   * @param {number} clientX - 鼠标/触摸点的 X 坐标
   */
  function onMove(clientX) {
    if (!isDragging.value) return
    leftPercent.value = calcLeftPercent(clientX)
  }

  /**
   * 结束拖拽
   * 重置拖拽状态和全局样式
   */
  function onEnd() {
    if (!isDragging.value) return
    isDragging.value = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  /**
   * 鼠标拖拽开始（桌面端）
   *
   * @param {MouseEvent} e - 鼠标事件对象
   */
  function onDividerMouseDown(e) {
    // 移动端上下布局时禁用拖拽（除非显式启用）
    if (!enableOnMobile && window.innerWidth <= 768) return

    isDragging.value = true
    leftPercent.value = calcLeftPercent(e.clientX)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  /**
   * 触摸拖拽开始（移动端）
   *
   * @param {TouchEvent} e - 触摸事件对象
   */
  function onDividerTouchStart(e) {
    if (!enableOnMobile && window.innerWidth <= 768) return
    const touch = e.touches[0]
    if (!touch) return

    isDragging.value = true
    leftPercent.value = calcLeftPercent(touch.clientX)
  }

  // ============================================
  // 全局事件监听
  // ============================================

  /**
   * 全局事件监听函数（保存引用以便解绑）
   */
  const handlers = {
    onMouseMove(e) { onMove(e.clientX) },
    onMouseUp: onEnd,
    onTouchMove(e) {
      if (!isDragging.value) return
      const touch = e.touches[0]
      if (touch) onMove(touch.clientX)
    },
    onTouchEnd: onEnd
  }

  onMounted(() => {
    document.addEventListener('mousemove', handlers.onMouseMove)
    document.addEventListener('mouseup', handlers.onMouseUp)
    document.addEventListener('touchmove', handlers.onTouchMove, { passive: true })
    document.addEventListener('touchend', handlers.onTouchEnd)
  })

  onUnmounted(() => {
    document.removeEventListener('mousemove', handlers.onMouseMove)
    document.removeEventListener('mouseup', handlers.onMouseUp)
    document.removeEventListener('touchmove', handlers.onTouchMove)
    document.removeEventListener('touchend', handlers.onTouchEnd)
  })

  // ============================================
  // 返回公共接口
  // ============================================

  return {
    leftPercent,
    leftPanelStyle,
    rightPanelStyle,
    isDragging,
    onDividerMouseDown,
    onDividerTouchStart
  }
}