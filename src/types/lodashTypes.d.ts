// fix lodash global issue. Keep in mind lodash is already imported on screeps.
import * as lodash from 'lodash';
declare global { 
  var _: typeof lodash
}