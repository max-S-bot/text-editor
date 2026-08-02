'use strict';

import express from 'express';
import { getPath, handleDir, getFile, postFile, handleTerm } from './util.js';
const app = express();
const port = 8080;

app.use(express.text());

app.get('/dir', (req, res) => res.send(handleDir(req.get('path')!, req.get('id')!)));

app.get('/file', (req, res) => res.send(getFile(req.get('path')!)));

app.post('/file', (req, res) => res.send(postFile(req.get('path')!, req.body)));

app.post('/term', async (req, res) => res.send(await handleTerm(req.get('id')!, req.body)));

app.get(/(.*)/, (req, res) => res.sendFile(getPath(req.url)));

app.listen(port);