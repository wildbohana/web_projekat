using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace API.Models
{    
    public class Recenzija
    {
        public int ID { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Proizvod nije dobro unet!")]
        public int Product { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Reviewer is invalid !")]
        public int Reviewer { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Title is invalid !")]
        public string Title { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Content is invalid !")]
        public string Content { get; set; }

        [Required(AllowEmptyStrings = false, ErrorMessage = "Image is invalid !")]
        public string Image { get; set; }

        // Logička polja za brisanje, odobravanje ili odbijanje recenzije
        public bool isDeleted { get; set; }
        public bool isApproved { get; set; }
        public bool isDenied { get; set; }
    }
}
