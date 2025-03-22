import path from 'path'

export default {
  root: './src',
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
}