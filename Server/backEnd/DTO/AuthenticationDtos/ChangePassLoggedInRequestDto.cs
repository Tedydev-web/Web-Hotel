using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.AuthenticationDtos
{
    public class ChangePassLoggedInRequestDto
    {
        [Required]
        public string? Email { get; set; }

        [Required]
        public string? CurrentPassword { get; set; }

        [Required]
        public string? NewPassword { get; set; }

        [Required]
        [Compare("NewPassword")]
        public string? ConfirmNewPassword { get; set; }
    }
}
