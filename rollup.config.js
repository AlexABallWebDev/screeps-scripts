import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
    name: 'screepsScripts',
    exports: 'named'
  },
  plugins: [
    resolve({
      jsnext: true,
      main: true
    }),
    commonjs()
  ]
};