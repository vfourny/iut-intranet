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
  delete: {
    actions: {
      cancel: 'Annuler',
      confirm: 'Supprimer',
    },
    confirm: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
    title: 'Supprimer un utilisateur',
    toast: {
      error: {
        detail: 'Une erreur est survenue lors de la suppression.',
        summary: 'Erreur',
      },
      success: {
        detail: 'Le compte a bien été supprimé.',
        summary: 'Utilisateur supprimé',
      },
    },
  },
  edit: {
    actions: {
      cancel: 'Annuler',
      submit: 'Enregistrer les modifications',
    },
    title: 'Modifier un utilisateur',
    toast: {
      error: {
        detail: 'Une erreur est survenue lors de la modification.',
        summary: 'Erreur',
      },
      success: {
        detail: 'Le compte a bien été modifié.',
        summary: 'Utilisateur modifié',
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
