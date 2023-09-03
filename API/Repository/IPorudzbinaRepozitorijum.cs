using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Repository
{
    public interface IPorudzbinaRepozitorijum
    {
        IEnumerable<Porudzbina> DobaviSve();
        Porudzbina PronadjiPoId(int id);
        IEnumerable<Porudzbina> PronadjiPoKorisniku(int idKorisnika);
        Porudzbina DodajPorudzbinu(Porudzbina p, out string poruka);
        Porudzbina IzmeniPorudzbinu(Porudzbina nova, out string poruka);
        Porudzbina ObrisiPorudzbinu(int id);
        string IzmeniStatusPorudzbine(int idPorudzbine, StatusPorudzbine status);
    }
}
