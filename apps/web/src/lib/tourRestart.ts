// The event that starts the tutorial again. Kept apart from components/Tour.tsx, which may only
// export components (fast refresh).

export const TOUR_RESTART = 'kaye:tour'

/** Starts the tutorial again from the first step (Configurações). */
export function startTour() {
  window.dispatchEvent(new Event(TOUR_RESTART))
}
