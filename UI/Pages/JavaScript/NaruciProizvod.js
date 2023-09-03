// Provera da li je neko prijavljen
$(document).ready(() =>
{
    ProveriLogin().then(() =>
    {
        // Izvlačenje ID proizvoda za naručivanje iz URL
        let ID = new URL(window.location.href).searchParams.get("ID");
        if (!ID) {
            windows.location.href = klijent + "PocetnaStranica.html";
        }

        // Dobavljanje podataka o proizvodu od servera
        $.ajax({
            url: server + "products/find/" + ID,
            type: "GET",
            dataType: "json",

            success: function (product) {
                let title = $("<h1></h1>").text(product.Name);
                title.addClass("grid-title");

                let price = $("<p></p>").text("Cena:\t" + product.Price + " RSD");
                price.addClass("grid-price");

                $("#buy-amount").attr("max", product.Amount);
                $("#product-amount").text("(Dostupno:\t" + product.Amount + " komada)");

                // Ako je kupac - omogući mu kupovinu i dodavanje proizvoda u omiljene
                if (uloga == "Buyer") {
                    $("#btnBuy").click({ id: product.ID }, Porucivanje);
                    $("#btnFav").click({ id: product.ID }, DodajOmiljeno);
                    $("#btnFav").removeClass("hide");
                    if (omiljeniProizvodi.includes(product.ID)) {
                        $("#btnFav").addClass("favourite");
                    }
                }
                // Ako ne postoji trenutan kupac -> pošalji ga na stranicu za prijavu
                else if (!uloga) {
                    $("#btnBuy").click(PrijavaKorisnika);
                    $("#btnFav").removeClass("hide");
                }
                // Ostalima - onemogući kupovinu i dodavanje u omiljene
                else {
                    $("#btnBuy").remove();
                    $("#btnFav").remove();
                    $("#buy-amount").remove();
                    $("#amount-label").remove();
                }

                let img = $("<img>").attr("src", slike + product.Image);
                img.click({ param1: product.Image }, OtvoriSliku);
                img.addClass("grid-img");

                let desc = $("<p></p>").text('Opis:\n ' + product.Description);
                desc.addClass("grid-desc");

                let date = $("<p></p>").text("Datum postavljanja: " + new Date(product.PublishDate).toLocaleDateString(dateLocale));
                date.addClass("grid-date");

                let city = $("<p></p>").text("Grad: " + product.City);
                city.addClass("grid-city");

                // Dodaj prikaz na HTML
                $("#product-display").append(title, img, desc, date, city, price);
            },
            error: function (xhr, status, error) {
                let result = JSON.parse(xhr.responseText);
                ApiPoruka(result.Message, error);
                history.back();
            }
        });

        // Dobavljanje recenzija za proizvod
        $.ajax({
            url: server + "reviews/for-product/" + ID,
            type: "GET",
            dataType: "json",
            contentType: "application/json",

            success: function (response) {
                // Ako postoje recenzije
                if (response.length > 0)
                {
                    $.each(response, function (index, review)
                    {
                        let div = $("<div></div>").addClass("review");
                        let title = $("<h3></h3>").text(review.Title);

                        let image = $("<img>").attr("src", slike + review.Image);
                        image.click({ param1: review.Image }, OtvoriSliku);

                        let content = $("<p></p>").text(review.Content);

                        // Dodaj red u tabelu
                        div.append(title, content, image);
                        $(".reviews-container").append(div);
                    });
                }
                else {
                    let message = $("<h2>Nisu pronađene recenzije za proizvod.</h2>");
                    $(".reviews-container").append(message);
                }
            },
            error: function (xhr, status, error) {
                let result = JSON.parse(xhr.responseText);
                ApiPoruka(result.Message, error);
            }
        });
    });
});

// Redirect na stranicu za prijavu (neprijavljeni korisnici ne mogu da kupuju proizvod)
function PrijavaKorisnika()
{
    window.location.href = klijent + "Prijava.html";
}

// Klik na dugme poruči
function Porucivanje(event)
{
    let proizvod = event.data.id;
    let kupac = trenutniId;

    let kolicina = $("#buy-amount").val();
    if (kolicina <= 0) {
        ApiPoruka("Količina mora biti veća od nule!", "Greška!");
        return;
    }

    let porudzbin = {
        Product: proizvod,
        Amount: kolicina,
        Buyer: kupac
    };

    // Slanje POST zahteva serveru
    $.ajax({
        url: server + "orders/add",
        method: 'POST',
        contentType: "application/json",
        headers: {
            "Authorization": token
        },
        data: JSON.stringify(porudzbin),

        success: function (res) {
            window.location.href = klijent + "PregledProfila.html?ID=" + trenutniId;
        },
        error(xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}

// Dodavanje proizvoda u omiljene
function DodajOmiljeno(event)
{
    let proizvod = event.data.id;
    let korisnik = trenutniId;

    let zahtev = {
        UserId: korisnik,
        ProductId: proizvod
    };

    // Slanje PUT zahteva serveru
    $.ajax({
        url: server + "products/add-to-favourites/",
        method: 'PUT',
        contentType: "application/json",
        headers: {
            "Authorization": token
        },
        data: JSON.stringify(zahtev),

        success: function (response)
        {
            omiljeniProizvodi = Array.from(response);

            if (omiljeniProizvodi.includes(proizvod)) {
                window.location.href = klijent + "PregledProfila.html?ID=" + trenutniId;
            }
            else {
                $("#btnFav").removeClass("favourite");
            }
        },
        error(xhr, status, error) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            ApiPoruka(result.Message, error);
        }
    });
}
