var express = require('express');
var app = express();
app.use(express.static('./webviewer'));
app.listen(process.env['PORT'] || 3000);
