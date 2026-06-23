# BinaryCode

Convertisseur web statique, moderne et accessible pour traduire du texte UTF-8 en binaire et du binaire en texte.

## Fonctionnalités

- Conversion instantanée texte ⇄ binaire.
- Gestion UTF-8 complète : accents, symboles et emojis.
- Validation stricte des groupes binaires de 8 bits.
- Actions rapides : copier, coller, effacer.
- Interface responsive avec statistiques de caractères et d'octets.
- Workflow GitHub Actions prêt pour Node.js 24.

## Développement

```bash
npm test
```

## Structure

- `index.html` : structure de l'interface.
- `styles.css` : design responsive et états interactifs.
- `script.js` : logique de conversion et interactions.
- `.github/workflows/build.yml` : validation CI et artifact statique.
