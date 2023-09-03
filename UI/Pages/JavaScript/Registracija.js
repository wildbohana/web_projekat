// Provera da li je neko već ulogovan
$(document).ready(() => {
    ProveriLogin().then(() => {
        $('#signupBtn').click({}, Registracija);
    });
});

// Klik na dugme za registraciju
function Registracija(event)
{
    event.preventDefault();

    // Validacija unetih podataka u formi
    user = ValidacijaPodataka();
    if (user == null) {
        return;
    }

    // Slanje POST zahteva serveru
    $.ajax({
        url: server + "users/register",
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(user),

        success: function (response) {
            window.location.href = klijent + "PocetnaStranica.html";
        },
        error: function (xhr, status, error) {
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

// Validacija podataka iz forme
function ValidacijaPodataka()
{
    let kime = $("#usrname").val().trim();
    let loz = $("#pswd").val().trim();
    let ime = $("#fname").val().trim();
    let prz = $("#lname").val().trim();
    let email = $("#email").val().trim();
    let pol = $("input[name='Gender']:checked").val();
    let datum = new Date($("#dob").val());

    isValid = true;

    // Kime
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
    let emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email.match(emailPattern)) {
        isValid = false;
        $("#email")[0].setCustomValidity("Email adresa nije dobro uneta.");
    } else {
        $("#email")[0].setCustomValidity("");
    }
    $("#email")[0].reportValidity();

    // Datum rođenja
    if (datum === null || datum >= Date.now()) {
        isValid = false;
        $("#dob")[0].setCustomValidity("Datum rođenja je neophodan.");
    } else{
        $("#dob")[0].setCustomValidity("");
    }
    $("#dob")[0].reportValidity();

    // Ako podaci nisu dobri - vrati null
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
        Role: 0
    };

    return user;
}
