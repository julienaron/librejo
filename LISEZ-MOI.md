# Librejo – prototype nº 1

Un test, pas l'application. Il sert à vérifier trois choses sur de vrais postes :

1. l'application s'installe depuis Edge ou Chrome ;
2. elle écrit et relit un réglage dans un dossier choisi (NAS, lecteur réseau, OneDrive, disque) ;
3. elle retrouve ce dossier à l'ouverture suivante, sans rien redemander.

## Mettre en ligne (GitHub Pages)

1. Sur GitHub, dans l'organisation `librejo`, créer un dépôt public nommé `librejo.github.io`.
2. Y déposer tous les fichiers de ce dossier, à la racine (« Add file », « Upload files »).
3. Dans Settings, Pages : source « Deploy from a branch », branche `main`, dossier `/ (root)`.
4. Après une ou deux minutes, le site répond sur https://librejo.github.io

Le prototype fonctionne aussi dans un sous-dossier ou un autre dépôt (adresses relatives).

## Faire le test

Sur chaque poste, et pour chaque type de dossier :

1. Ouvrir le site dans Edge, cliquer sur « Installer Librejo ».
2. Ouvrir l'application installée, choisir un dossier de test, enregistrer un nom fictif.
3. Fermer, rouvrir : le dossier doit être retrouvé. Si le navigateur redemande, cliquer sur
   « Réautoriser » et choisir « Autoriser à chaque visite » s'il le propose.
4. Recommencer le lendemain, puis après un redémarrage du poste.
5. Couper le réseau et ouvrir l'application : elle doit s'afficher quand même.
6. Cliquer sur « Copier le rapport » et le coller dans la conversation.

Le journal est écrit dans `librejo-test.json`, dans le dossier choisi : deux postes qui
choisissent le même dossier partagé alimentent le même journal.

Aucune donnée d'usager. Supprimer `librejo-test.json` à la fin du test.
