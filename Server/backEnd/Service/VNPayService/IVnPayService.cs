using WebHotel.DTO;

namespace WebHotel.Service.VNPayService
{
    public interface IVnPayService
    {
        VnPay CreatePaymentUrl(PaymentInformationDto model, HttpContext context);
        PaymentResponseDto PaymentExecute(IQueryCollection collections);
    }
}
