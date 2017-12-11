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


//Q1
app.get("/sitzverteilung", async (req, res) => {
  const { rows } = await dbConnector.query(queries.sitzverteilung);
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
app.get("/knappste", async (req, res) => {
  const { rows } = await dbConnector.query(queries.knappsteSiegerVerlierer);
  res.send(rows);
})

//Abfrage Frauen- & Männerquote - Bundestag gesamt
app.get("/bundestagQuote", async (req, res) => {
  const { rows } = await dbConnector.query(queries.bundestagQuote);
  res.send(rows);
})

//Abfrage Frauen- & Männerquote - Bundestag Parteiebene
app.get("/bundestagParteienQuote", async (req, res) => {
  const { rows } = await dbConnector.query(queries.bundestagParteienQuote);
  res.send(rows);
})

//Abfrage Altersstufen - Bundestag gesamt
app.get("/bundestagAlter", async (req, res) => {
  const { rows } = await dbConnector.query(queries.bundestagAlter);
  res.send(rows);
})

//Abfrage Altersstufen - Bundestag Parteiebene
app.get("/bundestagParteienAlter", async (req, res) => {
  const { rows } = await dbConnector.query(queries.bundestagParteienAlter);
  res.send(rows);
})

//Abfrage Frauen- & Männerquote nach Altersstufen - Bundestag gesamt
app.get("/bundestagAlterQuote", async (req, res) => {
  const { rows } = await dbConnector.query(queries.bundestagAlterQuote);
  res.send(rows);
})

//Eigene Abfrage
app.get("/umgewichtung", async (req, res) => {
  const { rows } = await dbConnector.query(queries.umgewichtung);
  res.send(rows);
})

//Add-On: Umgewichtungsplot
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

app.get("/wahlkreisdirektkandidaten/:wahlkreisid", async (req, res) => {
    const { rows } = await dbConnector.query(queries.wahlkreiskandidaten(req.params.wahlkreisid));
    res.send(rows);
})

app.get("/wahlkreisparteien/:wahlkreisid", async (req, res) => {
    const { rows } = await dbConnector.query(queries.wahlkreisparteien(req.params.wahlkreisid));
    res.send(rows);
})

app.listen(3000, () => {
  console.log("App listening on port 3000!");
})

module.exports = app;
