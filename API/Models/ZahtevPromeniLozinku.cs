using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace API.Models
{
    public class ZahtevPromeniLozinku
    {
        [Required(AllowEmptyStrings = false, ErrorMessage = "ID korisnika nije dobro unet")]
        public int UserId { get; set; }
        
        [Required(AllowEmptyStrings = false, ErrorMessage = "Lozinka nije dobro uneta")]
        public string OldPassword { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Lozinka nije dobro uneta")]
        public string NewPassword { get; set; }
    }
}
