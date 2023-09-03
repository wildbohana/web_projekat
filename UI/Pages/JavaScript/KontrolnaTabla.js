// Liste za proizvode
let sviProizvodi = [];
let filtriraniProizvodi = [];
// Liste za korisnike
let sviKorisnici = []
let filtriraniKorisnici = [];

// Dobavljanje ID iz URL
$(document).ready(() =>
{
    let ID = new URL(window.location.href).searchParams.get("ID");
    if (!ID) {
        window.location.href = klijent + "PocetnaStranica.html";
    }

    // Provera ko je prijavljen
    ProveriLogin();

    // Ako je neko ulogovan
    if (token)
    {
        // Dobavi podatke o trenutnom korisniku
        $.ajax({
            url: server + "users/user/" + ID,
            method: 'GET',
            contentType: "application/json",

            // Ako trenutan korisnik nije admin, vrati ga na početnu
            success: function (response) {
                if (response.RoleName != "Administrator") {
                    window.location.href = klijent + "PocetnaStranica.html";
                }

                // Prikaži inforacije o adminu
                $("#usrname").text(response.Username);
                $("#fname").text(response.FirstName);
                $("#lname").text(response.LastName);
                $("#gender").text(response.Gender === "m" ? "Muški" : "Ženski");
                $("#email").text(response.Email);
                $("#dob").text(new Date(response.DateOfBirth).toLocaleDateString(dateLocale));
                $("#role").text(response.RoleName);
                $("#editBtn").click({ id: response.ID }, IzmeniProfil);

                // Popuni prikaze za ostalo
                GenerisiPrikazProizvoda();
                GenerisiPrikazPorudzbina();
                GenerisiPrikazRecenzija();
                GenerisiPrikazKorisnika();
            },
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
            }
        })
    }

    // Ako je ulogovan admin - omogući mu dodavanje novog prodavca
    $("#userAddBtn").click({}, DodajKorisnika);
});

// Izmena podataka o adminu
function IzmeniProfil(event) {
    window.location.href = klijent + "IzmenaKorisnika.html?ID=" + event.data.id;
}

/* KORISNICI */

