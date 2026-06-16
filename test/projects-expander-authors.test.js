const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const assert = require('node:assert/strict');

const html = readFileSync('projects.html', 'utf8');
const script = readFileSync('scripts/script.js', 'utf8');
const css = readFileSync('css/layout.css', 'utf8');

function extractProjectHeaderAreas(source) {
  return source
    .split(/<div class="expander(?:\s+nyu)?">/)
    .slice(1)
    .map((block) => block.split('<div class="expander-content">')[0]);
}

test('project expander headers include collapsed author text', () => {
  const headers = extractProjectHeaderAreas(html);

  assert.equal(headers.length, 10);
  for (const header of headers) {
    assert.match(header, /class="expander-authors"/);
  }
});

test('collapsed author text links to author pages when available', () => {
  const collapsedHeaders = extractProjectHeaderAreas(html).join('\n');
  const linkedAuthors = [
    ['Linxi Xie', 'https://lafoucc.github.io/'],
    ['Hammond Liu', 'https://hmdliu.site/'],
    ['Hongyi Wen', 'https://whongyi.github.io/'],
    ['Xingchen Zhang', 'https://shanghai.nyu.edu/academics/faculty/directory/xingchen-zhang'],
    ['Marcela Godoy', 'https://ima.shanghai.nyu.edu/faculty/marcela-godoy'],
    ['Alfredo Canziani', 'https://atcold.github.io/'],
    ['Rob Fergus', 'https://cs.nyu.edu/~fergus/pmwiki/pmwiki.php'],
    ['Lihua Xu', 'https://shanghai.nyu.edu/academics/faculty/directory/lihua-xu'],
    ['Li Guo', 'https://shanghai.nyu.edu/academics/faculty/directory/li-guo'],
    ['Xianbin Gu', 'https://shanghai.nyu.edu/academics/faculty/directory/xianbin-gu'],
  ];

  for (const [name, href] of linkedAuthors) {
    const linkPattern = new RegExp(`<a href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>${name}(?:<sup>\\*</sup>)?</a>`);
    assert.match(collapsedHeaders, linkPattern);
  }
});

test('collapsed author text emphasizes Yuanhe Guo', () => {
  const headers = extractProjectHeaderAreas(html);

  for (const header of headers) {
    assert.match(header, /<strong>Yuanhe Guo(?:<sup>\*<\/sup>)?<\/strong>/);
  }
});

test('ImageGem equal-contribution markers are superscripted', () => {
  const imageGemHeader = extractProjectHeaderAreas(html)[0];

  assert.match(imageGemHeader, /<strong>Yuanhe Guo<sup>\*<\/sup><\/strong>/);
  assert.match(imageGemHeader, /<a href="https:\/\/lafoucc\.github\.io\/">Linxi Xie<sup>\*<\/sup><\/a>/);
  assert.doesNotMatch(imageGemHeader, /Yuanhe Guo\*/);
  assert.doesNotMatch(imageGemHeader, /Linxi Xie\*/);
});

test('expanded content does not duplicate project author paragraphs', () => {
  const paragraphs = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/g) || [];

  for (const paragraph of paragraphs) {
    assert.doesNotMatch(paragraph, /Yuanhe Guo/);
  }
});

test('expanded title and authors keep collapsed header styling', () => {
  const collapsedHeaderRule = /\.expander-header\s*{(?<body>[^}]*)}/.exec(css);
  const collapsedTitleBlockRule = /\.expander-title-block\s*{(?<body>[^}]*)}/.exec(css);
  const collapsedAuthorRule = /\.expander-authors\s*{(?<body>[^}]*)}/.exec(css);
  const expandedHeaderRule = /\.expander\.show\s+\.expander-header\s*{(?<body>[^}]*)}/.exec(css);
  const expandedTitleBlockRule = /\.expander\.show\s+\.expander-title-block\s*{(?<body>[^}]*)}/.exec(css);
  const expandedTitleRule = /\.expander\.show\s+\.expander-title\s*{(?<body>[^}]*)}/.exec(css);
  const expandedAuthorRule = /\.expander\.show\s+\.expander-authors\s*{(?<body>[^}]*)}/.exec(css);

  assert.ok(collapsedHeaderRule);
  assert.ok(collapsedTitleBlockRule);
  assert.ok(collapsedAuthorRule);
  assert.ok(expandedHeaderRule);
  assert.ok(expandedTitleBlockRule);
  assert.match(collapsedHeaderRule.groups.body, /font-size:\s*18px/);
  assert.match(collapsedTitleBlockRule.groups.body, /transition:\s*gap\s+0\.3s\s+ease/);
  assert.match(collapsedAuthorRule.groups.body, /font-size:\s*14px/);
  assert.match(expandedHeaderRule.groups.body, /font-family:\s*"Ubuntu Mono",\s*monospace/);
  assert.match(expandedHeaderRule.groups.body, /font-size:\s*18px/);
  assert.match(expandedHeaderRule.groups.body, /padding:\s*0/);
  assert.match(expandedTitleBlockRule.groups.body, /gap:\s*12px/);
  assert.equal(expandedTitleRule, null);
  assert.equal(expandedAuthorRule, null);
});

test('clicking collapsed author links does not toggle the expander', () => {
  assert.match(script, /closest\('\.expander-authors a'\)/);
});
