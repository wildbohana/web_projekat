using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Repository.DAO.Impl
{
    public class KorisnikDao : IKorisnikDao
    {
        // Ako već postoji to korisničko ime, ali je obrisano,
        // može se dodati korisnik sa tim imenom (pravi se novi ID)
        public Korisnik DodajKorisnika(Korisnik korisnik)
        {
            if (BazaPodataka.ListaKorisnika.Find(x => x.Username == korisnik.Username && !x.isDeleted) == default(Korisnik))
            {
                korisnik.ID = BazaPodataka.GenerisiID();
                BazaPodataka.ListaKorisnika.Add(korisnik);
                return korisnik;
            }
            return default(Korisnik);
        }

        public Korisnik ObrisiKorisnika(int id)
        {
            Korisnik obrisan = PronadjiPoId(id);
            if (obrisan != default(Korisnik))
            {
                obrisan.isDeleted = true;
                return obrisan;
            }

            return obrisan;
        }

        public Korisnik PronadjiPoId(int id)
        {
            return BazaPodataka.ListaKorisnika.Find(x => x.ID == id && !x.isDeleted);
        }

        public Korisnik PronadjiPoKimenu(string kime)
        {
            return BazaPodataka.ListaKorisnika.Find(x => x.Username == kime && !x.isDeleted);
        }

        public IEnumerable<Korisnik> DobaviSve()
        {
            return BazaPodataka.ListaKorisnika.FindAll(x => !x.isDeleted);
        }

        // Kaskadno brisanje svih pojava proizvoda sa datim ID (kada se briše proizvod)
        public void UkloniProizvodIzOmiljenih(int idProizvoda)
        {
            foreach (var x in BazaPodataka.ListaKorisnika)
            {
                x.Favourites.Remove(idProizvoda);
            }
        }

        // ID se ne menja (logično)
        public Korisnik IzmeniKorisnika(Korisnik novi)
        {
            // Preko "novog" korisnika se pronađe ID starog
            // Izmene se vrše na starom (preuzimaju se vrednosti od novog)
            Korisnik stari = PronadjiPoId(novi.ID);
            if (stari != default(Korisnik))
            {
                stari.FirstName = novi.FirstName;
                stari.LastName = novi.LastName;
                stari.Gender = novi.Gender;
                stari.Email = novi.Email;
                stari.DateOfBirth = novi.DateOfBirth;
            }

            return stari;
        }
    }
}
