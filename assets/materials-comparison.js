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
