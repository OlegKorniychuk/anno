function bolden() {
  const selection = window.getSelection();
  console.log(selection.toString())
  if (selection.rangeCount) {
    const wrapper = document.createElement('b');
    const range = selection.getRangeAt(0).cloneRange();
    range.surroundContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  const textField = document.getElementById('inputArea');
  console.log(textField);
}

function bgYellow() {
  const selection = window.getSelection();
  if (selection.rangeCount) {
    const wrapper = document.createElement('span');
    wrapper.style.backgroundColor = 'yellow';
    const range = selection.getRangeAt(0).cloneRange();
    range.surroundContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  const textField = document.getElementById('inputArea');
  console.log(textField);
}