const menu = document.querySelector(".menu");
const menuList = document.getElementById("mobile_menu");

let menuDisplay = false;

function toggleMenu() {
	if (menuDisplay == false) {
		menuList.style.right = "0";
		menuList.style.display = "block";
		menuDisplay = true;
	} else {
		menuList.style.right = "-50%";
		menuList.style.display = "none";
		menuDisplay = false;
	}
}

menu.addEventListener("click", toggleMenu);