import { Component } from '@theme/component';

/**
 * Lets a visitor click a press logo to reveal its matching quote.
 *
 * @typedef {object} Refs
 * @property {HTMLButtonElement[]} logoButtons - The clickable logo buttons.
 * @property {HTMLElement[]} quotes - The quote elements, one per logo.
 * @property {HTMLElement} quotePanel - Where the active quote is displayed.
 *
 * @extends Component<Refs>
 */
class LogoTestimonialsComponent extends Component {
  requiredRefs = ['logoButtons', 'quotes', 'quotePanel'];

  connectedCallback() {
    super.connectedCallback();

    this.#relocateQuotes();
    this.addEventListener('click', this.#handleClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.#handleClick);
  }

  /**
   * Re-runs the quote relocation after the Section Rendering API morphs this
   * component's subtree (eg. editing a setting in the theme editor), since morph
   * resets the quote elements back inside their original block markup.
   */
  updatedCallback() {
    super.updatedCallback();
    this.#relocateQuotes();
  }

  #relocateQuotes() {
    const { quotes, quotePanel } = this.refs;

    for (const quote of quotes) {
      if (quote.parentElement !== quotePanel) {
        quotePanel.appendChild(quote);
      }
    }
  }

  /**
   * @param {MouseEvent} event
   */
  #handleClick = (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const button = target.closest('.logo-testimonials__logo-button');
    if (!(button instanceof HTMLButtonElement)) return;

    const { logoButtons, quotes } = this.refs;
    const index = logoButtons.indexOf(button);
    if (index === -1) return;

    logoButtons.forEach((logoButton, i) => {
      const isActive = i === index;
      logoButton.classList.toggle('is-active', isActive);
      logoButton.setAttribute('aria-pressed', String(isActive));
    });

    quotes.forEach((quote, i) => {
      const isActive = i === index;
      quote.classList.toggle('is-active', isActive);
      quote.hidden = !isActive;
    });
  };
}

if (!customElements.get('logo-testimonials-component')) {
  customElements.define('logo-testimonials-component', LogoTestimonialsComponent);
}
