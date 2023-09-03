// Filtrirani proizvodi i svi proizvodi
let filtriraniProizvodi = []
let sviProizvodi = []

// Provera da li je neko ulogovan
$(document).ready(() =>
{
    ProveriLogin().then(() =>
    {
        // ID za korisnika od interesa se dobija iz URL
        let ID = new URL(window.location.href).searchParams.get("ID");
        if (!ID) {
            windows.location.href = klijent + "PocetnaStranica.html";
        }

        // Dobavljanje podataka za datog korisnika
        $.ajax({
            url: server + "users/user/" + ID,
            method: 'GET',
            contentType: "application/json",

            success: function (response) {
                $("#usrname").text(response.Username);
                $("#fname").text(response.FirstName);
                $("#lname").text(response.LastName);
                $("#gender").text(response.Gender === "m" ? "Muški" : "Ženski");
                $("#email").text(response.Email);
                $("#dob").text(new Date(response.DateOfBirth).toLocaleDateString(dateLocale));
                $("#role").text(response.RoleName);
                $("#editBtn").click({ id: response.ID }, IzmmeniProfil);

                // Za kupca se prikazuju omiljeni proizvodi
                // Ali se ne prikazuju dugmad za dodavanje novog i filtriranje proizvoda
                if (response.RoleName == "Buyer") {
                    $("#product-title").text("Omiljeni");
                    GenerisiPrikazPorudzbina(response.ID);
                    GenerisiPrikazRecenzija(response.ID);
                    $("#productAddBtn").remove();
                    $("#filterBtns").remove();
                }
                // Za prodavce se sakrivaju recenzije i porudžbine
                // Admin ne bi trebao da može da pristupi ovoj stranici
                else {
                    $("#reviews").removeClass("items-container");
                    $("#reviews").removeClass("datatable");
                    $("#reviews").addClass("hide");

                    $("#orders").removeClass("items-container");
                    $("#orders").addClass("hide");

                    $("#productAddBtn").click({}, DodajProizvod);
                }

                GenerisiPrikazProizvoda(response.ID);
            },
            error: function (xhr, status, error) {
                console.log(xhr.responseText);
                let result = JSON.parse(xhr.responseText);
                ApiPoruka(result.Message, error);
            }
        })

    });
});

// Izmena profila
function IzmmeniProfil(event) {
    window.location.href = klijent + "IzmenaKorisnika.html?ID=" + trenutniId;
}

/* PROIZVODI */

