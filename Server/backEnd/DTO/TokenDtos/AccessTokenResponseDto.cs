namespace WebHotel.DTO.TokenDtos
{
    public class AccessTokenResponseDto
    {
        public string? TokenString { get; set; }
        public DateTime ValidTo { get; set; }
    }
}
