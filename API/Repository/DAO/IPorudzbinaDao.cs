using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Repository.DAO
{
    public interface IPorudzbinaDao
    {
        IEnumerable<Porudzbina> DobaviSve();
        Porudzbina PronadjiPoId(int id);
        IEnumerable<Porudzbina> PronadjiPoKorisniku(int userId);
        Porudzbina DodajPorudzbinu(Porudzbina order);
        Porudzbina IzmeniPorudzbinu(Porudzbina updatedOrder);
        Porudzbina ObrisiPorudzbinu(int id);
    }
}
