import { Component } from '@theme/component';

const SCROLL_CLOSE_DELTA = 220;
const OPEN_GUARD_MS = 320;
const POINTER_GUARD_MS = 400;

/**
 * A quick-categories strip with hover/click-activated panels, similar to a mega menu.
 *
 * @extends Component
 */
class CategoryNav extends Component {
  #openGuardUntil = 0;
  #startScrollY = 0;
  #boundDocumentClick = this.#handleDocumentClick.bind(this);
  #boundScroll = this.#handleScroll.bind(this);
  #boundKeydown = this.#handleKeydown.bind(this);

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.#boundDocumentClick);
    window.addEventListener('scroll', this.#boundScroll, { passive: true });
    document.addEventListener('keydown', this.#boundKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.#boundDocumentClick);
    window.removeEventListener('scroll', this.#boundScroll);
    document.removeEventListener('keydown', this.#boundKeydown);
  }

  /**
   * Sets an early guard so the outside-click closer ignores the click that opens a panel.
   */
  guardOpen() {
    this.#openGuardUntil = performance.now() + POINTER_GUARD_MS;
  }

  /**
   * @param {{ key: string }} data
   * @param {Event} event
   */
  togglePanel(data, event) {
    event.preventDefault();
    const key = data.key;
    const tab = /** @type {HTMLElement | null} */ (event.target instanceof Element ? event.target.closest('[data-key]') : null);

    if (tab?.classList.contains('is-active')) {
      this.#hide();
    } else {
      this.#show(key);
    }
  }

  /** @param {string} key */
  #show(key) {
    const panel = this.querySelector(`.category-nav__panel[data-key="${key}"]`);
    if (!panel) return;

    this.querySelectorAll('.category-nav__panel').forEach((candidate) => {
      candidate.setAttribute('aria-hidden', candidate === panel ? 'false' : 'true');
    });

    this.querySelectorAll('.category-nav__tab').forEach((tab) => {
      const isActive = /** @type {HTMLElement} */ (tab).dataset.key === key;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });

    this.classList.add('is-open');
    this.#openGuardUntil = performance.now() + OPEN_GUARD_MS;
    this.#startScrollY = window.scrollY || 0;
  }

  #hide() {
    if (!this.classList.contains('is-open')) return;

    this.classList.remove('is-open');

    this.querySelectorAll('.category-nav__tab').forEach((tab) => {
      tab.classList.remove('is-active');
      tab.setAttribute('aria-selected', 'false');
    });

    this.querySelectorAll('.category-nav__panel').forEach((panel) => {
      panel.setAttribute('aria-hidden', 'true');
    });
  }

  /** @param {MouseEvent} event */
  #handleDocumentClick(event) {
    if (!this.classList.contains('is-open')) return;
    if (performance.now() < this.#openGuardUntil) return;
    if (!(event.target instanceof Element) || !event.target.closest('.category-nav')) {
      this.#hide();
    }
  }

  #handleScroll() {
    if (!this.classList.contains('is-open')) return;
    const y = window.scrollY || 0;
    if (y - this.#startScrollY > SCROLL_CLOSE_DELTA) this.#hide();
  }

  /** @param {KeyboardEvent} event */
  #handleKeydown(event) {
    if (event.key === 'Escape') this.#hide();
  }
}

if (!customElements.get('category-nav')) {
  customElements.define('category-nav', CategoryNav);
}
