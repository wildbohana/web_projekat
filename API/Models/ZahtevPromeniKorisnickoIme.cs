using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace API.Models
{
    public class ZahtevPromeniKorisnickoIme
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Korisnik nije dobro unet")]
        public int UserID { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Korisničko ime nije dobro uneto")]
        public string NewUsername { get; set; }
    }
}
