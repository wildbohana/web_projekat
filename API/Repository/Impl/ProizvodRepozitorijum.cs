using API.Models;
using API.Repository.DAO.Impl;
using API.Repository.DAO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Repository.Impl
{
    public class ProizvodRepozitorijum : IProizvodRepozitorijum
    {
        #region Data Access Objects
        IProizvodDao proizvodDao = new ProizvodDao();
        IKorisnikDao korisnikDao = new KorisnikDao();
        IRecenzijaDao recenzijaDao = new RecenzijaDao();
        #endregion

        public Proizvod DodajProizvod(Proizvod proizvod, out string poruka)
        {
            poruka = string.Empty;

            Korisnik prodavac = korisnikDao.PronadjiPoId(proizvod.SellerId);
            if (prodavac == default(Korisnik))
            {
                poruka = "Prodavac nije pronađen.";
                return proizvod;
            }

            // Dodavanje preostalih polja za proizvod - datum, ID, ...
            proizvod.PublishDate = DateTime.UtcNow;
            Proizvod novi = proizvodDao.DodajProizvod(proizvod);
            prodavac.PublishedProducts.Add(proizvod.ID);

            return novi;
        }

        public IEnumerable<int> DodajProizvodUOmiljene(int idKorisnika, int idProizvoda, out string poruka)
        {
            poruka = string.Empty;

            Korisnik korisnik = korisnikDao.PronadjiPoId(idKorisnika);
            if (korisnik == default(Korisnik))
            {
                poruka = "Korisnik nije pronađen!";
                return Enumerable.Empty<int>();
            }

            Proizvod proizvod = proizvodDao.PronadjiPoId(idProizvoda);
            if (proizvod == default(Proizvod))
            {
                poruka = "Proizvod nije pronađen";
                return Enumerable.Empty<int>();
            }
            
            // Ako je proizvod već u omiljenim - ukloni ga
            // Ako nije, dodaj ga u omiljene
            if (korisnik.Favourites.Contains(idProizvoda))
            {
                korisnik.Favourites.Remove(idProizvoda);
            }
            else
            {
                korisnik.Favourites.Add(idProizvoda);
            }
            return korisnik.Favourites;
        }

        public Proizvod ObrisiProizvod(int id)
        {
            Proizvod proizvod = proizvodDao.PronadjiPoId(id);
            if (proizvod == default(Proizvod))
            {
                return proizvod;
            }

            // Ukloni proizvod iz liste prodavanih od njegovog prodavca
            Korisnik prodavac = korisnikDao.PronadjiPoId(proizvod.SellerId);
            prodavac.PublishedProducts.Remove(id);

            // Ukloni ga iz liste omiljenih kod svih kupaca, i obriši sve recenzije
            korisnikDao.UkloniProizvodIzOmiljenih(id);
            recenzijaDao.ObrisiPoIdjevima(proizvod.Reviews);

            return proizvodDao.ObrisiProizvod(id);
        }

        public Proizvod PronadjiPoId(int id)
        {
            return proizvodDao.PronadjiPoId(id);
        }

        public IEnumerable<Proizvod> DobaviSve()
        {
            return proizvodDao.DobaviSve();
        }

        // Svi proizvodi koji su asocirani sa kupcem
        // Za kupca - omiljeni
        // Za prodavca - prodavani
        public IEnumerable<Proizvod> PronadjiZaKorisnika(int idKorisnika, out string poruka)
        {
            poruka = string.Empty;

            Korisnik korisnik = korisnikDao.PronadjiPoId(idKorisnika);
            if (korisnik == default(Korisnik))
            {
                poruka = "Korisnik nije pronađen!";
                return Enumerable.Empty<Proizvod>();
            }
            
            if (korisnik.Role == TipKorisnika.Buyer)
            {
                return proizvodDao.PronadjiPoIdjevima(korisnik.Favourites);
            }
            else if (korisnik.Role == TipKorisnika.Seller)
            {
                return proizvodDao.PronadjiPoIdjevima(korisnik.PublishedProducts);
            }
            
            return Enumerable.Empty<Proizvod>();
        }

        public Proizvod IzmeniProizvod(Proizvod izmenjeni, out string poruka)
        {
            poruka = string.Empty;

            if (proizvodDao.PronadjiPoId(izmenjeni.ID) == default(Proizvod))
            {
                poruka = "Proizvod nije pronađen!";
                return default(Proizvod);
            }

            Korisnik prodavac = korisnikDao.PronadjiPoId(izmenjeni.SellerId);
            if (prodavac == default(Korisnik))
            {
                poruka = "Prodavac nije pronađen";
                return izmenjeni;
            }

            if (izmenjeni.Price <= 0)
            {
                poruka = "Cena mora biti veća od nule!";
                return default(Proizvod);
            }
            
            if (izmenjeni.Amount < 0)
            {
                poruka = "Količina ne sme biti negativna";
                return default(Proizvod);
            }

            // Datum objavljivanja (ažuriranja) se postavlja na DateTime.Now
            izmenjeni.PublishDate = DateTime.UtcNow;
            Proizvod postojeci = proizvodDao.IzmeniProizvod(izmenjeni);

            return postojeci;
        }
    }
}
