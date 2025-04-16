namespace WebHotel.DTO;

public class PaymentResponseDto
{
    public bool Success { get; set; }
    public string PaymentMethod = null!;
    public string OrderDescription = null!;
    public string OrderId = null!;
    public string PaymentId = null!;
    public string TransactionId = null!;
    public string Token = null!;
    public string VnPayResponseCode = null!;
}
