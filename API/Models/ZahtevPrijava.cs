using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace API.Models
{
    public class ZahtevPrijava
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "Korisničko ime nije dobro uneto!")]
        public string username { get; set; }


        [Required(AllowEmptyStrings = false, ErrorMessage = "Lozinka nije dobro uneta!")]
        public string password { get; set; }
    }
}
