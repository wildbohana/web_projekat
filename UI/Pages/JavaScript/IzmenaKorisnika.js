// Varijable od kojih zavisi prikaz
let dozvola_promene_imena = false;
let dozvola_promene_lozinke = false;

let staro_kime;
let stara_loz = "placeholder";

// Provera da li je neko već ulogovan
$(document).ready(function ()
{
    ProveriLogin().then(function ()
    {
        // Izvlačenje ID korisnika iz URL
        let ID = new URL(window.location.href).searchParams.get("ID");
        if (ID != null) {
            $("#title").text("Izmeni korisnika");
            $("#addBtn").text("Sačuvaj");
            $("#addBtn").click({ id: ID }, IzmeniKorisnika);

            PopuniPodatkeKorisnika(ID);

            $("#usrname").addClass("hide");
            $("#usrlbl").addClass("hide");
            $("#pswd").addClass("hide");
            $("#pswdlbl").addClass("hide");

            $("#chgUsrname").removeClass("hide");
            $("#chgUsrname").click({ id: ID }, PromeniKime);
            $("#chgPswd").removeClass("hide");
            $("#chgPswd").click({ id: ID }, PromeniLozinku);
        }
        // Ako je trenutno ulogovan korisnik, klik na sačuvaj dodaje korisnika
        else if (uloga == "Administrator") {
            $("#addBtn").click({}, DodajKorisnika);
        }
        else {
            window.location.href = urlProfila;
        }
    });
});

