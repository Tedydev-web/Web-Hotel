using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.TokenDtos
{
    public class TokenRequestDto
    {
        [Required]
        public string? AccessToken { get; set; }
        [Required]
        public string? RefreshToken { get; set; }
    }
}
