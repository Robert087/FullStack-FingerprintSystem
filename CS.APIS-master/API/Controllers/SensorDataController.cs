using API.DTOs;
using Core.FingerId;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Project.APIS.Erorrs;
using Repository.Data;

namespace API.Controllers
{
    public class SensorDataController : BaseApiController
    {
        private readonly StoreContext _storeContext;

        public SensorDataController(StoreContext storeContext)
        {
            _storeContext = storeContext;
        }

        [HttpPost]
        public async Task<ActionResult<SensorData>> PostData(SensorDataDTO SensorData)
        {
            var mappData = new SensorData
            {
                ID = SensorData.ID,
                Name = SensorData.Name,
                Timestamp = DateTime.Now,
            };
            _storeContext.SensorData.Add(mappData);
            await _storeContext.SaveChangesAsync();
            var Data = _storeContext.SensorData.Where(x=>x.Name == SensorData.Name);
            return Ok(Data);

        }
        [HttpGet]
        public async Task<ActionResult<SensorDataDTO>> GetData(int id)
        {  
            var Data = _storeContext.SensorData.Where(x => x.ID == id);
            return Ok(Data);

        }

    }
}
