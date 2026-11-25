# Librejo – prototype nº 2 : Docubus en application web

Le vrai Docubus, servi par le site, qui lit ses réglages et ses documents dans le dossier de la structure.
Rien n'est envoyé au site : les réglages sont lus sur le poste, comme des données (jamais exécutés).

## Mettre en ligne

Dans le dépôt `librejo.github.io`, créer un dossier `essai2` et y déposer tout le contenu de ce dossier
(sans les réglages d'une vraie structure : il n'y en a pas ici). Adresse : https://librejo.github.io/essai2/

Le prototype nº 1 reste à la racine et continue de fonctionner.

## Tester

1. Copier le dossier `Librejo-dossier-test` (données fictives) là où on veut tester : NAS, lecteur réseau, OneDrive, disque.
2. Ouvrir https://librejo.github.io/essai2/ dans Edge ou Chrome, installer l'application.
3. Choisir le dossier `Librejo-dossier-test`. Mot de passe admin : `test`.
4. Vérifier : accueil, ouverture et impression d'un document, formulaire « Attestation de passage », annuaire, ajout d'un document en mode admin.
5. Fermer, rouvrir le lendemain : l'application doit retrouver le dossier (au pire après un clic).

## Personnaliser

Mode admin, Administration, Réglages, carte « Apparence » : couleur du menu, couleur des boutons, logo de la structure (menu et en-tête des PDF), nom de la structure dans le menu. Les couleurs trop claires sont assombries automatiquement pour rester lisibles.

## Papier à en-tête et liens

Réglages, carte « Papier à en-tête des PDF » : texte sous le logo, bas de page, taille du logo, alignements, police, trait de couleur, avec aperçu. Les liens web ont une vignette dessinée automatiquement ; en mode admin, menu « … » d’un lien, « Changer la miniature » : coller une capture d’écran (Ctrl + V) ou choisir une image.

## Formulaires

Mode admin, Administration, Formulaires : « Bibliothèque de modèles » (DIPC, personne de confiance, accord de partage, événement indésirable, trames du livret d’accueil et du règlement de fonctionnement, Cerfa de domiciliation en lien, en-tête d’ordonnance). « Ajouter » en fait une copie modifiable. Les formulaires intégrés peuvent être masqués ; l’ancienne ordonnance l’est par défaut. L’éditeur montre un aperçu en direct (formulaire à remplir, ou PDF).

## Limites connues

- Interface passée aux couleurs et au nom de Librejo (24/11/2026). Restent propres au secteur addictologie : formulaires TSO, ordonnance (à remplacer par l’en-tête d’ordonnance) : ce seront les packs.
- « Copier l'emplacement du fichier » donne un chemin incomplet en version web.
