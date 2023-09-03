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
    [Authorize(Roles = "Administrator")]
    public class OrdersController : ApiController
    {
        #region REPOZITORIJUM
        IPorudzbinaRepozitorijum porRepo = new PorudzbinaRepozitorijum();
        #endregion

        #region GET zahtevi
        [HttpGet]
        [ActionName("all")]
        public IHttpActionResult DobaviSve()
        {
            return Ok(porRepo.DobaviSve());
        }

        [HttpGet]
        [ActionName("find")]
        public IHttpActionResult DobaviPoId(int id)
        {
            Porudzbina p = porRepo.PronadjiPoId(id);
            if (p == default(Porudzbina))
            {
                return NotFound();
            }

            return Ok(p);
        }

        [HttpGet]
        [ActionName("for-user")]
        [OverrideAuthorization]
        [Authorize]
        public IHttpActionResult DobaviPoKorisniku(int id)
        {
            return Ok(porRepo.PronadjiPoKorisniku(id));
        }

        [HttpGet]
        [ActionName("statuses")]
        [AllowAnonymous]
        public IHttpActionResult DobaviStatuse()
        {
            return Ok(Enum.GetNames(typeof(StatusPorudzbine)));
        }
        #endregion

        #region POST zahtevi
        [HttpPost]
        [ActionName("add")]
        [OverrideAuthorization]
        [Authorize(Roles = "Buyer")]
        public IHttpActionResult DodajNovu(Porudzbina p)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            string por;
            
            Porudzbina nova = porRepo.DodajPorudzbinu(p, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }
            
            return Ok(nova);
        }

        [HttpPost]
        [ActionName("change-status")]
        public IHttpActionResult PromenaStatusa([FromBody] ZahtevPromeniStatusPosiljke zahtev)
        {
            string rez = porRepo.IzmeniStatusPorudzbine(zahtev.orderId, zahtev.status);
            if (rez == string.Empty)
            {
                return InternalServerError();
            }
            
            return Ok(rez);
        }
        #endregion

        #region PUT zahtevi
        [HttpPut]
        [ActionName("update")]
        public IHttpActionResult IzmenaPorudzbine(Porudzbina p)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            string por;
            
            Porudzbina izmenjena = porRepo.IzmeniPorudzbinu(p, out por);
            if (por != string.Empty)
            {
                return BadRequest(por);
            }
            
            return Ok(izmenjena);
        }

        [HttpPut]
        [ActionName("delivered")]
        [OverrideAuthorization]
        [Authorize(Roles = "Buyer")]
        public IHttpActionResult DostavljenaPorudzbina(int id)
        {
            string rez = porRepo.IzmeniStatusPorudzbine(id, StatusPorudzbine.COMPLETED);
            if (rez == string.Empty)
            {
                return InternalServerError();
            }

            return Ok(rez);
        }
        #endregion

        #region DELETE zahtevi
        [HttpDelete]
        [ActionName("delete")]
        public IHttpActionResult ObrisiPorudzbinu(int id)
        {
            Porudzbina obrisana = porRepo.ObrisiPorudzbinu(id);
            if (obrisana == default(Porudzbina))
            {
                return NotFound();
            }

            return Ok(obrisana);
        }
        #endregion   
    }
}
