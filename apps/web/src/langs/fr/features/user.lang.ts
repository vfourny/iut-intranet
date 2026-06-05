export const user = {
  add: {
    actions: {
      cancel: 'Annuler',
      create: 'Créer un utilisateur',
      submit: "Créer l'utilisateur",
    },
    fields: {
      departmentCode: 'Département',
      email: 'Email',
      firstName: 'Prénom',
      jobTitle: 'Poste',
      lastName: 'Nom',
      phone: 'Téléphone',
      role: 'Rôle',
    },
    placeholders: {
      departmentCode: 'Sélectionner un département',
      email: "jean{'@'}univ-littoral.fr",
      firstName: 'Jean',
      jobTitle: 'Responsable RH',
      lastName: 'Dupont',
      phone: '06 12 34 56 78',
      role: 'Sélectionner un rôle',
    },
    sections: {
      account: 'Compte',
      department: 'Département',
      profile: 'Profil',
    },
    title: 'Nouvel utilisateur',
    toast: {
      error: {
        detail: 'Une erreur est survenue lors de la création.',
        summary: 'Erreur',
      },
      success: {
        detail: 'Le compte a bien été créé.',
        summary: 'Utilisateur créé',
      },
    },
  },
  search: 'Rechercher un utilisateur',
  table: {
    department: 'Département',
    email: 'Email',
    job: 'Poste',
    nom: 'Nom',
    phone: 'Téléphone',
    prénom: 'Prénom',
  },
}
