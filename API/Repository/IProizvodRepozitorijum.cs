using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Repository
{
    public interface IProizvodRepozitorijum
    {
        IEnumerable<Proizvod> DobaviSve();
        Proizvod PronadjiPoId(int id);
        IEnumerable<Proizvod> PronadjiZaKorisnika(int idKorisnika, out string poruka);
        Proizvod DodajProizvod(Proizvod product, out string poruka);
        IEnumerable<int> DodajProizvodUOmiljene(int idKorisnika, int idProizvoda, out string poruka);
        Proizvod IzmeniProizvod(Proizvod novi, out string poruka);
        Proizvod ObrisiProizvod(int id);
    }
}
