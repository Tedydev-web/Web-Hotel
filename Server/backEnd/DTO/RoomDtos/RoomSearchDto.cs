using WebHotel.DTO.RoomTypeDtos;
using WebHotel.DTO.ServiceAttachDtos;

namespace WebHotel.DTO.RoomDtos
{
    public class RoomSearchDto
    {
        public int MaxPerson { get; set; }

        public decimal MaxPrice { get; set; }

        public List<RoomTypeResponseDto>? RoomTypes { get; set; }

        public List<ServiceAttachResponseDto>? ServiceAttachs { get; set; }
    }
}
