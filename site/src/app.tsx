import { useState } from "react";
import { PolaroidCarousel } from "react-polaroid-carousel";
import { examples } from "./examples";
import { credits, hero } from "./media";

const REPO = "https://github.com/KushalBhanot/react-polaroid-carousel";
const NPM = "https://www.npmjs.com/package/react-polaroid-carousel";

function CopyInstall() {
  const [copied, setCopied] = useState(false);
  const cmd = "npm i react-polaroid-carousel";
  return (
    <button
      type="button"
      className="install"
      onClick={() => {
        void navigator.clipboard?.writeText(cmd).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
    >
      <span aria-hidden="true">$</span> {cmd}
      <span className="install-hint">{copied ? "copied!" : "copy"}</span>
    </button>
  );
}

export function App() {
  return (
    <>
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">react-polaroid-carousel</p>
          <h1>Photo carousels that feel like memories.</h1>
          <p className="lede">
            A tiny React carousel that stacks your photos like tilted polaroids. Swipe it, autoplay it, theme it, or go
            fully headless. Accessible and SSR-safe out of the box.
          </p>
          <CopyInstall />
          <ul className="facts">
            <li><strong>~4 kB</strong> min+gzip</li>
            <li><strong>0</strong> dependencies</li>
            <li><strong>SSR-safe</strong> Next.js, Remix, Astro</li>
            <li><strong>WCAG</strong> APG carousel pattern</li>
          </ul>
          <p className="links">
            <a href={REPO}>GitHub</a>
            <a href={NPM}>npm</a>
            <a href="#examples">Examples ↓</a>
          </p>
        </div>
        <div className="hero-demo" id="hero-demo">
          <PolaroidCarousel items={hero} autoplay={3200} priority label="Demo photos" />
        </div>
      </header>

      <main id="examples">
        <h2 className="section-title">What people build with it</h2>
        {examples.map(({ id, title, blurb, tags, code, Demo }) => (
          <section key={id} id={id} className="example">
            <div className="example-text">
              <h3>
                <a href={`#${id}`}>{title}</a>
              </h3>
              <p>{blurb}</p>
              <ul className="tags">
                {tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <pre>
                <code>{code}</code>
              </pre>
            </div>
            <div className="example-demo" data-demo={id}>
              <Demo />
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        <p>
          MIT © <a href="https://www.kushalbhanot.com">Kushal Bhanot</a> · <a href={REPO}>Source</a> ·{" "}
          <a href={`${REPO}/blob/main/README.md`}>Docs</a>
        </p>
        <p className="credits">
          Photos from <a href="https://unsplash.com/license">Unsplash</a> by{" "}
          {credits.unsplash.map((u, i) => (
            <span key={u}>
              {i > 0 && ", "}
              <a href={`https://unsplash.com/@${u}`}>@{u}</a>
            </span>
          ))}
          . Videos from <a href="https://www.pexels.com/license/">Pexels</a> by{" "}
          {credits.pexels.map((p, i) => (
            <span key={p.url}>
              {i > 0 && ", "}
              <a href={p.url}>{p.name}</a>
            </span>
          ))}
          .
        </p>
      </footer>
    </>
  );
}
