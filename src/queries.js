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


const maxproB = typ => [
  'with ergproB (bid, m) as (',
  'select bundeslandid, max(' + typ + ') from bundeslaendergebnisse',
  'where legislaturperiodeid = 2017 ',
  'group by bundeslandid )'].join('\n');

const secproB = typ => {
  return (
    [ 'with ergproB (bid, m) as (',
      '    select b1.bundeslandid, b1.' + typ + ' from bundeslandergebnisse b1',
      '    where b1.legislaturperiodeid = 2017',
      '    and 1 = (select count(*) from bundeslandergebnisse b2',
      '                        where b2.legislaturperiodeid = 2017',
      '                        and b2.' + typ + ' > b1.' + typ,
      '                        and b1.bundeslandid = b2.bundeslandid)',
      ')',
    ].join('\n')
  );
}

export const bundeslanderg = (typ, platz) => {
  const t = typ === "erst" ? "erststimmen" : "zweitstimmen";
  const head = (platz === "sieger" ? maxproB(t) : secproB(t));
  return (
    [ head,
    'select bb.name as land, p.name as partei',
    'from ergproB m, bundeslaendergebnisse b, bundeslaender bb, parteien p',
    'where m.m = b.' + t,
    'and b.bundeslandid = bb.id',
    'and b.parteiid = p.id',
    'and m.bid = b.bundeslandid'].join('\n')
  )
};


export const wahlkreisuebersicht = jahr => (
['with wahlkreisuebersicht (legislaturperiodeid,wahlkreisid, wahlbeteiligung, siegerid)as',
'',
'(select we.legislaturperiodeid, we.wahlkreisid, anzahlwaehler * 1.00 / anzahlwahlberechtigte,',
'(select dk.kandidatid',
'from wahlkreiserststimmenergebnisse werst, direktkandidaturen dk',
'where we.wahlkreisid = werst.wahlkreisid',
'and we.legislaturperiodeid = werst.legislaturperiodeid and',
'werst.wahlkreisid = dk.wahlkreisid and',
'werst.kandidatid = dk.kandidatid and',
'not exists (select *',
'               from wahlkreiserststimmenergebnisse wersto',
'                    where wersto.legislaturperiodeid = werst.legislaturperiodeid',
'                    and wersto.wahlkreisid = werst.wahlkreisid',
'                    and wersto.anz > werst.anz)) as sieger',
'',
'',
'from wahlkreisergebnisse we, wahlkreisewaehlerwahlberechtigte www',
'where we.legislaturperiodeid = www.legislaturperiodeid',
'and we.wahlkreisid = www.wahlkreisid),',
'',
'wahlkreisuebersicht_sieger_partei (Wahlkreis, "Wahlbeteiligung [in %]", "Direktkandidat-Sieger", "Direktkandidat-Partei", "Siegerpartei") as',
'(Select w.name, wue.wahlbeteiligung, k.nachname || \', \' || k.vorname, p2.name, p.name',
'from wahlkreisuebersicht wue, kandidaten k, wahlkreiszweitstimmenergebnisse wze, parteien p, wahlkreise w, parteien p2',
'where wue.siegerid = k.id',
'and wze.legislaturperiodeid = ' + jahr,
'and w.id = wue.wahlkreisid',
'and p.id = wze.parteiid',
'and p2.id = k.parteiid',
'and wze.legislaturperiodeid = wue.legislaturperiodeid',
'and wze.wahlkreisid = wue.wahlkreisid',
'and wze.anteil = (select max(wzea.anteil)',
'                       from wahlkreiszweitstimmenergebnisse wzea',
'                       where wzea.legislaturperiodeid = wze.legislaturperiodeid',
'                       and wzea.wahlkreisid = wze.wahlkreisid))',
'',
'select b.name Bundesland, wsp.* from wahlkreisuebersicht_sieger_partei wsp, wahlkreise w, bundeslaender b',
'where w.name = wsp.wahlkreis and w.bundeslandid = b.id'].join('\n'));

