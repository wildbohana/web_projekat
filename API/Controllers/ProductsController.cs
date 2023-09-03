using API.Models;
using API.Repository.Impl;
using API.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Security;

namespace API.Controllers
{
    [Authorize(Roles = "Administrator, Seller")]
    public class ProductsController : ApiController
    {
        #region REPOZITORIJUM
        IProizvodRepozitorijum proRepo = new ProizvodRepozitorijum();
        #endregion

        #region GET zahtevi
        [HttpGet]
        [ActionName("all")]
        [AllowAnonymous]
        public IHttpActionResult DobaviSve()
        {
            return Ok(proRepo.DobaviSve());
        }

        [HttpGet]
        [ActionName("find")]
        [AllowAnonymous]
        public IHttpActionResult PronadjiZaId(int id)
        {
            Proizvod p = proRepo.PronadjiPoId(id);
            if (p == default(Proizvod))
            {
                return NotFound();
            }

            return Ok(p);
        }

        [HttpGet]
        [ActionName("user")]
        [OverrideAuthorization]
        [Authorize]
        public IHttpActionResult PronadjiZaKorisnika(int id)
        {
            string por;
            IEnumerable<Proizvod> proizvodi = proRepo.PronadjiZaKorisnika(id, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }

            return Ok(proizvodi);
        }
        #endregion

        #region POST zahtevi
        [HttpPost]
        [ActionName("add")]
        public IHttpActionResult DodajNovi(Proizvod p)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Loši podaci!");
            }

            string por;
            Proizvod novi = proRepo.DodajProizvod(p, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }
            
            return Ok(novi);
        }
        #endregion

        #region PUT zahtevi
        [HttpPut]
        [ActionName("add-to-favourites")]
        [OverrideAuthorization]
        [Authorize(Roles = "Buyer")]
        public IHttpActionResult AddToFavourites([FromBody] ZahtevDodajOmiljeni zahtev)
        {
            string por;
            IEnumerable<int> omiljeni = proRepo.DodajProizvodUOmiljene(zahtev.UserId, zahtev.ProductId, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }

            return Ok(omiljeni);
        }

        [HttpPut]
        [ActionName("update")]
        public IHttpActionResult IzmeniProizvod(Proizvod p)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Loši podaci!");
            }

            string por;
            Proizvod izmenjen = proRepo.IzmeniProizvod(p, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }
            
            return Ok(izmenjen);
        }
        #endregion

        #region DELETE zahtevi
        [HttpDelete]
        [ActionName("delete")]
        public IHttpActionResult ObrisiProizvod(int id)
        {
            Proizvod p = proRepo.PronadjiPoId(id);
            if (p == null)
            {
                return NotFound();
            }

            return Ok(proRepo.ObrisiProizvod(p.ID));
        }
        #endregion
    }
}
