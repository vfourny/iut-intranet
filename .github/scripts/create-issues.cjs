module.exports = async ({ github, context, core }) => {
  const owner = context.repo.owner
  const repo = context.repo.repo
  const dryRun = context.payload.inputs?.dry_run === 'true'

  // ── Labels setup ─────────────────────────────────────────────────

  const LABELS = [
    // Type
    {
      name: 'type: feature',
      color: '0075ca',
      description: 'New feature or request',
    },
    {
      name: 'type: bug',
      color: 'd73a4a',
      description: "Something isn't working",
    },
    {
      name: 'type: chore',
      color: 'e4e669',
      description: 'Build, tooling, infrastructure',
    },
    { name: 'type: docs', color: '0075ca', description: 'Documentation' },
    {
      name: 'type: refactor',
      color: 'fbca04',
      description: 'Code refactoring',
    },
    // Priority
    {
      name: 'priority: critical',
      color: 'b60205',
      description: 'Critical – blocks everything',
    },
    { name: 'priority: high', color: 'e11d48', description: 'High priority' },
    {
      name: 'priority: medium',
      color: 'f97316',
      description: 'Medium priority',
    },
    { name: 'priority: low', color: 'fde68a', description: 'Low priority' },
    // Scope
    {
      name: 'scope: auth',
      color: 'c5def5',
      description: 'Authentication & authorization',
    },
    {
      name: 'scope: directory',
      color: 'c5def5',
      description: 'Annuaire / user profiles',
    },
    {
      name: 'scope: news',
      color: 'c5def5',
      description: 'Actualités / articles',
    },
    {
      name: 'scope: newsletter',
      color: 'c5def5',
      description: 'Newsletter & email subscriptions',
    },
    { name: 'scope: agenda', color: 'c5def5', description: 'Agenda & events' },
    {
      name: 'scope: hr',
      color: 'c5def5',
      description: 'Espace RH & documents',
    },
    { name: 'scope: photos', color: 'c5def5', description: 'Photothèque' },
    {
      name: 'scope: plans',
      color: 'c5def5',
      description: 'Plans des sites & déplacements',
    },
    { name: 'scope: org-chart', color: 'c5def5', description: 'Organigramme' },
    {
      name: 'scope: ui',
      color: 'c5def5',
      description: 'UI components & design system',
    },
    {
      name: 'scope: infra',
      color: 'c5def5',
      description: 'Infrastructure & DevOps',
    },
    {
      name: 'scope: db',
      color: 'c5def5',
      description: 'Database & Prisma schema',
    },
    // Special
    {
      name: 'good first issue',
      color: '7057ff',
      description: 'Good for newcomers',
    },
    {
      name: 'breaking-change',
      color: 'b60205',
      description: 'Introduces a breaking change',
    },
    { name: 'security', color: 'b60205', description: 'Security concern' },
    {
      name: 'dependencies',
      color: '0075ca',
      description: 'Dependency updates',
    },
    {
      name: 'status: blocked',
      color: 'e4e669',
      description: 'Blocked by another issue or external factor',
    },
    {
      name: 'status: needs-info',
      color: 'e4e669',
      description: 'More information required',
    },
  ]

  // Get existing labels
  const existingLabelsRes = await github.rest.issues.listLabelsForRepo({
    owner,
    repo,
    per_page: 100,
  })
  const existingLabels = new Set(existingLabelsRes.data.map((l) => l.name))

  console.log(
    `\n🏷️  Synchronisation des labels (${LABELS.length} labels définis)...`,
  )
  for (const label of LABELS) {
    if (existingLabels.has(label.name)) {
      console.log(`  ⏭️  Label existant : ${label.name}`)
      continue
    }
    if (dryRun) {
      console.log(`  [DRY RUN] Would create label: ${label.name}`)
      continue
    }
    try {
      await github.rest.issues.createLabel({ owner, repo, ...label })
      console.log(`  ✅ Label créé : ${label.name}`)
      await new Promise((r) => setTimeout(r, 200))
    } catch (err) {
      console.warn(
        `  ⚠️  Impossible de créer le label "${label.name}" :`,
        err.message,
      )
    }
  }
  console.log('')

  // ── Helpers ──────────────────────────────────────────────────────

  function userStoryBody({
    asA,
    iWant,
    soThat,
    acceptanceCriteria,
    additionalContext,
  }) {
    return [
      '## 🎯 User Story',
      '',
      `**En tant que** ${asA}`,
      '',
      `**Je veux** ${iWant}`,
      '',
      `**Afin de** ${soThat}`,
      '',
      "## Critères d'acceptation",
      '',
      acceptanceCriteria,
      '',
      '## Contexte additionnel',
      '',
      additionalContext || '_N/A_',
    ].join('\n')
  }

  function taskBody({ taskType, description, steps, additionalContext }) {
    return [
      '## 🔧 Tâche',
      '',
      `**Type de tâche :** ${taskType}`,
      '',
      '## Description',
      '',
      description,
      '',
      '## Étapes',
      '',
      steps || '_À définir_',
      '',
      '## Contexte additionnel',
      '',
      additionalContext || '_N/A_',
    ].join('\n')
  }

  function docBody({ whatToDocument, additionalContext }) {
    return [
      "## Qu'est-ce qui doit être documenté ?",
      '',
      whatToDocument,
      '',
      '## Contexte additionnel',
      '',
      additionalContext || '_N/A_',
    ].join('\n')
  }

  // ── Fetch milestones ─────────────────────────────────────────────

  const milestonesRes = await github.rest.issues.listMilestones({
    owner,
    repo,
    state: 'all',
    per_page: 50,
  })

  const milestoneMap = {}
  for (const m of milestonesRes.data) {
    milestoneMap[m.title] = m.number
  }
  console.log('Milestones trouvés :', JSON.stringify(milestoneMap))

  // Titres exacts des milestones (sans notion de sprint)
  const MILESTONE_TITLES = [
    'Fondations, Auth, Annuaire', // ms1
    'Profils, Actualités, Storage', // ms2
    'Newsletter, Agenda, RH', // ms3
    'Photothèque, Plans, Organigramme, Documentation', // ms4
    'Reprise : Valeur ajoutée et mise en production', // ms5
  ]

  function findMilestone(titleToFind) {
    for (const [key, val] of Object.entries(milestoneMap)) {
      if (key === titleToFind) return val
    }
    // Fallback: partial match (case-insensitive)
    const lower = titleToFind.toLowerCase()
    for (const [key, val] of Object.entries(milestoneMap)) {
      if (key.toLowerCase().includes(lower.split(',')[0].trim())) return val
    }
    return undefined
  }

  const ms1 = findMilestone(MILESTONE_TITLES[0])
  const ms2 = findMilestone(MILESTONE_TITLES[1])
  const ms3 = findMilestone(MILESTONE_TITLES[2])
  const ms4 = findMilestone(MILESTONE_TITLES[3])
  const ms5 = findMilestone(MILESTONE_TITLES[4])

  console.log(`Milestones résolus →`)
  console.log(`  ms1 (${MILESTONE_TITLES[0]}) → ${ms1}`)
  console.log(`  ms2 (${MILESTONE_TITLES[1]}) → ${ms2}`)
  console.log(`  ms3 (${MILESTONE_TITLES[2]}) → ${ms3}`)
  console.log(`  ms4 (${MILESTONE_TITLES[3]}) → ${ms4}`)
  console.log(`  ms5 (${MILESTONE_TITLES[4]}) → ${ms5}`)

  // ── Issues list ───────────────────────────────────────────────────

  const issues = [
    // ═══════════════════════════════════════════════════════════════
    // MILESTONE 1 — Sprint 1 : Fondations, Auth, Annuaire de base
    // ═══════════════════════════════════════════════════════════════
    {
      title: '[Chore] Setup monorepo Turborepo',
      milestone: ms1,
      labels: ['type: chore', 'priority: critical', 'scope: infra'],
      body: taskBody({
        taskType: '🛠️ DevOps / Infra',
        description:
          'Initialiser la structure du monorepo : packages `web` (Nuxt), `api` (tRPC server), `db` (Prisma), `email`, `shared-types`, `ui` (composants Vue partagés). Configurer Turborepo, ESLint, Prettier, TypeScript strict, scripts globaux. Mettre en place `.env` centralisé et `globalDependencies` pour invalidation cache.',
        steps:
          '- [ ] Créer la structure Turborepo avec tous les packages\n- [ ] Configurer ESLint + Prettier partagés\n- [ ] Configurer TypeScript strict dans chaque package\n- [ ] Mettre en place les scripts globaux (dev, build, lint, typecheck)\n- [ ] Configurer `.env` centralisé et `.env.example`\n- [ ] Configurer `globalDependencies` Turborepo pour invalidation cache\n- [ ] Vérifier que `turbo run build` fonctionne',
        additionalContext:
          "Point d'entrée du projet. Toutes les autres issues dépendent de cette base.",
      }),
    },
    {
      title: '[Chore] Setup Prisma + PostgreSQL',
      milestone: ms1,
      labels: ['type: chore', 'priority: critical', 'scope: db'],
      body: taskBody({
        taskType: '⚙️ Backend',
        description:
          'Initialiser Prisma dans `packages/db`. Configurer la connexion PostgreSQL. Schéma initial avec `User`, `Session`, et les enums `Site`, `Department`, `Specialty`. Système de migrations + seed TypeScript.',
        steps:
          '- [ ] Initialiser Prisma dans `packages/db`\n- [ ] Configurer `DATABASE_URL` dans `.env`\n- [ ] Créer le schéma initial : `User`, `Session`, enums `Site`, `Department`, `Specialty`\n- [ ] Créer la première migration\n- [ ] Écrire le seed TypeScript de base\n- [ ] Documenter la procédure de migration',
        additionalContext:
          'Dépend de #1 (Setup monorepo). PostgreSQL sera provisionné par JRCanDev en prod.',
      }),
    },
    {
      title: '[Chore] Récupération assets charte IUT-LCO',
      milestone: ms1,
      labels: ['type: chore', 'priority: high', 'scope: ui'],
      body: taskBody({
        taskType: '🔍 Research / Spike',
        description:
          "Demander et récupérer auprès de l'IUT : fichiers logo principal (couleur, monochrome) en SVG, les 8 logos de département en SVG, valeurs RGB officielles. Intégrer dans `packages/ui/assets/`.",
        steps:
          "- [ ] Contacter le service communication IUT-LCO\n- [ ] Obtenir logo principal couleur SVG\n- [ ] Obtenir logo principal monochrome SVG\n- [ ] Obtenir les 8 logos de département SVG\n- [ ] Vérifier les valeurs RGB officielles vs conversions CMYK\n- [ ] Intégrer les assets dans `packages/ui/assets/`\n- [ ] Documenter les règles d'usage (zone de protection, interdits)",
        additionalContext:
          'Couleurs de référence : Rouge IUT #E30613, Bleu IUT #00AEEF, Gris IUT #737373.',
      }),
    },
    {
      title: '[Chore] Design tokens charte IUT-LCO',
      milestone: ms1,
      labels: ['type: chore', 'priority: high', 'scope: ui'],
      body: taskBody({
        taskType: '🎨 Frontend',
        description:
          "Définir tous les tokens CSS dans `packages/ui` : couleurs principales IUT, couleurs des 5 spécialités, typographie Arial, espacements. Configurer Tailwind avec ces tokens. Documenter les règles d'usage du logo.",
        steps:
          '- [ ] Créer le fichier de variables CSS globales dans `packages/ui`\n- [ ] Définir les couleurs principales : `--color-iut-red: #E30613`, `--color-iut-blue: #00AEEF`, `--color-iut-gray: #737373`\n- [ ] Définir les couleurs spécialités (5 valeurs)\n- [ ] Configurer `tailwind.config.ts` avec `theme.extend.colors` pointant vers les tokens\n- [ ] Définir les tokens de typographie (Arial / Arial Narrow)\n- [ ] Documenter les règles logo dans `packages/ui/README.md`',
        additionalContext:
          'Dépend de #3 (assets charte). Ces tokens sont utilisés dans tout le projet dès le Sprint 1.',
      }),
    },
    {
      title: '[Chore] Setup Nuxt 3 + Tailwind + PrimeVue',
      milestone: ms1,
      labels: ['type: chore', 'priority: critical', 'scope: ui'],
      body: taskBody({
        taskType: '🎨 Frontend',
        description:
          'Configurer Nuxt avec TypeScript, Tailwind, PrimeVue. Appliquer le thème PrimeVue conforme à la charte IUT-LCO (couleurs primaires, typo Arial). Layout de base.',
        steps:
          '- [ ] Configurer Nuxt 3 dans `packages/web` avec TypeScript strict\n- [ ] Intégrer Tailwind CSS avec les tokens IUT-LCO\n- [ ] Intégrer PrimeVue et créer un preset thème IUT-LCO\n- [ ] Configurer Pinia et Pinia Colada\n- [ ] Mettre en place VeeValidate\n- [ ] Créer le layout de base `layouts/default.vue`\n- [ ] Vérifier le rendu sur mobile',
        additionalContext:
          'Dépend de #4 (design tokens). Le thème PrimeVue doit utiliser les variables CSS IUT-LCO.',
      }),
    },
    {
      title: '[Chore] Setup tRPC + Inversify + Better Auth',
      milestone: ms1,
      labels: [
        'type: chore',
        'priority: critical',
        'scope: auth',
        'scope: infra',
      ],
      body: taskBody({
        taskType: '⚙️ Backend',
        description:
          'Configurer tRPC server avec Inversify pour la DI. Intégrer Better Auth (email/password). Créer les middlewares : `publicProcedure`, `authenticatedProcedure`, `adminProcedure`, `editorProcedure`, `hrProcedure`. Client tRPC côté Nuxt avec Pinia Colada.',
        steps:
          '- [ ] Configurer tRPC server dans `packages/api`\n- [ ] Mettre en place Inversify (DI) avec les décorateurs TypeScript\n- [ ] Intégrer Better Auth avec provider email/password\n- [ ] Créer `publicProcedure`\n- [ ] Créer `authenticatedProcedure` (vérifie session)\n- [ ] Créer `adminProcedure` (rôle ADMIN)\n- [ ] Créer `editorProcedure` (rôles ADMIN + EDITOR)\n- [ ] Créer `hrProcedure` (rôles ADMIN + HR)\n- [ ] Configurer le client tRPC dans `packages/web` avec Pinia Colada\n- [ ] Tester un appel end-to-end',
        additionalContext:
          'Les erreurs métier utilisent `AppError` custom propagées via Inversify. Validation Zod obligatoire sur toutes les procédures.',
      }),
    },
    {
      title: '[Feat] Modèles Site, Department et Specialty',
      milestone: ms1,
      labels: ['type: feature', 'priority: high', 'scope: db'],
      body: userStoryBody({
        asA: 'développeur',
        iWant:
          "avoir des modèles de données cohérents pour les sites, départements et spécialités de l'IUT-LCO",
        soThat:
          "tous les autres modules (annuaire, agenda, actualités…) puissent s'y référer de manière typée",
        acceptanceCriteria:
          '- [ ] Enum `Site` : `BOULOGNE`, `CALAIS`, `DUNKERQUE`, `SAINT_OMER`\n- [ ] Enum `Specialty` : 5 valeurs\n- [ ] Enum `Department` : 8 valeurs (GACO, GEA, TC, INFO, GEII, GIM, GB, GTE)\n- [ ] Table de référence `Department` seedée avec métadonnées (site, spécialité, couleur hex, libellé complet)\n- [ ] Types partagés dans `packages/shared-types`\n- [ ] Migration et seed fonctionnels',
        additionalContext:
          'Couleurs spécialités : Administration/Gestion/Commerce #D71F69, Électricité/Automatique/Informatique #0089CF, Sciences Industrielles #4D5C66, Chimie/Biologie #7FB539, Construction/Énergie #EE7F00',
      }),
    },
    {
      title: '[Feat] Modèle User et système de rôles',
      milestone: ms1,
      labels: [
        'type: feature',
        'priority: critical',
        'scope: auth',
        'scope: db',
      ],
      body: userStoryBody({
        asA: 'administrateur système',
        iWant:
          "disposer d'un modèle User complet avec rôles et rattachement organisationnel",
        soThat:
          "les permissions soient correctement appliquées et l'annuaire reflète la structure de l'IUT",
        acceptanceCriteria:
          '- [ ] Champs : `firstName`, `lastName`, `email`, `phone`, `photoUrl`, `jobTitle`\n- [ ] Champ `departmentId` (FK optionnel vers `Department`)\n- [ ] Champ `service` (texte libre, pour le personnel transverse)\n- [ ] Champ `managerId` (auto-référence optionnelle)\n- [ ] Enum `Role` : `ADMIN`, `EDITOR`, `HR`, `USER`\n- [ ] Contrainte : soit `departmentId` soit `service` renseigné\n- [ ] Migration et seed avec utilisateurs de test',
        additionalContext:
          "Les utilisateurs sans département (RH, scolarité, direction…) utilisent le champ `service` libre. Le champ `managerId` est nécessaire pour l'organigramme du Sprint 4.",
      }),
    },
    {
      title: "[Feat] Pages d'authentification",
      milestone: ms1,
      labels: ['type: feature', 'priority: critical', 'scope: auth'],
      body: userStoryBody({
        asA: 'utilisateur IUT-LCO',
        iWant:
          'pouvoir créer un compte, me connecter, et réinitialiser mon mot de passe',
        soThat: "j'accède à l'intranet de manière sécurisée",
        acceptanceCriteria:
          "- [ ] Page `/auth/signup` : formulaire inscription avec validation VeeValidate + Zod\n- [ ] Page `/auth/login` : formulaire connexion\n- [ ] Page `/auth/forgot-password` : demande de reset par email\n- [ ] Page `/auth/reset-password` : formulaire nouveau mot de passe (token single-use)\n- [ ] Gestion des erreurs claire (email déjà pris, mot de passe incorrect…)\n- [ ] Redirections post-auth vers la page d'origine ou `/`\n- [ ] Design conforme charte IUT-LCO\n- [ ] Messages d'erreur en français",
        additionalContext:
          'Utilise Better Auth (configuré dans #6). Les tokens de reset sont cryptographiquement sécurisés et single-use.',
      }),
    },
    {
      title: '[Feat] Layout global',
      milestone: ms1,
      labels: ['type: feature', 'priority: high', 'scope: ui'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          "naviguer dans l'intranet avec un layout cohérent aux couleurs IUT-LCO",
        soThat: "je m'y repère facilement sur tous les appareils",
        acceptanceCriteria:
          '- [ ] Header avec logo IUT-LCO cliquable (vers `/`)\n- [ ] Navigation principale (Accueil, Annuaire, Actualités, Agenda, RH, Photos, Plans, Organigramme)\n- [ ] Menu utilisateur (avatar, nom, lien profil, déconnexion)\n- [ ] Footer avec mentions légales et coordonnées IUT\n- [ ] Sidebar pour les zones admin/éditeur\n- [ ] Responsive mobile (hamburger menu)\n- [ ] Design conforme charte IUT-LCO (couleurs, typo Arial)\n- [ ] Logo respecte les règles de zone de protection',
        additionalContext:
          'Dépend de #4 (design tokens) et #5 (Nuxt/PrimeVue). Le layout admin est différent du layout public.',
      }),
    },
    {
      title: '[Feat] Composant Badge département',
      milestone: ms1,
      labels: ['type: feature', 'priority: medium', 'scope: ui'],
      body: userStoryBody({
        asA: 'développeur frontend',
        iWant:
          "avoir un composant Vue réutilisable affichant le badge d'un département",
        soThat:
          "l'appartenance organisationnelle soit clairement visible et cohérente dans tout l'intranet",
        acceptanceCriteria:
          '- [ ] Affiche sigle du département (ex: INFO)\n- [ ] Affiche le site (ex: Calais)\n- [ ] Couleur de fond selon la spécialité\n- [ ] Fallback pour les utilisateurs en service transverse (libellé libre + couleur neutre)\n- [ ] Composant typé TypeScript (props validées)\n- [ ] Tailles variants (sm, md, lg)\n- [ ] Accessible (contraste suffisant)',
        additionalContext:
          "Utilisé dans l'annuaire, les articles, les événements, la photothèque. Voir #7 pour les couleurs de spécialité.",
      }),
    },
    {
      title: '[Feat] Annuaire V1 — liste et recherche basique',
      milestone: ms1,
      labels: ['type: feature', 'priority: high', 'scope: directory'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant: 'consulter la liste de mes collègues et les rechercher par nom',
        soThat: "je puisse retrouver rapidement les coordonnées d'un collègue",
        acceptanceCriteria:
          '- [ ] Page `/annuaire` accessible uniquement aux utilisateurs connectés\n- [ ] Liste paginée des utilisateurs avec photo, nom complet, fonction, badge département/service\n- [ ] Barre de recherche par nom (debounce 300ms)\n- [ ] Résultats en temps réel\n- [ ] Photo de profil avec fallback avatar initiales\n- [ ] Lien vers fiche profil public\n- [ ] Requête tRPC avec `authenticatedProcedure`',
        additionalContext:
          'Annuaire V2 avec filtres avancés prévu au Sprint 2. Cette V1 est le minimum viable pour la démo Sprint 1.',
      }),
    },
    {
      title: '[Chore] CI/CD + environnement de preview',
      milestone: ms1,
      labels: ['type: chore', 'priority: high', 'scope: infra'],
      body: taskBody({
        taskType: '🛠️ DevOps / Infra',
        description:
          'Configurer GitHub Actions : lint, typecheck, build sur PR. Déploiement preview automatique. Coordination avec JRCanDev pour environnement de prod.',
        steps:
          "- [ ] Workflow CI : lint + typecheck sur chaque PR\n- [ ] Workflow CI : build sur chaque PR\n- [ ] Workflow CD : déploiement preview automatique sur PR\n- [ ] Badge CI dans le README\n- [ ] Coordination avec JRCanDev pour l'env prod",
        additionalContext:
          'Les workflows Turborepo doivent utiliser le cache pour accélérer les builds.',
      }),
    },
    {
      title: '[Chore] Coordination hébergement JRCanDev',
      milestone: ms1,
      labels: ['type: chore', 'priority: high', 'scope: infra'],
      body: taskBody({
        taskType: '🔍 Research / Spike',
        description:
          "Recueillir les contraintes d'hébergement auprès de JRCanDev : Docker ? reverse proxy ? PostgreSQL provisionné ? domaine ? certificats SSL ? procédure de déploiement ? Documenter dans le repo.",
        steps:
          "- [ ] Réunion avec l'équipe JRCanDev\n- [ ] Clarifier : Docker / docker-compose ou autre ?\n- [ ] Clarifier : reverse proxy (Nginx, Caddy, Traefik ?)\n- [ ] Clarifier : PostgreSQL provisionné ou à déployer ?\n- [ ] Clarifier : domaine et sous-domaine\n- [ ] Clarifier : certificats SSL\n- [ ] Documenter la procédure de déploiement dans `docs/deployment.md`",
        additionalContext:
          'Cette issue bloque potentiellement le déploiement preview et la mise en production finale.',
      }),
    },
    {
      title: '[Docs] README initial',
      milestone: ms1,
      labels: ['type: docs', 'priority: medium', 'scope: infra'],
      body: docBody({
        whatToDocument:
          'Documentation de démarrage :\n- Prérequis (Node.js, PostgreSQL, pnpm)\n- Installation et configuration (clone, `.env`, `pnpm install`)\n- Lancement en mode développement (`turbo dev`)\n- Structure du monorepo (packages et leurs rôles)\n- Conventions du projet (conventional commits, branches, labels GitHub)\n- Références à la charte graphique IUT-LCO',
        additionalContext:
          'Le README doit permettre à un nouveau contributeur de démarrer en moins de 15 minutes. À mettre à jour à chaque sprint.',
      }),
    },

    // ═══════════════════════════════════════════════════════════════
    // MILESTONE 2 — Sprint 2 : Profils, Actualités, Storage
    // ═══════════════════════════════════════════════════════════════
    {
      title: '[Chore] Setup Scaleway Object Storage',
      milestone: ms2,
      labels: ['type: chore', 'priority: critical', 'scope: infra'],
      body: taskBody({
        taskType: '🛠️ DevOps / Infra',
        description:
          "Créer un bucket Scaleway (région Paris). Package `storage` dans le monorepo avec client S3-compatible. Helpers pour upload, génération d'URLs signées, suppression.",
        steps:
          "- [ ] Créer le bucket Scaleway (région Paris, hébergement France)\n- [ ] Créer `packages/storage` avec client S3-compatible\n- [ ] Helper `uploadFile(key, buffer, mimeType)`\n- [ ] Helper `getSignedUrl(key, expiresIn)`\n- [ ] Helper `deleteFile(key)`\n- [ ] Configurer les variables d'env : `SCALEWAY_ACCESS_KEY`, `SCALEWAY_SECRET_KEY`, `SCALEWAY_BUCKET`, `SCALEWAY_ENDPOINT`\n- [ ] Mettre à jour `.env.example`\n- [ ] Tester upload d'une image de test",
        additionalContext:
          "Scaleway Object Storage est S3-compatible. Endpoint : `s3.fr-par.scw.cloud`. Utilisé pour photos de profil, images d'articles, documents RH et photothèque.",
      }),
    },
    {
      title: '[Feat] Upload photo de profil',
      milestone: ms2,
      labels: [
        'type: feature',
        'priority: high',
        'scope: photos',
        'scope: directory',
      ],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant: 'uploader et recadrer une photo de profil',
        soThat:
          "mes collègues puissent me reconnaître facilement dans l'annuaire",
        acceptanceCriteria:
          "- [ ] Composant d'upload avec preview avant envoi\n- [ ] Recadrage côté client (format carré, ratio 1:1)\n- [ ] Validation taille max (ex: 5 Mo)\n- [ ] Validation format (JPEG, PNG, WebP)\n- [ ] Upload vers Scaleway Object Storage\n- [ ] Mise à jour `User.photoUrl` via procédure tRPC\n- [ ] Suppression de l'ancienne photo si remplacement\n- [ ] Feedback de progression d'upload",
        additionalContext:
          'Dépend de #16 (Scaleway Storage). Le recadrage peut utiliser `cropperjs` ou équivalent.',
      }),
    },
    {
      title: '[Feat] Page profil personnel éditable',
      milestone: ms2,
      labels: ['type: feature', 'priority: high', 'scope: directory'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          'éditer mon profil personnel (téléphone, fonction, département/service, photo)',
        soThat: "mes informations soient à jour dans l'annuaire",
        acceptanceCriteria:
          "- [ ] Page `/profil` accessible via le menu utilisateur\n- [ ] Formulaire d'édition : prénom, nom, téléphone, fonction, département/service\n- [ ] Validation téléphone via `libphonenumber-js`\n- [ ] Validation Zod côté serveur et client\n- [ ] Section upload photo\n- [ ] Sauvegarde via `authenticatedProcedure` tRPC\n- [ ] Confirmation de sauvegarde\n- [ ] Design conforme charte IUT-LCO",
        additionalContext:
          'Le champ téléphone utilise `libphonenumber-js` pour la validation (format E.164 en base, affichage formaté).',
      }),
    },
    {
      title: '[Feat] Page profil public',
      milestone: ms2,
      labels: ['type: feature', 'priority: medium', 'scope: directory'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant: "consulter la fiche profil publique d'un collègue",
        soThat:
          'je dispose de ses coordonnées et informations professionnelles complètes',
        acceptanceCriteria:
          "- [ ] Page `/annuaire/[id]` accessible aux utilisateurs connectés\n- [ ] Affichage : photo, nom complet, fonction, badge département/service\n- [ ] Affichage : email professionnel, téléphone\n- [ ] Lien vers le profil du manager (si renseigné)\n- [ ] Bouton retour vers l'annuaire\n- [ ] Design conforme charte IUT-LCO",
        additionalContext:
          'Email et téléphone ne sont visibles que des utilisateurs authentifiés.',
      }),
    },
    {
      title: '[Feat] Annuaire V2 — filtres avancés',
      milestone: ms2,
      labels: ['type: feature', 'priority: high', 'scope: directory'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          "filtrer et trier l'annuaire par site, département, service ou rôle",
        soThat:
          "je retrouve rapidement les membres d'une équipe ou d'un site spécifique",
        acceptanceCriteria:
          "- [ ] Filtres : site (4 valeurs), département (8 + service transverse), rôle\n- [ ] Tri : nom alphabétique, département\n- [ ] Pagination server-side\n- [ ] Filtres mémorisés dans l'URL (query params)\n- [ ] Réutilise le pattern `DataTable` générique\n- [ ] Combinaison de filtres possible\n- [ ] Remise à zéro des filtres",
        additionalContext:
          "Étend l'Annuaire V1. Les filtres URL permettent de partager des liens vers des vues filtrées.",
      }),
    },
    {
      title: '[Feat] Modèle Article et tags',
      milestone: ms2,
      labels: [
        'type: feature',
        'priority: critical',
        'scope: news',
        'scope: db',
      ],
      body: userStoryBody({
        asA: 'développeur',
        iWant:
          'avoir un modèle de données complet pour les articles et leurs tags',
        soThat:
          "le système d'actualités puisse gérer brouillons, publication immédiate, programmée et ciblage d'audience",
        acceptanceCriteria:
          '- [ ] Modèle `Article` : titre, slug (unique), contenu riche (JSON TipTap), excerpt, coverUrl, authorId (FK User), status (enum DRAFT|PUBLISHED|SCHEDULED), publishedAt\n- [ ] Champ `audience` pour cibler départements/sites/spécialités\n- [ ] Modèle `Tag` : nom, slug\n- [ ] Relation many-to-many `Article ↔ Tag`\n- [ ] Migration et seed avec articles de test\n- [ ] Types partagés dans `packages/shared-types`',
        additionalContext:
          'Le contenu riche est stocké au format JSON TipTap (ProseMirror). Le slug est généré automatiquement depuis le titre.',
      }),
    },
    {
      title: "[Feat] Éditeur d'articles avec TipTap",
      milestone: ms2,
      labels: ['type: feature', 'priority: critical', 'scope: news'],
      body: userStoryBody({
        asA: 'rédacteur (rôle editor ou admin)',
        iWant: 'créer et éditer des articles avec un éditeur riche TipTap',
        soThat:
          "je puisse publier des actualités avec du contenu formaté, des images et un ciblage d'audience",
        acceptanceCriteria:
          "- [ ] Page `/admin/articles` : liste des articles avec statut (brouillon, publié, programmé)\n- [ ] Création d'article avec TipTap (titre, contenu riche, image de couverture)\n- [ ] Sélection de tags\n- [ ] Sélection d'audience (tous, par département, par site, par spécialité)\n- [ ] Publication immédiate ou programmée (date/heure)\n- [ ] Sauvegarde en brouillon\n- [ ] Prévisualisation avant publication\n- [ ] Accès réservé aux rôles `editor` et `admin` via `editorProcedure`",
        additionalContext:
          "Dépend du Modèle Article. L'upload d'images dans TipTap est traité séparément.",
      }),
    },
    {
      title: "[Feat] Upload d'images dans l'éditeur TipTap",
      milestone: ms2,
      labels: ['type: feature', 'priority: high', 'scope: news'],
      body: userStoryBody({
        asA: 'rédacteur',
        iWant:
          "insérer des images dans l'éditeur TipTap par glisser-déposer ou copier-coller",
        soThat:
          "mes articles soient visuellement riches sans quitter l'éditeur",
        acceptanceCriteria:
          "- [ ] Drag & drop d'image dans l'éditeur → upload automatique vers Scaleway\n- [ ] Coller une image depuis le presse-papiers → upload automatique\n- [ ] Barre d'outils avec bouton d'insertion d'image\n- [ ] Redimensionnement automatique (max-width configurable)\n- [ ] Indicateur de progression d'upload\n- [ ] Formats acceptés : JPEG, PNG, WebP, GIF\n- [ ] Taille max : 10 Mo",
        additionalContext: "Dépend de Scaleway Storage et de l'Éditeur TipTap.",
      }),
    },
    {
      title: '[Feat] Liste publique des actualités',
      milestone: ms2,
      labels: ['type: feature', 'priority: high', 'scope: news'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          'consulter les actualités publiées, filtrées par tag ou département',
        soThat:
          "je reste informé des nouvelles pertinentes pour mon département ou l'ensemble de l'IUT",
        acceptanceCriteria:
          "- [ ] Page `/actualites` accessible aux utilisateurs connectés\n- [ ] Grille d'articles publiés avec image de couverture, titre, excerpt, date, auteur\n- [ ] Pagination côté serveur\n- [ ] Filtres par tag\n- [ ] Filtres par département (avec code couleur)\n- [ ] Barre de recherche plein texte\n- [ ] Articles ciblés sur un département affichés avec son code couleur de spécialité",
        additionalContext:
          "Les articles avec audience spécifique ne s'affichent qu'aux utilisateurs concernés.",
      }),
    },
    {
      title: "[Feat] Page détail d'un article",
      milestone: ms2,
      labels: ['type: feature', 'priority: high', 'scope: news'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant: "lire le contenu complet d'un article",
        soThat: "je puisse me tenir informé de l'actualité de l'IUT",
        acceptanceCriteria:
          '- [ ] Page `/actualites/[slug]` avec rendu du contenu TipTap\n- [ ] Affichage : titre, image de couverture, auteur, date de publication\n- [ ] Tags cliquables (filtrent la liste des actualités)\n- [ ] Badge département si article ciblé\n- [ ] Section articles liés (même tag ou même auteur)\n- [ ] Breadcrumb (Accueil > Actualités > Titre)\n- [ ] Meta SEO basiques (title, description)',
        additionalContext:
          'Le rendu TipTap utilise `@tiptap/vue-3` en mode lecture seule.',
      }),
    },
    {
      title: '[Feat] Permissions articles',
      milestone: ms2,
      labels: ['type: feature', 'priority: high', 'scope: news', 'scope: auth'],
      body: taskBody({
        taskType: '⚙️ Backend',
        description:
          "Implémenter les règles de permissions pour les articles : création/édition réservée aux admin et editor, lecture filtrée selon l'audience, brouillons visibles uniquement par l'auteur et les admins.",
        steps:
          "- [ ] `editorProcedure` : création, édition, suppression d'articles\n- [ ] `authenticatedProcedure` : lecture des articles publiés selon audience\n- [ ] Filtre audience : article ciblé sur un département = visible uniquement par les membres\n- [ ] Brouillons : visibles uniquement par auteur et admin\n- [ ] Articles SCHEDULED : non accessibles en lecture publique avant `publishedAt`\n- [ ] Tests unitaires des règles de permissions",
        additionalContext:
          'Un utilisateur en service transverse voit tous les articles sans restriction de département.',
      }),
    },
    {
      title: "[Feat] Publication programmée d'articles",
      milestone: ms2,
      labels: ['type: feature', 'priority: medium', 'scope: news'],
      body: taskBody({
        taskType: '⚙️ Backend',
        description:
          'Mettre en place un job périodique qui passe automatiquement les articles `SCHEDULED` en `PUBLISHED` lorsque la date `publishedAt` est atteinte.',
        steps:
          '- [ ] Créer un job cron (ou équivalent) dans `packages/api`\n- [ ] Requête : `UPDATE Article SET status = PUBLISHED WHERE status = SCHEDULED AND publishedAt <= NOW()`\n- [ ] Gérer les erreurs et logger les publications effectuées\n- [ ] Configurer la fréquence (ex: toutes les minutes)\n- [ ] Tester avec un article programmé dans le passé',
        additionalContext:
          'Stocker les dates en UTC. Peut utiliser `node-cron` ou un système de queue.',
      }),
    },

    // ═══════════════════════════════════════════════════════════════
    // MILESTONE 3 — Sprint 3 : Newsletter, Agenda, RH
    // ═══════════════════════════════════════════════════════════════
    {
      title: '[Chore] Setup Resend + package email',
      milestone: ms3,
      labels: ['type: chore', 'priority: critical', 'scope: newsletter'],
      body: taskBody({
        taskType: '⚙️ Backend',
        description:
          'Créer le package `email` avec templates Handlebars. Système de cache des templates. Helpers pour envoi via Resend. Templates aux couleurs IUT-LCO. Interface de prévisualisation email (route dev-only).',
        steps:
          '- [ ] Créer `packages/email` avec Resend SDK\n- [ ] Configurer variable `RESEND_API_KEY`\n- [ ] Créer le layout Handlebars : header avec logo IUT-LCO, footer avec coordonnées\n- [ ] Appliquer les couleurs IUT-LCO dans les templates\n- [ ] Système de cache des templates compilés\n- [ ] Helper `sendEmail(to, subject, template, data)`\n- [ ] Route dev-only `/dev/email-preview` pour visualiser les templates\n- [ ] Template de test (email de bienvenue)',
        additionalContext:
          'Les templates Handlebars doivent être responsives et compatibles avec les principaux clients email.',
      }),
    },
    {
      title: '[Feat] Modèle Subscription newsletter',
      milestone: ms3,
      labels: [
        'type: feature',
        'priority: high',
        'scope: newsletter',
        'scope: db',
      ],
      body: userStoryBody({
        asA: 'développeur',
        iWant:
          'avoir un modèle de données pour les abonnements à la newsletter avec des tokens de désabonnement sécurisés',
        soThat:
          'les utilisateurs puissent gérer leurs abonnements de manière sécurisée et conforme RGPD',
        acceptanceCriteria:
          '- [ ] Modèle `NewsletterSubscription` : userId (FK), frequency (enum WEEKLY|MONTHLY), isActive, unsubscribeToken, lastSentAt\n- [ ] Token de désabonnement : généré via `crypto.randomBytes`, single-use\n- [ ] Migration et seed\n- [ ] Types partagés dans `packages/shared-types`\n- [ ] Procédures tRPC : `subscribe`, `unsubscribe`, `updateFrequency`',
        additionalContext:
          'Les tokens sont single-use : une fois le désabonnement effectué, le token est invalidé. Conforme aux exigences RGPD.',
      }),
    },
    {
      title: '[Feat] Génération et envoi de la newsletter',
      milestone: ms3,
      labels: ['type: feature', 'priority: high', 'scope: newsletter'],
      body: userStoryBody({
        asA: 'utilisateur abonné',
        iWant:
          'recevoir une newsletter périodique avec les articles publiés depuis le dernier envoi',
        soThat:
          "je reste informé sans avoir à me connecter à l'intranet tous les jours",
        acceptanceCriteria:
          "- [ ] Job périodique (hebdomadaire/mensuel selon fréquence abonné)\n- [ ] Génération d'un digest des articles publiés depuis `lastSentAt`\n- [ ] Template Handlebars conforme charte IUT-LCO\n- [ ] Envoi groupé via Resend (batch)\n- [ ] Lien de désabonnement dans chaque email\n- [ ] Mise à jour de `lastSentAt` après envoi\n- [ ] Gestion des erreurs d'envoi (retry, log)",
        additionalContext:
          'Les articles ciblés sur un département ne doivent être inclus que pour les abonnés du département concerné.',
      }),
    },
    {
      title: "[Feat] Pages d'abonnement et désabonnement newsletter",
      milestone: ms3,
      labels: ['type: feature', 'priority: high', 'scope: newsletter'],
      body: userStoryBody({
        asA: 'utilisateur',
        iWant:
          'gérer mon abonnement à la newsletter et me désabonner via un lien email',
        soThat:
          'je contrôle la fréquence de réception et puisse me désabonner facilement',
        acceptanceCriteria:
          '- [ ] Section newsletter dans la page `/profil` : toggle actif/inactif, sélection fréquence\n- [ ] Page publique de désabonnement `/newsletter/unsubscribe?token=xxx`\n- [ ] Token vérifié et invalidé après désabonnement (single-use)\n- [ ] Confirmation de désabonnement affichée\n- [ ] Lien de désabonnement dans chaque email de newsletter\n- [ ] Design conforme charte IUT-LCO',
        additionalContext:
          'La page de désabonnement est publique (accessible sans connexion). Le token doit être validé côté serveur.',
      }),
    },
    {
      title: '[Feat] Modèle Event et agenda',
      milestone: ms3,
      labels: [
        'type: feature',
        'priority: critical',
        'scope: agenda',
        'scope: db',
      ],
      body: userStoryBody({
        asA: 'développeur',
        iWant:
          'avoir un modèle de données complet pour les événements et les participations',
        soThat: "l'agenda puisse gérer invitations, RSVP et exports iCal",
        acceptanceCriteria:
          '- [ ] Modèle `Event` : titre, description, startAt, endAt, location, site (enum Site), departmentId (FK optionnel), videoLink, organizerId (FK User), audience, isPublic\n- [ ] Modèle `EventParticipant` : eventId, userId, status (enum PENDING|ACCEPTED|DECLINED)\n- [ ] Migration et seed avec événements de test\n- [ ] Types partagés dans `packages/shared-types`',
        additionalContext:
          'Le champ `videoLink` est libre pour le moment (décision outil visio reportée à une réunion dédiée).',
      }),
    },
    {
      title: '[Feat] Vue agenda',
      milestone: ms3,
      labels: ['type: feature', 'priority: critical', 'scope: agenda'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          "consulter l'agenda de l'IUT-LCO en vue mensuelle et hebdomadaire",
        soThat:
          'je visualise facilement les événements à venir, filtrés par site ou département',
        acceptanceCriteria:
          "- [ ] Page `/agenda` accessible aux utilisateurs connectés\n- [ ] Vue mensuelle et vue hebdomadaire (toggle)\n- [ ] Navigation précédent/suivant/aujourd'hui\n- [ ] Filtres : site, département, audience\n- [ ] Événements colorés selon département/spécialité\n- [ ] Clic sur un événement → détail (titre, lieu, horaire, lien vidéo si renseigné)\n- [ ] Responsive mobile",
        additionalContext:
          'Peut utiliser `v-calendar` ou `FullCalendar`. Les couleurs suivent les tokens de spécialité.',
      }),
    },
    {
      title: "[Feat] Création et édition d'événement",
      milestone: ms3,
      labels: ['type: feature', 'priority: high', 'scope: agenda'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant: "créer et éditer des événements dans l'agenda",
        soThat:
          "mes collègues soient informés des réunions, formations et événements que j'organise",
        acceptanceCriteria:
          "- [ ] Formulaire de création : titre, description, date début/fin, lieu, site, département (optionnel), vidéo link, audience\n- [ ] Pré-remplissage : organisateur = utilisateur courant, site = site de l'utilisateur\n- [ ] Validation Zod côté serveur et client\n- [ ] Édition possible par organisateur et admin\n- [ ] Suppression avec confirmation\n- [ ] Champ `videoLink` libre (texte, pas de validation d'outil spécifique)",
        additionalContext:
          "La décision sur l'outil visio est reportée à une réunion dédiée.",
      }),
    },
    {
      title: '[Feat] RSVP et invitations email',
      milestone: ms3,
      labels: ['type: feature', 'priority: high', 'scope: agenda'],
      body: userStoryBody({
        asA: "organisateur d'événement",
        iWant: 'inviter des participants et recevoir leurs réponses par email',
        soThat: 'je sache combien de personnes participeront à mon événement',
        acceptanceCriteria:
          "- [ ] Sélection des participants à la création/édition d'un événement\n- [ ] Envoi d'email d'invitation conforme charte IUT-LCO avec lien Accept/Refuser\n- [ ] Page de RSVP `/agenda/rsvp?token=xxx&response=accepted`\n- [ ] Token single-use pour le RSVP (cryptographiquement sécurisé)\n- [ ] Mise à jour `EventParticipant.status` sur réponse\n- [ ] Notification à l'organisateur par email\n- [ ] Affichage du nombre de réponses sur la fiche événement",
        additionalContext:
          'Dépend du package email (Resend). Les tokens RSVP suivent le même pattern que les tokens de désabonnement.',
      }),
    },
    {
      title: '[Feat] Export iCal',
      milestone: ms3,
      labels: ['type: feature', 'priority: medium', 'scope: agenda'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          'exporter mon agenda IUT-LCO vers mon application de calendrier (Google Calendar, Outlook…)',
        soThat:
          "je n'aie pas à vérifier l'intranet pour connaître mes événements",
        acceptanceCriteria:
          "- [ ] Endpoint `/api/calendar/[token].ics` générant un flux iCal valide (RFC 5545)\n- [ ] Token personnalisé stable par utilisateur (non single-use, révocable)\n- [ ] Inclut : événements créés par l'utilisateur + événements où il est invité\n- [ ] Champs iCal : SUMMARY, DESCRIPTION, DTSTART, DTEND, LOCATION, URL\n- [ ] Page de configuration dans `/profil` : affichage URL, bouton de régénération du token\n- [ ] Content-Type `text/calendar`",
        additionalContext:
          'Utiliser la librairie `ical-generator` ou similaire.',
      }),
    },
    {
      title: '[Feat] Modèle HRDocument et espace RH',
      milestone: ms3,
      labels: ['type: feature', 'priority: high', 'scope: hr', 'scope: db'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          'accéder à un espace RH listant les documents officiels par catégorie',
        soThat:
          "je trouve facilement les formulaires, procédures et informations RH dont j'ai besoin",
        acceptanceCriteria:
          '- [ ] Modèle `HRDocument` : titre, description, fileUrl, category, publishedAt, audience\n- [ ] Page `/rh` accessible aux utilisateurs connectés\n- [ ] Documents listés par catégorie avec titre, description, date\n- [ ] Téléchargement PDF via lien signé Scaleway\n- [ ] Filtres par catégorie\n- [ ] Migration et seed\n- [ ] Types partagés dans `packages/shared-types`',
        additionalContext:
          "L'audience suit la même logique que les articles. L'interface admin RH est traitée séparément.",
      }),
    },
    {
      title: '[Feat] Upload et gestion documents RH',
      milestone: ms3,
      labels: ['type: feature', 'priority: high', 'scope: hr'],
      body: userStoryBody({
        asA: 'responsable RH (rôle hr ou admin)',
        iWant: 'uploader et gérer les documents RH depuis une interface dédiée',
        soThat: 'les documents soient disponibles et à jour pour le personnel',
        acceptanceCriteria:
          '- [ ] Interface admin `/admin/rh` réservée aux rôles `hr` et `admin` (via `hrProcedure`)\n- [ ] Upload de PDF vers Scaleway Object Storage\n- [ ] Formulaire : titre, description, catégorie, audience\n- [ ] Liste des documents avec actions modifier/supprimer\n- [ ] Suppression physique du fichier sur Scaleway\n- [ ] Validation : format PDF uniquement, taille max 50 Mo',
        additionalContext:
          'Accès strictement limité aux rôles `hr` et `admin`.',
      }),
    },

    // ═══════════════════════════════════════════════════════════════
    // MILESTONE 4 — Sprint 4 : Photothèque, Plans, Organigramme, Documentation
    // ═══════════════════════════════════════════════════════════════
    {
      title: '[Feat] Modèle Photo et Album',
      milestone: ms4,
      labels: ['type: feature', 'priority: high', 'scope: photos', 'scope: db'],
      body: userStoryBody({
        asA: 'développeur',
        iWant:
          'avoir un modèle de données pour les albums photo et les photos avec modération',
        soThat:
          "la photothèque permette l'upload par tous et la modération par les admins",
        acceptanceCriteria:
          '- [ ] Modèle `Album` : titre, description, coverUrl, site (enum Site), departmentId (optionnel FK), createdBy (FK User)\n- [ ] Modèle `Photo` : url, caption, albumId (FK), uploadedBy (FK User), status (enum PENDING|APPROVED|REJECTED), rejectionReason\n- [ ] Relation `Photo ↔ Tag` (many-to-many)\n- [ ] Migration et seed avec album de test\n- [ ] Types partagés dans `packages/shared-types`',
        additionalContext:
          'Les photos sont PENDING par défaut. Seules les photos APPROVED sont visibles dans la galerie publique.',
      }),
    },
    {
      title: '[Feat] Photothèque — galerie et upload pour tous',
      milestone: ms4,
      labels: ['type: feature', 'priority: high', 'scope: photos'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          "consulter la galerie photo de l'IUT et uploader mes propres photos",
        soThat: "je partage des moments de la vie de l'IUT avec mes collègues",
        acceptanceCriteria:
          "- [ ] Page `/photos` : galerie d'albums filtrables par site et département\n- [ ] Page `/photos/[albumId]` : grille des photos approuvées de l'album\n- [ ] Upload accessible à tous les utilisateurs authentifiés\n- [ ] Formulaire upload : sélection album (ou création), caption, une ou plusieurs photos\n- [ ] Statut PENDING par défaut après upload\n- [ ] Message info : photo en attente de modération\n- [ ] Design conforme charte IUT-LCO",
        additionalContext:
          'Dépend de Scaleway Storage et du Modèle Photo/Album. La modération est traitée séparément.',
      }),
    },
    {
      title: '[Feat] Modération photothèque',
      milestone: ms4,
      labels: ['type: feature', 'priority: high', 'scope: photos'],
      body: userStoryBody({
        asA: 'administrateur',
        iWant: 'modérer les photos uploadées par les utilisateurs',
        soThat:
          'seules des photos appropriées soient visibles dans la galerie publique',
        acceptanceCriteria:
          "- [ ] Interface `/admin/photos` réservée au rôle `admin`\n- [ ] Liste des photos en attente (PENDING) avec aperçu, uploader, date\n- [ ] Actions : Approuver → status APPROVED, Rejeter → status REJECTED + motif\n- [ ] Email de notification à l'uploader en cas de rejet\n- [ ] Filtres par statut (PENDING, APPROVED, REJECTED)\n- [ ] Suppression physique possible par l'admin",
        additionalContext:
          "Dépend du package email (Resend). L'approbation rend la photo immédiatement visible dans la galerie.",
      }),
    },
    {
      title: '[Feat] Composant LazyLoad photos',
      milestone: ms4,
      labels: [
        'type: feature',
        'priority: medium',
        'scope: photos',
        'scope: ui',
      ],
      body: taskBody({
        taskType: '🎨 Frontend',
        description:
          'Créer ou adapter un composant de chargement progressif des images pour la galerie photo. IntersectionObserver pour le lazy load, états progressifs (placeholder, chargement, erreur).',
        steps:
          "- [ ] Composant `LazyImage.vue` avec IntersectionObserver\n- [ ] Placeholder (skeleton ou blur hash)\n- [ ] État de chargement progressif (fade-in)\n- [ ] État d'erreur avec fallback image\n- [ ] Intégration dans la galerie photos\n- [ ] Composant typé TypeScript",
        additionalContext:
          'Améliore les performances de la galerie. Réutilise les patterns existants si disponibles.',
      }),
    },
    {
      title: '[Feat] Page Plans des sites',
      milestone: ms4,
      labels: ['type: feature', 'priority: medium', 'scope: plans'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant: "consulter le plan d'un site de l'IUT-LCO",
        soThat:
          'je me repère facilement sur les 4 sites (Boulogne, Calais, Dunkerque, Saint-Omer)',
        acceptanceCriteria:
          '- [ ] Page `/plans` avec sélection du site (tabs ou dropdown)\n- [ ] Affichage du plan correspondant (image ou PDF)\n- [ ] Viewer avec zoom et déplacement (pinch-to-zoom mobile)\n- [ ] 4 sites : Boulogne-sur-Mer, Calais, Dunkerque, Saint-Omer\n- [ ] Plans hébergés sur Scaleway Object Storage\n- [ ] Téléchargement PDF possible\n- [ ] Design conforme charte IUT-LCO',
        additionalContext:
          "Les plans (images ou PDF) sont fournis par l'IUT. Si disponibles en PDF, utiliser un viewer PDF léger (ex: `pdfjs-dist`).",
      }),
    },
    {
      title: '[Feat] Page Déplacements',
      milestone: ms4,
      labels: ['type: feature', 'priority: medium', 'scope: plans'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          'accéder aux procédures et formulaires de déplacements professionnels',
        soThat: 'je sache comment préparer et déclarer mes déplacements',
        acceptanceCriteria:
          '- [ ] Page `/deplacements` avec structure FAQ ou sections\n- [ ] Liens vers formulaires officiels de remboursement\n- [ ] Contenu éditable par les admins via modèle `InfoPage` (slug, titre, contenu riche)\n- [ ] Modèle `InfoPage` : slug (unique), titre, content (JSON TipTap), updatedBy, updatedAt\n- [ ] Interface admin pour éditer le contenu\n- [ ] Design conforme charte IUT-LCO',
        additionalContext:
          "Le modèle `InfoPage` est réutilisable pour d'autres pages de contenu statique.",
      }),
    },
    {
      title: '[Feat] Organigramme automatique',
      milestone: ms4,
      labels: ['type: feature', 'priority: high', 'scope: org-chart'],
      body: userStoryBody({
        asA: 'utilisateur connecté',
        iWant:
          "visualiser l'organigramme de l'IUT-LCO généré automatiquement depuis les données des utilisateurs",
        soThat:
          'je comprenne la hiérarchie et puisse naviguer vers les fiches profil',
        acceptanceCriteria:
          "- [ ] Page `/organigramme` accessible aux utilisateurs connectés\n- [ ] Génération automatique depuis `User.managerId`\n- [ ] Visualisation arborescente groupée par site puis département\n- [ ] Nœuds cliquables → lien vers fiche profil\n- [ ] Couleurs par spécialité (tokens de la charte)\n- [ ] Responsive / zoom\n- [ ] Gestion des utilisateurs sans manager (racines de l'arbre)\n- [ ] Gestion des services transverses",
        additionalContext:
          'Peut utiliser `d3-hierarchy`, `vue-org-tree` ou un composant custom.',
      }),
    },
    {
      title: '[Docs] Documentation utilisateur',
      milestone: ms4,
      labels: ['type: docs', 'priority: medium'],
      body: docBody({
        whatToDocument:
          "Guides d'utilisation destinés aux différents profils :\n\n1. **Rédacteur** : comment publier un article (TipTap, ciblage audience, tags, programmation)\n2. **Administrateur** : comment gérer les utilisateurs (rôles, suspension), modérer les photos, gérer les documents RH\n3. **Responsable RH** : comment uploader et gérer les documents RH\n4. **Utilisateur** : comment uploader une photo, s'abonner à la newsletter, exporter l'agenda iCal\n\nFormat markdown dans le repo (`docs/guide-*.md`) + page `/aide` accessible en ligne dans l'intranet.",
        additionalContext:
          "Les guides doivent être illustrés de captures d'écran. La page `/aide` liste les guides avec liens de téléchargement.",
      }),
    },
    {
      title: '[Docs] Documentation technique',
      milestone: ms4,
      labels: ['type: docs', 'priority: high'],
      body: docBody({
        whatToDocument:
          "Documentation technique pour les développeurs :\n\n1. **Architecture du monorepo** : rôle de chaque package, dépendances inter-packages\n2. **Modèle de données** : diagramme ERD, sites/départements/spécialités, conventions\n3. **Conventions tRPC et permissions** : comment créer une nouvelle procédure, tester les middlewares\n4. **Procédure de déploiement** : variables d'env, migration Prisma, build, déploiement JRCanDev\n5. **Ajouter une nouvelle feature** : conventions branches/commits, création issue, PR template\n6. **Gestion des migrations Prisma** : créer, appliquer, rollback\n\nFormat markdown dans `docs/` du repo.",
        additionalContext:
          'À compléter progressivement pendant les 4 sprints. La documentation de déploiement est critique pour la mise en prod.',
      }),
    },

    // ═══════════════════════════════════════════════════════════════
    // MILESTONE 5 — Reprise : Valeur ajoutée et mise en production
    // ═══════════════════════════════════════════════════════════════
    {
      title: '[Feat] Intégration SSO UlCO',
      milestone: ms5,
      labels: [
        'type: feature',
        'priority: medium',
        'scope: auth',
        'security',
        'status: blocked',
      ],
      body: userStoryBody({
        asA: 'utilisateur IUT-LCO',
        iWant: "me connecter à l'intranet avec mon compte UlCO (SSO)",
        soThat: "je n'aie pas à gérer un mot de passe supplémentaire",
        acceptanceCriteria:
          "- [ ] Identification du protocole UlCO (CAS, Shibboleth ou OIDC)\n- [ ] Provider Better Auth custom pour le protocole identifié\n- [ ] Migration des comptes existants (email/password → SSO)\n- [ ] Coexistence email/password + SSO pendant la période de transition\n- [ ] Tests d'intégration SSO\n- [ ] Documentation de la configuration SSO",
        additionalContext:
          "⚠️ Conditionnel à la réception d'une réponse de l'UlCO. Si pas de réponse, cette issue reste en backlog.",
      }),
    },
    {
      title: '[Feat] Feature bonus Sprint 5',
      milestone: ms5,
      labels: ['type: feature', 'priority: low', 'status: needs-info'],
      body: taskBody({
        taskType: '🔍 Research / Spike',
        description:
          'Feature bonus à définir selon les priorités des commanditaires en fin de Sprint 8. Candidats : visio intégrée, recherche globale, notifications in-app, export annuaire.',
        steps:
          "- [ ] Recueillir les retours commanditaires en fin de Sprint 8\n- [ ] Voter/prioriser la feature bonus\n- [ ] Cadrage rapide (user story, critères d'acceptation)\n- [ ] Mettre à jour cette issue avec le scope définitif\n- [ ] Implémentation",
        additionalContext:
          'Candidats : visio intégrée (réunion dédiée), recherche globale (Meilisearch ?), notifications in-app, export annuaire (CSV/Excel).',
      }),
    },
    {
      title: '[Chore] Tests E2E parcours critiques',
      milestone: ms5,
      labels: ['type: chore', 'priority: high', 'scope: infra'],
      body: taskBody({
        taskType: '🧪 Tests',
        description:
          "Écrire les tests end-to-end Playwright pour les parcours critiques de l'application.",
        steps:
          "- [ ] Configurer Playwright dans le monorepo\n- [ ] Test : signup → login → logout\n- [ ] Test : publication d'un article (editor)\n- [ ] Test : création d'un événement avec RSVP\n- [ ] Test : upload d'un document RH (hr)\n- [ ] Test : désabonnement newsletter via token\n- [ ] Test : upload photo → modération\n- [ ] Intégrer les tests E2E dans le workflow CI/CD",
        additionalContext:
          'Les tests doivent tourner contre un environnement de staging avec une base de données de test.',
      }),
    },
    {
      title: '[Chore] Hardening sécurité et conformité RGPD',
      milestone: ms5,
      labels: [
        'type: chore',
        'priority: critical',
        'scope: auth',
        'scope: infra',
        'security',
      ],
      body: taskBody({
        taskType: '🛠️ DevOps / Infra',
        description:
          'Audit de sécurité et conformité RGPD avant mise en production.',
        steps:
          "- [ ] Rate limiting sur les endpoints publics (auth, newsletter)\n- [ ] Content Security Policy (CSP) configuré\n- [ ] Headers de sécurité (HSTS, X-Frame-Options, X-Content-Type-Options)\n- [ ] HTTPS enforcement\n- [ ] Audit des dépendances npm (vulnérabilités)\n- [ ] Documentation RGPD : registre des traitements, durées de conservation\n- [ ] Droit à l'effacement : procédure de suppression de compte\n- [ ] Page mentions légales conforme charte IUT-LCO\n- [ ] Revue des permissions tRPC",
        additionalContext:
          'Priorité critique avant mise en production. Les tokens doivent être stockés en httpOnly cookies, pas localStorage.',
      }),
    },
    {
      title: '[Chore] Refacto et qualité de code',
      milestone: ms5,
      labels: ['type: chore', 'priority: medium'],
      body: taskBody({
        taskType: '⚙️ Backend',
        description:
          'Reprise du code livré pendant les 4 sprints : amélioration des patterns, extraction de la logique commune, nettoyage.',
        steps:
          '- [ ] Review du code des 4 sprints\n- [ ] Extraction de helpers/composables communs\n- [ ] Élimination des duplications\n- [ ] Vérification de la couverture TypeScript (strict mode)\n- [ ] Nettoyage des `TODO` et `FIXME`\n- [ ] Mise à jour de la documentation inline\n- [ ] Vérification des patterns tRPC (procédures, validations Zod)',
        additionalContext:
          'Basé sur les retours des reviews continues. Prioriser auth et permissions.',
      }),
    },
    {
      title: '[Chore] Mise en production',
      milestone: ms5,
      labels: ['type: chore', 'priority: critical', 'scope: infra'],
      body: taskBody({
        taskType: '🛠️ DevOps / Infra',
        description:
          'Coordination finale avec JRCanDev pour le déploiement en production : configuration, monitoring, backups, secrets.',
        steps:
          "- [ ] Déploiement sur l'infrastructure JRCanDev\n- [ ] Configuration des variables d'environnement de production\n- [ ] Mise en place du monitoring (uptime, erreurs)\n- [ ] Configuration des backups PostgreSQL automatiques\n- [ ] Rotation des secrets (token Better Auth, clés Scaleway, Resend API key)\n- [ ] Plan de reprise d'activité documenté\n- [ ] Tests de smoke en production\n- [ ] Communication aux utilisateurs (email de lancement)",
        additionalContext:
          'Dépend de la Coordination hébergement JRCanDev et du Hardening sécurité. Nécessite que tous les tests E2E passent.',
      }),
    },
  ]

  // ── Create issues ─────────────────────────────────────────────────

  console.log(`\n📋 ${issues.length} issues à créer (dry_run=${dryRun})\n`)

  let created = 0
  let failed = 0

  for (const issue of issues) {
    if (dryRun) {
      console.log(
        `[DRY RUN] Would create: ${issue.title} → milestone ${issue.milestone}`,
      )
      created++
      continue
    }

    try {
      const payload = {
        owner,
        repo,
        title: issue.title,
        body: issue.body,
        labels: issue.labels,
      }
      if (issue.milestone) payload.milestone = issue.milestone

      const result = await github.rest.issues.create(payload)
      console.log(`✅ #${result.data.number} — ${issue.title}`)
      created++

      // Pause to respect GitHub API rate limits
      await new Promise((r) => setTimeout(r, 400))
    } catch (err) {
      console.error(`❌ ERREUR pour "${issue.title}" :`, err.message)
      failed++
    }
  }

  console.log(`\n🎉 Terminé ! ${created} issues créées, ${failed} erreurs.`)
}
