// main.js
import { getChapters, saveChapters, deleteChapter } from './storage.js';
import { renderPreview, renderChapterList } from './ui.js';

// Gộp các chương con (VD: 46.1, 46.2 -> Chương 46)
function mergeChapters(chapters) {
  const merged = {};
  chapters.forEach(ch => {
    const match = ch.title.match(/Chương (\d+)(?:\.\d+)?(?:\s*:\s*(.+))?/i);
    if (!match) return;
    const baseChapter = match[1];
    const subtitle = match[2] || '';
    if (!merged[baseChapter]) {
      merged[baseChapter] = { title: `Chương ${baseChapter}`, content: [] };
    }
    merged[baseChapter].content.push(subtitle ? `${subtitle}\n${ch.content}` : ch.content);
  });
  return Object.values(merged).map(ch => ({
    title: ch.title,
    content: ch.content.join('\n\n')
  }));
}

// Phân tích nội dung từ textarea
function parseRawText(rawText) {
  const chapters = [];
  const lines = rawText.split('\n');
  let currentChapter = null;
  
  for (const line of lines) {
    if (line.startsWith('=== Chương')) {
      if (currentChapter) chapters.push(currentChapter);
      currentChapter = { title: line.replace('=== ', '').trim(), content: '' };
    } else if (currentChapter) {
      currentChapter.content += line + '\n';
    }
  }
  if (currentChapter) chapters.push(currentChapter);
  return chapters.map(ch => ({ title: ch.title, content: ch.content.trim() }));
}

// Xuất file .docx
function exportToDocx(chapters, storyName) {
  const doc = new docx.Document({
    sections: chapters.map(ch => ({
      properties: {},
      children: [
        new docx.Paragraph({
          text: ch.title,
          heading: docx.HeadingLevel.HEADING_1
        }),
        new docx.Paragraph(ch.content)
      ]
    }))
  });
  docx.Packer.toBlob(doc).then(blob => {
    saveAs(blob, `${storyName || 'Truyen'} - GopChuong.docx`);
  });
}

// Xuất file .zip
function exportToZip(chapters, storyName) {
  const zip = new JSZip();
  chapters.forEach((ch, index) => {
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            text: ch.title,
            heading: docx.HeadingLevel.HEADING_1
          }),
          new docx.Paragraph(ch.content)
        ]
      }]
    });
    docx.Packer.toBlob(doc).then(blob => {
      zip.file(`${ch.title}.docx`, blob);
      if (index === chapters.length - 1) {
        zip.generateAsync({ type: 'blob' }).then(blob => {
          saveAs(blob, `${storyName || 'Truyen'} - Chapters.zip`);
        });
      }
    });
  });
}

// Gắn sự kiện cho các nút
document.getElementById('loadFromStorage').addEventListener('click', () => {
  const chapters = getChapters();
  document.getElementById('rawTextInput').value = chapters.map(ch => `=== ${ch.title} ===\n${ch.content}`).join('\n\n');
});

document.getElementById('preview').addEventListener('click', () => {
  const rawText = document.getElementById('rawTextInput').value;
  const chapters = parseRawText(rawText);
  const merged = mergeChapters(chapters);
  renderPreview(merged);
});

document.getElementById('saveToStorage').addEventListener('click', () => {
  const rawText = document.getElementById('rawTextInput').value;
  const chapters = parseRawText(rawText);
  saveChapters(chapters);
  renderChapterList();
  alert('✅ Đã lưu vào localStorage!');
});

document.getElementById('exportDocx').addEventListener('click', () => {
  const rawText = document.getElementById('rawTextInput').value;
  const storyName = document.getElementById('storyName').value;
  const chapters = parseRawText(rawText);
  const merged = mergeChapters(chapters);
  exportToDocx(merged, storyName);
});

document.getElementById('exportZip').addEventListener('click', () => {
  const rawText = document.getElementById('rawTextInput').value;
  const storyName = document.getElementById('storyName').value;
  const chapters = parseRawText(rawText);
  exportToZip(chapters, storyName);
});
