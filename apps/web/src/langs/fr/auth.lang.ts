export const auth = {
  signIn: {
    error: 'Email ou mot de passe incorrect.',
    fields: {
      email: {
        label: 'Email',
        placeholder: "etudiant{'@'}iut.fr",
      },
      password: {
        label: 'Mot de passe',
        placeholder: '••••••••',
      },
      rememberMe: 'Se souvenir de moi',
    },
    footer: {
      createAccount: 'Créer un compte',
      noAccount: 'Pas encore de compte ?',
    },
    header: {
      subtitle: 'Accédez à votre espace IUT',
      title: 'Connexion',
    },
    submit: 'Se connecter',
  },
  signOut: {
    label: 'Se déconnecter',
  },
  signUp: {
    error: 'Une erreur est survenue. Vérifiez vos informations.',
    fields: {
      confirmPassword: {
        label: 'Confirmer le mot de passe',
        mismatch: 'Les mots de passe ne correspondent pas.',
      },
      department: {
        label: 'Département',
        placeholder: 'Sélectionnez votre département',
      },
      email: {
        label: 'Email',
        placeholder: "etudiant{'@'}iut.fr",
      },
      firstName: {
        label: 'Prénom',
        placeholder: 'Jean',
      },
      jobTitle: {
        label: 'Intitulé de poste',
        placeholder: 'Enseignant-chercheur',
      },
      lastName: {
        label: 'Nom',
        placeholder: 'Dupont',
      },
      password: {
        hint: '8 caractères minimum, majuscule, chiffre et caractère spécial requis.',
        label: 'Mot de passe',
        placeholder: '••••••••',
      },
      phone: {
        label: 'Téléphone',
        placeholder: '0612345678',
      },
    },
    footer: {
      alreadyAccount: 'Déjà un compte ?',
      signIn: 'Se connecter',
    },
    header: {
      subtitle: 'Rejoignez votre intranet IUT',
      title: 'Créer un compte',
    },
    submit: 'Créer mon compte',
  },
} as const
