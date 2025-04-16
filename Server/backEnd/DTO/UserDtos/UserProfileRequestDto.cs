namespace WebHotel.DTO.UserDtos
{
    public class UserProfileRequestDto
    {
        public string? PhoneNumber { get; set; }
        public IFormFile? Image { get; set; }
        public string? Address { get; set; }
        public string? CMND { get; set; }
    }
}
