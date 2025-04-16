using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.ServiceAttachDetailDtos
{
    public class ServiceAttachDetailRequestDto
    {
        [Required(ErrorMessage = "{0} is required")]
        public int? RoomTypeId { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public int? ServiceAttachId { get; set; }
    }

    public class ServiceAttachDetailRequestDtos
    {
        [Required(ErrorMessage = "{0} is required")]
        public int? RoomTypeId { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public ICollection<int>? ServiceAttachIds { get; set; }
    }
}
