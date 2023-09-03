using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace API.Repository.DAO
{
    public interface IRecenzijaDao
    {
        IEnumerable<Recenzija> DobaviSve();
        Recenzija PronadjiPoId(int id);
        IEnumerable<Recenzija> PronadjiPoIdjevima(List<int> ids);
        IEnumerable<Recenzija> PronadjiPoRecezentu(int id);
        Recenzija DodajRecenziju(Recenzija recenzija);
        Recenzija IzmeniRecenziju(Recenzija recenzija);
        Recenzija ObrisiRecenziju(int id);
        void ObrisiPoIdjevima(List<int> ids);
    }
}
