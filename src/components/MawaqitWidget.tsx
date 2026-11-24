type Props = {
  /** The last part of the mosque's mawaqit.net address (Site Settings → Mawaqit page). */
  slug?: string | null
  size?: 'small' | 'large' | 'tv'
  title?: string
}

export function MawaqitWidget({ slug, size = 'small', title = 'Prayer times from Mawaqit' }: Props) {
  if (!slug?.trim()) {
    return (
      <div className={`mawaqit-frame mawaqit-placeholder ${size}`} role="note">
        <p>
          Prayer times appear here once your Mawaqit page is set in
          <br />
          <strong>Admin → Site Settings → Mawaqit page</strong>.
        </p>
      </div>
    )
  }
  const src = `https://mawaqit.net/en/w/${encodeURIComponent(slug.trim())}`
  return (
    <iframe
      className={`mawaqit-frame ${size}`}
      src={src}
      title={title}
      // The TV screen shows the widget immediately and has nothing else to load first.
      loading={size === 'tv' ? 'eager' : 'lazy'}
      allowFullScreen
    />
  )
}
