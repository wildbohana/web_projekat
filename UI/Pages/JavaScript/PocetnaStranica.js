// Liste proizvoda (svi, filtrirani)
let sviProizvodi = [];
let filtriraniProizvodi = [];

// Provera da li je neko ulogovan
$(document).ready(() =>
{
    ProveriLogin().then(() =>
    {
        $('#searchBtn').click(Pretraga);

        // Slanje GET zahteva serveru - za sve proizvode
        $.ajax({
            url: server + "products/all",
            type: "GET",
            dataType: "json",
            contentType: "application/json",

            success: function (response) {
                sviProizvodi = response;
                filtriraniProizvodi = Array.from(sviProizvodi);

                PopuniPrikazProizvoda(sviProizvodi);
            },
            error: function (xhr, status, error) {
                let result = JSON.parse(xhr.responseText);
                ApiPoruka(result.Message, error);
            }
        });
    });
});

// Popunjavanje prikaza za proizvode
function PopuniPrikazProizvoda(items)
{
    // Ako nema proizvoda
    if (items.length == 0) {
        let div = $(".items-container");
        div.empty();

        let message = $("<h2></h2>").text("Nisu pronađeni proizvodi.");
        div.append(message);

        return;
    }

    let max_price = 0;
    let div = $(".items-container");
    div.empty();

    // Generisanje reda za svaki proizvod
    // Usput se traži najveća cena proizvoda
    $.each(items, function (index, product)
    {
        // Provera da li je proizvod dostupan
        if (product.isAvailable)
        {
            if (product.Price > max_price) {
                max_price = product.Price;
            }

            // Klik na proizvod vodi do stranice za naručivanje
            let a = $("<a></a>").addClass("product");
            a.attr('href', "NaruciProizvod.html?ID=" + product.ID);

            // Naslov, slika, cena
            let title = $("<h3></h3>").text(product.Name);
            let image = $("<img>").attr("src", slike + product.Image);
            let price = $("<p></p>").text(product.Price + " RSD");

            // Dodavanje reda u tabelu
            a.append(image, title, price);
            div.append(a);
        }
    });

    // Postavljanje najveće cene na HTML
    $("#max").val(max_price);
    $("#max").attr("max", max_price);
}

// Klik na dugme za pretragu
function Pretraga()
{
    if (sviProizvodi)
    {
        let result = sviProizvodi;

        // Pretraga po nazivu
        let name = new RegExp($("#name").val().trim().toLowerCase());
        if (name) {
            result = result.filter(p => p.Name.toLowerCase().match(name));
        }

        // Pretraga po gradu
        let city = new RegExp($("#city").val().trim().toLowerCase());
        if (city) {
            result = result.filter(p => p.City.toLowerCase().match(city));
        }

        // Pretraga po ceni
        let min = $('#min').val();
        let max = $('#max').val();
        if (min && max) {
            result = result.filter(p => p.Price >= min && p.Price <= max);
        }

        // Prikaz rezultata
        filtriraniProizvodi = result;
        PopuniPrikazProizvoda(result);
    }
}
