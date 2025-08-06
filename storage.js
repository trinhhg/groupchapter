// storage.js
export function getChapters() {
  return JSON.parse(localStorage.getItem('gopChuongData') || '[]');
}

export function saveChapters(chapters) {
  localStorage.setItem('gopChuongData', JSON.stringify(chapters));
}

export function deleteChapter(index) {
  const chapters = getChapters();
  chapters.splice(index, 1);
  saveChapters(chapters);
}
