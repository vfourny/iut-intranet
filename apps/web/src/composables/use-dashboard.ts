import { computed } from 'vue'

import { useSession } from '@/api/auth.api'
import { useVisibleEvents } from '@/api/event.api'

// Fenêtre « à venir » bornée (≈ 6 mois) : la home n'est pas un calendrier, on
// borne donc la requête au lieu de tout charger.
const DASHBOARD_HORIZON_DAYS = 180

// Bornes alignées sur minuit : la clé de cache de `useVisibleEvents` dérive de
// `from/to.toISOString()`. Sans alignement, deux appelants (la liste et le
// compteur) construiraient des `new Date()` à quelques ms d'écart → clés
// distinctes → dédup cassée. Aligné au jour, la clé est identique partout.
const dashboardRange = () => {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date(from)
  to.setDate(to.getDate() + DASHBOARD_HORIZON_DAYS)
  return { from, to }
}

// Requête events partagée par la liste « à venir » et la StatCard correspondante.
// Une seule requête réseau grâce à la dédup par clé de Pinia Colada.
export const useDashboardEvents = () => {
  const { currentSession } = useSession()
  const { data: events } = useVisibleEvents(
    currentSession.value?.user.id ?? '',
    dashboardRange(),
  )

  const upcoming = computed(() =>
    (events.value ?? [])
      .filter((event) => new Date(event.startAt).getTime() >= Date.now())
      .sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      ),
  )

  return { upcoming }
}
