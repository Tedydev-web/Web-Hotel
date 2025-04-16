namespace WebHotel.DTO.BlogDtos;

public class BlogResponseDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ShortTitle { get; set; }
    public string? ShortContent { get; set; }
    public string? Image { get; set; }
    public string? LongTitle { get; set; }
    public string? LongContent { get; set; }
    public string? PosterEmail { get; set; }
    public List<string>? PosterRoles { get; set; }
}
