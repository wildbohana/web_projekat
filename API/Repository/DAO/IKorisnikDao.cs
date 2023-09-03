using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Repository.DAO
{
    public interface IKorisnikDao
    {
        IEnumerable<Korisnik> DobaviSve();
        Korisnik PronadjiPoId(int id);
        Korisnik PronadjiPoKimenu(string username);
        Korisnik DodajKorisnika(Korisnik user);
        Korisnik IzmeniKorisnika(Korisnik updatedUser);
        void UkloniProizvodIzOmiljenih(int productId);
        Korisnik ObrisiKorisnika(int id);
    }
}
