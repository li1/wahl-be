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

const bodyParser = require('body-parser');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


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

//Eigenes Add-On: (Zweit)sieger nach Bundesland
//typ: "erst" || "zweit"
//platz: "sieger" || "zweiter"
app.get("/bundeslanderg/:typ/:platz", async (req, res) => {
  let query = "";
  if(req.params.typ === "erst") {
    if(req.params.platz === "sieger") {
      query = queries.erstSieger;
    } else {
      query = queries.erstFollower;
    }
  } else {
    if(req.params.platz === "sieger") {
      query = queries.zweitSieger;
    } else {
      query = queries.zweitFollower;
    }
  }
  
  const { rows } = await dbConnector.query(query);
  res.send(rows);
});

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

//Team-Aufgaben
//Frauen- & Männerquote - Kandidaten gesamt (/kg)
//Frauen- & Männerquote - Bundestag gesamt (/bg)
//Frauen- & Männerquote - Kandidaten Parteien (/kp)
//Frauen- & Männerquote - Bundestag Parteien (/bp)
app.get("/quote/:type", async (req, res) => {
  let query = "";
  if (req.params.type === "kg") {
    query = queries.kg
  } else if (req.params.type === "bg") {
    query = queries.bg
  } else if (req.params.type === "kp") {
    query = queries.kp
  } else {
    query = queries.bp
  }

  const { rows } = await dbConnector.query(query);
  res.send(rows);
})

//Teamaufgaben
//Altersverteilung - Kandidaten Parteien (/akp)
//Altersverteilung - Bundestag Parteien (/abp)
app.get("/age/:type", async (req, res) => {
  let query = "";
  if (req.params.type === "akp") {
    query = queries.akp
  } else {
    query = queries.abp
  }

  const { rows } = await dbConnector.query(query);
  res.send(rows);
})

//Wählen
app.get("/votingcode/:code", async(req, res) => {
  const { rows } = await dbConnector.query(queries.votingcode_wahlkreisid(req.params.code));
  let result = '{ "status" : "Not Ok", "WahlkreisID" : null }';
  if (rows.length > 0) {
    //code exists in the database
    result = '{ "status" : "OK", "WahlkreisID" :' +  rows[0]["wahlkreisid"] + '}';
  }
  res.send(result);
});

app.get("/wahlkreisdirektkandidaten/:wahlkreisid", async (req, res) => {
    const { rows } = await dbConnector.query(queries.wahlkreiskandidaten(req.params.wahlkreisid));
    res.send(rows);
})

app.get("/wahlkreisparteien/:wahlkreisid", async (req, res) => {
    const { rows } = await dbConnector.query(queries.wahlkreisparteien(req.params.wahlkreisid));
    res.send(rows);
})

app.post("/vote",  async (request, response) => {
  const { rows } = await  dbConnector.query(queries.votingcode_wahlkreisid(request.body.code));
  let wahlkreisid = rows[0]["wahlkreisid"];
  let result = '{ "status" : "error"}';
  console.log("starting vote (this may take a while)...");
  if (rows.length > 0) {
    //code exists in the database -> TODO: we should lock this code here
    //validate if votes are ok
    if (request.body.ErststimmenAuswahl.length === 1) {
       await  dbConnector.query(queries.erstimmen_vote(request.body.ErststimmenAuswahl[0]));
    } else {
        await  dbConnector.query(queries.erstimmen_vote_ungueltig(wahlkreisid));
    }
    if (request.body.ZweitstimmenAuswahl.length === 1) {
        await  dbConnector.query(queries.zweitstimmen_vote(request.body.ZweitstimmenAuswahl[0], wahlkreisid));
    } else {
        await  dbConnector.query(queries.zweitstimmen_vote_ungueltig(wahlkreisid));
    }
    //TODO: Delete code from database -> request.body.code
    result = '{ "status" : "OK"}';
  }
  console.log("vote received.");
  response.send(result);
});


app.listen(3000, () => {
  console.log("App listening on port 3000!");
})

module.exports = app;
