// Mock global de l'envoi d'email : aucun test de service ne doit toucher Resend.
// `email-and-password.config` (better-auth) importe `sendEmail` au chargement —
// ce mock est hoisté avant, donc le vrai module (et sa lecture de RESEND_API_KEY)
// n'est jamais évalué.
vi.mock('@iut-intranet/emails/email-sender', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
}))
