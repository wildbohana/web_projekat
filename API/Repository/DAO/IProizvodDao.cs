using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Repository.DAO
{
    public interface IProizvodDao
    {
        IEnumerable<Proizvod> DobaviSve();
        Proizvod PronadjiPoId(int id);
        IEnumerable<Proizvod> PronadjiPoIdjevima(List<int> ids);
        Proizvod DodajProizvod(Proizvod product);
        Proizvod IzmeniProizvod(Proizvod updatedProduct);
        Proizvod ObrisiProizvod(int product);
    }
}
