const { existsSync, readFileSync } = require('node:fs');
const { test } = require('node:test');
const assert = require('node:assert/strict');

const html = readFileSync('projects.html', 'utf8');
const indexHtml = readFileSync('index.html', 'utf8');
const aboutHtml = readFileSync('about.html', 'utf8');
const archiveHtml = readFileSync('Archive/index_archive.html', 'utf8');
const script = readFileSync('scripts/script.js', 'utf8');
const css = readFileSync('css/layout.css', 'utf8');

function extractProjectHeaderAreas(source) {
  return source
    .split(/<div class="expander(?:\s+nyu)?">/)
    .slice(1)
    .map((block) => block.split('<div class="expander-content">')[0]);
}

function extractProjectBlockByTitle(title) {
  const titleIndex = html.indexOf(title);

  assert.notEqual(titleIndex, -1);

  const projectBlockStart = html.lastIndexOf('<div class="expander">', titleIndex);
  const nextProjectStart = html.indexOf('\n\n        <div class="expander', projectBlockStart + 1);
  const projectBlockEnd = nextProjectStart === -1 ? html.length : nextProjectStart;
  return html.slice(projectBlockStart, projectBlockEnd);
}

test('project expander headers include collapsed author text', () => {
  const headers = extractProjectHeaderAreas(html);

  assert.equal(headers.length, 11);
  for (const header of headers) {
    assert.match(header, /class="expander-authors"/);
  }
});

test('new CVPR 2026 flow diffusion project includes metadata and links', () => {
  const title = 'From Navigation to Refinement: Revealing the Two-Stage Nature of Flow-based Diffusion Models through Oracle Velocity';
  const projectBlock = extractProjectBlockByTitle(title);

  assert.match(projectBlock, /<a href="https:\/\/hmdliu\.site\/">Haoming Liu<\/a>/);
  assert.match(projectBlock, /Jinnuo Liu/);
  assert.match(projectBlock, /Yanhao Li/);
  assert.match(projectBlock, /Liuyang Bai/);
  assert.match(projectBlock, /Yunkai Ji/);
  assert.match(projectBlock, /<strong>Yuanhe Guo<\/strong>/);
  assert.match(projectBlock, /<a href="https:\/\/scholar\.google\.com\/citations\?user=5lnIJhIAAAAJ&amp;hl=en">Shenji Wan<\/a>/);
  assert.match(projectBlock, /<a href="https:\/\/whongyi\.github\.io\/">Hongyi Wen<\/a>/);
  assert.match(projectBlock, /<span class="expander-badge cvf">cvpr2026<\/span>/);
  assert.match(projectBlock, /<span class="expander-badge">2025\/09-2026\/04<\/span>/);
  assert.match(projectBlock, /<a href="https:\/\/maps-research\.github\.io\/from-navigation-to-refinement\/" class="pill projectpage">Project Page<\/a>/);
  assert.match(projectBlock, /<a href="http:\/\/arxiv\.org\/abs\/2512\.02826" class="pill paper">Paper<\/a>/);
});

