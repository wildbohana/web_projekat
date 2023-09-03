using API.Models;
using API.Repository.DAO.Impl;
using API.Repository.DAO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Repository.Impl
{
    public class RecenzijaRepozitorijum : IRecenzijaRepozitorijum
    {
        #region DataAccessObjects
        IRecenzijaDao reviewDao = new RecenzijaDao();
        IProizvodDao productDao = new ProizvodDao();
        IKorisnikDao userDao = new KorisnikDao();
        #endregion

        public Recenzija DodajRecenziju(Recenzija recenzija, out string poruka)
        {
            poruka = string.Empty;
           
            Korisnik recezent = userDao.PronadjiPoId(recenzija.Reviewer);
            if (recezent == default(Korisnik))
            {
                poruka = "Recezent nije pronađen";
                return default(Recenzija);
            }
            
            Proizvod proizvod = productDao.PronadjiPoId(recenzija.Product);
            if (proizvod == default(Proizvod))
            {
                poruka = "Proizvod nije pronađen";
                return default(Recenzija);
            }

            Recenzija nova = reviewDao.DodajRecenziju(recenzija);
            proizvod.Reviews.Add(nova.ID);
            
            return nova;
        }

        public string OdobriRecenziju(int id)
        {
            Recenzija recenzija = reviewDao.PronadjiPoId(id);
            if (recenzija == default(Recenzija))
            {
                return string.Empty;
            }

            recenzija.isApproved = true;
            return "Odobreno";
        }

        public string OdbijRecenziju(int id)
        {
            Recenzija recenzija = reviewDao.PronadjiPoId(id);
            if (recenzija == default(Recenzija))
            {
                return string.Empty;
            }

            recenzija.isDenied = true;
            return "Odbijeno";
        }

        public Recenzija ObrisiRecenziju(int id)
        {
            Recenzija r = reviewDao.ObrisiRecenziju(id);
            return r;
        }

        public Recenzija PronadjiPoId(int id)
        {
            return reviewDao.PronadjiPoId(id);
        }

        // Sve recenzije za dati proizvod
        // Koristi se za pregled recenzija
        public IEnumerable<Recenzija> PronadjiZaProizvod(int idProizvoda, out string poruka)
        {
            poruka = string.Empty;

            Proizvod proizvod = productDao.PronadjiPoId(idProizvoda);
            if (proizvod == default(Proizvod))
            {
                poruka = "Proizvod nije pronađen!";
                return Enumerable.Empty<Recenzija>();
            }
            
            IEnumerable<Recenzija> rez = reviewDao.PronadjiPoIdjevima(proizvod.Reviews);
            return rez;
        }

        // Sve recenzije koje je neki korisnik ostavio (za različite proizvode)
        public IEnumerable<Recenzija> PronadjiZaRecezenta(int idKorisnika, out string poruka)
        {
            poruka = string.Empty;

            Korisnik korisnik = userDao.PronadjiPoId(idKorisnika);
            if (korisnik == default(Korisnik))
            {
                poruka = "Korisnik nije pronađen!";
                return Enumerable.Empty<Recenzija>();
            }

            IEnumerable<Recenzija> rez = reviewDao.PronadjiPoRecezentu(idKorisnika);
            return rez;
        }

        public IEnumerable<Recenzija> DobaviSve()
        {
            return reviewDao.DobaviSve();
        }

        public Recenzija IzmeniRecenziju(Recenzija nova, out string poruka)
        {
            poruka = string.Empty;

            if (PronadjiPoId(nova.ID) == default(Recenzija))
            {
                poruka = "Recenzija nije pronađena!";
                return default(Recenzija);
            }

            Korisnik recezent = userDao.PronadjiPoId(nova.Reviewer);
            if (recezent == default(Korisnik))
            {
                poruka = "Recezent nije pronađen";
                return default(Recenzija);
            }

            Proizvod proizvod = productDao.PronadjiPoId(nova.Product);
            if (proizvod == default(Proizvod))
            {
                poruka = "Proizvod nije pronađen";
                return default(Recenzija);
            }

            Recenzija azurirana = reviewDao.IzmeniRecenziju(nova);
            return azurirana;
        }
    }
}
