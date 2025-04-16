using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.PaymentDtos
{
    public class PaymentRequestFullDto
    {
        [Required(ErrorMessage = "{0} is required")]
        public decimal? PriceTotal { get; set; }

        public string? OrderInfo { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public string? OrderType { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public string? PayType { get; set; } = null!;

        [Required(ErrorMessage = "{0} is required")]
        public int? Status { get; set; }

        public string? Message { get; set; } = null!;

        [Required(ErrorMessage = "{0} is required")]
        public string? ReservationId { get; set; }
    }
}
