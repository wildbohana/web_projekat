using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Repository.DAO.Impl
{
    public class ProizvodDao : IProizvodDao
    {
        public Proizvod DodajProizvod(Proizvod proizvod)
        {
            proizvod.ID = BazaPodataka.GenerisiID();
            BazaPodataka.ListaProizvoda.Add(proizvod);
            return proizvod;
        }

        public Proizvod ObrisiProizvod(int id)
        {
            Proizvod obrisan = PronadjiPoId(id);
            if (obrisan != default(Proizvod))
            {
                obrisan.isDeleted = true;
            }

            return obrisan;
        }

        // Samo jedan ID - za pregled proizvoda itd.
        public Proizvod PronadjiPoId(int id)
        {
            return BazaPodataka.ListaProizvoda.Find(x => x.ID == id && !x.isDeleted);
        }

        // Lista ID - za kaskadno brisanje isl.
        public IEnumerable<Proizvod> PronadjiPoIdjevima(List<int> ids)
        {
            return BazaPodataka.ListaProizvoda.FindAll(p => ids.Contains(p.ID) && !p.isDeleted);
        }

        public IEnumerable<Proizvod> DobaviSve()
        {
            return BazaPodataka.ListaProizvoda.FindAll(p => !p.isDeleted);
        }

        public Proizvod IzmeniProizvod(Proizvod novi)
        {
            Proizvod stari = PronadjiPoId(novi.ID);
            if (stari != default(Proizvod))
            {
                stari.Name = novi.Name;
                stari.Price = novi.Price;
                stari.Amount = novi.Amount;
                stari.Description = novi.Description;
                stari.Image = novi.Image;
                stari.PublishDate = novi.PublishDate;
                stari.City = novi.City;
            }

            return stari;
        }
    }
}
