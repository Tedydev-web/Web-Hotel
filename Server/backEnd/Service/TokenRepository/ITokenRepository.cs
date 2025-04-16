using System.Security.Claims;
using WebHotel.DTO.TokenDtos;

namespace WebHotel.Service.TokenRepository
{
    public interface ITokenRepository
    {
        AccessTokenResponseDto GetAccessToken(IEnumerable<Claim> claim);
        string GetRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
        object RefreshToken(TokenRequestDto tokenRequest);
        bool Revoke(TokenRequestDto tokenRequest);
    }
}
