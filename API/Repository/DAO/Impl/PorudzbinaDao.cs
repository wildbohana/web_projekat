using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Repository.DAO.Impl
{
    public class PorudzbinaDao : IPorudzbinaDao
    {
        public Porudzbina DodajPorudzbinu(Porudzbina porudzbina)
        {
            porudzbina.ID = BazaPodataka.GenerisiID();
            BazaPodataka.ListaPorudzbina.Add(porudzbina);
            return porudzbina;
        }

        public Porudzbina ObrisiPorudzbinu(int id)
        {
            Porudzbina obrisana = PronadjiPoId(id);
            if (obrisana != default(Porudzbina))
            {
                obrisana.isDeleted = true;
            }

            return obrisana;
        }

        public Porudzbina PronadjiPoId(int id)
        {
            return BazaPodataka.ListaPorudzbina.Find(x => x.ID == id && !x.isDeleted);
        }

        public IEnumerable<Porudzbina> PronadjiPoKorisniku(int id)
        {
            return BazaPodataka.ListaPorudzbina.FindAll(x => x.Buyer == id && !x.isDeleted);
        }

        public IEnumerable<Porudzbina> DobaviSve()
        {
            return BazaPodataka.ListaPorudzbina.FindAll(x => !x.isDeleted);
        }

        public Porudzbina IzmeniPorudzbinu(Porudzbina nova)
        {
            Porudzbina stara = PronadjiPoId(nova.ID);
            if (stara != default(Porudzbina))
            {
                stara.Product = nova.Product;
                stara.Amount = nova.Amount;
                stara.Buyer = nova.Buyer;
                stara.OrderDate = nova.OrderDate;
            }

            return stara;
        }
    }
}
