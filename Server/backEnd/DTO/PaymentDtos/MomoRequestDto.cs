using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.PaymentDtos
{
    public class MomoRequestDto
    {
        public string? orderInfo { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        [Range(1000, int.MaxValue, ErrorMessage = "Please enter {0} bigger than {1}")]
        public string? amount { get; set; }
    }
}
