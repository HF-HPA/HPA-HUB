const logoContainer = document.getElementById("logo-container");
const logo = document.getElementById("logo");
const splash = document.getElementById("splash");
const login = document.getElementById("login");

logoContainer.addEventListener("click", () => {
  logo.classList.add("fade-out");

  setTimeout(() => {
    splash.classList.remove("active");
    login.classList.add("active");
  }, 800);
});
