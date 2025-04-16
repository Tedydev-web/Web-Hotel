using System.ComponentModel.DataAnnotations;

namespace WebHotel.DTO.ServiceAttachDtos
{
    public class ServiceAttachRequestDto
    {
        [Required(ErrorMessage = "{0} is required")]
        public string? Name { get; set; }

        [Required(ErrorMessage = "{0} is required")]
        public string? Icon { get; set; }

        public string? Description { get; set; }
    }
}
