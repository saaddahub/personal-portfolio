import postcss from 'postcss';

// Keep the original site's styles inside the tube without an iframe.
export function scopePortfolioCss() {
  return {
    postcssPlugin: 'portfolio-screen-scope',
    Once(root, { result }) {
      const file = (result.opts.from || '').replaceAll('\\', '/');
      const original = /\/src\/(?:index|vintage)\.css$/.test(file) || /\/src\/components\/[^/]+\.css$/.test(file);
      const monitor = file.endsWith('/src/styles/screen.css');
      if (!original && !monitor) return;
      if (original) {
        root.walkRules(rule => {
          rule.selector = rule.selector
            .replace(/:root(\[data-theme[^\]]+\])?:has\(\.portfolio-surface\)/g, ':scope$1')
            .replace(/:root|\bhtml\b|\bbody\b/g, ':scope');
          if (/^\[data-theme/.test(rule.selector)) rule.selector = ':scope' + rule.selector;
        });
        root.walkDecls(declaration => {
          declaration.value = declaration.value.replace(/(\d*\.?\d+)(?:s|d|l)?v([wh])\b/g, '$1cq$2');
        });
      }
      const scope = postcss.atRule({ name: 'scope', params: original ? '(.portfolio-surface)' : '(:root) to (.portfolio-surface)' });
      for (const node of [...root.nodes]) {
        if (node.type === 'atrule' && /^(?:import|charset|font-face|(?:-\w+-)?keyframes)$/.test(node.name)) continue;
        scope.append(node);
      }
      root.append(scope);
    },
  };
}
