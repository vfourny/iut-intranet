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
} as const
