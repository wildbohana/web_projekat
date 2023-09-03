using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Repository
{
    public interface IKorisnikRepozitorijum
    {
        IEnumerable<Korisnik> DobaviSve();
        Korisnik PronadjiPoId(int id);
        Korisnik PronadjiPoKimenu(string kime);
        Korisnik DodajKorisnika(Korisnik k);
        Korisnik IzmeniKorisnika(Korisnik novi);
        Korisnik ObrisiKorisnika(int id);
        string PromeniKorisnickoIme(int id, string novoKime);
    }
}
