using WebHotel.Repository.AdminRepository.AuthenRepository;
using WebHotel.Repository.AdminRepository.DiscountRepository;
using WebHotel.Repository.AdminRepository.DiscountReservationDetailAdminRepository;
using WebHotel.Repository.AdminRepository.DiscountRoomDetailAdminRepository;
using WebHotel.Repository.AdminRepository.DiscountRoomDetailRepository;
using WebHotel.Repository.AdminRepository.DiscountServiceDetailAdminRepository;
using WebHotel.Repository.AdminRepository.DiscountTypeRepository;
using WebHotel.Repository.AdminRepository.RoomRepository;
using WebHotel.Repository.AdminRepository.RoomTypeRepository;
using WebHotel.Repository.AdminRepository.ServiceAttachDetailRepository;
using WebHotel.Repository.AdminRepository.ServiceAttachRepository;
using WebHotel.Repository.BaseRepository.NotificationRepository;
using WebHotel.Repository.UserRepository.AuthenRepository;
using WebHotel.Repository.UserRepository.ReservationRepository;
using WebHotel.Repository.UserRepository.RoomStarRepository;
using WebHotel.Repository.UserRepository.RoomUserRepository;
using WebHotel.Repository.UserRepository.UserProfileRepository;
using WebHotel.Service.EmailRepository;
using WebHotel.Service.FileService;
using WebHotel.Service.TokenRepository;
using WebHotel.Service.VNPayService;

namespace WebHotel.Startup
{
    public static class RepositorySetup
    {
        public static IServiceCollection RepositoryService(this IServiceCollection services)
        {
            services.AddScoped<ITokenRepository, TokenRepository>();

            services.AddScoped<IAuthenUserRepository, AuthenUserRepository>();

            services.AddScoped<IAuthenAdminRepository, AuthenAdminRepository>();

            services.AddScoped<IMailService, MailService>();

            services.AddScoped<IUserProfileRepository, UserProfileRepository>();

            services.AddScoped<IFileService, FileService>();

            services.AddScoped<IRoomAdminRepository, RoomAdminRepository>();

            services.AddScoped<IRoomUserRepository, RoomUserRepository>();

            services.AddScoped<IRoomStarUserRepository, RoomStarUserRepository>();

            services.AddScoped<IRoomTypeAdminRepository, RoomTypeAdminRepository>();

            services.AddScoped<IDiscountAdminRepository, DiscountAdminRepository>();

            services.AddScoped<IDiscountRoomDetailAdminRepository, DiscountRoomDetailAdminRepository>();

            services.AddScoped<IDiscountServiceDetailAdminRepository, DiscountServiceDetailAdminRepository>();

            services.AddScoped<IDiscountReservationDetailAdminRepository, DiscountReservationDetailAdminRepository>();

            services.AddScoped<IReservationUserRepository, ReservationUserRepository>();

            services.AddScoped<IRoomTypeAdminRepository, RoomTypeAdminRepository>();

            services.AddScoped<IDiscountTypeAdminRepository, DiscountTypeAdminRepository>();

            services.AddScoped<IServiceAttachAdminRepository, ServiceAttachAdminRepository>();

            services.AddScoped<IServiceAttachDetailRepository, ServiceAttachDetailRepository>();

            services.AddScoped<IVnPayService, VnPayService>();

            services.AddScoped<INotificationRepository, NotificationRepository>();

            return services;
        }
    }
}
