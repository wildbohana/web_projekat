using API.Models;
using API.Repository;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace API
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        #region PODACI
        string putanja { get; set; }
        JsonSerializerSettings settings = new JsonSerializerSettings();
        CancellationTokenSource cancellationTokenSource;
        Timer autosave;
        #endregion

        #region POKRETANJE APLIKACIJE
        protected void Application_Start()
        {
            // Korenska putanja servera
            putanja = HttpContext.Current.Server.MapPath("~");

            // JSON  formatiranje
            settings.Formatting = Formatting.Indented;
            settings.DateFormatString = "dd/MM/yyyy";
            
            // Učitavanje podataka iz JSON datoteka
            UcitajPodatke();

            try
            {
                cancellationTokenSource = new CancellationTokenSource();
                TimeSpan sekunde = TimeSpan.FromSeconds(30);
                autosave = new Timer(SacuvajPodatke, null, TimeSpan.Zero, sekunde);
            }
            catch (Exception ex)
            {

            }

            GlobalConfiguration.Configure(WebApiConfig.Register);
        }
        #endregion

        #region GAŠENJE APLIKACIJE
        protected void Application_End()
        {
            SacuvajPodatke(null);
            cancellationTokenSource.Cancel();
            autosave.Dispose();
            cancellationTokenSource.Dispose();
        }
        #endregion

        #region ČUVANJE PODATAKA
        private void SacuvajPodatke(object state)
        {
            if (cancellationTokenSource.Token.IsCancellationRequested) return;
            
            try
            {
                //  Upis Admina
                string adminPath = Path.Combine(putanja, "App_Data/Admins.json");
                if (BazaPodataka.ListaKorisnika != null)
                {
                    // Find all admins
                    List<Korisnik> admins = BazaPodataka.ListaKorisnika.FindAll(x => x.Role == TipKorisnika.Administrator);

                    // Save admins to Admin.json
                    File.WriteAllText(adminPath, JsonConvert.SerializeObject(admins, settings));
                }

                // Upis korisnika
                string userPath = Path.Combine(putanja, "App_Data/Users.json");
                if (BazaPodataka.ListaKorisnika != null)
                {
                    List<Korisnik> users = BazaPodataka.ListaKorisnika.FindAll(x => x.Role != TipKorisnika.Administrator);
                    File.WriteAllText(userPath, JsonConvert.SerializeObject(users, settings));
                }

                // Upis proizvoda
                string productPath = Path.Combine(putanja, "App_Data/Products.json");
                if (BazaPodataka.ListaProizvoda != null)
                {
                    var products = BazaPodataka.ListaProizvoda.ToArray();
                    File.WriteAllText(productPath, JsonConvert.SerializeObject(products, settings));
                }

                // Upis proizvoda
                string reviewPath = Path.Combine(putanja, "App_Data/Reviews.json");
                if (BazaPodataka.ListaRecenzija != null)
                {
                    var reviews = BazaPodataka.ListaRecenzija.ToArray();
                    File.WriteAllText(reviewPath, JsonConvert.SerializeObject(reviews, settings));
                }

                // Upis porudžbina
                string orderPath = Path.Combine(putanja, "App_Data/Orders.json");
                if (BazaPodataka.ListaPorudzbina != null)
                {
                    var orders = BazaPodataka.ListaPorudzbina.ToArray();
                    File.WriteAllText(orderPath, JsonConvert.SerializeObject(orders, settings));
                }
            }
            catch (Exception ex)
            {
                
            }
        }
        #endregion

        #region ČITANJE PODATAKA
        private List<T> CitanjeIzFajla<T>(string path)
        {
            string json = File.ReadAllText(path);
            return JsonConvert.DeserializeObject<List<T>>(json, settings);
        }
        
        private void UcitajPodatke()
        {
            try
            {
                // Read admins from file
                string adminPath = Path.Combine(putanja, "App_Data/Admins.json");
                BazaPodataka.ListaKorisnika = CitanjeIzFajla<Korisnik>(adminPath);
                if (BazaPodataka.ListaKorisnika == null)
                {
                    BazaPodataka.ListaKorisnika = new List<Korisnik>();
                }

                // Read users from file
                string userPath = Path.Combine(putanja, "App_Data/Users.json");
                var users = CitanjeIzFajla<Korisnik>(userPath);
                if (users != null)
                {
                    BazaPodataka.ListaKorisnika.AddRange(users);
                }

                // Read products from file
                string productPath = Path.Combine(putanja, "App_Data/Products.json");
                BazaPodataka.ListaProizvoda = CitanjeIzFajla<Proizvod>(productPath);
                if (BazaPodataka.ListaProizvoda == null)
                {
                    BazaPodataka.ListaProizvoda = new List<Proizvod>();
                }

                // Read reviews from file
                string reviewPath = Path.Combine(putanja, "App_Data/Reviews.json");
                BazaPodataka.ListaRecenzija = CitanjeIzFajla<Recenzija>(reviewPath);
                if (BazaPodataka.ListaRecenzija == null)
                {
                    BazaPodataka.ListaRecenzija = new List<Recenzija>();
                }

                // Read orders from file
                string orderPath = Path.Combine(putanja, "App_Data/Orders.json");
                BazaPodataka.ListaPorudzbina = CitanjeIzFajla<Porudzbina>(orderPath);
                if (BazaPodataka.ListaPorudzbina == null)
                {
                    BazaPodataka.ListaPorudzbina = new List<Porudzbina>();
                }
            }
            catch (Exception ex)
            {
            }
        }
        #endregion
    }
}
