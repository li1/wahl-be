export const sitzverteilung = "select p.name as partei, sitze::real from SitzverteilungBundestagParteien sbp, parteien p " +
  "where legislaturperiodeid = '2017' and p.id = sbp.parteiid";

export const bundestagsmitglieder = "with Bundestagsmitglieder (partei, bundesland, direktkandidat, listenplatz, vorname, nachname, geschlecht, geburtsjahr, beruf) AS " +
    "( " +
    "select p.name, coalesce(w.bundeslandid, ll.bundeslandid), case when dk.kandidatid is null then 'nein' else 'ja' end, l.platz, k.vorname, k.nachname, k.geschlecht, k.geburtsjahr, k.beruf " +
    "from abgeordnete a, parteien p, kandidaten k " +
    "left outer join listenplaetze l on k.id = l.kandidatid  " +
    "left outer join landeslisten ll on ll.id = l.landeslisteid " +
    "left outer join direktkandidaten dk on k.id = dk.kandidatid " +
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
  'select bundeslandid, max(' + typ + ') from bundeslaenderergebnisse',
  'where legislaturperiodeid = 2017 ',
  'group by bundeslandid )'].join('\n');

const secproB = typ => {
  return (
    [ 'with ergproB (bid, m) as (',
      '    select b1.bundeslandid, b1.' + typ + ' from bundeslaenderergebnisse b1',
      '    where b1.legislaturperiodeid = 2017',
      '    and 1 = (select count(*) from bundeslaenderergebnisse b2',
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
    'from ergproB m, bundeslaenderergebnisse b, bundeslaender bb, parteien p',
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
'from wahlkreiserststimmenergebnisse werst, direktkandidaten dk',
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

const wahlkreisFilter = wahlkreis => ("w.id = " + wahlkreis + " and");
export const wahlkreisdetails = (jahr, wahlkreis) => (
['    with wahlkreisparteiergebnisse (legislaturperiodeid, wahlkreisname, direktkandidat, anzerststimmen, anteilerst, anzzweitstimmen, anteilzweit, parteiid) as ',
'',
'    (select we.legislaturperiodeid, w.name,  k.nachname || \', \' || k.vorname, we.anz, we.anteil, wz.anz, wz.anteil, p.name',
'    from  Wahlkreiserststimmenergebnisse we, Wahlkreiszweitstimmenergebnisse wz, Kandidaten k, Wahlkreise w,  Parteien p',
'    where we.wahlkreisid = wz.wahlkreisid and',
  wahlkreis && wahlkreisFilter(wahlkreis),
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
';'].join('\n'));


export const ueberhangmandate = jahr => (
['select bl.name Bundesland, p.name Partei,',
'    CASE WHEN  ble.Direktmandate < pzm.Mandate THEN 0 ELSE ble.Direktmandate - pzm.Mandate END AS "Überhangmandate"',
'from Bundeslaenderergebnisse ble, ParteienZweitstimmenmandate pzm, Parteien p, Bundeslaender bl',
'where ble.legislaturperiodeid = pzm.legislaturperiodeid and',
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
'from verliererParteien, direktkandidaten dk, kandidaten k, ',
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

export const bundestagQuote = 
['with pmac (c) as (select count(*) from kandidaten),',
'pmmc (c) as (select count(*) from kandidaten where geschlecht = \'m\'),',
'pmwc (c) as (select count(*) from kandidaten where geschlecht = \'w\')',
'',
'select round(pmmc.c * 1.0 / pmac.c, 2) \"Männeranteil\", round(pmwc.c * 1.0 / pmac.c, 2) \"Frauenanteil\" ',
'from pmmc, pmwc, pmac;'].join('\n');

export const bundestagParteienQuote =
['-- Frauen- und Männerquote im Bundestag (auf Parteienebene)',
'with partei_mitglieder_alle (partei, anz) as (',
'    select bm.partei, count(*) ',
'    from bundestagsmitglieder bm',
'    group by bm.partei',
'),',
'',
'partei_mitglieder_m (partei, anz) as (',
'    select bm.partei, count(*) ',
'    from bundestagsmitglieder bm',
'    where bm.geschlecht = \'m\'',
'    group by bm.partei',
'),',
'',
'partei_mitglieder_w (partei, anz) as (',
'    select bm.partei, count(*) ',
'    from bundestagsmitglieder bm',
'    where bm.geschlecht = \'w\'',
'    group by bm.partei',
')',
'',
'select pmm.partei, round(pmm.anz * 100.0 / pma.anz, 2)::real \"Männeranteil\", round(pmw.anz * 100.0 / pma.anz, 2)::real \"Frauenanteil\"',
'from partei_mitglieder_alle pma, partei_mitglieder_m pmm, partei_mitglieder_w pmw',
'where pma.partei = pmm.partei and pmm.partei = pmw.partei'].join('\n');

export const bundestagParteienAlter =
['-- Altersgruppen im Bundestag (auf Parteienebene)',
'with partei_mitglieder_alle (partei, anz) as (',
'    select bm.partei, count(*) ',
'    from bundestagsmitglieder bm',
'    group by bm.partei',
'),',
'',
'partei_mitglieder_0_30 (partei, anz) as (',
'    select bm.partei, count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 30)',
'    group by bm.partei',
'),',
'',
'partei_mitglieder_31_40 (partei, anz) as (',
'    select bm.partei, count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 31)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 40)',
'    group by bm.partei',
'),',
'',
'partei_mitglieder_41_50 (partei, anz) as (',
'    select bm.partei, count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 41)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 50)',
'    group by bm.partei',
'),',
'',
'partei_mitglieder_51_60 (partei, anz) as (',
'    select bm.partei, count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 51)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 60)',
'    group by bm.partei',
'),',
'',
'partei_mitglieder_61_70 (partei, anz) as (',
'    select bm.partei, count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 61)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 70)',
'    group by bm.partei',
'),',
'',
'partei_mitglieder_71_up (partei, anz) as (',
'    select bm.partei, count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 71)',
'    group by bm.partei',
')',
'',
'select',
'    pma.partei,',
'    coalesce(round(partei_mitglieder_0_30.anz * 100.0 / pma.anz, 2), 0)::real \"< 30\",',
'    coalesce(round(partei_mitglieder_31_40.anz * 100.0 / pma.anz, 2), 0)::real \"31-40\",',
'    coalesce(round(partei_mitglieder_41_50.anz * 100.0 / pma.anz, 2), 0)::real \"41-50\",',
'    coalesce(round(partei_mitglieder_51_60.anz * 100.0 / pma.anz, 2), 0)::real \"51-60\",',
'    coalesce(round(partei_mitglieder_61_70.anz * 100.0 / pma.anz, 2), 0)::real \"61-70\",',
'    coalesce(round(partei_mitglieder_71_up.anz * 100.0 / pma.anz, 2), 0)::real \"> 70\"',
'from ',
'    partei_mitglieder_alle pma ',
'    full outer join partei_mitglieder_0_30 on pma.partei = partei_mitglieder_0_30.partei',
'    full outer join partei_mitglieder_31_40 on pma.partei = partei_mitglieder_31_40.partei',
'    full outer join partei_mitglieder_41_50 on pma.partei = partei_mitglieder_41_50.partei',
'    full outer join partei_mitglieder_51_60 on pma.partei = partei_mitglieder_51_60.partei',
'    full outer join partei_mitglieder_61_70 on pma.partei = partei_mitglieder_61_70.partei',
'    full outer join partei_mitglieder_71_up on pma.partei = partei_mitglieder_71_up.partei;'].join('\n');

export const bundestagAlter =
['-- Altersgruppen im Bundestag (parteiübergreifend)',
'with mitglieder_alle (anz) as (',
'    select count(*) from bundestagsmitglieder bm',
'),',
'',
'mitglieder_0_30 (anz) as (',
'    select count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 30)',
'),',
'',
'mitglieder_31_40 (anz) as (',
'    select count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 31)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 40)',
'),',
'',
'mitglieder_41_50 (anz) as (',
'    select count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 41)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 50)',
'),',
'',
'mitglieder_51_60 (anz) as (',
'    select count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 51)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 60)',
'),',
'',
'mitglieder_61_70 (anz) as (',
'    select count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 61)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 70)',
'),',
'',
'mitglieder_71_up (anz) as (',
'    select count(*) from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 71)',
')',
'',
'select',
'    round(mitglieder_0_30.anz * 100.0 / pma.anz, 2)::real \"< 30\", ',
'    round(mitglieder_31_40.anz * 100.0 / pma.anz, 2)::real \"31-40\",',
'    round(mitglieder_41_50.anz * 100.0 / pma.anz, 2)::real \"41-50\",',
'    round(mitglieder_51_60.anz * 100.0 / pma.anz, 2)::real \"51-60\",',
'    round(mitglieder_61_70.anz * 100.0 / pma.anz, 2)::real \"61-70\",',
'    round(mitglieder_71_up.anz * 100.0 / pma.anz, 2)::real \"> 70\"',
'from ',
'    mitglieder_alle pma,',
'    mitglieder_0_30,',
'    mitglieder_31_40,',
'    mitglieder_41_50,',
'    mitglieder_51_60,',
'    mitglieder_61_70,',
'    mitglieder_71_up;'].join('\n');

export const bundestagAlterQuote =
['-- Altersgruppen im Bundestag (auf Parteienebene)',
'with mitglieder_alle (anz) as (',
'    select count(*) from bundestagsmitglieder bm',
'),',
'',
'mitglieder_0_30 (anz, geschlecht) as (',
'    select count(*), bm.geschlecht from bundestagsmitglieder bm',
'    where bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 30)',
'    group by bm.geschlecht',
'),',
'',
'mitglieder_31_40 (anz, geschlecht) as (',
'    select count(*), bm.geschlecht from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 31)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 40)',
'    group by bm.geschlecht',
'),',
'',
'mitglieder_41_50 (anz, geschlecht) as (',
'    select count(*), bm.geschlecht from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 41)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 50)',
'    group by bm.geschlecht',
'),',
'',
'mitglieder_51_60 (anz, geschlecht) as (',
'    select count(*), bm.geschlecht from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 51)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 60)',
'    group by bm.geschlecht',
'),',
'',
'mitglieder_61_70 (anz, geschlecht) as (',
'    select count(*), bm.geschlecht from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 61)',
'    and bm.geburtsjahr >= (date_part(\'year\', CURRENT_DATE) - 70)',
'    group by bm.geschlecht',
'),',
'',
'mitglieder_71_up (anz, geschlecht) as (',
'    select count(*), bm.geschlecht from bundestagsmitglieder bm',
'    where bm.geburtsjahr <= (date_part(\'year\', CURRENT_DATE) - 71)',
'    group by bm.geschlecht',
')',
'',
'select',
'    mitglieder_0_30.geschlecht,',
'    round(mitglieder_0_30.anz * 100.0 / pma.anz, 2)::real \"< 30\", ',
'    round(mitglieder_31_40.anz * 100.0 / pma.anz, 2)::real \"31-40\",',
'    round(mitglieder_41_50.anz * 100.0 / pma.anz, 2)::real \"41-50\",',
'    round(mitglieder_51_60.anz * 100.0 / pma.anz, 2)::real \"51-60\",',
'    round(mitglieder_61_70.anz * 100.0 / pma.anz, 2)::real \"61-70\",',
'    round(mitglieder_71_up.anz * 100.0 / pma.anz, 2)::real \"> 70\"',
'from ',
'    mitglieder_alle pma,',
'    mitglieder_0_30,',
'    mitglieder_31_40,',
'    mitglieder_41_50,',
'    mitglieder_51_60,',
'    mitglieder_61_70,',
'    mitglieder_71_up',
'where',
'    mitglieder_0_30.geschlecht = mitglieder_31_40.geschlecht and',
'    mitglieder_31_40.geschlecht = mitglieder_41_50.geschlecht and',
'    mitglieder_41_50.geschlecht = mitglieder_51_60.geschlecht and',
'    mitglieder_51_60.geschlecht = mitglieder_61_70.geschlecht and',
'    mitglieder_61_70.geschlecht = mitglieder_71_up.geschlecht;'].join('\n');


export const wahlkreiskandidaten = (wahlkreisid) => (
    ['   select COALESCE(k.titel || \' \', \'\') || k.nachname || \', \' || k.vorname as Name, k.beruf, k.geburtsjahr, p.name Partei, k.id Kandidatid',
        '   from direktkandidaten dk, kandidaten k, parteien p',
        'where dk.kandidatid = k.id',
        'and dk.legislaturperiodeid=2017',
        'and dk.wahlkreisid = ' + wahlkreisid,
        ' and k.parteiid = p.id'].join('\n'));

export const wahlkreisparteien = (wahlkreisid) => (
    [' select p.name',
     ' from wahlkreiszweitstimmenergebnisse wz, parteien p',
        '   where wz.parteiid = p.id',
        ' and legislaturperiodeid = 2017',
        ' and wz.wahlkreisid =' + wahlkreisid].join('\n'));

export const votingcode_wahlkreisid = (votingcode) => (
    [
        'select wahlkreisid from stimmabgabencodes',
        'where code = \''  +  votingcode + '\''].join('\n'));


export const erstimmen_vote = (kandidatid) => (
    ['Insert into erststimmestimmzettel values (' + kandidatid + ')'
    ].join('\n'));

export const erstimmen_vote_ungueltig = (wahlkreisid) => (
    ['Insert into erststimmestimmzettelungueltig values (' + wahlkreisid + ')'
    ].join('\n'));

export const zweitstimmen_vote = (partei, wahlkreisid) => (
    ['insert into zweitstimmestimmzettel' ,
    'select p.id, ' + wahlkreisid ,
    'from parteien p ' ,
    'where p.name = \'' + partei + '\''
    ].join('\n'));

export const zweitstimmen_vote_ungueltig = (wahlkreisid) => (
    ['Insert into zweitstimmestimmzettelungueltig values (' + wahlkreisid + ')'
    ].join('\n'));

