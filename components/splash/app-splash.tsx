import { AppReady } from './app-ready'

// Inlined on purpose: the splash must paint from the first HTML bytes without
// waiting for Tailwind, fonts, images or JavaScript, which is what makes it the
// First Contentful Paint. Colours mirror --background / --primary in globals.css.
const css = `
.app-splash{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;background:#14112f;color:#fff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;transition:opacity .3s ease,visibility .3s ease;animation:app-splash-failsafe 0s linear 10s forwards}
html[data-app-ready] .app-splash{opacity:0;visibility:hidden;pointer-events:none}
.app-splash__brand{display:flex;align-items:center;gap:10px;font-size:34px;font-weight:900;font-style:italic;letter-spacing:-.02em;line-height:1}
.app-splash__mark{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:#ec640f;font-style:normal;font-size:26px}
.app-splash__accent{color:#ec640f}
.app-splash__track{position:relative;width:132px;height:4px;border-radius:999px;background:#272257;overflow:hidden}
.app-splash__bar{position:absolute;top:0;left:0;height:100%;width:40%;border-radius:999px;background:#ec640f;animation:app-splash-slide 1.1s ease-in-out infinite}
@keyframes app-splash-slide{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
@keyframes app-splash-failsafe{to{opacity:0;visibility:hidden;pointer-events:none}}
@media (prefers-reduced-motion:reduce){.app-splash{transition:none}.app-splash__bar{animation:none;width:100%;opacity:.6}}
`

export function AppSplash() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <noscript>
        <style>{'.app-splash{display:none}'}</style>
      </noscript>
      <div className="app-splash" role="status" aria-live="polite" aria-label="Loading WandaBet">
        <div className="app-splash__brand" aria-hidden="true">
          <span className="app-splash__mark">W</span>
          <span>
            wanda<span className="app-splash__accent">bet</span>
          </span>
        </div>
        <div className="app-splash__track" aria-hidden="true">
          <div className="app-splash__bar" />
        </div>
      </div>
      <AppReady />
    </>
  )
}
