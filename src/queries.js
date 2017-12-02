export const bundestagsmitglieder = "with Bundestagsmitglieder (partei, bundesland, direktkandidat, listenplatz, vorname, nachname, geschlecht, geburtsjahr, beruf) AS " +
    "( " +
    "select p.name, coalesce(w.bundeslandid, ll.bundeslandid), case when dk.kandidatid is null then 'nein' else 'ja' end, l.platz, k.vorname, k.nachname, k.geschlecht, k.geburtsjahr, k.beruf " +
    "from abgeordnete a, parteien p, kandidaten k " +
    "left outer join listenplaetze l on k.id = l.kandidatid  " +
    "left outer join landeslisten ll on ll.id = l.landeslisteid " +
    "left outer join direktkandidaturen dk on k.id = dk.kandidatid " +
    "left outer join wahlkreise w on w.id = dk.wahlkreisid " +
    "where a.legislaturperiodeid = 2017  " +
    "and a.parteiid = p.id  " +
    "and k.id = a.kandidatid  " +
    ") " +
    "select partei, b.name as Bundesland, direktkandidat as Direktkandidatur, listenplatz, vorname, nachname, geschlecht, geburtsjahr  " +
    "from bundestagsmitglieder bm, bundeslaender b " +
    "where bm.bundesland = b.id;";

export const zweitstimmensieger =
['with maxproB (bid, m) as (',
'select bundeslandid, max(zweitstimmen) from bundeslaendergebnisse',
'where legislaturperiodeid = 2017 ',
'group by bundeslandid )',
'',
'select bb.name as land, p.name as partei',
'from maxproB m, bundeslaendergebnisse b, bundeslaender bb, parteien p',
'where m.m = b.zweitstimmen',
'and b.bundeslandid = bb.id',
'and b.parteiid = p.id',
'and m.bid = b.bundeslandid'].join('\n');

export const zweitstimmenFollower =
['with zweiterproBland (bid, zw) as (',
'    select b1.bundeslandid, b1.zweitstimmen from bundeslandergebnisse b1',
'    where b1.legislaturperiodeid = 2017',
'    and 1 = (select count(*) from bundeslandergebnisse b2',
'                        where b2.legislaturperiodeid = 2017',
'                        and b2.zweitstimmen > b1.zweitstimmen',
'                        and b1.bundeslandid = b2.bundeslandid)',
')',
'',
'select bb.name as land, p.name as partei',
'from zweiterproBland zw, bundeslandergebnisse b, bundeslaender bb, parteien p',
'where zw.zw = b.zweitstimmen',
'and b.bundeslandid = bb.id',
'and b.parteiid = p.id',
'and zw.bid = b.bundeslandid'].join('\n');

export const erststimmensieger =
['with maxproB (bid, m) as (',
'select bundeslandid, max(erststimmen) from bundeslandergebnisse',
'where legislaturperiodeid = 2017',
'group by bundeslandid )',
'',
'select bb.name as land, p.name as partei',
'from maxproB m, bundeslandergebnisse b, bundeslaender bb, parteien p',
'where m.m = b.erststimmen',
'and b.bundeslandid = bb.id',
'and b.parteiid = p.id',
'and m.bid = b.bundeslandid',
''].join('\n');

export const erststimmenFollower =
['with zweiterproBland (bid, zw) as (',
'    select b1.bundeslandid, b1.erststimmen from bundeslandergebnisse b1',
'    where b1.legislaturperiodeid = 2017',
'    and 1 = (select count(*) from bundeslandergebnisse b2',
'                        where b2.legislaturperiodeid = 2017',
'                        and b2.erststimmen > b1.erststimmen',
'                        and b1.bundeslandid = b2.bundeslandid)',
')',
'',
'select bb.name as land, p.name as partei',
'from zweiterproBland zw, bundeslandergebnisse b, bundeslaender bb, parteien p',
'where zw.zw = b.erststimmen',
'and b.bundeslandid = bb.id',
'and b.parteiid = p.id',
'and zw.bid = b.bundeslandid'].join('\n');

// select , anzahlwaehler 1.00 / anzahlwahlberechtigte,
// (select dk.kandidatid 
// from wahlkreiserststimmenergebnisse werst, direktkandidaturen dk
// where we.wahlkreisid = werst.wahlkreisid
// and we.legislaturperiodeid = werst.legislaturperiodeid and
// werst.wahlkreisid = dk.wahlkreisid and 
// werst.kandidatid = dk.kandidatid and
// not exists (select * 
//                from wahlkreiserststimmenergebnisse wersto
//                     where wersto.legislaturperiodeid = werst.legislaturperiodeid
//                     and wersto.wahlkreisid = werst.wahlkreisid
//                     and wersto.anz > werst.anz)) as sieger
// from wahlkreisergebnisse we, wahlkreisewaehlerwahlberechtigte www
// where we.legislaturperiodeid = www.legislaturperiodeid 
// and we.wahlkreisid = www.wahlkreisid

// [17:27]  
// die anfrage liefert die wahlkreisergebnisse
// [17:28]  
// und evtl den kandidaten dazu- joinen damit man an namen und so kommt
// [17:28]  
// und parei
// [17:28]  
// partei
// [17:28]  
// aber kann ich auch machen

