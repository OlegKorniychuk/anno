const filterFunction = (inputId, dropItemClass) => {
  const input = document.getElementById(inputId),
  filter = input.value.toUpperCase(),
  a = document.querySelectorAll(dropItemClass);

  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;

    const ifIndex = txtValue.toUpperCase().indexOf(filter) > -1;

    a[i].style.display = ifIndex ? '' : 'none';
  }
};

const dropItemOnClick = (inputId, dropItemId) => {
  const value = document.getElementById(dropItemId).innerText;

  document.getElementById(inputId).value = value;
};



document.getElementById('category').addEventListener('keypress', e => {
  if (e.code == 'Enter')
    document.getElementById("indexForm").submit();
});