'use strict';

const express = require('express');
const {getPath, handleDir, getFile, postFile, handleTerm} = require('./util.js');
const app = express();
const port = 8080;

app.use(express.text());

app.get('/dir', (req, res) => res.send(handleDir(req)));

app.get('/file', (req, res) => res.send(getFile(req)));

app.post('/file', (req, res) => res.send(postFile(req, req.body)));

app.post('/term', async (req, res) => res.send(await handleTerm(req, req.body)));

app.get(/(.*)/, (req, res) => res.sendFile(getPath(req.url)));

app.listen(port);