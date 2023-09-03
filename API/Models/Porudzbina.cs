using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace API.Models
{
    public enum StatusPorudzbine 
    { 
        ACTIVE,
        COMPLETED, 
        CANCELED 
    }

    public class Porudzbina
    {
        public int ID { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Proizvod nije dobro unet!")]
        public int Product { get; set; }
        public string ProductName { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Količina nije dobro uneta!")]
        public int Amount { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Kupac nije dobro unet!")]
        public int Buyer { get; set; }

        // Može biti null?
        public DateTime? OrderDate { get; set; }

        public StatusPorudzbine Status { get; set; }
        public string StatusMessage { get => Status.ToString(); }

        // Polje za logičko brisanje
        public bool isDeleted { get; set; }
    }
}
