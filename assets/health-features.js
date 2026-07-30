import { Component } from '@theme/component';
import { getScrollEventTarget, scrollContainerMediaQuery } from '@theme/scroll-container';

const MOBILE_QUERY = window.matchMedia('(max-width: 749px)');

/**
 * On mobile, highlights whichever feature item is closest to the vertical
 * center of the viewport as the page scrolls, and swaps the product image
 * to match the active item's side. Desktop stays static (matches the
 * source design, which never swaps the image outside the mobile layout).
 *
 * @typedef {object} Refs
 * @property {HTMLElement[]} items - The feature list items.
 * @property {HTMLImageElement} [image] - The product image.
 *
 * @extends Component<Refs>
 */
class HealthFeaturesComponent extends Component {
  requiredRefs = ['items'];

  connectedCallback() {
    super.connectedCallback();

    this.#relocateItems();

    this.#scrollTarget = getScrollEventTarget();
    this.#scrollTarget.addEventListener('scroll', this.#handleChange, { passive: true });
    window.addEventListener('resize', this.#handleChange, { passive: true });
    scrollContainerMediaQuery.addEventListener('change', this.#handleBreakpointChange);
    MOBILE_QUERY.addEventListener('change', this.#handleChange);

    this.#update();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#relocateItems();
    this.#update();
  }

  /**
   * Blocks all render into `.health-features__list--left` (so `block.settings`
   * resolves correctly through `content_for`), then right-side items get
   * moved into their own list here so the left/right split layout (and the
   * mobile column-reverse order) still works.
   */
  #relocateItems() {
    const rightList = this.querySelector('.health-features__list--right');
    if (!rightList) return;

    for (const item of this.refs.items ?? []) {
      if (item.dataset.side === 'right' && item.parentElement !== rightList) {
        rightList.append(item);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.#scrollTarget?.removeEventListener('scroll', this.#handleChange);
    window.removeEventListener('resize', this.#handleChange);
    scrollContainerMediaQuery.removeEventListener('change', this.#handleBreakpointChange);
    MOBILE_QUERY.removeEventListener('change', this.#handleChange);

    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  /** @type {EventTarget | null} */
  #scrollTarget = null;

  /** @type {number | null} */
  #rafId = null;

  #handleBreakpointChange = () => {
    this.#scrollTarget?.removeEventListener('scroll', this.#handleChange);
    this.#scrollTarget = getScrollEventTarget();
    this.#scrollTarget.addEventListener('scroll', this.#handleChange, { passive: true });
    this.#update();
  };

  #handleChange = () => {
    if (this.#rafId !== null) return;

    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null;
      this.#update();
    });
  };

  #update() {
    const { items, image } = this.refs;
    if (!items?.length) return;

    if (!MOBILE_QUERY.matches) {
      for (const item of items) {
        item.classList.remove('health-features__item--active');
      }
      this.#setImage(image?.dataset.desktop);
      return;
    }

    const viewportCenter = window.innerHeight / 2;

    /** @type {HTMLElement | null} */
    let closest = null;
    let closestDistance = Infinity;

    for (const item of items) {
      const rect = item.getBoundingClientRect();
      // Skip items fully outside the viewport so an off-screen item can't win.
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;

      const distance = Math.abs(rect.top + rect.height / 2 - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = item;
      }
    }

    closest ??= items[0] ?? null;

    for (const item of items) {
      item.classList.toggle('health-features__item--active', item === closest);
    }

    const isLeft = closest?.dataset.side === 'left';
    const targetSrc = isLeft
      ? image?.dataset.swapMobile || image?.dataset.mobile || image?.dataset.desktop
      : image?.dataset.mobile || image?.dataset.desktop;

    this.#setImage(targetSrc);
  }

  /**
   * @param {string | undefined} src
   */
  #setImage(src) {
    const { image } = this.refs;
    if (image && src && image.src !== src) {
      image.src = src;
    }
  }
}

if (!customElements.get('health-features-component')) {
  customElements.define('health-features-component', HealthFeaturesComponent);
}
