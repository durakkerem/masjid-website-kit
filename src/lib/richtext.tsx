import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

type Node = {
  type?: string
  tag?: string
  text?: string
  format?: number
  listType?: string
  fields?: { url?: string; newTab?: boolean }
  children?: Node[]
}

const BOLD = 1
const ITALIC = 1 << 1
const UNDERLINE = 1 << 3
const CODE = 1 << 4

function renderInline(node: Node, i: number): React.ReactNode {
  if (node.type === 'text' || !node.type) {
    let content: React.ReactNode = node.text ?? ''
    const f = node.format ?? 0
    if (f & CODE) content = <code key={i}>{content}</code>
    if (f & BOLD) content = <strong key={i}>{content}</strong>
    if (f & ITALIC) content = <em key={i}>{content}</em>
    if (f & UNDERLINE) content = <u key={i}>{content}</u>
    return <React.Fragment key={i}>{content}</React.Fragment>
  }
  if (node.type === 'linebreak') return <br key={i} />
  if (node.type === 'link' && node.fields?.url) {
    return (
      <a
        key={i}
        href={node.fields.url}
        target={node.fields.newTab ? '_blank' : undefined}
        rel={node.fields.newTab ? 'noopener noreferrer' : undefined}
      >
        {node.children?.map(renderInline)}
      </a>
    )
  }
  return <React.Fragment key={i}>{node.children?.map(renderInline)}</React.Fragment>
}

function renderBlock(node: Node, i: number): React.ReactNode {
  switch (node.type) {
    case 'heading': {
      const Tag = (node.tag || 'h2') as keyof React.JSX.IntrinsicElements
      return <Tag key={i}>{node.children?.map(renderInline)}</Tag>
    }
    case 'paragraph':
      return <p key={i}>{node.children?.map(renderInline)}</p>
    case 'quote':
      return <blockquote key={i}>{node.children?.map(renderInline)}</blockquote>
    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return <Tag key={i}>{node.children?.map(renderBlock)}</Tag>
    }
    case 'listitem':
      return <li key={i}>{node.children?.map(renderInline)}</li>
    default:
      if (node.children?.length) {
        return <div key={i}>{node.children.map(renderBlock)}</div>
      }
      return null
  }
}

export function RichText({ data }: { data?: SerializedEditorState | null }) {
  if (!data?.root?.children) return null
  return <div className="rich-text">{(data.root.children as unknown as Node[]).map(renderBlock)}</div>
}
