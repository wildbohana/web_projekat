using API.Models;
using API.Repository.Impl;
using API.Repository;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.Security;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : ApiController
    {
        #region REPOZITORIJUM
        IKorisnikRepozitorijum korRepo = new KorisnikRepozitorijum();
        #endregion

        #region METODE ZA AUTENTIFIKACIJU
        string _biber = ConfigurationManager.AppSettings["BiberZaLozinku"];
        string jwt_secret = ConfigurationManager.AppSettings["JwtTajniKljuc"];

        private string HashPassword(string password)
        {
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            byte[] saltBytes = Encoding.UTF8.GetBytes(_biber);

            byte[] combinedBytes = new byte[passwordBytes.Length + saltBytes.Length];
            Buffer.BlockCopy(passwordBytes, 0, combinedBytes, 0, passwordBytes.Length);
            Buffer.BlockCopy(saltBytes, 0, combinedBytes, passwordBytes.Length, saltBytes.Length);

            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] hashBytes = sha256.ComputeHash(combinedBytes);
                return Convert.ToBase64String(hashBytes);
            }
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            string hashedInput = HashPassword(password);
            return string.Equals(hashedInput, hashedPassword);
        }

        public string GenerateJwtToken(Korisnik user)
        {
            DateTime issuedAt = DateTime.UtcNow;
            DateTime expires = DateTime.UtcNow.AddMinutes(30);


            var tokenHandler = new JwtSecurityTokenHandler();
            var baseAddress = ConfigurationManager.AppSettings["BaseAddress"];

            ClaimsIdentity claimsIdentity = new ClaimsIdentity(new[]
            {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
            });
            
            DateTime now = DateTime.UtcNow;
            var securityKey = new SymmetricSecurityKey(Encoding.Default.GetBytes(jwt_secret));
            var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);

            var token = (JwtSecurityToken) tokenHandler.CreateJwtSecurityToken
                (issuer: baseAddress, 
                audience: baseAddress,
                subject: claimsIdentity, 
                notBefore: issuedAt, 
                expires: expires, 
                signingCredentials: signingCredentials);
            string tokenString = tokenHandler.WriteToken(token);

            return tokenString;
        }
        #endregion

        #region GET zahtevi
        [HttpGet]
        [ActionName("all")]
        [Authorize(Roles = "Administrator")]
        public IHttpActionResult DobaviSve()
        {
            return Ok(BazaPodataka.ListaKorisnika.Where(x => !x.isDeleted));
        }

        [HttpGet]
        [ActionName("user")]
        [AllowAnonymous]
        public IHttpActionResult PronadjiPoId(int id)
        {
            Korisnik k = korRepo.PronadjiPoId(id);
            if (k == default(Korisnik))
            {
                return NotFound();
            }

            return Ok(k);
        }

        [HttpGet]
        [ActionName("current")]
        public IHttpActionResult DobaviTrenutnog()
        {
            Korisnik k = korRepo.PronadjiPoKimenu(User.Identity.Name);
            if (k == default(Korisnik))
            {
                return NotFound();
            }

            TrenutniKorisnik trenutni = new TrenutniKorisnik
            {
                ID = k.ID,
                Username = k.Username,
                Role = k.RoleName,
                Favourites = k.Favourites
            };

            return Ok(trenutni);
        }

        [HttpGet]
        [ActionName("roles")]
        [AllowAnonymous]
        public IHttpActionResult DobaviUloge()
        {
            return Ok(Enum.GetNames(typeof(TipKorisnika)));
        }
        #endregion

        #region POST zahtevi
        [HttpPost]
        [ActionName("login")]
        [AllowAnonymous]
        public IHttpActionResult Prijava([FromBody] ZahtevPrijava zahtev)
        {
            Korisnik k = korRepo.PronadjiPoKimenu(zahtev.username);
            if (k == default(Korisnik))
            {
                return BadRequest("Ne postoji nalog sa tim korisničkim imenom!");
            }

            if (VerifyPassword(zahtev.password, k.Password))
            {
                return Ok(GenerateJwtToken(k));
            }

            return BadRequest("Lozinka nije tačna!");
        }

        [HttpPost]
        [ActionName("add")]
        [Authorize(Roles = "Administrator")]
        public IHttpActionResult DodajKorisnika(Korisnik k)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Poslati podaci nisu dobri");
            }

            // Ne može se dodati novi administrator
            if (k.Role == TipKorisnika.Administrator)
            {
                return BadRequest("Ne može se dodati novi administrator!");
            }

            k.Password = HashPassword(k.Password);

            Korisnik novi = korRepo.DodajKorisnika(k);
            if (novi == default(Korisnik))
            {
                return BadRequest("Korisničko ime je zauzeto!");
            }
            
            return Ok(novi);
        }

        [HttpPost]
        [ActionName("register")]
        [AllowAnonymous]
        public IHttpActionResult Registracija(Korisnik k)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Podaci nisu dobro uneti");
            }
            
            if (k == default(Korisnik))
            {
                return BadRequest("Podaci nisu dobro uneti");
            }

            // Posle registracije, korisnik može postati samo Kupac
            k.Role = TipKorisnika.Buyer;
            k.Password = HashPassword(k.Password);

            Korisnik novi = korRepo.DodajKorisnika(k);
            if (novi == default(Korisnik))
            {
                return BadRequest("Korisničko ime je zauzeto!");
            }

            return Ok(novi);
        }
        #endregion

        #region PUT zahtevi
        [HttpPut]
        [ActionName("update")]
        public IHttpActionResult IzmenaKorisnika(Korisnik k)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Podaci nisu dobro uneti");
            }

            if (korRepo.PronadjiPoId(k.ID) == null)
            {
                return BadRequest("Izabrani korisnik ne postoji");
            }
            
            return Ok(korRepo.IzmeniKorisnika(k));
        }

        [HttpPut]
        [ActionName("update-username")]
        public IHttpActionResult IzmenaKime([FromBody] ZahtevPromeniKorisnickoIme zahtev)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Podaci nisu dobro uneti");
            }

            string por = korRepo.PromeniKorisnickoIme(zahtev.UserID, zahtev.NewUsername);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }
            
            return Ok("Korisničko ime je uspešno izmenjeno");
        }

        [HttpPut]
        [ActionName("update-password")]
        public IHttpActionResult IzmeniLozinku([FromBody] ZahtevPromeniLozinku zahtev)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Podaci nisu dobro uneti");
            }

            Korisnik k = korRepo.PronadjiPoId(zahtev.UserId);
            if (k == default(Korisnik))
            {
                return BadRequest("Ne postoji nalog sa tim korisničkim imenom!");
            }
            
            if (!VerifyPassword(zahtev.OldPassword, k.Password))
            {
                return BadRequest("Stara lozinka nije tačna");
            }
            
            k.Password = HashPassword(zahtev.NewPassword);
            return Ok("Lozinka je uspešno promenjena");
        }
        #endregion

        #region DELETE zahtevi
        [HttpDelete]
        [ActionName("delete")]
        [Authorize(Roles = "Administrator")]
        public IHttpActionResult ObrisiKorisnika(int id)
        {
            Korisnik k = korRepo.PronadjiPoId(id);
            if (k == default(Korisnik))
            {
                return NotFound();
            }

            return Ok(korRepo.ObrisiKorisnika(k.ID));
        }
        #endregion
    }
}
