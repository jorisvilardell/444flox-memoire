import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Entry from '#models/entry'
import type { EntryFormat, EntryMeta, EntryType } from '#models/entry_types'

interface SeedEntry {
  title: string
  type: EntryType
  subtitle?: string
  format?: EntryFormat
  content?: string
  image?: string
  tags: string[]
  meta?: EntryMeta
  date: string
}

const SEED: SeedEntry[] = [
  {
    title: 'No-Label & Anonymat',
    type: 'TEXTE',
    subtitle: 'Stratégies du vêtement technique',
    format: 'paragraph',
    content:
      "La suppression de l'étiquette constitue un acte réflexif de refus de la marque commerciale. Le vêtement technique s'exprime exclusivement par son patronage.",
    tags: ['TEXTILE', 'DESIGN', 'CONCEPT'],
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000',
    date: '05/11/2026',
  },
  {
    title: 'Sérigraphie Brute & Cuisson',
    type: 'RÉFÉRENCES',
    content: "Expérimentation d'empâtement d'encre plastisol et spray 7A sur molleton lourd.",
    tags: ['SÉRIGRAPHIE', 'CRAFT', 'PRINT'],
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1000',
    meta: {
      apaRefArtist: 'Overmade Workshop',
      apaRefYear: '2026',
      apaRefTitle: 'Série Textile N°04',
      apaRefSource: 'Belle de Mai, Marseille',
    },
    date: '03/11/2026',
  },
  {
    title: 'Naomi Klein // No Logo',
    type: 'CITATION',
    content:
      "Les marques ne produisent pas des choses, mais des significations. Le design alternatif réapproprie l'objet matériel contre la domination du signe.",
    tags: ['THEORIE', 'CRITIQUE', 'BRANDING'],
    meta: {
      apaCiteAuthor: 'Klein, N.',
      apaCiteYear: '2000',
      apaCiteBook: 'No Logo: Taking Aim at the Brand Bullies',
      apaCitePublisher: 'Knopf Canada',
      apaCitePage: 'p. 28',
    },
    date: '01/11/2026',
  },
  {
    title: 'Atelier Upcycling Marseille',
    type: 'INTERVIEW',
    tags: ['INTERVIEW', 'MARSEILLE', 'UPCYCLING'],
    meta: {
      speaker1: 'Florent (ESDM)',
      speaker2: 'Mathias (HYDDN)',
      dialogue: [
        { spk: 'spk1', text: "Comment penses-tu le 'no-label' dans ta production locale ?" },
        {
          spk: 'spk2',
          text: "On supprime les griffes apparentes pour valoriser la matière et l'assemblage technique.",
        },
      ],
    },
    date: '28/10/2026',
  },
  {
    title: 'Archives Streetwear Minimaliste',
    type: 'RÉFÉRENCES',
    content:
      'Recherche sur les silhouettes surdimensionnées des années 2000 couplées au minimalisme radical des designers belges.',
    tags: ['FASHION', 'ARCHIVES', '2000S'],
    image: 'https://images.unsplash.com/photo-1523398002811-999aa8e95707?q=80&w=1000',
    date: '20/10/2026',
  },
]

export default class EntrySeeder extends BaseSeeder {
  async run() {
    const [{ $extras }] = await Entry.query().count('* as total')
    if (Number($extras.total) > 0) return

    await Entry.createMany(
      SEED.map((item, index) => ({
        title: item.title,
        type: item.type,
        subtitle: item.subtitle ?? null,
        format: item.format ?? 'paragraph',
        content: item.content ?? '',
        imageUrl: item.image ?? null,
        tags: item.tags,
        meta: item.meta ?? {},
        position: index + 1,
        entryDate: DateTime.fromFormat(item.date, 'dd/MM/yyyy', { zone: 'utc' }),
      }))
    )
  }
}
