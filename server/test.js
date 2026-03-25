const fs = require('fs');
try {
  require('./index.js');
} catch (e) {
  fs.writeFileSync('debug.txt', e.stack || e.message);
}