const wahlkreisFilter = wahlkreis => ("where wahlkreis = '" + wahlkreis + "'");
export const wahlkreisdetails = (jahr, wahlkreis) => (
['    with wahlkreisparteiergebnisse (legislaturperiodeid, wahlkreisname, direktkandidat, anzerststimmen, anteilerst, anzzweitstimmen, anteilzweit, parteiid) as ',
'',
'    (select we.legislaturperiodeid, w.name,  k.nachname || \', \' || k.vorname, we.anz, we.anteil, wz.anz, wz.anteil, p.name',
'    from  Wahlkreiserststimmenergebnisse we, Wahlkreiszweitstimmenergebnisse wz, Kandidaten k, Wahlkreise w,  Parteien p',
'    where we.wahlkreisid = wz.wahlkreisid and',
'     w.id = we.wahlkreisid and',
'     p.id = wz.parteiid and',
'    we.kandidatid = k.id and',
'    k.parteiid = wz.parteiid and',
'    we.legislaturperiodeid = wz.legislaturperiodeid and',
'    we.legislaturperiodeid = 2017',
'    UNION ',
'    select wz.legislaturperiodeid, w.name,  \'n.a.\',null, null, wz.anz, wz.anteil, p.name',
'    from  Wahlkreiszweitstimmenergebnisse wz, Wahlkreise w,  Parteien p',
'    where w.id = wz.wahlkreisid and',
'     p.id = wz.parteiid and',
'    wz.legislaturperiodeid = 2013),',
'',
'    wahlkreisparteiergebnisse_vorperiodevergleich(wahlkreis, direktkandidat, Erststimmen, "Erststimmenanteil [in %]", Partei, Zweitstimmen, "Zweitstimmenanteil [in %]", "Vorjahresvergleich [in %]") as',
'    ( select w1.wahlkreisname, w1.direktkandidat, w1.anzerststimmen, w1.anteilerst, ',
'          w1.parteiid, w1.anzzweitstimmen, w1.anteilzweit, ',
'         CASE WHEN w1.legislaturperiodeid = 2013 THEN \'n.a.\' ',
'         ELSE \'\' || w1.anteilzweit - w2.anteilzweit END',
'     from wahlkreisparteiergebnisse w1 left outer join wahlkreisparteiergebnisse w2',
'     on w1.parteiid = w2.parteiid and w1.legislaturperiodeid <> w2.legislaturperiodeid and',
'     w1.wahlkreisname = w2.wahlkreisname ',
'     where w1.legislaturperiodeid = ' + jahr,
'    )',
'    select * from wahlkreisparteiergebnisse_vorperiodevergleich',
    wahlkreis && wahlkreisFilter(wahlkreis),
';'].join('\n'));


export const ueberhangmandate = jahr => (
['select bl.name Bundesland, p.name Partei,',
'    CASE WHEN  ble.Direktmandate < pzm.Mandate THEN 0 ELSE ble.Direktmandate - pzm.Mandate END AS "Überhangmandate"',
'from Bundeslaendergebnisse ble, ParteienZweitstimmenmandate pzm, Parteien p, Bundeslaender bl',
'where ble.legislaturperiodeid = pzm.legislaturperiode and',
'ble.parteiid = pzm.parteiid and',
'ble.bundeslandid = pzm.bundeslandid and',
'p.id = ble.parteiid and',
'ble.legislaturperiodeid = ' + jahr,
'and bl.id = ble.bundeslandid'].join('\n'));


export const knappsteSiegerVerlierer = 
['With ErsterZweiter (legislaturperiodeid, wahlkreisid, kandidatid, anz, anteil, platz) as',
'(',
'    select legislaturperiodeid, wahlkreisid, kandidatid, anz, anteil, ROW_Id',
'    from (SELECT *, ROW_NUMBER() OVER (PARTITION BY legislaturperiodeid, wahlkreisid order by anz desc)',
'         AS ROW_ID FROM wahlkreiserststimmenergebnisse where legislaturperiodeid = 2017) A',
'    WHERE ROW_ID < 3',
'),',
'',
'GewinnerVorsprung (legislaturperiodeid, wahlkreis, kandidat, partei, prozentualerVOrsprung, anteil, parteiid, wahlkreisid) as',
'(',
'    select e.legislaturperiodeid, w.name , k.nachname || \', \' || k.vorname, p.name, e.anteil - z.anteil, e.anteil, p.id, w.id',
'    from ErsterZweiter e, ErsterZweiter z, wahlkreise w, kandidaten k, Parteien p',
'    Where e.legislaturperiodeid = z.legislaturperiodeid ',
'    and e.wahlkreisid = z.wahlkreisid ',
'    and e.platz < z.platz',
'    and w.id = e.wahlkreisid',
'    and k.id = e.kandidatid',
'    and p.id = k.parteiid',
'    ),',
'knappsteGewinner (legislaturperiodeid, wahlkreis, kandidat, partei, prozentualervorsprung) as',
'( select * ',
'    from (SELECT *, ROW_NUMBER() OVER (PARTITION BY legislaturperiodeid, partei order by prozentualervorsprung asc)',
'         AS ROW_ID FROM GewinnerVorsprung) A',
'    WHERE ROW_ID < 11',
'),',
'--parteien die nicht drin vorkommen',
'verliererParteien (parteiid) as',
'(',
'    select p.id',
'    from parteien p',
'    where p.name not in (select partei from knappsteGewinner)',
'),',
' knappsteVerlierer (legislaturperiodeid, wahlkreis, kandidat, partei, abstand ) as',
'(select werst.legislaturperiodeid, w.name, k.nachname || \', \' || k.vorname as kandidat, p.name, gv.anteil - werst.anteil as abstand',
'from verliererParteien, direktkandidaturen dk, kandidaten k, ',
'        GewinnerVorsprung gv, wahlkreiserststimmenergebnisse werst,',
'        wahlkreise w, parteien p',
'where dk.kandidatid = k.id ',
'and k.parteiid = verliererParteien.parteiid ',
'and gv.wahlkreisid = dk.wahlkreisid ',
'and dk.legislaturperiodeid = gv.legislaturperiodeid',
'and werst.legislaturperiodeid = gv.legislaturperiodeid',
'and werst.wahlkreisid = dk.wahlkreisid ',
'and werst.kandidatid = k.id ',
'and w.id = werst.wahlkreisid',
'and p.id = k.parteiid ',
'and p.id <> 43',
'order by abstand asc),',
'knappsteVerlierer_10 (legislaturperiodeid, wahlkreis, kandidat, partei, abstand ) as',
'(select * ',
'    from (SELECT *, ROW_NUMBER() OVER (PARTITION BY legislaturperiodeid, partei order by abstand asc)',
'         AS ROW_ID FROM knappsteVerlierer) A',
'    WHERE ROW_ID < 11',
'), gewinnerUndVerlierer ( legislaturperiodeid, wahlkreis, kandidat, partei, "abstand [in %]", gewinner) as',
'(select legislaturperiodeid, wahlkreis, kandidat, partei, abstand, false as gewinner  from knappsteVerlierer_10',
'union ',
'select legislaturperiodeid, wahlkreis, kandidat, partei, prozentualerVOrsprung, true as gewinner from GewinnerVorsprung',
' )',
' select * from gewinnerUndVerlierer'].join('\n'); 

