namespace WebHotel.DTO.BlogDtos
{
    public class ParameterSearchDto
    {
        public DateTime? CreatedAt { get; set; } = null;
        public string? ShortTitle { get; set; }
        public string? ShortContent { get; set; }
        public string? LongTitle { get; set; }
        public string? LongContent { get; set; }
        public string? PosterEmail { get; set; }
        public string? PosterRole { get; set; }
    }
}
