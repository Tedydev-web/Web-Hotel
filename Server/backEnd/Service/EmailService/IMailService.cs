using WebHotel.DTO;

namespace WebHotel.Service.EmailRepository
{
    public interface IMailService
    {
        bool SendMail(EmailRequestDto mailRequest);
    }
}
