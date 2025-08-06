// ui.js
import { getChapters, deleteChapter } from './storage.js';

// Hiển thị nội dung xem trước
export function renderPreview(chapters) {
  const previewDiv = document.getElementById('previewContent');
  previewDiv.innerHTML = chapters.map(ch => `
    <h2 class="text-xl font-bold">${ch.title}</h2>
    <p class="whitespace-pre-wrap">${ch.content}</p>
  `).join('');
}

// Hiển thị danh sách chương trong tab "Quản lý chương"
export function renderChapterList() {
  const chapters = getChapters();
  const chapterListDiv = document.getElementById('chapterList');
  chapterListDiv.innerHTML = chapters.map((ch, index) => `
    <div class="flex justify-between items-center p-2 border-b">
      <div>
        <strong>${ch.title}</strong> (${ch.content.length} ký tự)
      </div>
      <div class="flex gap-2">
        <button class="view-btn px-2 py-1 bg-blue-500 text-white rounded" data-index="${index}">📄 Xem</button>
        <button class="edit-btn px-2 py-1 bg-yellow-500 text-white rounded" data-index="${index}">✏️ Sửa</button>
        <button class="delete-btn px-2 py-1 bg-red-500 text-white rounded" data-index="${index}">🗑️ Xóa</button>
        <button class="export-btn px-2 py-1 bg-orange-500 text-white rounded" data-index="${index}">⬇️ Xuất .docx</button>
      </div>
    </div>
  `).join('');

  // Gắn sự kiện cho các nút
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = btn.dataset.index;
      const chapters = getChapters();
      document.getElementById('rawTextInput').value = `=== ${chapters[index].title} ===\n${chapters[index].content}`;
      document.querySelector('.tab-btn[data-tab="merge"]').click();
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = btn.dataset.index;
      const chapters = getChapters();
      const newContent = prompt('Sửa nội dung chương:', chapters[index].content);
      if (newContent !== null) {
        chapters[index].content = newContent;
        saveChapters(chapters);
        renderChapterList();
      }
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Xóa chương này?')) {
        deleteChapter(btn.dataset.index);
        renderChapterList();
      }
    });
  });

  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = btn.dataset.index;
      const chapters = getChapters();
      const doc = new docx.Document({
        sections: [{
          properties: {},
          children: [
            new docx.Paragraph({
              text: chapters[index].title,
              heading: docx.HeadingLevel.HEADING_1
            }),
            new docx.Paragraph(chapters[index].content)
          ]
        }]
      });
      docx.Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${chapters[index].title}.docx`);
      });
    });
  });
}

// Chuyển đổi tab
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.replace('bg-blue-500', 'bg-gray-300'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    btn.classList.replace('bg-gray-300', 'bg-blue-500');
    document.getElementById(btn.dataset.tab).classList.remove('hidden');
    if (btn.dataset.tab === 'manage') renderChapterList();
  });
});

// Render ban đầu
renderChapterList();
