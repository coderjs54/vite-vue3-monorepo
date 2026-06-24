import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function createViteConfig(projectName) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const rootDir = path.resolve(__dirname, '../')
  
  return {
    base: process.env.NODE_ENV === 'production' ? `/vite-vue3-monorepo/${projectName}/` : `/${projectName}/`,
    // 将缓存统一放到根目录
    cacheDir: path.resolve(rootDir, `node_modules/.vite-${projectName}`),
    
    // 其他共享配置
    resolve: {
      alias: {
        '@': path.resolve(rootDir, `projects/${projectName}/src`),
      }
    }
  }
}