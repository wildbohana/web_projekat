using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace API.Models
{
    public class ZahtevPromeniStatusPosiljke
    {
        public int orderId { get; set; }
        public StatusPorudzbine status { get; set; }
    }
}
