using Firebase.Auth;
using Firebase.Storage;
using WebHotel.DTO;

namespace WebHotel.Service.FileService
{
    public class FileService : IFileService
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly string ApiKey = "";
        private readonly string Bucket = "";
        private readonly string AuthEmail = "";
        private readonly string AuthPassword = "";

        public FileService(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
            ApiKey = _configuration["Firebase:ApiKey"];
            Bucket = _configuration["Firebase:Bucket"];
            AuthEmail = _configuration["Firebase:AuthEmail"];
            AuthPassword = _configuration["Firebase:AuthPassword"];
        }

        public async Task<FileResponseDto> GetFile(string rootFolder, string fileName)
        {
            var auth = new FirebaseAuthProvider(new FirebaseConfig(ApiKey));
            var a = await auth.SignInWithEmailAndPasswordAsync(AuthEmail, AuthPassword);

            var task = new FirebaseStorage(
                Bucket,
                new FirebaseStorageOptions
                {
                    AuthTokenAsyncFactory = () => Task.FromResult(a.FirebaseToken),
                    ThrowOnCancel = true
                })
                .Child(rootFolder)
                .Child(fileName)
                .GetDownloadUrlAsync();
            try
            {
                string link = await task;
                return new FileResponseDto { Status = 1, Url = link };
            }
            catch (Exception ex)
            {
                return new FileResponseDto { Status = 0, Errors = ex.InnerException!.Message };
            }
        }

        public async Task<FileResponseDto> SendFile(string rootFolder, IFormFile file)
        {
            FileStream stream;
            if (file.Length > 0)
            {
                string path_root = Path.Combine(_environment.ContentRootPath, "Images");
                if (!Directory.Exists(path_root))
                {
                    Directory.CreateDirectory(path_root);
                }
                string path = Path.Combine(_environment.ContentRootPath, "Images", file.FileName);
                using (stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                stream = new FileStream(path, FileMode.Open);
                var auth = new FirebaseAuthProvider(new FirebaseConfig(ApiKey));
                var a = await auth.SignInWithEmailAndPasswordAsync(AuthEmail, AuthPassword);

                var task = new FirebaseStorage(
                    Bucket,
                    new FirebaseStorageOptions
                    {
                        AuthTokenAsyncFactory = () => Task.FromResult(a.FirebaseToken),
                        ThrowOnCancel = true
                    })
                    .Child(rootFolder)
                    .Child(file.FileName)
                    .PutAsync(stream);
                try
                {
                    string link = await task;
                    return new FileResponseDto { Status = 1, Url = link };
                }
                catch (Exception ex)
                {
                    return new FileResponseDto { Status = 0, Errors = ex.InnerException!.Message };
                }
                finally
                {
                    stream.Dispose();
                    File.Delete(path);
                }
            }
            return new FileResponseDto { Status = 0, Errors = "Not Choose File" };
        }

        public async Task<bool> deleteFile(string rootFolder, string fileName)
        {
            var auth = new FirebaseAuthProvider(new FirebaseConfig(ApiKey));
            var a = await auth.SignInWithEmailAndPasswordAsync(AuthEmail, AuthPassword);

            var task = new FirebaseStorage(
                Bucket,
                new FirebaseStorageOptions
                {
                    AuthTokenAsyncFactory = () => Task.FromResult(a.FirebaseToken),
                    ThrowOnCancel = true
                })
                .Child(rootFolder)
                .Child(fileName)
                .DeleteAsync();
            try
            {
                await task;
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
