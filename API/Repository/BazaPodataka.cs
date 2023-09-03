using API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Repository
{
    public class BazaPodataka : IDisposable
    {
        public static List<Korisnik> ListaKorisnika { get; set; } = new List<Korisnik>();
        public static List<Recenzija> ListaRecenzija { get; set; } = new List<Recenzija>();
        public static List<Proizvod> ListaProizvoda { get; set; } = new List<Proizvod>();
        public static List<Porudzbina> ListaPorudzbina { get; set; } = new List<Porudzbina>();

        #region GENERIŠI ID
        public static int GenerisiID()
        {
            return Math.Abs(Guid.NewGuid().GetHashCode());
        }
        #endregion

        #region DISPOSE PATTERN
        private bool disposedValue;

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    ListaKorisnika.Clear();
                    ListaRecenzija.Clear();
                    ListaProizvoda.Clear();
                    ListaPorudzbina.Clear();
                }

                disposedValue = true;
            }
        }
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
        #endregion
    }
}
