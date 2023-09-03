// URL koji se često koriste
const server = "https://localhost:44336/api/";
const klijent = "https://localhost:44379/Pages/";
const slike = "https://localhost:44336/Images/";

// Bitne promenljive (poput JWT tokena)
let token = localStorage.getItem("jwt_token");
let uloga;           // roleName
let trenutniId;      // trenutno ulogovani korisnik
let ulogovan = false;
let omiljeniProizvodi = [];
let korisnickoIme;
let urlProfila;
const dateLocale = "en-GB";

// Proverava da li je neki korisnik trenutno ulogovan
async function ProveriLogin()
{
    try {
        // Šalje zahtev serveru
        let response = await $.ajax({
            url: server + "users/current",
            type: "GET",
            headers: {
                "Authorization": token
            }
        });

        // Popunjava polja
        uloga = response.Role;
        trenutniId = response.ID;
        omiljeniProizvodi = Array.from(response.Favourites);
        korisnickoIme = response.Username;

        // Na stranici pokazuje naziv profila gore desno u ćošku
        $("#dropdown").removeClass("hide");
        let profil = $("#profile-name");
        profil.text(korisnickoIme);
        ulogovan = true;

        // Ako je admin -> klik na ime profila vodi na kontrolnu tablu
        if (uloga == "Administrator") {
            urlProfila = klijent + "KontrolnaTabla.html?ID=" + response.ID;
            profil.attr("href", urlProfila);
        }
        // Ako nije admin -> klik na ime profila vodi na pregled profila
        else {
            urlProfila = klijent + "PregledProfila.html?ID=" + response.ID;
            profil.attr("href", urlProfila);
        }
    }
    catch (error) {
        $("#links").removeClass("hide");
        Odjava();
    }

    $('#logoutBtn').click(Odjava);
}

// Odjava (ako je korisnik ulogovan)
function Odjava()
{
    if (token != null) {
        localStorage.removeItem("jwt_token");

        // Vrati korisnika na početnu stranicu
        if (window.location.href != klijent + "PocetnaStranica.html") {
            window.location.href = klijent + "PocetnaStranica.html";
        }
        else {
            location.reload();
        }
    }
}

// Otvranje slike kad se klikne na nju
function OtvoriSliku(event)
{
    window.open(slike + event.data.param1, "_blank");
}

// Vraća korisnika na stranicu za pregled profila
// Koristi se kada se odustane od ostavljanja recenzije isl.
function DoProfila()
{
    if (urlProfila) {
        window.location.href = urlProfila;
    }
    else {
        window.location.href = klijent + "PocetnaStranica.html";
    }
}

// Prikaz API poruke - kada nešto nije u redu na serverskoj strani
function ApiPoruka(message, error)
{
    let div = $("<div></div>");
    div.addClass("api-error");

    let popup = $("<div></div>");
    popup.addClass("error-popup");

    let title = $("<h1></h1>").text(error);
    let text = $("<p></p>").text(message);
    text.addClass("red-text");

    let btn = $("<button>Ok</button>");
    btn.addClass("green-btn");
    btn.click(() => {
        div.remove();
    });

    popup.append(title, text, btn);
    div.append(popup);

    $("main").append(div);
}
