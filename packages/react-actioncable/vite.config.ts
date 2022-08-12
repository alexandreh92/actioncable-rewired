import { defineConfig } from 'vite';
import * as path from 'path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    eslintPlugin({ include: './lib/**/*.{js,jsx,ts,tsx}' }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: 'react-actioncable',
      formats: ['es', 'umd'],
      fileName: (format) => `react-actioncable.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'actioncable'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          actioncable: 'Actioncable',
        },
      },
    },
  },
});
