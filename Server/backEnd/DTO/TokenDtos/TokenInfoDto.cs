namespace WebHotel.DTO.TokenDtos;

public partial class TokenInfoDto
{

    public string? Usename { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime RefreshTokenExpiry { get; set; }
}
