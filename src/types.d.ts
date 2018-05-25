// type shim for nodejs' `require()` syntax
declare const require: (module: string) => any;

// fix lodash global issue. Keep in mind lodash is already imported on screeps.
import * as lodash from 'lodash';
declare global { 
  var _: typeof lodash
  // I tend to use creep memory with a role property
  interface CreepMemory { role: string }
}