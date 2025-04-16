using WebHotel.DTO.ServiceAttachDtos;

namespace WebHotel.DTO.RoomDtos
{
    public class RoomResponseDto
    {
        public string Id { get; set; } = null!;

        public string RoomNumber { get; set; } = null!;

        public string Name { get; set; } = null!;

        public bool? IsActive { get; set; }

        public string? Description { get; set; }

        public string? RoomPicture { get; set; }

        public string? RoomPictures { get; set; }

        public int? StarAmount { get; set; }

        public float? StarSum { get; set; }

        public int PeopleNumber { get; set; }

        public int NumberOfSimpleBed { get; set; }

        public int NumberOfDoubleBed { get; set; }

        public decimal CurrentPrice { get; set; }

        public decimal? DiscountPrice { get; set; }

        public int RoomTypeId { get; set; }

        public string? RoomTypeName { get; set; }

        public List<ServiceAttachResponseDto>? ServiceAttachs { get; set; }
    }
}
