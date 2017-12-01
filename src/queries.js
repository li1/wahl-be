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
'and b.parteiid = p.id'].join('\n');


