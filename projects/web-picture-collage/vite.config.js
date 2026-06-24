import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createViteConfig } from '../../shared/viteConfig.js'

export default defineConfig({
  plugins: [vue()],
  ...createViteConfig('web-picture-collage')
})