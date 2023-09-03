using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Repository.DAO.Impl
{
    public class RecenzijaDao : IRecenzijaDao
    {
        public Recenzija DodajRecenziju(Recenzija recenzija)
        {
            recenzija.ID = BazaPodataka.GenerisiID();
            BazaPodataka.ListaRecenzija.Add(recenzija);
            return recenzija;
        }

        // Brisanje svih čiji ID se nalaze u listi za brisanje
        // (koristi se kod brisanja korisnika i proizvoda)
        public void ObrisiPoIdjevima(List<int> ids)
        {
            IEnumerable<Recenzija> brisanje = BazaPodataka.ListaRecenzija.FindAll(x => ids.Contains(x.ID) && !x.isDeleted);
            foreach (Recenzija rec in brisanje)
            {
                rec.isDeleted = true;
            }
        }

        public Recenzija ObrisiRecenziju(int id)
        {
            Recenzija obrisana = PronadjiPoId(id);
            if (obrisana != default(Recenzija))
            {
                obrisana.isDeleted = true;
            }

            return obrisana;
        }

        public Recenzija PronadjiPoId(int id)
        {
            return BazaPodataka.ListaRecenzija.Find(x => x.ID == id && !x.isDeleted);
        }

        // Recenzije čiji ID se nalazi u listi
        public IEnumerable<Recenzija> PronadjiPoIdjevima(List<int> ids)
        {
            return BazaPodataka.ListaRecenzija.FindAll(x => ids.Contains(x.ID) && x.isApproved && !x.isDeleted);
        }

        // Sve recenzije koje je korisnik sa traženim ID napravio
        public IEnumerable<Recenzija> PronadjiPoRecezentu(int idKorisnika)
        {
            return BazaPodataka.ListaRecenzija.FindAll(x => x.Reviewer == idKorisnika && !x.isDeleted && !x.isDenied);
        }

        public IEnumerable<Recenzija> DobaviSve()
        {
            return BazaPodataka.ListaRecenzija.FindAll(x => !x.isDeleted && !x.isApproved);
        }

        // Preko nove recenzije se pronađe stara, i na njoj se vrše izmene
        public Recenzija IzmeniRecenziju(Recenzija nova)
        {
            Recenzija stara = PronadjiPoId(nova.ID);
            if (stara != default(Recenzija))
            {
                stara.Product = nova.Product;
                stara.Reviewer = nova.Reviewer;
                stara.Title = nova.Title;
                stara.Content = nova.Content;
                stara.Image = nova.Image;
                stara.isApproved = false;
            }

            return stara;
        }
    }
}
