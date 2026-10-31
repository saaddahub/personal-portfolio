import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('continuous media reel keeps accessible project links and handles hidden, single, and empty galleries', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: Projects } = await server.ssrLoadModule('/src/components/Projects.jsx');
    const { PortfolioProvider, DEFAULT_PORTFOLIO_DATA, normalizePortfolio } = await server.ssrLoadModule('/src/context/PortfolioContext.jsx');
    const original = DEFAULT_PORTFOLIO_DATA.projects;
    const render = () => renderToStaticMarkup(createElement(PortfolioProvider, null, createElement(Projects, { animationReady: false })));
    try {
      const markup = render();
      assert.equal((markup.match(/class="work-reel-link"/g) || []).length, original.length * 2);
      assert.equal((markup.match(/tabindex="0"/g) || []).length, original.length, 'Each project appears once in keyboard navigation');
      assert.equal((markup.match(/tabindex="-1"/g) || []).length, original.length);
      for (const project of original) assert.ok(markup.includes(`href="/work/${encodeURIComponent(project.id)}"`));
      assert.ok(markup.includes('work-reel-cover'), 'Projects without screenshots have a visual fallback');
      assert.ok(markup.includes('Pause continuous gallery'));
      assert.ok(!markup.includes('Next project'), 'The gallery moves continuously without slide navigation');
      assert.equal(normalizePortfolio({ projects: [original[1]] }).projects[0].videoUrl, '', 'Older projects keep working without a video URL');

      DEFAULT_PORTFOLIO_DATA.projects = [{ ...original[0], visible: false }, { ...original[1], id: 'work with / spaces' }];
      const single = render();
      assert.ok(!single.includes('href="/work/proj-1"'));
      assert.ok(single.includes('href="/work/work%20with%20%2F%20spaces"'));
      assert.equal((single.match(/class="work-reel-link"/g) || []).length, 8, 'One project still fills the looping strip');
      assert.equal((single.match(/tabindex="0"/g) || []).length, 1);

      DEFAULT_PORTFOLIO_DATA.projects = [{ ...original[0], videoUrl: 'https://example.com/demo.webm' }];
      const video = render();
      assert.ok(video.includes('<video'));
      assert.ok(video.includes('muted=""') && /playsinline=""/i.test(video));
      assert.equal(normalizePortfolio({ projects: DEFAULT_PORTFOLIO_DATA.projects }).projects[0].videoUrl, 'https://example.com/demo.webm');
      DEFAULT_PORTFOLIO_DATA.projects = [{ ...original[0], videoUrl: 'javascript:alert(1)' }];
      assert.ok(!render().includes('<video'), 'Unsafe video URLs cannot reach a media source');

      const { default: ProjectVideoInput } = await server.ssrLoadModule('/src/admin/ProjectVideoInput.jsx');
      const editor = value => renderToStaticMarkup(createElement(ProjectVideoInput, { value, onChange() {} }));
      assert.ok(editor('https://example.com/demo.webm').includes('<video'));
      const invalid = editor('javascript:alert(1)');
      assert.ok(invalid.includes('aria-invalid="true"') && !invalid.includes('<video'));

      DEFAULT_PORTFOLIO_DATA.projects = [];
      assert.equal(render(), '');
    } finally {
      DEFAULT_PORTFOLIO_DATA.projects = original;
    }
  } finally {
    await server.close();
  }
});
