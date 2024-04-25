import "@babel/polyfill";
import $ from "jquery";
import { displayMap } from "./mapbox";
import { login, logout } from "./login";
import { showAlert } from "./alert";
import { changeSettings } from "./updateSettings";
import { bookTour } from "./stripe";
//DOM ELEMENTS
const mapBox = document.getElementById("map");
const filterForm = document.querySelector("#filterForm");
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
//const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-property");
// DELEGATION
if (mapBox) {
  displayMap();
}
// getting user coordinates
if (document.getElementById("radius")) {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        document.getElementById("latitude").value = latitude;
        document.getElementById("longitude").value = longitude;
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

$(document).ready(function () {
  if (bookBtn) {
    bookBtn.addEventListener("click", (e) => {
      e.target.textContent = "Processing...";
      const { propertyId } = e.target.dataset;
      bookTour(propertyId);
    });
  }
  $("#filterToggle").on("click", function () {
    // Toggle the arrow-down class to arrow-up
    $(this).toggleClass("arrow-down arrow-up");
    $("#filterForm").slideToggle();
  });
});
// index.js

// index.js
const lessThan100kPercentage = parseFloat(
  document.getElementById("lessThan100kPercentage").innerText
);
const between100kAnd500kPercentage = parseFloat(
  document.getElementById("between100kAnd500kPercentage").innerText
);
const moreThan500kPercentage = parseFloat(
  document.getElementById("moreThan500kPercentage").innerText
);
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("priceChart").getContext("2d");
    const chartData = {
      labels: ["Less than $100k", "$100k - $500k", "More than $500k"],
      datasets: [
        {
          data: [
            lessThan100kPercentage,
            between100kAnd500kPercentage,
            moreThan500kPercentage,
          ], // Use the actual values
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        },
      ],
    };
    new Chart(ctx, {
      type: "pie",
      data: chartData,
      options: {
        // Add chart options here if needed
      },
    });
  });
})();

if (loginForm) {
  document.querySelector(".form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener("click", logout);
if (userDataForm) {
  document.querySelector(".form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);
    changeSettings(form, "data");
  });
}
if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";
    const passwordCurrent = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await changeSettings(
      { passwordCurrent, newPassword, passwordConfirm },
      "password"
    );

    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}

const alertMessage = document.querySelector("body").dataset.alert;
if (alertMessage) showAlert("success", alertMessage, 7);
