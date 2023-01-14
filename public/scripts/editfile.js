const COLORS = {
  person: '#d79bf2',
  org: '#eff29b',
  location: '#9bf2bc',
  other: '#f29b9b'
};



const initText = document.getElementById("textArea").innerHTML + '',
text = initText.replace(/\s\s+/g, ' ');

const words = text.split(' ');

document.getElementById('textArea').innerHTML = '';

for (let i = 0; i < words.length; i++) {
  const htmlInput = `<span class="word" id="word${i}">${words[i]}</span> `;

  if (words[i].replace(/\s/g, '') !== '')
    document.getElementById('textArea').innerHTML += htmlInput;
}

const wordObjects = document.querySelectorAll('.word');



const selectColor = (words, color) => {
  words.forEach(word => {
    word.addEventListener('click', () => {
      word.classList.add('painted');
      word.setAttribute('style', `background-color: ${color}; color: #1b2b36`);
    });
  });
};

const clearSelect = btnName => {
  if (!document.getElementById(btnName).classList.contains('selected')) {
    const toolBtns = document.querySelectorAll('.toolBtn');

    for (const btn of toolBtns)
      btn.classList.remove('selected');

    document.getElementById(btnName).classList.add('selected');
  }
};



for (const name in COLORS) {
  document.getElementById(name).addEventListener('click', () => {
    clearSelect(name);
    selectColor(wordObjects, COLORS[name]);
  });
}



document.getElementById('file_accept').addEventListener('click', () => {
  const editedText = document.getElementById('textArea').innerHTML;
  document.getElementById('text').value = editedText;
  document.getElementById('textForm').submit();
});

document.getElementById('file_clear').addEventListener('click', () => {
  window.location.reload();
});