// Prikaz proizvoda za datog korisnika
function GenerisiPrikazProizvoda(id)
{
    $.ajax({
        url: server + "products/user/" + id,
        method: 'GET',
        headers: {
            "Authorization": token
        },
        contentType: "application/json",

        success: function (res) {
            sviProizvodi = res;
            filtriraniProizvodi = Array.from(sviProizvodi);
            PopuniPrikazProizvoda(filtriraniProizvodi);
        },
        error: function (xhr, status, error) {
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}

// Pomoćna funkcija za generisanje prikaza proizvoda
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

            // Provera da li je proizvod dostupan
            if (!product.isAvailable) {
                productDiv.addClass("unavailable");
            }

            // ID i naziv proizvoda
            productDiv.attr("id", "product-" + product.ID);
            let text = $("<div></div>");
            let title = $("<h3></h3>").text(product.Name);

            // Slika proizvoda
            let image = $("<img>").attr("src", slike + product.Image);
            image.click({ param1: product.Image }, OtvoriSliku);

            // Cena proizvoda
            let price = $("<p></p>").text(product.Price + " RSD");
            text.append(title, price);

            // Akcije nad proizvodom
            let action = $("<div></div>");
            action.addClass("product-action");

            // Klik na tekst preusmerava na pregled detalja o proizvodu
            text.click({ id: product.ID }, DetaljiProizvoda);

            // Prodavac može da menja/briše proizvode
            if (uloga == "Seller") {
                let editBtn = $("<button>Izmeni</button>");
                editBtn.addClass("green-btn");
                editBtn.click({ id: product.ID }, IzmenaProizvoda);

                let deleteBtn = $("<button>Obriši</button>");
                deleteBtn.addClass("red-btn");
                deleteBtn.click({ id: product.ID }, ObrisiProizvod);

                action.append(editBtn, text, deleteBtn);
            }
            else {
                let placeholder = $("<span>&nbsp</span>");
                let placeholder1 = $("<span>&nbsp</span>");
                action.append(text, placeholder, placeholder1);
            }

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
function IzmenaProizvoda(event)
{
    window.location.href = klijent + "NoviProizvod.html?ID=" + event.data.id;
}

// Redirect na stranicu
function DodajProizvod(event)
{
    window.location.href = klijent + "NoviProizvod.html";
}

// Brisanje proizvoda
function ObrisiProizvod(event)
{
    event.preventDefault();

    $.ajax({
        url: server + "products/delete/" + event.data.id,
        method: "DELETE",
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (res) {
            console.log(res);
            $("#product-" + event.data.id).remove();
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

/* PORUDŽBINE */

// Generisanje prikaza za porudžbine za korisnika
function GenerisiPrikazPorudzbina(id)
{
    $.ajax({
        url: server + "orders/for-user/" + id,
        method: 'GET',
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (response) {
            // Ako postoje porudžbine
            if (response.length > 0)
            {
                $.each(response, function (index, order)
                {
                    let table = $(".orders");
                    let tr = $("<tr></tr>");
                    let id = $("<td></td>").text(order.ID);
                    let product = $("<td></td>").text(order.ProductName);
                    let amount = $("<td></td>").text(order.Amount);
                    let date = $("<td></td>").text(new Date(order.OrderDate).toLocaleDateString(dateLocale));
                    let status = $("<td></td>").text(order.StatusMessage);
                    let actionBtn = $('<button></button>');
                    actionBtn.addClass("blue-btn");
                    status.attr("id", "order-status-" + order.ID);
                    actionBtn.attr("id", "order-btn-" + order.ID);

                    // Menjanje statusa porudžbine
                    if (order.StatusMessage == "COMPLETED") {
                        actionBtn.text("Recenzija +");
                        actionBtn.click({ id: order.Product }, OstaviRecenziju);
                    }
                    else if (order.StatusMessage == "ACTIVE") {
                        actionBtn.text("Gotova?");
                        actionBtn.click({ id: order.ID, product: order.Product }, PorudzbinaZavrsena);
                    }

                    let action = $("<td></td>");
                    action.append(actionBtn);

                    // Dodavanje reda u tabelu
                    tr.append(id, product, amount, date, status, action);
                    table.append(tr);
                });
            }
            else {
                let div = $(".orders");
                let message = $('<td colspan=6></td>').text("Nisu pronađene porudžbine!");
                div.append(message);
            }
        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

// Klik na dugme "označi gotovom"
function PorudzbinaZavrsena(event)
{
    $.ajax({
        url: server + "orders/delivered/" + event.data.id,
        method: 'PUT',
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (response) {
            console.log(response);
            $("#order-status-" + event.data.id).text(response);
            let btn = $("#order-btn-" + event.data.id);
            btn.text("Recenzija +");
            btn.click({ id: event.data.product }, OstaviRecenziju);
            btn.off("click", PorudzbinaZavrsena);

        },
        error: function (xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

/* RECENZIJE */

// Generiši pregled za recenzije za korisnika
function GenerisiPrikazRecenzija(id)
{
    $.ajax({
        url: server + "/reviews/for-user/" + id,
        method: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (res) {
            // Ako postoje recenzije
            if (res.length > 0)
            {
                $.each(res, function (index, review)
                {
                    // Naslov
                    let div = $("<div></div>").addClass("review");
                    let title = $("<h3></h3>").text(review.Title);

                    // Slika
                    let image = $("<img>").attr("src", slike + review.Image);
                    image.click({ param1: review.Image }, OtvoriSliku);

                    // Sadržaj
                    let content = $("<p></p>").text(review.Content);
                    let actions = $("<div></div>");

                    div.attr("id", "review-" + review.ID);

                    let editBtn = $("<button>Izmeni</button>");
                    editBtn.addClass("green-btn");
                    editBtn.click({ id: review.ID, product: review.Product }, IzmeniRecenziju);

                    let deleteBtn = $("<button>Obriši</button>");
                    deleteBtn.addClass("red-btn");
                    deleteBtn.click({ id: review.ID }, ObrisiRecenziju);

                    actions.append(editBtn, deleteBtn);

                    // Dodaj podatke u red
                    div.append(title, content, image, actions);

                    // Ako je recenzija odobrena - ostavi je da se prikazuje
                    if (review.isApproved) {

                    }
                    // Ako nije - sakrij je
                    else {
                        div.addClass("unavailable");
                    }

                    // Dodaj red u tabelu
                    $(".reviews").append(div);
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

// Redirect na stranicu
function OstaviRecenziju(event)
{
    window.location.href = klijent + "OstaviRecenziju.html?productId=" + event.data.id;
}

// Redirect na stranicu
function IzmeniRecenziju(event)
{
    window.location.href = klijent + "OstaviRecenziju.html?reviewId=" + event.data.id + "&productId=" + event.data.product;
}

// Brisanje recenzije
function ObrisiRecenziju(event)
{
    event.preventDefault();
    $.ajax({
        url: server + "reviews/delete/" + event.data.id,
        method: "DELETE",
        contentType: "application/json",
        headers: {
            "Authorization": token
        },

        success: function (response) {
            $("#review-" + event.data.id).remove();
        },
        error: function (xhr, statis, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    })
}
