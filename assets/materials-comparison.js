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
    this.#relocatePanels();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#relocatePanels();
  }

  /**
   * Category blocks render their tab button and panel together (so
   * `block.settings` resolves correctly through `content_for`), both landing
   * inside `.materials-comparison__tablist`. Relocate each panel into its own
   * container so the tablist keeps its grid layout independent of panel
   * content.
   */
  #relocatePanels() {
    const panelsContainer = this.querySelector('.materials-comparison__panels');
    if (!panelsContainer) return;

    for (const panel of this.refs.panels ?? []) {
      panelsContainer.append(panel);
    }
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
}

if (!customElements.get('materials-comparison-component')) {
  customElements.define('materials-comparison-component', MaterialsComparisonComponent);
}
