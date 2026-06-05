export const user = {
  add: {
    actions: {
      cancel: 'Annuler',
      create: 'Créer un utilisateur',
      submit: "Créer l'utilisateur",
    },
    fields: {
      departmentCode: 'Code',
      departmentId: 'ID',
      departmentSite: 'Site',
      email: 'Email',
      firstname: 'Prénom',
      jobTitle: 'Poste',
      name: 'Nom',
      password: 'Mot de passe',
      phone: 'Téléphone',
      role: 'Rôle',
    },
    placeholders: {
      departmentCode: 'Code',
      departmentId: 'dept-001',
      departmentSite: 'Site',
      email: "jean{'@'}univ-littoral.fr",
      firstname: 'Jean',
      jobTitle: 'Responsable RH',
      name: 'Dupont',
      password: '8 caractères minimum',
      phone: '06 12 34 56 78',
      role: 'Sélectionner',
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
