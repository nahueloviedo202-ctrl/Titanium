import { Component } from '@theme/component';

/**
 * Highlights whichever line block is closest to the vertical center of the
 * viewport as the page scrolls, dimming the rest.
 *
 * @typedef {object} Refs
 * @property {HTMLElement[]} lines - The line elements.
 *
 * @extends Component<Refs>
 */
class ScrollTextFadeComponent extends Component {
  requiredRefs = ['lines'];

  connectedCallback() {
    super.connectedCallback();

    this.#update();

    window.addEventListener('scroll', this.#handleChange, { passive: true });
    window.addEventListener('resize', this.#handleChange, { passive: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('scroll', this.#handleChange);
    window.removeEventListener('resize', this.#handleChange);

    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  /** @type {number | null} */
  #rafId = null;

  #handleChange = () => {
    if (this.#rafId !== null) return;

    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      this.#update();
    });
  };

  #update() {
    const { lines } = this.refs;
    if (!lines?.length) return;

    const viewportCenter = window.innerHeight / 2;

    /** @type {HTMLElement | null} */
    let closest = null;
    let closestDistance = Infinity;

    for (const line of lines) {
      // Skip lines hidden via the desktop/mobile visibility toggles so a
      // display:none line can never "win" and leave every visible line dim.
      if (line.offsetParent === null) continue;

      const rect = line.getBoundingClientRect();
      const distance = Math.abs(viewportCenter - (rect.top + rect.height / 2));

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = line;
      }
    }

    for (const line of lines) {
      line.classList.toggle('scroll-text-fade__line--focused', line === closest);
    }
  }
}

if (!customElements.get('scroll-text-fade-component')) {
  customElements.define('scroll-text-fade-component', ScrollTextFadeComponent);
}