// Generisanje prikaza svih korisnika
function GenerisiPrikazKorisnika()
{
    // Slanje zahteva serveru za sve korisnike
    $.ajax({
        url: server + "users/all/",
        method: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (res) {
            if (res.length > 0) {
                sviKorisnici = res;
                filtriraniKorisnici = Array.from(sviKorisnici);

                PopuniTabeluKorisnika(sviKorisnici);
            }
            else {
                let table = $(".users");
                let tr = $("<tr></tr>");
                let message = $('<td colspan=6></td>').text("Nisu pronađeni korisnici!");
                tr.append(message);
                table.append(tr);
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

// Popunjavanje tabele za prikaz korisnika
function PopuniTabeluKorisnika(users)
{
    let table = $(".users tbody");
    table.empty();

    if (users.length == 0) {
        let tr = $("<tr></tr>");
        let message = $('<td colspan=6></td>').text("Nisu pronađeni korisnici!");
        tr.append(message);
        table.append(tr);
    }
    else {
        $.each(users, function (index, user)
        {
            let tr = $("<tr></tr>");
            tr.attr("id", "user-" + user.ID);

            let usrname = $("<td></td>").text(user.Username);
            let fname = $("<td></td>").text(user.FirstName);
            let lname = $("<td></td>").text(user.LastName);
            let email = $("<td></td>").text(user.Email);
            let role = $("<td></td>").text(user.RoleName);
            let gender = $("<td></td>").text(user.Gender === "m" ? "Muški" : "Ženski");
            let dob = $("<td></td>").text(new Date(user.DateOfBirth).toLocaleDateString(dateLocale));

            // Svi korisnici osim administratora se mogu obrisati
            let action = $('<td></td>');
            if (user.RoleName != "Administrator") {
                let editBtn = $('<button>Izmeni</button>');
                editBtn.addClass("green-btn");
                editBtn.click({ id: user.ID }, IzmeniProfil);

                let deleteBtn = $('<button>Obriši</button>');
                deleteBtn.addClass("red-btn");
                deleteBtn.click({ id: user.ID }, ObrisiKorisnika);

                action.append(editBtn, deleteBtn);
            }

            // Dodaj podatke u tabelu
            tr.append(usrname, fname, lname, email, role, gender, dob, action);
            table.append(tr);
        });
    }
}

// Redirect na stranicu
function DodajKorisnika(event)
{
    window.location.href = klijent + 'IzmenaKorisnika.html';
}

// Brisanje korisnika
function ObrisiKorisnika(event)
{
    event.preventDefault();
    $.ajax({
        url: server + "users/delete/" + event.data.id,
        method: "DELETE",
        headers: {
            "Authorization": token
        },

        success: function (response) {
            $("#user-" + event.data.id).remove();
            location.reload();
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}

// Pretraga korisnika
function PretragaKorisnika()
{
    let ime = new RegExp($("#searchFName").val().trim().toLowerCase());
    let prz = new RegExp($("#searchLName").val().trim().toLowerCase());
    let datumMin = new Date($("#minDate").val());
    let datumMax = new Date($("#maxDate").val());
    let uloga = $("#searchRole").val();

    filtriraniKorisnici = sviKorisnici;

    // Po imenu
    if (ime) {
        filtriraniKorisnici = filtriraniKorisnici.filter(x => x.FirstName.toLowerCase().match(ime));
    }
    // Po prezimenu
    if (prz) {
        filtriraniKorisnici = filtriraniKorisnici.filter(x => x.LastName.toLowerCase().match(prz));
    }
    // Po datumu rođenja
    if (!isNaN(datumMin) && !isNaN(datumMax)) {
        filtriraniKorisnici = filtriraniKorisnici.filter(x => new Date(x.DateOfBirth) >= datumMin && new Date(x.DateOfBirth) <= datumMax);
    }
    // Po ulozi
    if (uloga != -1) {
        filtriraniKorisnici = filtriraniKorisnici.filter(x => x.Role == uloga);
    }

    // Prikaži korisnike koji odgovaraju pretrazi
    PopuniTabeluKorisnika(filtriraniKorisnici);
}

/* PROIZVODI */

// Generisanje prikaza svih proizvoda
function GenerisiPrikazProizvoda()
{
    // Dobavljanje svih proizvoda od servera
    $.ajax({
        url: server + "products/all/",
        method: 'GET',
        headers: {
            "Authorization": token
        },
        contentType: "application/json",

        success: function (res) {
            sviProizvodi = res;
            filtriraniProizvodi = Array.from(sviProizvodi);

            // Popuni prikaz
            PopuniPrikazProizvoda(filtriraniProizvodi);
        },
        error: function (xhr, status, error) {
            let div = $(".products");
            let message = $("<h1></h1>").text(error);
            div.append(message);
        }
    })
}

// Popunjavanje prikaza sa proizvodima
function PopuniPrikazProizvoda(items)
{
    let div = $(".products");
    div.empty();

    // Ako postoje proizvodi
    if (items.length > 0)
    {
        $.each(items, function (index, product)
        {
            let productDiv = $("<div></div>").addClass("product");
            productDiv.attr("id", "product-" + product.ID);

            // Ako proizvod nije dostupan - sakrij ga (osenči)
            if (!product.isAvailable) {
                productDiv.addClass("unavailable");
            }

            let text = $("<div></div>");
            let title = $("<h3></h3>").text(product.Name);

            let image = $("<img>").attr("src", slike + product.Image);
            image.click({ param1: product.Image }, OtvoriSliku);

            let price = $("<p></p>").text(product.Price + " RSD");
            text.append(title, price);
            text.click({ id: product.ID }, DetaljiProizvoda);

            let action = $("<div></div>");
            action.addClass("product-action");

            let editBtn = $("<button>Izmeni</button>");
            editBtn.addClass("green-btn");
            editBtn.click({ id: product.ID }, IzmenaProizvoda);

            let deleteBtn = $("<button>Obriši</button>");
            deleteBtn.addClass("red-btn");
            deleteBtn.click({ id: product.ID }, ObrisiProizvod);

            action.append(text, editBtn, deleteBtn);

            // Dodaj podatke u tabelu
            productDiv.append(image, action);
            div.append(productDiv);
        });
    }
    else {
        let message = $("<h2></h2>").text("Nisu pronađeni proizvodi!");
        div.append(message);
    }
}

// Redirect na stranicu
function DetaljiProizvoda(event)
{
    window.location.href = klijent + "NaruciProizvod.html?ID=" + event.data.id;
}

// Redirect na stranicu
function IzmenaProizvoda(event) {
    window.location.href = klijent + "NoviProizvod.html?ID=" + event.data.id;
}

// Brisanje proizvoda
function ObrisiProizvod(event)
{
    event.preventDefault();

    // Slanje DELETE zahteva serveru
    $.ajax({
        url: server + "products/delete/" + event.data.id,
        method: "DELETE",
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (res) {
            $("#product-" + event.data.id).remove();
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}

/* RECENZIJE */

// Generiši prikaz recenzija
function GenerisiPrikazRecenzija()
{
    // Dobavi sve recenzije od servera
    $.ajax({
        url: server + "/reviews/all",
        method: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (response) {
            // Ako postoje recenzije
            if (response.length > 0)
            {
                $.each(response, function (index, review)
                {
                    let div = $("<div></div>");
                    div.attr("id", "review-" + review.ID);
                    div.addClass("review");

                    let title = $("<h3></h3>").text(review.Title);
                    let content = $("<p></p>").text(review.Content);

                    let image = $("<img>").attr("src", slike + review.Image);
                    image.click({ param1: review.Image }, OtvoriSliku);

                    let actions = $("<div></div>");

                    // Ako recenzija nije ni odobrena ni odbijena
                    if (!review.isApproved && !review.isDenied)
                    {
                        actions.attr("id", "reviewBtn-" + review.ID);

                        let approveBtn = $("<button>Odobri</button>");
                        approveBtn.addClass("green-btn");
                        approveBtn.click({ id: review.ID }, OdobriRecenziju);

                        let denyBtn = $("<button>Odbij</button>");
                        denyBtn.addClass("red-btn");
                        denyBtn.click({ id: review.ID }, OdbijRecenziju);

                        actions.append(approveBtn, denyBtn);

                        // Dodaj elemente u prikaz
                        div.append(title, content, image, actions);
                        $("#approved").append(div);
                    }
                    // Ako je recenzija odbijena
                    else if (review.isDenied) {
                        let message = $("<h2></h2>");
                        message.text("Odbijena");
                        message.addClass("red-text");
                        actions.append(message);

                        div.append(title, content, image, actions);
                        $("#denied").append(div);
                    }
                });
            }
            else {
                let div = $(".reviews");
                let message = $("<h2></h2>").text("Nisu pronađene recenzije!");
                div.append(message);
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}

// Odobri recenziju
function OdobriRecenziju(event)
{
    event.preventDefault();
    $.ajax({
        url: server + "reviews/approve/" + event.data.id,
        method: "PUT",
        headers: {
            "Authorization": token
        },

        success: function (res) {
            $("#review-" + event.data.id).remove();
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

// Odbij recenziju
function OdbijRecenziju(event)
{
    event.preventDefault();
    $.ajax({
        url: server + "reviews/deny/" + event.data.id,
        method: "PUT",
        headers: {
            "Authorization": token
        },

        success: function (res) {
            let temp = $("#reviewBtn-" + event.data.id).empty();
            let message = $("<h2></h2>");

            message.text("Odbijena");
            message.addClass("red-text");
            temp.append(message);

            let denied = $("#review-" + event.data.id);
            denied.remove();

            $("#denied").append(denied);
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

/* PORUDŽBINE */

// Generisanje prikaza za porudžbine
function GenerisiPrikazPorudzbina()
{
    // Dobavljanje svih porudžbina od servera
    $.ajax({
        url: server + "orders/all/",
        method: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (res) {
            // Ako postoje porudžbine
            if (res.length > 0)
            {
                $.each(res, function (index, order)
                {
                    let table = $(".orders");
                    let tr = $("<tr></tr>");
                    let id = $("<td></td>").text(order.ID);
                    let product = $("<td></td>").text(order.ProductName);
                    let amount = $("<td></td>").text(order.Amount);
                    let date = $("<td></td>").text(new Date(order.OrderDate).toLocaleDateString(dateLocale));
                    let status = $("<td></td>").text(order.StatusMessage);
                    status.attr("id", "order-status-" + order.ID);

                    // Označi završenom
                    let deliverBtn = $('<button></button>');
                    deliverBtn.addClass("green-btn");
                    deliverBtn.attr("id", "order-btn-" + order.ID);

                    // Otkaži
                    let cancelBtn = $('<button></button>');
                    cancelBtn.addClass("red-btn");
                    cancelBtn.attr("id", "order-btn-" + order.ID);

                    let action = $('<td></td>');
                    action.attr("id", "actionBtns-" + order.ID);

                    // Ako je porudžbina trenutno aktivna
                    if (order.StatusMessage == "ACTIVE")
                    {
                        deliverBtn.text("Dostavljena!");
                        deliverBtn.click({ id: order.ID, status: 1 }, PromeniStatusPorudzbine);
                        cancelBtn.text("Otkaži!");
                        cancelBtn.click({ id: order.ID, status: 2 }, PromeniStatusPorudzbine);
                        action.append(deliverBtn, cancelBtn);
                    }

                    // Dodaj podatke u tabelu
                    tr.append(id, product, amount, date, status, action);
                    table.append(tr);
                });
            }
            else {
                let table = $(".orders");
                let tr = $("<tr></tr>");
                let message = $('<td colspan=6></td>').text("Nisu pronađene porudžbine!");
                tr.append(message);
                table.append(tr);
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}

// Promena statusa porudžbina
function PromeniStatusPorudzbine(event)
{
    // Event u sebi ima informacije da li se menja u otkazanu (2) ili gotovu (1)
    let req = {
        orderId: event.data.id,
        status: event.data.status
    }

    // Slanje POST zahteva serveru
    $.ajax({
        url: server + "orders/change-status/",
        method: 'POST',
        contentType: "application/json",
        headers: {
            "Authorization": token
        },
        data: JSON.stringify(req),

        success: function (res) {
            console.log(res);
            $("#order-status-" + event.data.id).text(res);
            $("#actionBtns-" + event.data.id).empty();
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
        }
    });
}
