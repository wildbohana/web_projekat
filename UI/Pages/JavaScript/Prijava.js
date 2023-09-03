// Provera da li je neko prijavljen
$(document).ready(() => {
    ProveriLogin();
    $('#loginBtn').click({}, Prijava);
});

// Klik na dugme za prijavu
function Prijava(event)
{
    event.preventDefault();

    // Validacija unetih polje iz forme
    let zahtev = ValidacijaPodataka();
    if (zahtev == null) {
        return;
    }

    // Slanje POST zahteva serveru
    $.ajax({
        url: server + "users/login",
        type: 'POST',
        data: JSON.stringify(zahtev),
        contentType: "application/json",

        success: function (response) {
            localStorage.setItem("jwt_token", response);
            window.location.href = klijent + "PocetnaStranica.html";
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

// Validacija unetih vrednosti u formu
function ValidacijaPodataka()
{
    let kime = $("#usrname").val();
    let loz = $("#pswd").val();

    let ispravan = true;

    // Korisničko ime
    if (kime === "") {
        ispravan = false;
        $("#usrname")[0].setCustomValidity("Korisničko ime je neophodno!");
    }
    else {
        $("#usrname")[0].setCustomValidity("");
    }
    $("#usrname")[0].reportValidity();

    // Lozinka
    if (loz === "") {
        ispravan = false;
        $("#pswd")[0].setCustomValidity("Lozinka je neophodna!");
    }
    else {
        $("#pswd")[0].setCustomValidity("");
    }
    $("#pswd")[0].reportValidity();

    // Ako podaci nisu dobri - vrati null
    if (!ispravan) {
        return null;
    }

    let zahtev = {
        username: kime,
        password: loz
    };
    return zahtev;
}