test('new CVPR 2026 flow diffusion project uses a two-figure layout', () => {
  const title = 'From Navigation to Refinement: Revealing the Two-Stage Nature of Flow-based Diffusion Models through Oracle Velocity';
  const projectBlock = extractProjectBlockByTitle(title);
  const teaserPath = 'resources/Projects/FromNavigationToRefinement/teaser_v2.jpg';
  const modelPredictionPath = 'resources/Projects/FromNavigationToRefinement/model_pred.png';
  const teaserIndex = projectBlock.indexOf(teaserPath);
  const modelPredictionIndex = projectBlock.indexOf(modelPredictionPath);
  const metadataColumnIndex = projectBlock.indexOf('<div class="column durf">');
  const secondFigureColumnIndex = projectBlock.indexOf('<div class="column">\n                <img class="expander-image"', metadataColumnIndex + 1);

  assert.notEqual(teaserIndex, -1);
  assert.notEqual(modelPredictionIndex, -1);
  assert.notEqual(metadataColumnIndex, -1);
  assert.notEqual(secondFigureColumnIndex, -1);
  assert.ok(modelPredictionIndex < teaserIndex);
  assert.ok(metadataColumnIndex < secondFigureColumnIndex);
  assert.match(projectBlock, /alt="Model prediction examples"/);
  assert.doesNotMatch(projectBlock, /https:\/\/maps-research\.github\.io\/from-navigation-to-refinement\/static\/images\//);
  assert.ok(existsSync(teaserPath));
  assert.ok(existsSync(modelPredictionPath));
});

test('ImageGem expanded layout matches two-column research project pattern', () => {
  const imageGemBlock = extractProjectBlockByTitle('ImageGem: In-the-wild Generative Image Interaction Dataset for Generative Model Personalization');
  const imageColumnIndex = imageGemBlock.indexOf('<div class="column">\n                <img class="expander-image"');
  const metadataColumnIndex = imageGemBlock.indexOf('<div class="column durf">');

  assert.notEqual(imageColumnIndex, -1);
  assert.notEqual(metadataColumnIndex, -1);
  assert.ok(imageColumnIndex < metadataColumnIndex);
  assert.match(imageGemBlock, /<div class="column durf">[\s\S]*<div class="info">/);
  assert.match(imageGemBlock, /<div class="column durf">[\s\S]*<div class="case">/);
});

test('collapsed author text links to author pages when available', () => {
  const collapsedHeaders = extractProjectHeaderAreas(html).join('\n');
  const linkedAuthors = [
    ['Linxi Xie', 'https://lafoucc.github.io/'],
    ['Haoming Liu', 'https://hmdliu.site/'],
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

test('Haoming Liu display name is used consistently', () => {
  assert.doesNotMatch(`${html}\n${archiveHtml}`, /Hammond\s+Liu/i);
  assert.match(`${html}\n${archiveHtml}`, /Haoming Liu/);
});

test('collapsed author text emphasizes Yuanhe Guo', () => {
  const headers = extractProjectHeaderAreas(html);

  for (const header of headers) {
    assert.match(header, /<strong>Yuanhe Guo(?:<sup>\*<\/sup>)?<\/strong>/);
  }
});

test('ImageGem equal-contribution markers are superscripted', () => {
  const imageGemHeader = extractProjectHeaderAreas(html).find((header) => (
    header.includes('ImageGem: In-the-wild Generative Image Interaction Dataset for Generative Model Personalization')
  ));

  assert.ok(imageGemHeader);
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

test('site layout uses capped width with responsive side padding', () => {
  const rootRule = /^:root\s*{(?<body>[^}]*)}/m.exec(css);
  const pageContainerRule = /^\.page-container\s*{(?<body>[^}]*)}/m.exec(css);
  const headerRule = /^\.header\s*{(?<body>[^}]*)}/m.exec(css);
  const sectionRule = /^\.section\s*{(?<body>[^}]*)}/m.exec(css);
  const navRule = /^\.nav\s*{(?<body>[^}]*)}/m.exec(css);
  const headerDividerRule = /^\.header\s*>\s*\.container\s*{(?<body>[^}]*)}/m.exec(css);

  assert.ok(rootRule);
  assert.ok(pageContainerRule);
  assert.ok(headerRule);
  assert.ok(sectionRule);
  assert.ok(navRule);
  assert.ok(headerDividerRule);
  assert.match(rootRule.groups.body, /--site-max-width:\s*1440px/);
  assert.match(rootRule.groups.body, /--site-gutter:\s*50px/);
  assert.match(rootRule.groups.body, /--site-inline-padding:\s*var\(--site-gutter\)/);
  assert.match(pageContainerRule.groups.body, /max-width:\s*var\(--site-max-width\)/);
  assert.match(pageContainerRule.groups.body, /margin:\s*0\s+auto/);
  assert.match(headerRule.groups.body, /max-width:\s*var\(--site-max-width\)/);
  assert.match(headerRule.groups.body, /left:\s*50%/);
  assert.match(headerRule.groups.body, /transform:\s*translateX\(-50%\)/);
  assert.match(sectionRule.groups.body, /padding:\s*100px\s+var\(--site-inline-padding\)\s+0\s+var\(--site-inline-padding\)/);
  assert.match(navRule.groups.body, /padding:\s*30px\s+var\(--site-inline-padding\)\s+15px\s+var\(--site-inline-padding\)/);
  assert.match(headerDividerRule.groups.body, /margin-left:\s*var\(--site-inline-padding\)\s*!important/);
  assert.match(headerDividerRule.groups.body, /margin-right:\s*var\(--site-inline-padding\)\s*!important/);
});

