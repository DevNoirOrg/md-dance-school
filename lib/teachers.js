// A tánctanárok közös adatai — a főoldal (Tanáraink) és a tánctábor oldal is innen olvassa.
// A kártyára kattintva új lapon nyílik a tanár Instagram-videója.
// FIGYELEM: a `video` linkek még helyőrzők — cseréld a valódi Insta-videók linkjére.
const INSTA_PLACEHOLDER = 'https://www.instagram.com/'

export const teachers = [
  { src: '/canva/teacher-04-orangejersey.jpg', name: 'Jayson', style: 'Afro', video: INSTA_PLACEHOLDER },
  { src: '/canva/teacher-03-redpants.jpg', name: 'Lili', style: 'Koreo, Girly', video: INSTA_PLACEHOLDER },
  { src: '/canva/teacher-02-soxcap.jpg', name: 'Dalma', style: 'Hip-Hop', video: INSTA_PLACEHOLDER },
  { src: '/canva/teacher-01-beanie.jpg', name: 'Alex', style: 'Hip-Hop, House', video: INSTA_PLACEHOLDER },
  { src: '/canva/teacher-05-stool.jpg', name: 'Oliver', style: 'Hip-Hop', video: INSTA_PLACEHOLDER },
]

export const teacherByName = (name) => teachers.find((t) => t.name === name)
