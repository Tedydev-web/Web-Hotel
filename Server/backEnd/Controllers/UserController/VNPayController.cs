using Microsoft.AspNetCore.Mvc;
using WebHotel.DTO;
using WebHotel.Service.VNPayService;

namespace WebHotel.Controllers.UserController;

[ApiController]
[ApiVersion("1.0")]
[Route("user/")]
public class VNPayController : ControllerBase
{
    private readonly IVnPayService _vnPayService;

    public VNPayController(IVnPayService vnPayService)
    {
        _vnPayService = vnPayService;
    }

    [HttpPost("vn-pay/create")]
    public IActionResult CreatePaymentUrl(PaymentInformationDto model)
    {
        var url = _vnPayService.CreatePaymentUrl(model, HttpContext);

        return Ok(url);
    }

    [HttpGet("vn-pay/response")]
    public IActionResult PaymentCallback()
    {
        var response = _vnPayService.PaymentExecute(Request.Query);

        return Ok(response.ToString());
    }
}
