// Varijable
let putanjaSlike;

// Provera da li je neko ulogovan
// Izvlačenje ID proizvoda iz URL
$(document).ready(function ()
{
    ProveriLogin().then(() =>
    {
        let ID = new URL(window.location.href).searchParams.get("ID");
        // Ako proizvod postoji, izmeni ga
        if (ID != null) {
            $("#title").text("Izmeni proizvod");

            let addBtn = $("#addBtn");
            addBtn.text("Sačuvaj");
            addBtn.click({ id: ID }, IzmeniProizvod);

            PopuniPodatkeProizvoda(ID);
        }
        // U suprotnom dodaj novi - ali jedino ako je trenutni korisnik prodavac
        else if (uloga == "Seller") {
            $("#title").text("Dodaj proizvod");

            let addBtn = $("#addBtn");
            addBtn.text("Dodaj");
            addBtn.click({}, DodajProizvod);
            addBtn.addClass("hide");
        }
        // U suprotnom suprotnom, vrati korisnika na pregled profila
        else {
            window.location.href = urlProfila;
        }
        $('#uploadBtn').click({ id: ID }, OtpremiSliku);
    });
});

// Dobavljanje i prikaz informacija o proizvodu od interesa
function PopuniPodatkeProizvoda(productId)
{
    $.ajax({
        url: server + "products/find/" + productId,
        method: "GET",
        contentType: "application/json",

        success: function (res) {
            $("#name").val(res.Name);
            $("#price").val(res.Price);
            $("#amount").val(res.Amount);
            $("#desc").val(res.Description);
            $("#city").val(res.City);
            putanjaSlike = res.Image;
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}

// Dodavanje novog proizvoda
function DodajProizvod(event)
{
    event.preventDefault();

    // Validacija podataka unetih u formu
    let proizvod = ValidacijaProizvoda();
    if (proizvod == null) {
        return;
    }

    // Dodavanje ID-jeva
    proizvod.ID = event.data.id;
    proizvod.SellerId = trenutniId;

    if (putanjaSlike != "") {
        proizvod.Image = putanjaSlike;
    }
    else {
        return;
    }

    // Slanje POST zahteva serveru
    $.ajax({
        url: server + "products/add/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(proizvod),
        headers: {
            "Authorization": token
        },

        success: function (res) {
            window.location.href = urlProfila;
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

// Izmena proizvoda (postojećeg)
function IzmeniProizvod(event)
{
    event.preventDefault();

    // Provera validnosti unetih podataka
    let proizvod = ValidacijaProizvoda();
    if (proizvod == null) {
        return;
    }

    // Dodavanje ID-jeva
    proizvod.ID = event.data.id;
    proizvod.SellerId = trenutniId;

    if (putanjaSlike != "") {
        proizvod.Image = putanjaSlike;
    }

    // Slanje PUT zahteva serveru
    $.ajax({
        url: server + "products/update/",
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(proizvod),
        headers: {
            "Authorization": token
        },

        success: function (res) {
            window.location.href = urlProfila;
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

// Validacija podataka unetih u formu
function ValidacijaProizvoda()
{
    let naziv = $("#name").val().trim();
    let cena = parseFloat($("#price").val().trim());
    let kol = parseInt($("#amount").val().trim());
    let opis = $("#desc").val().trim();
    let grad = $("#city").val().trim();

    let ispravan = true;

    // Naziv
    if (naziv === "") {
        ispravan = false;
        $("#name")[0].setCustomValidity("Naziv proizvoda je neophodno!");
    } else {
        $("#name")[0].setCustomValidity("");
    }
    $("#name")[0].reportValidity();

    // Cena
    if (isNaN(cena) || cena <= 0) {
        ispravan = false;
        $("#price")[0].setCustomValidity("Cena proizvoda nije u dobrom formatu.");
    } else {
        $("#price")[0].setCustomValidity("");
    }
    $("#price")[0].reportValidity();

    // Količina
    if (isNaN(kol) || kol < 0) {
        ispravan = false;
        $("#amount")[0].setCustomValidity("Količina proizvoda mora biti veća od nule.");
    } else {
        $("#amount")[0].setCustomValidity("");
    }
    $("#amount")[0].reportValidity();

    // Opis
    if (opis === "") {
        ispravan = false;
        $("#desc")[0].setCustomValidity("Opis proizvoda je neophodan.");
    } else {
        $("#desc")[0].setCustomValidity("");
    }
    $("#desc")[0].reportValidity();

    // Grad
    if (grad === "") {
        ispravan = false;
        $("#city")[0].setCustomValidity("Grad je neophodan.");
    } else {
        $("#city")[0].setCustomValidity("");
    }
    $("#city")[0].reportValidity();

    // Ako podaci nisu dobri - vrati null
    if (!ispravan) {
        return null;
    }

    let proizvod = {
        Name: naziv,
        Price: cena,
        Amount: kol,
        Description: opis,
        City: grad
    };

    return proizvod;
}

// Otpremanje slike
function OtpremiSliku(event)
{
    event.preventDefault();

    if ($('#imageUpload').val() === '') {
        $("#imageUpload")[0].setCustomValidity("Morate otpremiti sliku");
        $("#imageUpload")[0].reportValidity();
        return;
    }
    else {
        $("#imageUpload")[0].setCustomValidity("");
        $("#imageUpload")[0].reportValidity();
    }

    // Proširenje POST zahteva - kad ima sliku u sebi
    let formData = new FormData();
    let file = $('#imageUpload')[0];
    formData.append('file', file.files[0]);

    // Slanje POST zahteva serveru
    $.ajax({
        url: server + "image/add/",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: {
            "Authorization": token
        },

        success: function (response) {
            console.log(response);
            putanjaSlike = response;
            $("#uploadBtn").addClass("hide");
            $("#addBtn").removeClass("hide");
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}
