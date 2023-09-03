using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace API.Models
{
    public enum TipKorisnika
    {
        Buyer = 0,
        Seller = 1,
        Administrator = 2
    }

    public class Korisnik
    {
        public int ID { get; set; }
        
        [Required(AllowEmptyStrings = false, ErrorMessage = "Korisnicko ime nije dobro uneto!")]
        public string Username { get; set; }
        
        [Required(AllowEmptyStrings = false, ErrorMessage = "Lozinka nije dobro uneta!")]
        public string Password { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Ime nije dobro uneto!")]
        public string FirstName { get; set; }
        [Required(AllowEmptyStrings = false, ErrorMessage = "Prezime nije dobro uneto!")]
        public string LastName { get; set; }

        public string FullName { get => FirstName + " " + LastName; }
        
        [Required(AllowEmptyStrings = false, ErrorMessage = "Pol nije dobro unet!")]
        public string Gender { get; set; }
        
        [Required(AllowEmptyStrings = false, ErrorMessage = "Email nije dobro unet!")]
        public string Email { get; set; }
        
        [Required(AllowEmptyStrings = false, ErrorMessage = "Datum rodjenja nije dobro unet!")]
        public DateTime? DateOfBirth { get; set; }

        public TipKorisnika Role { get; set; }
        public string RoleName { get => Role.ToString(); }
        
        // Liste za porudžbine, omiljene i objavljene proizvode
        public List<int> Orders { get; set; } = new List<int>();
        public List<int> Favourites { get; set; } = new List<int>();
        public List<int> PublishedProducts { get; set; } = new List<int>();
        
        // Polje za logičko brisanje
        public bool isDeleted { get; set; }
    }
}
