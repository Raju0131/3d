/**
 * ModelCredit — the CC BY 4.0 attribution the sneaker model requires.
 *
 * Separate from CreditLink by intent: that line says who built the site, this
 * one says whose model it is. They sit as two stacked lines in the top-left.
 *
 * The licence record travels inside the .glb at asset.extras; the strings here
 * are copied from it verbatim.
 *
 * No state, no hooks — stays a server component.
 */
export default function ModelCredit() {
  return (
    <p className="model-credit">
      {'Model "Sneakers - Game Ready - Textured (Mockup)" by '}
      <a
        href="https://sketchfab.com/kanesk06"
        target="_blank"
        rel="noopener noreferrer"
      >
        kane_sk06
      </a>
      {', '}
      <a
        href="https://creativecommons.org/licenses/by/4.0/"
        target="_blank"
        rel="noopener noreferrer"
      >
        CC BY 4.0
      </a>
      {', modified.'}
    </p>
  );
}
