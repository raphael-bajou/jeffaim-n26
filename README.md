# Jef'Faim Pizzas · jeffaim.com

Site vitrine one-page de Jef'Faim Pizzas : **Astro** (site 100 % statique) + **Pages CMS** pour que le contenu soit modifiable sans toucher au code.

## Structure

```
content/              ← le contenu, édité via Pages CMS
  pizzas.json           la carte (+ pizza du mois, pizzas masquées)
  emplacements.json     les rendez-vous de la semaine
  reglages.json         téléphone, Facebook, bandeau, annonce congés
public/img/           ← photos (inchangées depuis jeffaim-n24)
src/
  components/           sections du one-page (Hero, PizzaDuMois, Carte, Emplacements…)
  lib/content.ts        lecture du contenu au build
  scripts/effects.ts    effets (braises, apparitions, projecteur) + filtres de la carte
  styles/global.css     thème noir / or (Tailwind 4)
.pages.yml            ← configuration de Pages CMS
.github/workflows/    ← build + publication sur la branche `deploy`
```

## Développement (WSL)

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # génère dist/
```

## Mise à jour du contenu (propriétaire)

1. Se connecter sur https://app.pagescms.org (invitation par email, pas besoin de compte GitHub).
2. Modifier la carte, les emplacements ou les réglages, puis **Enregistrer**.
3. Le site est reconstruit et mis en ligne automatiquement en 1 à 2 minutes.

Astuces : une seule pizza doit avoir « Pizza du mois » cochée. Pour retirer une pizza temporairement, décocher « Visible sur le site » plutôt que la supprimer.

## Déploiement (Hostinger)

À chaque push sur `main` (y compris les commits de Pages CMS), l'Action `deploy.yml` construit le site et publie `dist/` sur la branche `deploy`. Sur Hostinger, le site est relié en Git à la branche `deploy` (déploiement automatique par webhook).

## Mise en place de Pages CMS (une fois)

1. Aller sur https://app.pagescms.org, se connecter avec GitHub et installer l'app Pages CMS sur le repo `jeffaim-n26`.
2. Ouvrir le repo, branche `main` : les sections « La carte », « Emplacements » et « Réglages » apparaissent.
3. Dans *Collaborators*, inviter le propriétaire par email.
