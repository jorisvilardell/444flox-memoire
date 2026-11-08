import { Fragment } from 'react'
import { ResourceEmbed } from './ResourceEmbed'
import type { Entry } from './types'

/** Only http(s) URLs become links, so a stored `javascript:` value can never run. */
function safeHttpUrl(raw: string | undefined): string | null {
  if (!raw?.trim()) return null
  try {
    const url = new URL(raw.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function Lines({ text }: { text: string }) {
  const lines = text.split('\n')
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ))
}

export function EntryBody({ entry }: { entry: Entry }) {
  const { meta } = entry

  switch (entry.type) {
    case 'TEXTE': {
      const items = entry.content.split('\n').filter((l) => l.trim())
      if (entry.format === 'bullet') {
        return (
          <ul className="preview-content" style={{ paddingLeft: '1.2rem', textAlign: 'left' }}>
            {items.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        )
      }
      if (entry.format === 'numbered') {
        return (
          <ol className="preview-content" style={{ paddingLeft: '1.2rem', textAlign: 'left' }}>
            {items.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ol>
        )
      }
      return (
        <p className="preview-content">
          <Lines text={entry.content} />
        </p>
      )
    }
    case 'CITATION':
      return (
        <>
          <blockquote className="apa-citation-block">« {entry.content} »</blockquote>
          {(meta.apaCiteAuthor || meta.apaCiteYear || meta.apaCiteBook) && (
            <div className="apa-reference-meta">
              Source : {meta.apaCiteAuthor} ({meta.apaCiteYear}). <em>{meta.apaCiteBook}</em>. {meta.apaCitePublisher}{' '}
              {meta.apaCitePage}
            </div>
          )}
        </>
      )
    case 'RÉFÉRENCES':
      return (
        <>
          <p className="preview-content">{entry.content}</p>
          {(meta.apaRefArtist || meta.apaRefYear || meta.apaRefTitle) && (
            <div className="apa-reference-meta">
              APA7 : {meta.apaRefArtist} ({meta.apaRefYear}). <em>{meta.apaRefTitle}</em> [Visuel]. {meta.apaRefSource}.
            </div>
          )}
        </>
      )
    case 'INTERVIEW': {
      const spk1 = meta.speaker1 || 'Interlocuteur 1'
      const spk2 = meta.speaker2 || 'Interlocuteur 2'
      return (
        <div className="chat-interview-container">
          {(meta.dialogue ?? []).map((d, i) => (
            <div key={i} className={`chat-turn ${d.spk}`}>
              <span className="chat-speaker">{d.spk === 'spk1' ? spk1 : spk2}</span>
              <div className="chat-bubble">{d.text}</div>
            </div>
          ))}
        </div>
      )
    }
    case 'RESSOURCE': {
      const href = safeHttpUrl(meta.apaResUrl)
      const link = (label: string) => (
        <a className="apa-res-link" href={href!} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      )
      return (
        <>
          <p className="preview-content">{entry.content}</p>
          {(meta.apaResAuthor || meta.apaResTitle) && (
            <div className="apa-reference-meta">
              APA7 : {meta.apaResAuthor} ({meta.apaResDate}).{' '}
              {href && meta.apaResTitle ? link(meta.apaResTitle) : meta.apaResTitle}. <em>{meta.apaResJournal}</em>.{' '}
              {href ? link(href) : meta.apaResUrl}
            </div>
          )}
          {href && <ResourceEmbed href={href} label={meta.apaResTitle} />}
        </>
      )
    }
  }
}
