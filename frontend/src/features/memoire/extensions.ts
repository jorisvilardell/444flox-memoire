import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style'
import { mergeAttributes } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { resolveImageUrl } from '../../shared/api-client'

export const FONTS = [
  { label: 'Helvetica', value: '' },
  { label: 'Instrument Sans', value: 'BodyFont' },
  { label: 'Tiro', value: 'TitleFont' },
]

export const FONT_SIZES = ['12px', '14px', '16px', '18px', '22px', '28px']

/** CMJN palette from the site's art direction; black clears the colour back to the text default. */
export const COLORS = [
  { label: 'Cyan', value: '#00b8d4', swatch: 'var(--cmyk-cyan)' },
  { label: 'Magenta', value: '#ff0055', swatch: 'var(--cmyk-magenta)' },
  { label: 'Jaune', value: '#e6b800', swatch: 'var(--cmyk-yellow)' },
  { label: 'Noir', value: '', swatch: 'var(--cmyk-black)' },
]

// Stored documents keep the relative /api/images/:id path; it is resolved against the API at render time,
// which also drops any src that is neither an uploaded image nor an http(s) URL.
const ApiImage = Image.extend({
  renderHTML({ HTMLAttributes }) {
    const src = resolveImageUrl(HTMLAttributes.src as string | undefined) ?? ''
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { src })]
  },
})

export const memoireExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    link: {
      openOnClick: false,
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
    },
  }),
  TextStyle,
  FontFamily,
  FontSize,
  Color,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'justify',
  }),
  ApiImage.configure({ HTMLAttributes: { class: 'memoire-image' } }),
]
