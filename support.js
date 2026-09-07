// Small, dependency-free bindings for this portfolio's exported HTML template.
// Values are property paths, never executable expressions.
class DCLogic {
  props = {};

  mount(root) {
    this._update = this.bind(root);
    this.forceUpdate();
    this.componentDidMount?.();
    root.removeAttribute('data-loading');
  }

  setState(next) {
    Object.assign(this.state, next);
    this.forceUpdate();
  }

  forceUpdate() {
    this._update?.(this.renderVals());
  }

  value(expression, scope) {
    const path = expression.replace(/^\s*{{\s*|\s*}}\s*$/g, '').trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    return path.split('.').reduce((value, key) => value?.[key], scope);
  }

  interpolate(template, scope) {
    return template.replace(/{{\s*([^}]+)\s*}}/g, (_, path) => this.value(path, scope) ?? '');
  }

  bind(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const template = node.textContent;
      return template.includes('{{') ? scope => {
        node.textContent = this.interpolate(template, scope);
      } : () => {};
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return () => {};

    if (node.localName === 'sc-for') {
      const list = node.getAttribute('list');
      const name = node.getAttribute('as');
      const template = [...node.childNodes].map(child => child.cloneNode(true));
      const rows = [];
      node.replaceChildren();
      return scope => {
        const items = this.value(list, scope) || [];
        while (rows.length > items.length) rows.pop().nodes.forEach(child => child.remove());
        items.forEach((item, index) => {
          if (!rows[index]) {
            const nodes = template.map(child => child.cloneNode(true));
            const updates = nodes.map(child => this.bind(child));
            node.append(...nodes);
            rows.push({ nodes, updates });
          }
          const local = { ...scope, [name]: item };
          rows[index].updates.forEach(update => update(local));
        });
      };
    }

    const updates = [];
    const condition = node.localName === 'sc-if' ? node.getAttribute('value') : null;
    if (condition) node.hidden = true;
    for (const { name, value } of [...node.attributes]) {
      if (name.startsWith('on') && value.includes('{{')) {
        let handler;
        node.removeAttribute(name);
        node.addEventListener(name.slice(2).toLowerCase(), event => handler?.(event));
        updates.push(scope => { handler = this.value(value, scope); });
      } else if (value.includes('{{') && name !== 'value') {
        updates.push(scope => {
          const result = this.interpolate(value, scope);
          if (node.getAttribute(name) !== result) node.setAttribute(name, result);
        });
      }
    }
    const hoverStyle = node.getAttribute('style-hover');
    if (hoverStyle) {
      let original;
      node.addEventListener('mouseenter', () => {
        original = node.style.cssText;
        node.style.cssText += ';' + hoverStyle;
      });
      node.addEventListener('mouseleave', () => { node.style.cssText = original; });
    }
    const children = [...node.childNodes].map(child => this.bind(child));
    return scope => {
      if (condition) {
        node.hidden = !this.value(condition, scope);
        if (node.hidden) return;
      }
      updates.forEach(update => update(scope));
      children.forEach(update => update(scope));
    };
  }
}
