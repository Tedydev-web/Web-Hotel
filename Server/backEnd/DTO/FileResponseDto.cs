namespace WebHotel.DTO
{
    public class FileResponseDto
    {
        public int Status { get; set; }

        public string? Url { get; set; } = "";

        public string? Errors { get; set; } = "";
    }
}
