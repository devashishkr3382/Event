require('./db/connect');
const express = require('express');
const app = express();
const Eventrouter = require('./Routers/EventRouter');

const port = process.env.PORT || 3000;
const util = require('util');

app.use(express.json());
app.use(Eventrouter);
app.listen(port,()=>{
console.warn("Server is Up on "+port);
});