export const umgewichtungPlot = 
['-- Vergleich von Zweitstimmenergebnis: regulär vs. falschwähler',
'with wahlkreis_falschwaehleranteil (wahlkreisid, falschwaehleranteil) as (',
'  select wahlkreisid, (ungueltigezweitstimmen * 1.0 / waehler)',
'  from wahlkreisergebnisse',
'  where legislaturperiodeid = 2017)',
'',
'select p.name, wf.*, wze.anteil from wahlkreis_falschwaehleranteil wf, wahlkreiszweitstimmenergebnisse wze, parteien p',
'where wze.legislaturperiodeid = 2017 and',
'wze.wahlkreisid = wf.wahlkreisid and',
'wze.parteiid = p.id',
'order by p.id, wahlkreisid asc'].join('\n');

export const umgewichtung =
['-- Vergleich von Zweitstimmenergebnis: regulär vs. mit Falschwählern gewichtet   ',
'with wahlkreis_falschwaehleranteil (wahlkreisid, falschwaehleranteil) as (',
'  select wahlkreisid, (ungueltigezweitstimmen * 1.0 / waehler)',
'  from wahlkreisergebnisse',
'  where legislaturperiodeid = 2017),',
'',
'wahlkreis_gewichtete_anz (wahlkreisid, parteiid, anz) as (',
'  select wze.wahlkreisid, parteiid, anz * falschwaehleranteil',
'  from wahlkreiszweitstimmenergebnisse wze, wahlkreis_falschwaehleranteil wf',
'  where legislaturperiodeid = 2017 and',
'  wze.wahlkreisid = wf.wahlkreisid',
'),',
'',
'regulaeres_summenergebnis (parteiid, anteil) as (',
'  select parteiid, sum(wze.anz) * 1.0 / (select sum(anz) from wahlkreiszweitstimmenergebnisse where legislaturperiodeid = 2017)',
'  from wahlkreiszweitstimmenergebnisse wze',
'  where legislaturperiodeid = 2017',
'  group by parteiid',
'),',
'',
'gewichtetes_summenergebnis (parteiid, anteil) as (',
'  select parteiid, sum(wga.anz) * 1.0 / (select sum(anz) from wahlkreis_gewichtete_anz)',
'  from wahlkreis_gewichtete_anz wga',
'  group by parteiid',
')',
'',
'select p.name, rs.anteil \"Regulärer Zweitstimmenanteil [in %]\", gs.anteil \"Gewichteter Zweitstimmenanteil [in %]\", gs.anteil - rs.anteil \"Veränderung [in %]\"',
'from gewichtetes_summenergebnis gs, regulaeres_summenergebnis rs, parteien p',
'where gs.parteiid = rs.parteiid',
'and p.id = gs.parteiid',
'order by \"Veränderung [in %]\" desc;'].join('\n');
