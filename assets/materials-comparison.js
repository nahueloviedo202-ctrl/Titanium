import { Component } from '@theme/component';

/**
 * Tab switcher for the materials comparison section. Each tab shows its
 * matching panel (a native `<slideshow-component>` carousel of cards) and
 * hides the rest; panels stay mounted so their carousel state isn't lost.
 *
 * @typedef {object} Refs
 * @property {HTMLButtonElement[]} tabs - The tab buttons.
 * @property {HTMLElement[]} panels - The category panels.
 *
 * @extends Component<Refs>
 */
class MaterialsComparisonComponent extends Component {
  requiredRefs = ['tabs', 'panels'];

  connectedCallback() {
    super.connectedCallback();
    this.#syncTabLabels();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#syncTabLabels();
  }

  /**
   * Tab buttons can't read their category's `label` setting directly (theme
   * blocks only resolve `block.settings` inside their own render scope), so
   * each panel carries the label in `data-tab-label` and we copy it across.
   */
  #syncTabLabels() {
    const { tabs, panels } = this.refs;

    tabs.forEach((tab, i) => {
      const label = panels[i]?.dataset.tabLabel;
      if (label) tab.textContent = label;
    });
  }

  /**
   * @param {number} index
   */
  selectCategory(index) {
    const { tabs, panels } = this.refs;
    const targetIndex = Number(index);

    tabs.forEach((tab, i) => {
      const selected = i === targetIndex;
      tab.setAttribute('aria-selected', String(selected));
      tab.classList.toggle('materials-comparison__tab--active', selected);
    });

    panels.forEach((panel, i) => {
      panel.hidden = i !== targetIndex;
    });
  }

  /**
   * Advances the active category's carousel to its next slide.
   */
  next() {
    this.#activeSlideshow()?.next();
  }

  /**
   * Moves the active category's carousel back to its previous slide.
   */
  previous() {
    this.#activeSlideshow()?.previous();
  }

  #activeSlideshow() {
    const panel = this.refs.panels.find((panel) => !panel.hidden);
    return panel?.querySelector('slideshow-component');
  }
}

if (!customElements.get('materials-comparison-component')) {
  customElements.define('materials-comparison-component', MaterialsComparisonComponent);
}
