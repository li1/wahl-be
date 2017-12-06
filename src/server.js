"use strict";

import "babel-polyfill";
import _ from "lodash";


import express from "express";
import * as dbConnector from "./dbConnector"
import * as queries from "./queries";


const app = express();

//Allow CORS for now.
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.get("/", async (req, res) => {
//   // const { id } = req.params
//   const { rows } = await dbConnector.query("SELECT * FROM bundeslaender ORDER BY id ASC")
//   res.send(rows)
// } );

// const parteien = ["DIE LINKE", "Sozialdemokratische Partei Deutschlands", "Freie Demokratische Partei"];
// const parteienIdents = ["Linke", "SPD", "FDP"] //_.map(parteien, partei => partei.split(' ').join(''));
// const parteienZip = _.zipWith(parteien, parteienIdents, (p, i) => [p, i]);

// const parteiergebnisseQuery = partei =>
// "select distinct wke.wahlkreisid wahlkreis, wke.anz " + partei + " from parteien p, " +
// "wahlkreiserststimmenergebnisse wke, kandidaten k, direktkandidaturen dk " + 
// "where wke.kandidatid = k.id and wke.legislaturperiodeid = '2017' and k.parteiid = p.id " + 
// "and p.name = $1 order by wahlkreis asc"


// const group = (key, mapArr) => _.groupBy(mapArr, e => e[key]);
// const mergeMapsByValueOfKey = (key, mapArr) => _.map(group(key, mapArr),  e => _.merge(...e));

// app.get("/parteiergebnisse", async (req, res) => {
//   const results = await Promise.all(parteienZip.map(partei => dbConnector.query(parteiergebnisseQuery(partei[1]), [partei[0]])))
//   .then(r => r.map(qr => (qr.rows))) //get rows
//   .then(r => _.flatten(r))
//   .then(r => mergeMapsByValueOfKey("wahlkreis", r))

//   res.send(results);
// });

const sitzverteilung = "select p.name as partei, sitze from SitzverteilungBundestagParteien sbp, parteien p " +
  "where legislaturperiodeid = '2017' and p.id = sbp.parteiid";

//Q1
app.get("/sitzverteilung", async (req, res) => {
  const { rows } = await dbConnector.query(sitzverteilung);
  res.send(rows);
})

//Q2
app.get("/bundestagsmitglieder", async (req, res) => {
  const { rows } = await dbConnector.query(queries.bundestagsmitglieder);
  res.send(rows);
})

//Q3.1, Q3.2, Q4 
app.get("/wahlkreisuebersicht/:jahr", async (req, res) => {
  const { rows } = await dbConnector.query(queries.wahlkreisuebersicht(req.params.jahr));
  res.send(rows);
})

//Q3.3, Q3.4 (Wahlkreis optional für Gesamtabfrage)
app.get("/wahlkreisdetails/:jahr/:wahlkreis", async (req, res) => {
  const { rows } = await dbConnector.query(queries.wahlkreisdetails(req.params.jahr, req.params.wahlkreis));
  res.send(rows);
})

//Q5
app.get("/ueberhangmandate/:jahr", async (req, res) => {
  const { rows } = await dbConnector.query(queries.ueberhangmandate(req.params.jahr));
  res.send(rows);
})

//Q6
app.get("/knappste/", async (req, res) => {
  const { rows } = await dbConnector.query(queries.knappsteSiegerVerlierer);
  res.send(rows);
})

//Eigene Abfrage
app.get("/umgewichtung", async (req, res) => {
  const { rows } = await dbConnector.query(queries.umgewichtung);
  res.send(rows);
})

app.get("/umgewichtungPlot", async (req, res) => {
  const { rows } = await dbConnector.query(queries.umgewichtungPlot);
  res.send(rows);
})

//Add-On: (Zweit)sieger nach Bundesland
//typ: "erst" || "zweit"
//platz: "sieger" || "zweiter"
app.get("/bundeslanderg/:typ/:platz", async (req, res) => {
  const { rows } = await dbConnector.query(queries.bundeslanderg(req.params.typ, req.params.platz));
  res.send(rows);
})

app.listen(3000, () => {
  console.log("App listening on port 3000!");
})
