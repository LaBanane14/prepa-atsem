export const DATES_NATIONALES = {
  inscription_debut: "24 mars 2026",
  inscription_fin: "29 avril 2026",
  depot_dossier: "7 mai 2026",
  epreuves_ecrites: "14 octobre 2026",
  resultats_admissibilite: "Fin novembre - décembre 2026",
  epreuves_orales: "Décembre 2026 - janvier 2027",
}

export const REGIONS = [
  {
    id: "idf",
    nom: "Île-de-France",
    concours_2026: true,
    note: "Organisation conjointe avec Centre-Val de Loire",
    cdg_organisateurs: [
      { nom: "CIG Petite Couronne", departements: ["Hauts-de-Seine (92)", "Seine-Saint-Denis (93)", "Val-de-Marne (94)"], site: "https://www.cigversailles.fr" },
      { nom: "CIG Grande Couronne", departements: ["Yvelines (78)", "Essonne (91)", "Val-d'Oise (95)"], site: "https://www.cigversailles.fr" },
      { nom: "CDG 77 — Seine-et-Marne", departements: ["Seine-et-Marne (77)", "Yonne (89)"], site: "https://www.cdg77.fr" },
      { nom: "CDG 75 — Paris", departements: ["Paris (75)"], site: "https://www.rdvservicepublic.fr" }
    ]
  },
  {
    id: "cvl",
    nom: "Centre-Val de Loire",
    concours_2026: true,
    note: "Organisation conjointe avec Île-de-France",
    cdg_organisateurs: [
      { nom: "CDG rattachés à l'organisation IDF", departements: ["Cher (18)", "Eure-et-Loir (28)", "Indre (36)", "Indre-et-Loire (37)", "Loir-et-Cher (41)", "Loiret (45)"], site: "https://www.concours-territorial.fr" }
    ]
  },
  {
    id: "ara",
    nom: "Auvergne-Rhône-Alpes",
    concours_2026: true,
    note: null,
    cdg_organisateurs: [
      { nom: "CDG 38 — Isère", departements: ["Isère (38)", "Drôme (26)"], site: "https://www.cdg38.fr" },
      { nom: "CDG 63 — Puy-de-Dôme", departements: ["Allier (03)", "Cantal (15)", "Haute-Loire (43)", "Puy-de-Dôme (63)"], site: "https://www.cdg63.fr" },
      { nom: "CDG 69 — Rhône", departements: ["Ain (01)", "Ardèche (07)", "Loire (42)", "Rhône (69)", "Métropole de Lyon"], site: "https://www.cdg69.fr" },
      { nom: "CDG 73 — Savoie", departements: ["Savoie (73)", "Haute-Savoie (74)"], site: "https://www.cdg73.com" }
    ]
  },
  {
    id: "pac",
    nom: "Provence-Alpes-Côte d'Azur",
    concours_2026: true,
    note: "Organisation incluant la Corse",
    cdg_organisateurs: [
      { nom: "CDG 05 — Hautes-Alpes", departements: ["Hautes-Alpes (05)"], site: "https://www.cdg05.fr" },
      { nom: "CDG 13 — Bouches-du-Rhône", departements: ["Bouches-du-Rhône (13)", "Var (83)", "Vaucluse (84)", "Alpes-de-Haute-Provence (04)", "Alpes-Maritimes (06)"], site: "https://www.cdg13.fr" }
    ]
  },
  {
    id: "cor",
    nom: "Corse",
    concours_2026: true,
    note: "Rattachée à l'organisation PACA",
    cdg_organisateurs: [
      { nom: "CDG 2B — Haute-Corse", departements: ["Corse-du-Sud (2A)", "Haute-Corse (2B)"], site: "https://www.cdg2b.fr" }
    ]
  },
  {
    id: "ges",
    nom: "Grand Est",
    concours_2026: true,
    note: null,
    cdg_organisateurs: [
      { nom: "CDG organisateurs Grand Est", departements: ["Ardennes (08)", "Aube (10)", "Marne (51)", "Haute-Marne (52)", "Meurthe-et-Moselle (54)", "Meuse (55)", "Moselle (57)", "Bas-Rhin (67)", "Haut-Rhin (68)", "Vosges (88)"], site: "https://www.concours-territorial.fr" }
    ]
  },
  {
    id: "hdf",
    nom: "Hauts-de-France",
    concours_2026: true,
    note: null,
    cdg_organisateurs: [
      { nom: "CDG 62 — Pas-de-Calais", departements: ["Pas-de-Calais (62)"], site: "https://www.cdg62.fr" },
      { nom: "CDG 59 — Nord", departements: ["Nord (59)"], site: "https://www.cdg59.fr" },
      { nom: "CDG 80 — Somme", departements: ["Somme (80)", "Aisne (02)", "Oise (60)"], site: "https://www.cdg80.fr" }
    ]
  },
  {
    id: "occ",
    nom: "Occitanie",
    concours_2026: true,
    note: null,
    cdg_organisateurs: [
      { nom: "CDG 11 — Aude", departements: ["Aude (11)"], site: "https://www.cdg11.fr" },
      { nom: "CDG 30 — Gard", departements: ["Gard (30)"], site: "https://www.cdg30.fr" },
      { nom: "CDG 31 — Haute-Garonne", departements: ["Haute-Garonne (31)", "Ariège (09)", "Gers (32)", "Lot (46)", "Hautes-Pyrénées (65)", "Tarn (81)", "Tarn-et-Garonne (82)"], site: "https://www.cdg31.fr" },
      { nom: "CDG 34 — Hérault", departements: ["Hérault (34)", "Lozère (48)", "Pyrénées-Orientales (66)", "Aveyron (12)"], site: "https://www.cdg34.fr" }
    ]
  },
  {
    id: "naq",
    nom: "Nouvelle-Aquitaine",
    concours_2026: true,
    note: null,
    cdg_organisateurs: [
      { nom: "CDG 33 — Gironde", departements: ["Gironde (33)", "Landes (40)"], site: "https://www.cdg33.fr" },
      { nom: "CDG 19 — Corrèze", departements: ["Corrèze (19)", "Creuse (23)", "Haute-Vienne (87)"], site: "https://www.cdg19.fr" },
      { nom: "CDG 24 — Dordogne", departements: ["Dordogne (24)", "Lot-et-Garonne (47)"], site: "https://www.cdg24.fr" },
      { nom: "CDG 16/17/79/86", departements: ["Charente (16)", "Charente-Maritime (17)", "Deux-Sèvres (79)", "Vienne (86)"], site: "https://www.concours-territorial.fr" }
    ]
  },
  {
    id: "nor",
    nom: "Normandie",
    concours_2026: false,
    note: "Concours organisé en 2025. Prochain concours probable : 2027. Tu peux passer le concours dans une autre région — il est valable sur tout le territoire national.",
    cdg_organisateurs: [
      { nom: "CDG 27 — Eure (organisateur 2025)", departements: ["Eure (27)", "Seine-Maritime (76)", "Calvados (14)", "Manche (50)", "Orne (61)"], site: "https://www.cdg27.fr" }
    ]
  },
  {
    id: "bre",
    nom: "Bretagne",
    concours_2026: false,
    note: "Concours organisé en 2025. Prochain concours probable : 2027. Tu peux passer le concours dans une autre région — il est valable sur tout le territoire national.",
    cdg_organisateurs: [
      { nom: "CDG 35 — Ille-et-Vilaine", departements: ["Ille-et-Vilaine (35)"], site: "https://www.cdg35.fr" },
      { nom: "CDG 22 — Côtes-d'Armor", departements: ["Côtes-d'Armor (22)"], site: "https://www.cdg22.fr" },
      { nom: "CDG 29 — Finistère", departements: ["Finistère (29)"], site: "https://www.cdg29.bzh" },
      { nom: "CDG 56 — Morbihan", departements: ["Morbihan (56)"], site: "https://www.cdg56.fr" }
    ]
  },
  {
    id: "pdl",
    nom: "Pays de la Loire",
    concours_2026: false,
    note: "Concours organisé en 2025. Prochain concours probable : 2027. Tu peux passer le concours dans une autre région — il est valable sur tout le territoire national.",
    cdg_organisateurs: [
      { nom: "CDG 44 — Loire-Atlantique", departements: ["Loire-Atlantique (44)"], site: "https://www.cdg44.fr" },
      { nom: "CDG 49 — Maine-et-Loire", departements: ["Maine-et-Loire (49)"], site: "https://www.cdg49.fr" },
      { nom: "CDG 53 — Mayenne", departements: ["Mayenne (53)"], site: "https://www.cdg53.fr" },
      { nom: "CDG 72 — Sarthe", departements: ["Sarthe (72)"], site: "https://www.cdg72.fr" },
      { nom: "CDG 85 — Vendée", departements: ["Vendée (85)"], site: "https://www.cdg85.fr" }
    ]
  },
  {
    id: "bfc",
    nom: "Bourgogne-Franche-Comté",
    concours_2026: false,
    note: "Le CDG 89 (Yonne) est rattaché à l'organisation IDF 2026 via le CDG 77. Les autres départements n'organisent probablement pas en 2026.",
    cdg_organisateurs: [
      { nom: "CDG 89 — Yonne (rattaché IDF 2026)", departements: ["Yonne (89)"], site: "https://www.cdg89.fr" },
      { nom: "Autres CDG BFC", departements: ["Côte-d'Or (21)", "Doubs (25)", "Jura (39)", "Nièvre (58)", "Haute-Saône (70)", "Saône-et-Loire (71)", "Territoire de Belfort (90)"], site: "https://www.concours-territorial.fr" }
    ]
  }
]

export const OUTRE_MER = [
  { nom: "Guadeloupe", concours_2026: true, inscription_debut: "30 septembre 2025", inscription_fin: "19 novembre 2025", cdg: "CDG Guadeloupe" },
  { nom: "Martinique", concours_2026: true, inscription_debut: "7 octobre 2025", inscription_fin: "12 novembre 2025", cdg: "CDG Martinique" }
]
