import { defineConfig } from 'vite';
import * as path from 'path';
import dts from 'vite-plugin-dts';
import eslintPlugin from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    eslintPlugin({ include: './lib/**/*.{js,jsx,ts,tsx}' }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: 'actioncable-rewired',
      formats: ['es', 'umd'],
      fileName: (format) => `actioncable-rewired.${format}.js`,
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
