import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import { emptyDir } from 'rollup-plugin-empty-dir';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: ['src/background.ts'],
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      emptyDir(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
      }),
      commonjs(),
    ],
  },
  {
    input: ['src/pages/run.ts', 'src/pages/edit.ts', 'src/pages/list.ts'],
    output: {
      dir: 'dist/pages',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
      }),
      commonjs(),
      nodeResolve(),
      copy({
        targets: [
          {
            src: ['src/pages/**/*.html'],
            dest: 'dist/pages',
          },
        ],
      }),
      nodeResolve(),
      copy({
        targets: [
          {
            src: ['src/manifest.json', 'src/content.js'],
            dest: 'dist',
          },
        ],
      }),
      postcss({
        plugins: [tailwindcss(), autoprefixer()],
        extract: 'style.css',
      }),
    ],
  },
];
