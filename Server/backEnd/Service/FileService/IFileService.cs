using WebHotel.DTO;

namespace WebHotel.Service.FileService
{
    public interface IFileService
    {
        Task<FileResponseDto> SendFile(string rootFolder, IFormFile formFile);

        Task<FileResponseDto> GetFile(string rootFolder, string fileName);

        Task<bool> deleteFile(string rootFolder, string fileName);
    }
}
