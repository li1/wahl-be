"use strict";

import "babel-polyfill";
import _ from "lodash";


import express from "express";
import * as dbConnector from "./dbConnector"


const app = express();

//Allow CORS for now.
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", async (req, res) => {
  // const { id } = req.params
  const { rows } = await dbConnector.query("SELECT * FROM bundeslaender ORDER BY id ASC")
  res.send(rows)
} );

const parteien = ["DIE LINKE", "Sozialdemokratische Partei Deutschlands", "Freie Demokratische Partei"];
const parteienIdents = ["Linke", "SPD", "FDP"] //_.map(parteien, partei => partei.split(' ').join(''));
const parteienZip = _.zipWith(parteien, parteienIdents, (p, i) => [p, i]);

const parteiergebnisseQuery = partei =>
"select distinct wke.wahlkreisid wahlkreis, wke.anz " + partei + " from parteien p, " +
"wahlkreiserststimmenergebnisse wke, kandidaten k, direktkandidaturen dk " + 
"where wke.kandidatid = k.id and wke.legislaturperiodeid = '2017' and k.parteiid = p.id " + 
"and p.name = $1 order by wahlkreis asc"


const group = (key, mapArr) => _.groupBy(mapArr, e => e[key]);
const mergeMapsByValueOfKey = (key, mapArr) => _.map(group(key, mapArr),  e => _.merge(...e));

app.get("/parteiergebnisse", async (req, res) => {
  const results = await Promise.all(parteienZip.map(partei => dbConnector.query(parteiergebnisseQuery(partei[1]), [partei[0]])))
  .then(r => r.map(qr => (qr.rows))) //get rows
  .then(r => _.flatten(r))
  .then(r => mergeMapsByValueOfKey("wahlkreis", r))

  res.send(results);
})

app.listen(3000, () => {
  console.log("App listening on port 3000!");
})