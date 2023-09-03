// Varijable
let putanjaSlike = "";
let recezent;

// Pri pokretanju stranice
$(document).ready(function ()
{
    ProveriLogin().then(() =>
    {
        // Sve korisnike osim kupaca vraća na pregled profila 
        // Jer samo kupci mogu da ostavljaju recenzije
        if (uloga != "Buyer") {
            window.location.href = urlProfila;
        }

        // Dobavljanja ID recenzije i proizvoda iz URL
        let params = new URL(window.location.href).searchParams;
        let reviewId = params.get("reviewId");
        let productId = params.get("productId");

        // Ako recenzija postoji - izmeni je
        if (reviewId != null) {
            $("#title").text("Izmena recenzije");
            $("#addBtn").text("Sačuvaj");
            PopuniPodatkeKorisnika(reviewId);
            $("#addBtn").click({ id: reviewId, product: productId }, IzmeniRecenziju);
        }
        // Ako recenzija ne postoji - napravi je
        else {
            $("#addBtn").click({ id: productId }, DodajRecenziju);
            $("#addBtn").addClass("hide");
        }

        $('#uploadBtn').click({}, OtpremiSliku);
    });
});

// Popunjavanje polja za prikaz (ako postoji recenzija)
function PopuniPodatkeKorisnika(reviewId)
{
    // Slanje GET zahteva serveru da pronađe tu recenziju
    $.ajax({
        url: server + "reviews/find/" + reviewId,
        method: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (res) {
            $("#name").val(res.Title);
            $("#content").text(res.Content);

            // Dodeli vrednost varijablama sa početka fajla
            recezent = res.Reviewer;
            putanjaSlike = res.Image
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}

// Pravljenje nove recenzije
function DodajRecenziju(event)
{
    event.preventDefault();
    let naslov = $("#name").val().trim();
    let sadrzaj = $("#content").val().trim();

    if (!ValidacijaRecenzije()) {
        return;
    }

    // Pravljenje zahteva
    let zahtev = {
        Title: naslov,
        Content: sadrzaj,
        Image: putanjaSlike,
        Product: parseInt(event.data.id),
        Reviewer: trenutniId
    }

    // Slanje POST zahteva serveru
    $.ajax({
        url: server + "reviews/add/",
        type: 'POST',
        data: JSON.stringify(zahtev),
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (response) {
            window.location.href = urlProfila;
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}

// Izmena postojeće recenzije
function IzmeniRecenziju(event)
{
    event.preventDefault();
    let naslov = $("#name").val().trim();
    let sadrzaj = $("#content").val().trim();

    if (!ValidacijaRecenzije()) {
        return;
    }

    // Pravljenje zahteva
    let zahtev = {
        ID: parseInt(event.data.id),
        Title: naslov,
        Content: sadrzaj,
        Product: parseInt(event.data.product),
        Reviewer: recezent
    }

    // Dodavanje slike (ako je otpremljena)
    if (putanjaSlike != "") {
        zahtev.Image = putanjaSlike;
    }

    // Slanje PUT zahteva serveru
    $.ajax({
        url: server + "reviews/update/",
        type: 'PUT',
        data: JSON.stringify(zahtev),
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (response) {
            window.location.href = urlProfila;
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}

// Validacija recenzije
function ValidacijaRecenzije()
{
    let ispravna = true;

    // Naslov
    if ($("#name").val().trim() === "") {
        $("#name")[0].setCustomValidity("Naslov je neophodan!");
        ispravna = false;
    } else {
        $("#name")[0].setCustomValidity("");
    }
    $("#name")[0].reportValidity();

    // Sadržaj
    if ($("#content").val().trim() === "") {
        $("#content")[0].setCustomValidity("Sadržaj je neophodan!");
        ispravna = false;
    } else {
        $("#content")[0].setCustomValidity("");
    }
    $("#content")[0].reportValidity();

    return ispravna;
}

// Otpremanje slike
function OtpremiSliku(event)
{
    event.preventDefault();

    // Slika mora biti otpremljena
    if ($('#imageUpload').val() === '') {
        $("#imageUpload")[0].setCustomValidity("Slika mora biti otpremljena");
        $("#imageUpload")[0].reportValidity();
        return;
    }
    else {
        $("#imageUpload")[0].setCustomValidity("");
        $("#imageUpload")[0].reportValidity();
    }

    // Proširenje POST zahteva - ugl se koristi kada postoje slike u zahtevu ili bilo koja datoteka
    let formData = new FormData();
    let file = $('#imageUpload')[0];
    formData.append('file', file.files[0]);

    // Slanje slike serveru
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
        }
    })
}
