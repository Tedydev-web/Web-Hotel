namespace WebHotel.DTO.DiscountReservationDetailDtos;

public class DiscountReservationDetailRequest
{
    public string ReservationId { get; set; } = null!;

    public int DiscountId { get; set; }
}