test('HOME name block anchors and scales to the capped site width', () => {
  const nameRule = /^\.name\s*{(?<body>[^}]*)}/m.exec(css);
  const guoRule = /^\.guo\s*{(?<body>[^}]*)}/m.exec(css);
  const nameCnRule = /^\.name-cn\s*{(?<body>[^}]*)}/m.exec(css);
  const nameLabelRule = /^\.name-label\s*{(?<body>[^}]*)}/m.exec(css);
  const nameEnOffsetRule = /^\.name-en\.name-en-offset\s*{(?<body>[^}]*)}/m.exec(css);
  const nameCnOffsetRule = /^\.name-cn\.name-cn-offset\s*{(?<body>[^}]*)}/m.exec(css);

  assert.ok(nameRule);
  assert.ok(guoRule);
  assert.ok(nameCnRule);
  assert.ok(nameLabelRule);
  assert.ok(nameEnOffsetRule);
  assert.ok(nameCnOffsetRule);
  assert.match(nameRule.groups.body, /width:\s*min\(100vw,\s*var\(--site-max-width\)\)/);
  assert.match(nameRule.groups.body, /max-width:\s*var\(--site-max-width\)/);
  assert.match(nameRule.groups.body, /left:\s*50%/);
  assert.match(nameRule.groups.body, /transform:\s*translateX\(-50%\)/);
  assert.match(nameRule.groups.body, /overflow-x:\s*visible/);
  assert.doesNotMatch(nameRule.groups.body, /overflow-x:\s*clip/);
  assert.match(guoRule.groups.body, /font-size:\s*min\(16\.5vw,\s*237\.6px\)/);
  assert.match(nameCnRule.groups.body, /font-size:\s*min\(14\.5vw,\s*208\.8px\)/);
  assert.match(nameLabelRule.groups.body, /font-size:\s*min\(2vw,\s*28\.8px\)/);
  assert.match(nameLabelRule.groups.body, /left:\s*min\(3vw,\s*43\.2px\)/);
  assert.match(nameEnOffsetRule.groups.body, /margin:\s*max\(-4\.5vw,\s*-64\.8px\)\s+0\s+0\s+0/);
  assert.match(nameCnOffsetRule.groups.body, /margin:\s*max\(-5vw,\s*-72px\)\s+0\s+0\s+0/);
  assert.match(indexHtml, /class="name-en name-en-offset"/);
  assert.match(indexHtml, /class="name-cn name-cn-offset"/);
  assert.doesNotMatch(indexHtml, /style="margin:\s*-4\.5vw/);
  assert.doesNotMatch(indexHtml, /style="margin:\s*-5vw/);
});

test('HOME description anchors to the capped content panel', () => {
  const descriptionRule = /^\.description\s*{(?<body>[^}]*)}/m.exec(css);

  assert.ok(descriptionRule);
  assert.match(descriptionRule.groups.body, /position:\s*fixed/);
  assert.match(descriptionRule.groups.body, /left:\s*calc\(max\(0px,\s*\(100vw\s*-\s*var\(--site-max-width\)\)\s*\/\s*2\)\s*\+\s*var\(--site-gutter\)\s*\+\s*min\(6vw,\s*86\.4px\)\)/);
  assert.match(descriptionRule.groups.body, /bottom:\s*50vh/);
  assert.match(descriptionRule.groups.body, /width:\s*min\(20vw,\s*288px\)/);
  assert.doesNotMatch(descriptionRule.groups.body, /left:\s*10vw/);
  assert.doesNotMatch(descriptionRule.groups.body, /width:\s*20vw/);
});

test('HOME stickers anchor and scale to the capped site width', () => {
  const homeRule = /^#home\s*{(?<body>[^}]*)}/m.exec(css);
  const stickerRule = /^\.sticker\s*{(?<body>[^}]*)}/m.exec(css);

  assert.ok(homeRule);
  assert.ok(stickerRule);
  assert.match(homeRule.groups.body, /position:\s*relative/);
  assert.match(stickerRule.groups.body, /width:\s*min\(12vw,\s*172\.8px\)/);
  assert.match(script, /document\.getElementById\('home'\)/);
  assert.match(script, /getPropertyValue\('--site-gutter'\)/);
  assert.match(script, /usableLeft\s*=\s*gutter/);
  assert.match(script, /usableWidth\s*=\s*Math\.max\(panel\.clientWidth\s*-\s*gutter\s*\*\s*2\s*-\s*item\.offsetWidth,\s*0\)/);
  assert.doesNotMatch(script, /bounds\.left\s*\+/);
  assert.match(script, /item\.dataset\.stickerX/);
  assert.match(script, /item\.dataset\.stickerY/);
  assert.match(script, /item\.style\.left\s*=\s*usableLeft\s*\+\s*parseFloat\(item\.dataset\.stickerX\)\s*\*\s*usableWidth\s*\+/);
  assert.match(script, /_stickerResizeHandler/);
  assert.match(script, /window\.addEventListener\('resize',\s*_stickerResizeHandler\)/);
  assert.match(script, /item\.offsetWidth/);
});

