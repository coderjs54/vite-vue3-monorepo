<script setup>
import { ref } from 'vue'

const emit = defineEmits(['images-added'])

const isDragging = ref(false)
const fileInput = ref(null)

const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const handleDragOver = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files) {
    processFiles(Array.from(files))
  }
}

const handleClick = () => {
  fileInput.value?.click()
}

const handleFileChange = (e) => {
  const target = e.target
  const files = target.files
  if (files) {
    processFiles(Array.from(files))
    target.value = ''
  }
}

const processFiles = (files) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  const newImages = []
  
  imageFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      newImages.push({
        id: generateId(),
        url: e.target?.result,
        name: file.name
      })
      
      if (newImages.length === imageFiles.length) {
        emit('images-added', newImages)
      }
    }
    reader.readAsDataURL(file)
  })
}
</script>

<template>
  <div
    class="upload-area"
    :class="{ 'is-dragging': isDragging }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="handleClick"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="file-input"
      @change="handleFileChange"
    />
    <div class="upload-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    </div>
    <h3>点击或拖拽上传图片</h3>
    <p>支持 JPG、PNG、GIF 等格式，可多选</p>
  </div>
</template>

<style lang="scss" scoped>
@use '/src/style.scss' as *;

.upload-area {
  border: 1px dashed $border-light;
  border-radius: 8px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
  background: $bg-white;

  &:hover {
    border-color: $accent;
    background: $accent-light;
  }

  &.is-dragging {
    border-color: $accent;
    background: $accent-medium;
  }

  h3 {
    font-size: 14px;
    font-weight: 500;
    color: $text;
    margin-bottom: 6px;
  }

  p {
    font-size: 12px;
    color: $text-gray;
  }
}

.file-input {
  display: none;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  color: $accent;
  opacity: 0.7;

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>