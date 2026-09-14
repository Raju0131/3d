/**
 * CreditLink — a single fixed line in the top-left corner pointing at the
 * case study. No state, no hooks: it stays a server component so it adds
 * nothing to the client bundle.
 *
 * Top-left is the only corner free at both 1440px and 360px: on desktop the
 * right column is the configurator panel, and below 768px the panel becomes a
 * fixed bottom sheet that covers the whole lower edge.
 */
export default function CreditLink() {
  return (
    <a
      className="credit-link"
      href="https://rifatsarkerraju.com/work/3d"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Built by Raju — read the Sneaker Lab case study"
    >
      Built by Raju ↗
    </a>
  );
}