// Popunjavanje stranice sa podacima o korisniku
function PopuniPodatkeKorisnika(id)
{
    $.ajax({
        url: server + "users/user/" + id,
        method: 'GET',
        contentType: "application/json",

        success: function (response) {
            staro_kime = response.Username;
            $("#fname").val(response.FirstName);
            $("#lname").val(response.LastName);
            $("#gender").val(response.Gender === "m" ? "Muški" : "Ženski");
            $("#email").val(response.Email);
            $("#dob").val(new Date(response.DateOfBirth).toISOString().split("T")[0]);
            $("#role").val(response.RoleName);
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}

// Klik na dugme prikazuje polja za izmenu korisničkog imena
function PromeniKime(event)
{
    event.preventDefault();

    $("#usrname").removeClass("hide");
    $("#usrlbl").removeClass("hide").text("Novo korisničko ime:");
    $("#chgUsrname").remove();

    dozvola_promene_imena = true;
    return;
}

// Klik na dugme omogućava polja za izmenu lozinke
function PromeniLozinku(event)
{
    event.preventDefault();

    $("#pswdlbl").removeClass("hide").text("Nova lozinka");
    $("#pswd").removeClass("hide");
    $("#oldPswdlbl").removeClass("hide");
    $("#oldPswd").removeClass("hide");
    $("#chgPswd").remove();

    dozvola_promene_lozinke = true;
    return;
}

// Dodavanje korisnika (administratorska radnja)
function DodajKorisnika(event)
{
    // Ako nije admin - vrati korisnika na pregled profila
    if (uloga != "Administrator") {
        window.location.href = urlProfila;
    }

    event.preventDefault();

    // Validacija vrednosti polja iz forme
    user = ValidacijaNovog();
    if (user == null) {
        return;
    }

    // Slanje POST zahteva serveru
    $.ajax({
        url: server + "users/add/",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(user),
        headers: {
            "Authorization": token
        },

        success: function (response) {
            window.location.href = urlProfila;
        },
        error: function (xhr, status, error) {
            console.error(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
    return false;
}

// Izmena korisnika
function IzmeniKorisnika(event)
{
    event.preventDefault();

    // Validacija polja iz forme
    user = ValidacijaIzmenjenog();
    if (user == null) {
        return;
    }

    // Event sadrži ID korisnika koji menjamo
    user.ID = event.data.id;

    // Ako je dozvoljena promena korisničkog imena
    if (dozvola_promene_imena) {
        let usrname = $("#usrname").val().trim();
        if (korisnickoIme == "") {
            $("#usrname")[0].setCustomValidity("Korisničko ime je neophodno!");
            $("#usrname")[0].reportValidity();
            return;
        }
        else {
            $("#usrname")[0].setCustomValidity("");
        }

        // Zahtev za promenu - ID korisnika i novo kime
        let zahtev = {
            UserID: user.ID,
            NewUsername: usrname
        }

        // Slanje PUT zahteva serveru
        $.ajax({
            url: server + "users/update-username/",
            type: 'PUT',
            contentType: "application/json",
            data: JSON.stringify(zahtev),
            headers: {
                "Authorization": token
            },

            success: function (response) {
                dozvola_promene_imena = false;
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText);
                let result = JSON.parse(xhr.responseText);
                ApiPoruka(result.Message, error);
                return;
            }
        });
    }

    user.Username = staro_kime;

    // Ako je dozvoljena promena lozinke
    if (dozvola_promene_lozinke) {
        let oldPswd = $("#oldPswd").val().trim();
        let pswd = $("#pswd").val().trim();
        if (oldPswd == "") {
            $("#oldPswd")[0].setCustomValidity("Neophodna je stara lozinka!");
            $("#oldPswd")[0].reportValidity();
            return;
        }
        else {
            $("#oldPswd")[0].setCustomValidity("");
        }

        if (pswd == "") {
            $("#pswd")[0].setCustomValidity("Neophodna je nova lozinka!");
            $("#pswd")[0].reportValidity();
            return;
        }
        else {
            $("#pswd")[0].setCustomValidity("");
        }

        // Zahtev za promenu - ID korisnika, stara i nova lozinka
        let zahtev = {
            UserID: user.ID,
            OldPassword: oldPswd,
            NewPassword: pswd
        }

        // Slanje PUT zahteva serveru
        $.ajax({
            url: server + "users/update-password/",
            type: 'PUT',
            contentType: "application/json",
            data: JSON.stringify(zahtev),
            headers: {
                "Authorization": token
            },

            success: function (response) {
                dozvola_promene_lozinke = false;
            },
            error: function (xhr, status, error) {
                console.error(xhr.responseText);
                let result = JSON.parse(xhr.responseText);
                ApiPoruka(result.Message, error);
                return;
            }
        });
    }

    user.Password = stara_loz;

    // Slanje PUT zahteva serveru za sve ostale izmene
    $.ajax({
        url: server + "users/update/",
        type: 'PUT',
        contentType: "application/json",
        data: JSON.stringify(user),
        headers: {
            "Authorization": token
        },

        success: function (response) {
            window.location.href = urlProfila;
        },
        error: function (xhr, status, error) {
            console.error(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
    return;
}

// Validacija podataka iz polja forme - kada se pravi novi korisnik (kada ga admin pravi)
function ValidacijaNovog()
{
    let kime = $("#usrname").val().trim();
    let loz = $("#pswd").val().trim();
    let ime = $("#fname").val().trim();
    let prz = $("#lname").val().trim();
    let email = $("#email").val().trim();
    let pol = $("input[name='Gender']:checked").val();
    let datum = new Date($("#dob").val());

    isValid = true;

    // Korisničko ime
    if (kime === "") {
        isValid = false;
        $("#usrname")[0].setCustomValidity("Korisničko ime je neophodno.");
    } else {
        $("#usrname")[0].setCustomValidity("");
    }
    $("#usrname")[0].reportValidity();

    // Lozinka
    if (loz === "") {
        isValid = false;
        $("#pswd")[0].setCustomValidity("Lozinka je neophodna.");
    } else {
        $("#pswd")[0].setCustomValidity("");
    }
    $("#pswd")[0].reportValidity();

    // Ime
    if (ime === "") {
        isValid = false;
        $("#fname")[0].setCustomValidity("Ime je neophodno.");
    } else {
        $("#fname")[0].setCustomValidity("");
    }
    $("#fname")[0].reportValidity();

    // Prezime
    if (prz === "") {
        isValid = false;
        $("#lname")[0].setCustomValidity("Prezime je neophodno.");
    } else {
        $("#lname")[0].setCustomValidity("");
    }
    $("#lname")[0].reportValidity();

    // Mejl
    let regeks = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(regeks)) {
        isValid = false;
        $("#email")[0].setCustomValidity("Email adresa nije uneta u ispravnom formatu.");
    } else {
        $("#email")[0].setCustomValidity("");
    }
    $("#email")[0].reportValidity();

    // Datum rođenja
    if (datum === null || datum >= Date.now()) {
        isValid = false;
        $("#dob")[0].setCustomValidity("Datum rođenja je neophodan.");
    } else {
        $("#dob")[0].setCustomValidity("");
    }
    $("#dob")[0].reportValidity();

    // Ako podaci nisu dobri, vrati null
    if (!isValid) {
        return null;
    }

    let user = {
        Username: kime,
        Password: loz,
        FirstName: ime,
        LastName: prz,
        Email: email,
        Gender: pol,
        DateOfBirth: datum,
        Role: 1
    };
    return user;
}

// Validacija polja iz forme - kada se menja korisnik
function ValidacijaIzmenjenog()
{
    let ime = $("#fname").val().trim();
    let prz = $("#lname").val().trim();
    let email = $("#email").val().trim();
    let pol = $("input[name='Gender']:checked").val();
    let datum = new Date($("#dob").val());

    isValid = true;

    // Ime
    if (ime === "") {
        isValid = false;
        $("#fname")[0].setCustomValidity("Ime je neophodno.");
    } else {
        $("#fname")[0].setCustomValidity("");
    }
    $("#fname")[0].reportValidity();

    // Prezime
    if (prz === "") {
        isValid = false;
        $("#lname")[0].setCustomValidity("Prezime je neophodno.");
    } else {
        $("#lname")[0].setCustomValidity("");
    }
    $("#lname")[0].reportValidity();

    // Mejl
    let emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(emailPattern)) {
        isValid = false;
        $("#email")[0].setCustomValidity("Email nije unet u dobrom formatu.");
    } else {
        $("#email")[0].setCustomValidity("");
    }
    $("#email")[0].reportValidity();

    // Datum rođenja
    if (datum === null || datum >= Date.now()) {
        isValid = false;
        $("#dob")[0].setCustomValidity("Datum rođenja  je neophodan.");
    } else {
        $("#dob")[0].setCustomValidity("");
    }
    $("#dob")[0].reportValidity();

    // Ako nije validan - vrati null
    if (!isValid) {

        return null;
    }

    let user = {
        Username: staro_kime,
        Password: stara_loz,
        FirstName: ime,
        LastName: prz,
        Email: email,
        Gender: pol,
        DateOfBirth: datum,
    };
    return user;
}
