/* FILTRIRANJE PROIZVODA */

// Kada se promeni checkbox za "Dostupne", filtriraju se samo dostupni proizvodi
$("#filterCheck").on("change", function ()
{
    if ($(this).is(':checked')) {
        FiltrirajDostupne(true);
    } else {
        FiltrirajDostupne(false);
    }
});

// Proizvodi - filtriraj dostupne
function FiltrirajDostupne(da) {
    filtriraniProizvodi = sviProizvodi.filter(x => x.isAvailable == da);
    PopuniPrikazProizvoda(filtriraniProizvodi);
}

/* SORTIRANJE PROIZVODA */

// Proizvodi - sortiranje po nazivu
function SortiranjeNaziv(desc)
{
    filtriraniProizvodi.sort((a, b) =>
    {
        const nazivA = a.Name.toUpperCase();
        const nazivB = b.Name.toUpperCase();

        if (desc) {
            if (nazivA < nazivB) return 1;
            if (nazivA > nazivB) return -1;
            return 0;
        } else {
            if (nazivA < nazivB) return -1;
            if (nazivA > nazivB) return 1;
            return 0;
        }
    });

    PopuniPrikazProizvoda(filtriraniProizvodi);
}

// Proizvodi - sortiranje po cenama
function SortiranjeCena(desc)
{
    filtriraniProizvodi.sort((a, b) =>
    {
        const cenaA = a.Price;
        const cenaB = b.Price;

        if (desc) {
            return cenaB - cenaA;
        } else {
            return cenaA - cenaB;
        }
    });

    PopuniPrikazProizvoda(filtriraniProizvodi);
}

// Proizvodi - sortiraj po datumu objavljivanja
function SortiranjeDatum(desc)
{
    filtriraniProizvodi.sort((a, b) =>
    {
        const datumA = new Date(a.PublishDate).getTime();
        const datumB = new Date(b.PublishDate).getTime();

        if (desc) {
            return datumB - datumA;
        } else {
            return datumA - datumB;
        }
    });

    PopuniPrikazProizvoda(filtriraniProizvodi);
}

/* SORTIRANJE KORISNIKA */

// Korisnici - sortiranje po imenu + prezimenu
function SortiranjeIme(desc)
{
    filtriraniKorisnici.sort((a, b) =>
    {
        const imeA = a.FullName.toUpperCase();
        const imeB = b.FullName.toUpperCase();

        if (desc) {
            if (imeA < imeB) return 1;
            if (imeA > imeB) return -1;
            return 0;
        } else {
            if (imeA < imeB) return -1;
            if (imeA > imeB) return 1;
            return 0;
        }
    });

    PopuniTabeluKorisnika(filtriraniKorisnici);
}

// Korisnici - sortiraj po ulogama
function SortiranjeUloga(desc)
{
    filtriraniKorisnici.sort((a, b) =>
    {
        const ulogaA = a.Role;
        const ulogaB = b.Role;

        if (desc) {
            return ulogaB - ulogaA;
        } else {
            return ulogaA - ulogaB;
        }
    });

    PopuniTabeluKorisnika(filtriraniKorisnici);
}

// Korisnici - sortiraj po datumu rođenja
function SortiranjeDatumRodjenja(desc)
{
    filtriraniKorisnici.sort((a, b) =>
    {
        const datumA = new Date(a.DateOfBirth);
        const datumB = new Date(b.DateOfBirth);

        if (desc) {
            return datumB - datumA;
        } else {
            return datumA - datumB;
        }
    });

    PopuniTabeluKorisnika(filtriraniKorisnici);
}
