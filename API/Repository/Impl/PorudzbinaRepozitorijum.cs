using API.Models;
using API.Repository.DAO.Impl;
using API.Repository.DAO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Repository.Impl
{
    public class PorudzbinaRepozitorijum : IPorudzbinaRepozitorijum
    {
        #region Data Access Objects
        IPorudzbinaDao porudzbinaDao = new PorudzbinaDao();
        IKorisnikDao korisnikDao = new KorisnikDao();
        IProizvodDao proizvodDao = new ProizvodDao();
        #endregion

        public Porudzbina DodajPorudzbinu(Porudzbina porudzbina, out string poruka)
        {
            poruka = string.Empty;

            Proizvod proizvod = proizvodDao.PronadjiPoId(porudzbina.Product);
            if (proizvod == default(Proizvod))
            {
                poruka = "Proizvod ne postoji!";
                return default(Porudzbina);
            }
            
            Korisnik buyer = korisnikDao.PronadjiPoId(porudzbina.Buyer);
            if (buyer == default(Korisnik))
            {
                poruka = "Kupac ne postoji!";
                return default(Porudzbina);
            }

            if (proizvod.Amount - porudzbina.Amount < 0)
            {
                poruka = "Nema dovoljno proizvoda na zalihama";
                return default(Porudzbina);
            }

            // Oduzimanje kupljene količine proizvoda, postavljanje statusa poružbine u aktivnu...
            proizvod.Amount -= porudzbina.Amount;
            porudzbina.Status = StatusPorudzbine.ACTIVE;
            porudzbina.OrderDate = DateTime.UtcNow;
            porudzbina.ProductName = proizvod.Name;

            return porudzbinaDao.DodajPorudzbinu(porudzbina);
        }

        // Kada brišemo porudžbinu, moramo da vratimo poručenu količinu proizvoda
        public Porudzbina ObrisiPorudzbinu(int id)
        {
            Porudzbina order = porudzbinaDao.PronadjiPoId(id);
            if (order == default(Porudzbina))
            {
                return order;
            }

            Proizvod product = proizvodDao.PronadjiPoId(id);
            product.Amount += order.Amount;
            
            return porudzbinaDao.ObrisiPorudzbinu(id);
        }

        // Po ID-ju porudžbine
        public Porudzbina PronadjiPoId(int id)
        {
            return porudzbinaDao.PronadjiPoId(id);
        }

        // Sve porudžbine za datog korisnika
        public IEnumerable<Porudzbina> PronadjiPoKorisniku(int id)
        {
            Korisnik k = korisnikDao.PronadjiPoId(id);
            if (k == default(Korisnik))
            {
                return Enumerable.Empty<Porudzbina>();
            }

            return porudzbinaDao.PronadjiPoKorisniku(id);
        }

        public IEnumerable<Porudzbina> DobaviSve()
        {
            return porudzbinaDao.DobaviSve();
        }

        public Porudzbina IzmeniPorudzbinu(Porudzbina nova, out string poruka)
        {
            poruka = string.Empty;

            Porudzbina stara = porudzbinaDao.PronadjiPoId(nova.ID);
            if (stara == default(Porudzbina))
            {
                poruka = "Porudžbina ne postoji!";
                return stara;
            }

            Proizvod proizvod = proizvodDao.PronadjiPoId(nova.Product);
            if (proizvod == default(Proizvod))
            {
                poruka = "Proizvod ne postoji!";
                return default(Porudzbina);
            }

            Korisnik kupac = korisnikDao.PronadjiPoId(nova.Buyer);
            if (kupac == default(Korisnik))
            {
                poruka = "Kupac ne postoji!";
                return default(Porudzbina);
            }

            // Prvo vraćamo staru količinu proizvoda
            // pa onda oduzimamo novu (čak i kada nije promenjena količina)
            proizvod.Amount += stara.Amount;
            if (proizvod.Amount - nova.Amount < 0)
            {
                poruka = "Nema dovoljno proizvoda na zalihama";
                return default(Porudzbina);
            }

            proizvod.Amount -= nova.Amount;
            nova.Status = StatusPorudzbine.ACTIVE;
            nova.OrderDate = DateTime.UtcNow;
            
            return porudzbinaDao.IzmeniPorudzbinu(nova);
        }

        // Promena statusa porudžbine (iz aktivne u gotova ili otkazana)
        public string IzmeniStatusPorudzbine(int id, StatusPorudzbine status)
        {
            Porudzbina p = porudzbinaDao.PronadjiPoId(id);
            if (p == default(Porudzbina))
            {
                return string.Empty;
            }

            // Ako je aktivna pošiljka otkazana, vrati poručenu količinu proizvoda
            if (status == StatusPorudzbine.CANCELED && p.Status == StatusPorudzbine.ACTIVE)
            {
                Proizvod product = proizvodDao.PronadjiPoId(p.Product);
                if (product != default(Proizvod))
                {
                    product.Amount += p.Amount;
                }
            }

            p.Status = status;
            return status.ToString();
        }
    }
}
