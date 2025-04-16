using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.RoomStarDtos
{
    public class RoomStarRequestDto
    {
        [Range(1, 5, ErrorMessage = "Star {0} must be between {1} and {2}")]
        public int Number { get; set; }

        public string RoomId { get; set; } = null!;
    }
}
