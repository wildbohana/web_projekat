using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Repository
{
    public interface IRecenzijaRepozitorijum
    {
        IEnumerable<Recenzija> DobaviSve();
        Recenzija PronadjiPoId(int id);
        Recenzija DodajRecenziju(Recenzija r, out string poruka);
        Recenzija IzmeniRecenziju(Recenzija nova, out string poruka);
        Recenzija ObrisiRecenziju(int id);
        IEnumerable<Recenzija> PronadjiZaProizvod(int idProizvoda, out string poruka);
        IEnumerable<Recenzija> PronadjiZaRecezenta(int idKorisnika, out string poruka);
        string OdobriRecenziju(int id);
        string OdbijRecenziju(int id);
    }
}
