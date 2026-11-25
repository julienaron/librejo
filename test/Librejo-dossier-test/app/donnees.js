// Librejo : documents et formulaires (dossier de TEST, données fictives).
window.DOCUBUS_DONNEES = {
 "maj": "2026-11-24 16:00",
 "categories": [
  {
   "id": "01 Accueil",
   "nom": "Accueil",
   "ordre": 1
  },
  {
   "id": "02 Démarches",
   "nom": "Démarches",
   "ordre": 2
  }
 ],
 "documents": [
  {
   "id": "dtest0",
   "chemin": "Documents/01 Accueil/Livret-accueil_v1_2026-11.pdf",
   "fichier": "Livret-accueil_v1_2026-11.pdf",
   "titre": "Livret d’accueil",
   "description": "Livret d’accueil (document fictif de test).",
   "motscles": [
    "accueil",
    "livret"
   ],
   "categorie": "01 Accueil",
   "ext": "pdf",
   "version": "1",
   "date": "2026-11",
   "ajoute": "2026-11-24",
   "taille": 8195,
   "historique": [],
   "epingle": true
  },
  {
   "id": "dtest1",
   "chemin": "Documents/01 Accueil/Reglement-fonctionnement_v2_2026-09.pdf",
   "fichier": "Reglement-fonctionnement_v2_2026-09.pdf",
   "titre": "Règlement de fonctionnement",
   "description": "Règlement de fonctionnement (document fictif de test).",
   "motscles": [
    "règlement",
    "règles"
   ],
   "categorie": "01 Accueil",
   "ext": "pdf",
   "version": "2",
   "date": "2026-09",
   "ajoute": "2026-11-24",
   "taille": 8012,
   "historique": [],
   "epingle": false
  },
  {
   "id": "dtest2",
   "chemin": "Documents/02 Démarches/Liste-pieces-domiciliation_v1_2026-10.pdf",
   "fichier": "Liste-pieces-domiciliation_v1_2026-10.pdf",
   "titre": "Pièces pour la domiciliation",
   "description": "Pièces pour la domiciliation (document fictif de test).",
   "motscles": [
    "domiciliation",
    "CCAS",
    "papiers"
   ],
   "categorie": "02 Démarches",
   "ext": "pdf",
   "version": "1",
   "date": "2026-10",
   "ajoute": "2026-11-24",
   "taille": 8136,
   "historique": [],
   "epingle": false
  },
  {
   "id": "dcerfa",
   "chemin": "Documents/02 Démarches/Cerfa-fictif-domiciliation_v1_2026-11.pdf",
   "fichier": "Cerfa-fictif-domiciliation_v1_2026-11.pdf",
   "titre": "Demande d’élection de domicile (Cerfa FICTIF)",
   "description": "Faux Cerfa remplissable, pour tester le pré-remplissage.",
   "motscles": [
    "domiciliation",
    "cerfa"
   ],
   "categorie": "02 Démarches",
   "ext": "pdf",
   "version": "1",
   "date": "2026-11",
   "ajoute": "2026-11-25",
   "taille": 0,
   "historique": [],
   "epingle": false
  }
 ],
 "formulaires": [
  {
   "id": "fexemple",
   "titre": "Attestation de passage",
   "description": "Atteste qu'une personne est passée à l'association à une date donnée.",
   "categorie": "01 Accueil",
   "confidentiel": true,
   "destinataires": "",
   "objet": "",
   "signataire": "",
   "champs": [
    {
     "id": "c1",
     "label": "Civilité",
     "type": "choix",
     "options": "M., Mme",
     "requis": true
    },
    {
     "id": "c2",
     "label": "Initiales",
     "type": "texte",
     "options": "",
     "requis": true
    },
    {
     "id": "c3",
     "label": "Date de passage",
     "type": "date",
     "options": "",
     "requis": true
    },
    {
     "id": "c4",
     "label": "Commentaire",
     "type": "long",
     "options": "",
     "requis": false
    }
   ],
   "modele": "L'équipe de l'Association des Tilleuls atteste que {Civilité} {Initiales} s'est présenté(e) dans notre structure le {Date de passage}.\n\n{Commentaire}"
  },
  {
   "id": "feqtest",
   "titre": "Fiche de liaison (essai équipe)",
   "groupe": "mixte",
   "emoji": "🤝",
   "description": "Formulaire fictif pour essayer la liste de l’équipe.",
   "categorie": "01 Accueil",
   "confidentiel": false,
   "destinataires": "",
   "objet": "",
   "signataire": "",
   "champs": [
    {
     "id": "c1",
     "label": "Destinataire",
     "type": "texte",
     "options": "",
     "requis": true
    },
    {
     "id": "c2",
     "label": "Référents",
     "type": "equipe",
     "options": "",
     "requis": true,
     "multi": true,
     "infos": [
      "fonction",
      "tel"
     ]
    }
   ],
   "modele": "Madame, Monsieur,\n\nNous vous adressons cette fiche de liaison. Vous pouvez joindre les professionnels qui suivent la situation : {Référents}.\n\nCordialement,",
   "motscles": [
    "liaison",
    "essai"
   ]
  }
 ],
 "kits": [],
 "semaine": {
  "listes": [
   {
    "id": "s-semaine",
    "titre": "Semaine",
    "items": []
   }
  ]
 }
};
