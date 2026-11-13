import { useRef, type ReactNode } from 'react'
import { useEditorState, type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { notify } from '../../shared/toast'
import { COLORS, FONT_SIZES, FONTS } from './extensions'
import { Icon } from './icons'
import { useUploadMemoireImage } from './memoire.api'

type Align = 'left' | 'center' | 'justify'

function useFormatState(editor: Editor) {
  return useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const style = e.getAttributes('textStyle') as { fontFamily?: string; fontSize?: string; color?: string }
      return {
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        underline: e.isActive('underline'),
        link: e.isActive('link'),
        h2: e.isActive('heading', { level: 2 }),
        h3: e.isActive('heading', { level: 3 }),
        bulletList: e.isActive('bulletList'),
        orderedList: e.isActive('orderedList'),
        align: (['left', 'center', 'justify'] as const).find((a) => e.isActive({ textAlign: a })) ?? 'justify',
        fontFamily: style.fontFamily ?? '',
        fontSize: style.fontSize ?? '',
        color: style.color ?? '',
      }
    },
  })
}

function ToolButton(props: { label: string; active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`memoire-tool${props.active ? ' is-active' : ''}`}
      title={props.label}
      aria-label={props.label}
      aria-pressed={props.active}
      // Keeps the text selection while clicking a tool.
      onMouseDown={(e) => e.preventDefault()}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

function promptLink(editor: Editor) {
  const previous = editor.getAttributes('link').href as string | undefined
  const input = window.prompt('Adresse du lien (vide pour retirer le lien) :', previous ?? 'https://')
  if (input === null) return
  const href = input.trim()
  const chain = editor.chain().focus().extendMarkRange('link')
  if (!href) {
    chain.unsetLink().run()
  } else if (!/^(https?:\/\/|mailto:)/i.test(href)) {
    notify('Le lien doit commencer par https:// ou mailto:')
  } else {
    chain.setLink({ href }).run()
  }
}

function FormatButtons({ editor, state }: { editor: Editor; state: ReturnType<typeof useFormatState> }) {
  const align = (a: Align) => editor.chain().focus().setTextAlign(a).run()
  return (
    <>
      <div className="memoire-tool-group">
        <ToolButton label="Gras" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <b>B</b>
        </ToolButton>
        <ToolButton label="Italique" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <i>I</i>
        </ToolButton>
        <ToolButton
          label="Souligné"
          active={state.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </ToolButton>
      </div>
      <div className="memoire-tool-group">
        <ToolButton label="Aligner à gauche" active={state.align === 'left'} onClick={() => align('left')}>
          <Icon name="alignLeft" />
        </ToolButton>
        <ToolButton label="Centrer" active={state.align === 'center'} onClick={() => align('center')}>
          <Icon name="alignCenter" />
        </ToolButton>
        <ToolButton label="Justifier" active={state.align === 'justify'} onClick={() => align('justify')}>
          <Icon name="alignJustify" />
        </ToolButton>
      </div>
    </>
  )
}

/** Fixed toolbar shown above the page while the admin edits. */
export function MemoireToolbar({ editor }: { editor: Editor }) {
  const state = useFormatState(editor)
  const fileInput = useRef<HTMLInputElement>(null)
  const upload = useUploadMemoireImage()

  const insertImage = async (file: File) => {
    try {
      const { url } = await upload.mutateAsync(file)
      editor.chain().focus().setImage({ src: url, alt: '' }).run()
    } catch (err) {
      notify(`Image non envoyée : ${(err as Error).message}`)
    }
  }

  return (
    <div className="memoire-toolbar" role="toolbar" aria-label="Mise en forme">
      <div className="memoire-tool-group">
        <select
          className="memoire-select"
          aria-label="Police"
          value={state.fontFamily}
          onChange={(e) => {
            const chain = editor.chain().focus()
            if (e.target.value) chain.setFontFamily(e.target.value).run()
            else chain.unsetFontFamily().run()
          }}
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          className="memoire-select"
          aria-label="Taille"
          value={state.fontSize}
          onChange={(e) => {
            const chain = editor.chain().focus()
            if (e.target.value) chain.setFontSize(e.target.value).run()
            else chain.unsetFontSize().run()
          }}
        >
          <option value="">Taille</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="memoire-tool-group">
        <ToolButton
          label="Titre de partie"
          active={state.h2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          T1
        </ToolButton>
        <ToolButton
          label="Sous-titre"
          active={state.h3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          T2
        </ToolButton>
      </div>

      <FormatButtons editor={editor} state={state} />

      <div className="memoire-tool-group" aria-label="Couleur du texte">
        {COLORS.map((c) => (
          <button
            key={c.label}
            type="button"
            className={`memoire-swatch${state.color === c.value ? ' is-active' : ''}`}
            style={{ background: c.swatch }}
            title={c.label}
            aria-label={`Couleur ${c.label}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const chain = editor.chain().focus()
              if (c.value) chain.setColor(c.value).run()
              else chain.unsetColor().run()
            }}
          />
        ))}
      </div>

      <div className="memoire-tool-group">
        <ToolButton
          label="Liste à puces"
          active={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Icon name="bulletList" />
        </ToolButton>
        <ToolButton
          label="Liste numérotée"
          active={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <Icon name="orderedList" />
        </ToolButton>
        <ToolButton label="Lien" active={state.link} onClick={() => promptLink(editor)}>
          <Icon name="link" />
        </ToolButton>
        <ToolButton label={upload.isPending ? 'Envoi…' : 'Insérer une image'} onClick={() => fileInput.current?.click()}>
          <Icon name="image" />
        </ToolButton>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) void insertImage(file)
          }}
        />
      </div>
    </div>
  )
}

/** Compact menu that follows a text selection, as in the client's reference. */
export function MemoireBubbleMenu({ editor }: { editor: Editor }) {
  const state = useFormatState(editor)
  return (
    <BubbleMenu
      editor={editor}
      className="memoire-bubble"
      shouldShow={({ editor: e, state: s }) => e.isEditable && !s.selection.empty && !e.isActive('image')}
    >
      <FormatButtons editor={editor} state={state} />
      <div className="memoire-tool-group">
        <ToolButton label="Lien" active={state.link} onClick={() => promptLink(editor)}>
          <Icon name="link" />
        </ToolButton>
      </div>
    </BubbleMenu>
  )
}
