/** Mission / launch copy — terminology only; rockets appear on countdown, agenda, and scroll rail. */
export const missionCopy = {
  countdown: {
    pre: (dateLabel: string) => `T-MINUS TO ${dateLabel.toUpperCase()}`,
    live: 'LAUNCH IN PROGRESS',
    complete: 'MISSION COMPLETE',
  },
  sections: {
    about: {
      kicker: 'ABOUT THE CLUB',
      title: 'Built by students, for students',
    },
    highlights: {
      kicker: 'WHY ATTEND',
      title: 'What to expect',
    },
    agenda: {
      kicker: 'FLIGHT PATH',
      title: 'A full day, start to finish',
      blurb: 'Scroll the timeline — the rocket marks where you are in the day.',
    },
    gallery: {
      kicker: 'MISSION LOG',
      title: 'The community, in the room',
    },
    sponsors: {
      kicker: 'FUEL THE MISSION',
      title: 'Backed by the community',
    },
    faq: {
      kicker: 'PRE-FLIGHT CHECK',
      title: 'Good to know',
    },
    location: {
      kicker: 'LANDING ZONE',
      title: 'Find us on the day',
    },
  },
  nav: {
    location: 'LANDING ZONE',
    faq: 'PRE-FLIGHT',
    agenda: 'AGENDA',
  },
  cta: {
    kickerFallback: 'LAUNCH WINDOW',
  },
} as const;
