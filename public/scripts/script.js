// window.onload = () => {
//   const slider = document.getElementById("slider");

//   slider.addEventListener("click", function () {
//     console.log(slider.checked);
//     const param = slider.checked == true ? "edit" : "download"; 
//     fetch(`/index?type=${param}`, { method: 'GET' })
//     .then(response => console.log(response))
//     .catch(data => console.log(data));
//   });
// };


function filterFunction(inputId, dropItemClass) {
  let input = document.getElementById(inputId);
  let filter = input.value.toUpperCase();
  let a = document.querySelectorAll(dropItemClass);
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}


const dropItemOnClick = (inputId, dropItemId) => {
  const value = document.getElementById(dropItemId).innerText;
  console.log(value);
  console.log(dropItemId);
  document.getElementById(inputId).value = value;
}