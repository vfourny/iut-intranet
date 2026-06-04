import { common } from '@/langs/fr/common.lang'

export const auth = {
  signIn: {
    error: 'Email ou mot de passe incorrect.',
    fields: {
      email: {
        label: common.fields.email,
        placeholder: "etudiant{'@'}iut.fr",
      },
      password: {
        label: common.fields.password,
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
        label: common.fields.email,
        placeholder: "etudiant{'@'}iut.fr",
      },
      firstName: {
        label: common.fields.firstName,
        placeholder: 'Jean',
      },
      jobTitle: {
        label: 'Intitulé de poste',
        placeholder: 'Enseignant-chercheur',
      },
      lastName: {
        label: common.fields.lastName,
        placeholder: 'Dupont',
      },
      password: {
        hint: '8 caractères minimum, majuscule, chiffre et caractère spécial requis.',
        label: common.fields.password,
        placeholder: '••••••••',
      },
      phone: {
        label: common.fields.phone,
        placeholder: '06 12 34 56 78',
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
