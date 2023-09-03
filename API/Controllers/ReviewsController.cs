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
    [Authorize(Roles = "Administrator, Buyer")]
    public class ReviewsController : ApiController
    {
        #region REPOZITORIJUM
        IRecenzijaRepozitorijum recRepo = new RecenzijaRepozitorijum();
        #endregion

        #region GET zahtevi
        [HttpGet]
        [ActionName("all")]
        [Authorize(Roles = "Administrator")]
        public IHttpActionResult DobaviSve()
        {
            return Ok(recRepo.DobaviSve());
        }

        [HttpGet]
        [ActionName("find")]
        public IHttpActionResult PronadjiZaId(int id)
        {
            Recenzija r = recRepo.PronadjiPoId(id);
            if (r == default(Recenzija))
            {
                return NotFound();
            }

            return Ok(r);
        }

        [HttpGet]
        [ActionName("for-product")]
        [AllowAnonymous]
        public IHttpActionResult PronadjiZaProizvod(int id)
        {
            string por;

            IEnumerable<Recenzija> recenzije = recRepo.PronadjiZaProizvod(id, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }

            return Ok(recenzije);
        }

        [HttpGet]
        [ActionName("for-user")]
        public IHttpActionResult PronadjiZaKorisnika(int id)
        {
            string por;

            IEnumerable<Recenzija> recenzije = recRepo.PronadjiZaRecezenta(id, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }

            return Ok(recenzije);
        }
        #endregion

        #region POST zahtevi
        [HttpPost]
        [ActionName("add")]
        [Authorize(Roles = "Buyer")]
        public IHttpActionResult DodajNovu(Recenzija r)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid data");
            }

            string por;
            
            Recenzija rez = recRepo.DodajRecenziju(r, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }
            
            return Ok(rez);
        }
        #endregion

        #region PUT zahtevi
        [HttpPut]
        [ActionName("approve")]
        [Authorize(Roles = "Administrator")]
        public IHttpActionResult OdobriRecenziju(int id)
        {
            string por = recRepo.OdobriRecenziju(id);
            if (por == string.Empty)
            {
                return NotFound();
            }

            return Ok(por);
        }

        [HttpPut]
        [ActionName("deny")]
        [Authorize(Roles = "Administrator")]
        public IHttpActionResult OdbijRecenziju(int id)
        {
            string por = recRepo.OdbijRecenziju(id);
            if (por == string.Empty)
            {
                return NotFound();
            }

            return Ok(por);
        }

        [HttpPut]
        [ActionName("update")]
        [Authorize(Roles = "Buyer")]
        public IHttpActionResult IzmeniRecenziju(Recenzija r)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid data");
            }

            string por;
            
            Recenzija izmenjena = recRepo.IzmeniRecenziju(r, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }

            return Ok(izmenjena);
        }
        #endregion

        #region DELETE zahtevi
        [HttpDelete]
        [ActionName("delete")]
        [Authorize(Roles = "Buyer")]
        public IHttpActionResult ObrisiRecenziju(int id)
        {
            Recenzija obrisana = recRepo.PronadjiPoId(id);
            if (obrisana == null)
            {
                return NotFound();
            }

            return Ok(recRepo.ObrisiRecenziju(obrisana.ID));
        }
        #endregion
    }
}
