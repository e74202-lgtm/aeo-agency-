// Shared pieces for generated images (share preview, app icon, logo).
// Colors are hex versions of the site's oklch tokens, since image generation needs plain hex.
export const brand = {
  paper: "#faf8f4",
  ink: "#1c1917",
  muted: "#6b625b",
  emerald: "#1a7a5a",
  emeraldBright: "#3ecf9a",
}

export function LogoMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path
        d="M14 3C7.9 3 3 7.4 3 12.9c0 3 1.5 5.7 3.9 7.5L6 25l4.9-2.5c1 .3 2 .4 3.1.4 6.1 0 11-4.4 11-9.9S20.1 3 14 3Z"
        fill={brand.ink}
      />
      <circle cx="14" cy="13" r="3.2" fill={brand.emeraldBright} />
    </svg>
  )
}

/** Loads Inter Tight from Google Fonts for the share image. Falls back to the default font if offline. */
export async function loadDisplayFont(text: string, weight = 800): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Inter+Tight:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text()
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    if (!src) return null
    return await (await fetch(src)).arrayBuffer()
  } catch {
    return null
  }
}
