using API.Models;
using API.Repository.DAO;
using API.Repository.DAO.Impl;
using System.Collections.Generic;
using System.Linq;

namespace API.Repository.Impl
{
    public class KorisnikRepozitorijum : IKorisnikRepozitorijum
    {
        #region Data Access Objects
        IKorisnikDao userDao = new KorisnikDao();
        IPorudzbinaDao orderDao = new PorudzbinaDao();
        IRecenzijaDao reviewDao = new RecenzijaDao();
        IProizvodDao productDao = new ProizvodDao();
        #endregion

        public Korisnik DodajKorisnika(Korisnik k)
        {
            return userDao.DodajKorisnika(k);
        }

        public string PromeniKorisnickoIme(int idKorisnika, string novoKime)
        {
            Korisnik korisnik = userDao.PronadjiPoId(idKorisnika);
            if (korisnik == default(Korisnik))
            {
                return "Korisnik nije pronađen!";
            }

            if (DobaviSve().FirstOrDefault(x => x.Username == novoKime && !x.isDeleted) != default(Korisnik))
            {
                return "Korisničko ime je već zauzeto!";
            }

            korisnik.Username = novoKime;
            return string.Empty;
        }

        public Korisnik ObrisiKorisnika(int id)
        {
            Korisnik korisnik = userDao.PronadjiPoId(id);
            if (korisnik != default(Korisnik))
            {
                // Ako je kupac
                if (korisnik.Role == TipKorisnika.Buyer)
                {
                    // Sve aktivne porudžbine se otkazuju
                    IEnumerable<Porudzbina> brisanje = orderDao.PronadjiPoKorisniku(id);
                    foreach (Porudzbina por in brisanje)
                    {
                        if (por.Status != StatusPorudzbine.ACTIVE)
                        {
                            continue;
                        }

                        Proizvod pro = productDao.PronadjiPoId(por.Product);
                        if (pro == default(Proizvod))
                        {
                            continue;
                        }
                        
                        pro.Amount += por.Amount;
                        orderDao.ObrisiPorudzbinu(por.ID);
                    }
                }
                // Ako je prodavac
                else if (korisnik.Role == TipKorisnika.Seller)
                {
                    // Svi objavljeni proizvodi se brišu (kaskadno)
                    IEnumerable<Proizvod> brisanje = productDao.PronadjiPoIdjevima(korisnik.PublishedProducts);
                    foreach (Proizvod pro in brisanje)
                    {
                        reviewDao.ObrisiPoIdjevima(pro.Reviews);
                        productDao.ObrisiProizvod(pro.ID);
                    }
                }
            }

            // Recenzije ostaju
            return userDao.ObrisiKorisnika(id);
        }

        public Korisnik PronadjiPoId(int id)
        {
            return userDao.PronadjiPoId(id);
        }

        public Korisnik PronadjiPoKimenu(string kime)
        {
            return userDao.PronadjiPoKimenu(kime);
        }

        public IEnumerable<Korisnik> DobaviSve()
        {
            return userDao.DobaviSve();
        }

        public Korisnik IzmeniKorisnika(Korisnik novi)
        {
            Korisnik stari = userDao.IzmeniKorisnika(novi);
            return stari;
        }
    }
}
