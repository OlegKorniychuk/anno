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

const categories = {};

window.onload = () => {
  document.querySelectorAll(".dropItem").forEach((item) => {
    categories[item.id] = item.innerText;
  })
}

console.log(categories);

function filterFunction() {
  let input = document.getElementById("category");
  let filter = input.value.toUpperCase();
  let a = document.querySelectorAll(".dropItem");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}


const dropItemOnClick = async (inputId, dropItemId, itemsStorage) => {
  document.getElementById(inputId).value = itemsStorage[dropItemId];
  console.log("chosen");
}