test('About page background image stays capped and fades out at both side edges', () => {
  const aboutSection = /<section class="section active" id="about"(?<attrs>[^>]*)>/.exec(aboutHtml);
  const aboutRule = /^#about\s*{(?<body>[^}]*)}/m.exec(css);
  const aboutBeforeRule = /^#about::before\s*{(?<body>[^}]*)}/m.exec(css);
  const aboutPageRule = /^#about\s*>\s*\.page\s*{(?<body>[^}]*)}/m.exec(css);

  assert.ok(aboutSection);
  assert.ok(aboutRule);
  assert.ok(aboutBeforeRule);
  assert.ok(aboutPageRule);
  assert.doesNotMatch(aboutSection.groups.attrs, /background-image/);
  assert.match(aboutRule.groups.body, /position:\s*relative/);
  assert.match(aboutRule.groups.body, /isolation:\s*isolate/);
  assert.match(aboutBeforeRule.groups.body, /position:\s*absolute/);
  assert.match(aboutBeforeRule.groups.body, /inset:\s*0/);
  assert.doesNotMatch(aboutBeforeRule.groups.body, /width:\s*100vw/);
  assert.doesNotMatch(aboutBeforeRule.groups.body, /transform:\s*translateX\(-50%\)/);
  assert.match(aboutBeforeRule.groups.body, /background-image:\s*url\(['"]?\.\.\/resources\/ExternalImages\/fuller_shanghai\.jpg['"]?\)/);
  assert.match(aboutBeforeRule.groups.body, /-webkit-mask-image:\s*linear-gradient\(to right,\s*transparent,\s*#000\s+96px,\s*#000\s+calc\(100%\s*-\s*96px\),\s*transparent\)/);
  assert.match(aboutBeforeRule.groups.body, /mask-image:\s*linear-gradient\(to right,\s*transparent,\s*#000\s+96px,\s*#000\s+calc\(100%\s*-\s*96px\),\s*transparent\)/);
  assert.match(aboutPageRule.groups.body, /position:\s*relative/);
  assert.match(aboutPageRule.groups.body, /z-index:\s*1/);
});

test('expander content uses a vertical wipe transition', () => {
  const collapsedContentRule = /^\.expander-content\s*{(?<body>[^}]*)}/m.exec(css);
  const collapsedContentChildRule = /^\.expander-content\s*>\s*\*\s*{(?<body>[^}]*)}/m.exec(css);
  const expandedContentRule = /^\.expander\.show\s+\.expander-content\s*{(?<body>[^}]*)}/m.exec(css);
  const collapsedContentColumnRule = /^\.expander-content-column\s*{(?<body>[^}]*)}/m.exec(css);
  const expandedContentColumnRule = /^\.expander\.show\s+\.expander-content-column\s*{(?<body>[^}]*)}/m.exec(css);

  assert.ok(collapsedContentRule);
  assert.ok(collapsedContentChildRule);
  assert.ok(expandedContentRule);
  assert.ok(collapsedContentColumnRule);
  assert.ok(expandedContentColumnRule);
  assert.match(collapsedContentRule.groups.body, /clip-path:\s*inset\(0\s+0\s+100%\s+0\)/);
  assert.match(collapsedContentRule.groups.body, /display:\s*grid/);
  assert.match(collapsedContentRule.groups.body, /grid-template-rows:\s*0fr/);
  assert.match(collapsedContentRule.groups.body, /transition:[^}]*clip-path\s+0\.4s/);
  assert.match(collapsedContentRule.groups.body, /transition:[^}]*grid-template-rows\s+0\.4s/);
  assert.match(collapsedContentChildRule.groups.body, /min-height:\s*0/);
  assert.match(collapsedContentChildRule.groups.body, /overflow:\s*hidden/);
  assert.match(expandedContentRule.groups.body, /clip-path:\s*inset\(0\s+0\s+0\s+0\)/);
  assert.match(expandedContentRule.groups.body, /grid-template-rows:\s*1fr/);
  assert.match(expandedContentRule.groups.body, /transition:[^}]*clip-path\s+0\.5s/);
  assert.match(expandedContentRule.groups.body, /transition:[^}]*grid-template-rows\s+0\.5s/);
  assert.match(expandedContentRule.groups.body, /overflow:\s*hidden/);
  assert.match(collapsedContentColumnRule.groups.body, /padding:\s*0/);
  assert.match(collapsedContentColumnRule.groups.body, /transition:\s*padding\s+0\.4s/);
  assert.match(expandedContentColumnRule.groups.body, /padding:\s*20px\s+0\s+40px\s+0/);
  assert.match(expandedContentColumnRule.groups.body, /transition:\s*padding\s+0\.5s/);
  assert.doesNotMatch(css, /max-height:\s*10000px/);
});

test('clicking collapsed author links does not toggle the expander', () => {
  assert.match(script, /closest\('\.expander-authors a'\)/);
});
