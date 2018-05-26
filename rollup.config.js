'use strict';

import clear from 'rollup-plugin-clear';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import screeps from 'rollup-plugin-screeps';

let cfg;
const dest = process.env.DEST;
if (!dest) {
  console.log('No destination specified - code will be compiled but not uploaded');
} else if ((cfg = require('./screeps')[dest]) == null) {
  throw new Error('Invalid upload destination');
}

// In Screeps, require works different and expects actual code
// This "plugin" merely prepends "module.exports = " to the source map so that it can be loaded in Screeps properly
function exportSourceMaps() {
  return {
    name: "export-source-maps",
    ongenerate: function(options, bundle) {
      let oldToString = bundle.map.toString;
      bundle.map.toString = function() {
        console.log("Adding module export to source map");
        return "module.exports = " + oldToString.apply(this, arguments);
      }
    }
  };
}

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
    sourcemap: true
  },

  plugins: [
    clear({ targets: ['dist'] }),
    resolve(),
    commonjs(),
    typescript({tsconfig: './tsconfig.json'}),
    screeps({config: cfg, dryRun: cfg == null}),
    exportSourceMaps()
  ]
};
